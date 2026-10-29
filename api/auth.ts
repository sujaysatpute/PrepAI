/**
 * PrepAI server-side Authentication endpoint (Vercel Serverless Function, Node.js runtime).
 *
 * Supported Actions:
 *   POST /api/auth?action=register -> Registers a new user with hashed password & returns signed session token.
 *   POST /api/auth?action=login    -> Authenticates user credentials & returns signed session token.
 *   GET  /api/auth?action=me       -> Validates Bearer token & returns current authenticated user.
 *   POST /api/auth?action=logout   -> Invalidates/confirms user sign-out.
 *
 * Security:
 *   - Passwords hashed with scrypt + 128-bit unique cryptographically secure salt.
 *   - Constant-time comparison (crypto.timingSafeEqual) against timing attacks.
 *   - Cryptographically signed stateless JWT tokens (HMAC-SHA256) with 7-day expiration.
 *   - Rate-limiting on authentication attempts (brute-force defense).
 *   - No passwords or secrets ever returned to the client.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
}

interface TokenPayload {
  uid: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

// Secret key for HMAC token signing (falls back to stable machine/process secret)
const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.GEMINI_API_KEY ||
  'prepai-secure-session-auth-key-2026';

const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days
const MAX_BODY_CHARS = 10_000;

// Rate limiting for auth attempts
const RATE_LIMIT_MAX = 20; // 20 attempts per minute per IP
const RATE_WINDOW_MS = 60_000;
const authRateBuckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = authRateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    authRateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    if (authRateBuckets.size > 2000) {
      for (const [k, b] of authRateBuckets) if (b.resetAt < now) authRateBuckets.delete(k);
    }
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

// ---------- User Persistence Store ----------
// In-memory cache + persistent file sync
const memoryUsers = new Map<string, StoredUser>();
let isStoreInitialized = false;

function getStoreFilePath(): string {
  // On Vercel / AWS Lambda serverless environments, the filesystem is read-only except /tmp
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'prepAI_users.json');
  }

  // Local development: store in .data directory in project root
  const localDir = path.resolve(process.cwd(), '.data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return path.join(localDir, 'users.json');
  } catch {
    // Read-only filesystem fallback
    return path.join('/tmp', 'prepAI_users.json');
  }
}

function loadUsersFromDisk(): void {
  if (isStoreInitialized) return;
  isStoreInitialized = true;
  try {
    const filePath = getStoreFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed: StoredUser[] = JSON.parse(data);
      if (Array.isArray(parsed)) {
        for (const u of parsed) {
          if (u.email && u.passwordHash) {
            memoryUsers.set(u.email.toLowerCase(), u);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[api/auth] Could not load stored users from disk:', err);
  }
}

function saveUsersToDisk(): void {
  try {
    const filePath = getStoreFilePath();
    const list = Array.from(memoryUsers.values());
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[api/auth] Could not persist users to disk:', err);
  }
}

// ---------- Cryptographic Helpers ----------

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const key = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (key.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(key, storedBuf);
  } catch {
    return false;
  }
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return Buffer.from(b64, 'base64').toString('utf-8');
}

export function signToken(user: PublicUser): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    uid: user.id,
    email: user.email.toLowerCase(),
    name: user.name,
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS,
  };

  const headerEnc = base64UrlEncode(JSON.stringify(header));
  const payloadEnc = base64UrlEncode(JSON.stringify(payload));
  const message = `${headerEnc}.${payloadEnc}`;
  const sig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(message)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${message}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerEnc, payloadEnc, sig] = parts;
    const message = `${headerEnc}.${payloadEnc}`;
    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(message)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const expectedBuf = Buffer.from(expectedSig);
    const actualBuf = Buffer.from(sig);
    if (expectedBuf.length !== actualBuf.length) return null;
    if (!crypto.timingSafeEqual(expectedBuf, actualBuf)) return null;

    const payload: TokenPayload = JSON.parse(base64UrlDecode(payloadEnc));
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// ---------- Validation Helpers ----------

function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 100) return false;
  // RFC 5322 compatible standard email regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(trimmed);
}

function isValidPassword(password: string): { valid: boolean; reason?: string } {
  if (typeof password !== 'string') {
    return { valid: false, reason: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long' };
  }
  if (password.length > 100) {
    return { valid: false, reason: 'Password cannot exceed 100 characters' };
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one letter and one number' };
  }
  return { valid: true };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

// ---------- Main Handler ----------

export async function POST(request: Request): Promise<Response> {
  loadUsersFromDisk();

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) {
    return json({ error: 'Too many authentication attempts. Please try again in a minute.', code: 'rate_limited' }, 429);
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  let rawBody = '';
  try {
    rawBody = await request.text();
  } catch {
    return json({ error: 'Failed to read request body', code: 'invalid_request' }, 400);
  }

  if (rawBody.length > MAX_BODY_CHARS) {
    return json({ error: 'Request payload too large', code: 'payload_too_large' }, 413);
  }

  let body: any = {};
  if (rawBody.trim()) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json({ error: 'Invalid JSON body', code: 'invalid_json' }, 400);
    }
  }

  // Action: REGISTER
  if (action === 'register') {
    const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
    const rawName = typeof body.name === 'string' ? body.name.trim() : '';
    const rawPassword = typeof body.password === 'string' ? body.password : '';

    if (!rawEmail || !isValidEmail(rawEmail)) {
      return json({ error: 'Please enter a valid email address.', code: 'invalid_email' }, 400);
    }

    if (!rawName || rawName.length < 2) {
      return json({ error: 'Please enter your name (minimum 2 characters).', code: 'invalid_name' }, 400);
    }

    const passCheck = isValidPassword(rawPassword);
    if (!passCheck.valid) {
      return json({ error: passCheck.reason, code: 'invalid_password' }, 400);
    }

    const emailKey = rawEmail.toLowerCase();
    if (memoryUsers.has(emailKey)) {
      return json({ error: 'An account with this email address already exists. Please sign in.', code: 'user_exists' }, 409);
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(rawPassword, salt);
    const userId = `usr_${crypto.randomUUID()}`;

    const newUser: StoredUser = {
      id: userId,
      email: emailKey,
      name: rawName.slice(0, 50),
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };

    memoryUsers.set(emailKey, newUser);
    saveUsersToDisk();

    const publicUser: PublicUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
    const token = signToken(publicUser);

    return json({
      success: true,
      message: 'Account registered successfully.',
      user: publicUser,
      token,
    }, 201);
  }

  // Action: LOGIN
  if (action === 'login') {
    const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
    const rawPassword = typeof body.password === 'string' ? body.password : '';

    if (!rawEmail || !rawPassword) {
      return json({ error: 'Email and password are required.', code: 'missing_credentials' }, 400);
    }

    const emailKey = rawEmail.toLowerCase();
    const user = memoryUsers.get(emailKey);

    if (!user) {
      return json({ error: 'Invalid email or password. Please check your credentials.', code: 'invalid_credentials' }, 401);
    }

    const isMatch = verifyPassword(rawPassword, user.salt, user.passwordHash);
    if (!isMatch) {
      return json({ error: 'Invalid email or password. Please check your credentials.', code: 'invalid_credentials' }, 401);
    }

    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    const token = signToken(publicUser);

    return json({
      success: true,
      message: 'Logged in successfully.',
      user: publicUser,
      token,
    }, 200);
  }

  // Action: LOGOUT
  if (action === 'logout') {
    return json({ success: true, message: 'Logged out successfully.' }, 200);
  }

  // Action: VERIFY (also accessible via POST)
  if (action === 'verify' || action === 'me') {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return json({ error: 'Missing authentication token.', code: 'unauthorized' }, 401);
    }
    const payload = verifyToken(token);
    if (!payload) {
      return json({ error: 'Session expired or invalid token. Please log in again.', code: 'session_expired' }, 401);
    }
    return json({
      success: true,
      user: {
        id: payload.uid,
        email: payload.email,
        name: payload.name,
      },
    }, 200);
  }

  return json({ error: `Unknown authentication action: ${action}`, code: 'unknown_action' }, 400);
}

export async function GET(request: Request): Promise<Response> {
  loadUsersFromDisk();

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'me' || action === 'verify') {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return json({ error: 'Missing authentication token.', code: 'unauthorized' }, 401);
    }
    const payload = verifyToken(token);
    if (!payload) {
      return json({ error: 'Session expired or invalid token. Please log in again.', code: 'session_expired' }, 401);
    }
    return json({
      success: true,
      user: {
        id: payload.uid,
        email: payload.email,
        name: payload.name,
      },
    }, 200);
  }

  return json({ status: 'healthy', service: 'PrepAI Authentication' });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
