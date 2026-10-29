/**
 * Client service for PrepAI authentication endpoint (/api/auth).
 * Talks to the backend serverless endpoint without exposing credentials or secrets.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
  error?: string;
  code?: string;
}

export class AuthError extends Error {
  constructor(message: string, public code: string = 'auth_error', public status?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

const REQUEST_TIMEOUT_MS = 15_000;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (err: any) {
    clearTimeout(timer);
    if (controller.signal.aborted) {
      throw new AuthError('The authentication server took too long to respond. Please try again.', 'timeout');
    }
    throw new AuthError(
      'Unable to connect to the authentication service. Please check your network connection.',
      'network_error'
    );
  } finally {
    clearTimeout(timer);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    const errorMsg =
      data?.error ||
      (response.status === 401
        ? 'Invalid email or password. Please verify your credentials.'
        : response.status === 409
        ? 'An account with this email already exists.'
        : response.status === 429
        ? 'Too many login attempts. Please wait a minute and try again.'
        : `Authentication failed (Status ${response.status}).`);
    throw new AuthError(errorMsg, data?.code || 'http_error', response.status);
  }

  return data as T;
}

export async function registerUser(name: string, email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const res = await request<AuthResponse>('/api/auth?action=register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.user || !res.token) {
    throw new AuthError('Invalid server response during registration.', 'invalid_response');
  }

  return { user: res.user, token: res.token };
}

export async function loginUser(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const res = await request<AuthResponse>('/api/auth?action=login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!res.user || !res.token) {
    throw new AuthError('Invalid server response during login.', 'invalid_response');
  }

  return { user: res.user, token: res.token };
}

export async function verifySession(token: string): Promise<AuthUser> {
  const res = await request<AuthResponse>('/api/auth?action=me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.user) {
    throw new AuthError('Session invalid or expired.', 'session_expired');
  }

  return res.user;
}

export async function logoutUser(token?: string | null): Promise<void> {
  try {
    await request<AuthResponse>('/api/auth?action=logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({}),
    });
  } catch {
    // Client-side logout proceeds regardless
  }
}
