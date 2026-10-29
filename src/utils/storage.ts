import { ActiveInterview, InterviewSession, Role } from './types';

function normalizeUserKey(userKey?: string): string {
  if (!userKey) return 'guest';
  return userKey.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

function getSessionKey(userKey?: string): string {
  const safe = normalizeUserKey(userKey);
  return `prepAI_sessions_${safe}`;
}

function getActiveKey(userKey?: string): string {
  const safe = normalizeUserKey(userKey);
  return `prepAI_active_interview_${safe}`;
}

const ROLE_STORAGE_KEY = 'prepAI_selected_role';

export function getStoredSessions(userName?: string): InterviewSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getSessionKey(userName));
    if (!raw) {
      // Check legacy migration if any
      const legacyRaw = localStorage.getItem('interviewSessions');
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch {}
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load interview sessions:', err);
    return [];
  }
}

export function saveInterviewSession(session: InterviewSession, userName?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredSessions(userName);
    // Deduplicate by ID
    const filtered = existing.filter(s => s.id !== session.id);
    const updated = [session, ...filtered];
    localStorage.setItem(getSessionKey(userName), JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save interview session:', err);
  }
}

export function getSessionById(id: string, userName?: string): InterviewSession | null {
  const sessions = getStoredSessions(userName);
  return sessions.find(s => s.id === id) || null;
}

export function getActiveInterview(userName?: string): ActiveInterview | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(getActiveKey(userName));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveActiveInterview(active: ActiveInterview, userName?: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(getActiveKey(userName), JSON.stringify(active));
  } catch (err) {
    console.error('Failed to save active interview:', err);
  }
}

export function clearActiveInterview(userName?: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(getActiveKey(userName));
  } catch {}
}

export function getStoredRole(): Role | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ROLE_STORAGE_KEY) || localStorage.getItem(ROLE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredRole(role: Role | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (role) {
      sessionStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(role));
    } else {
      sessionStorage.removeItem(ROLE_STORAGE_KEY);
    }
  } catch {}
}
