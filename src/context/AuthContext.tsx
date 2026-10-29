import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, loginUser, registerUser, verifySession, logoutUser } from '../services/authClient';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  userName: string | null;
  userEmail: string | null;
  userId: string | null;
  storageId: string; // Unique partition key for user data isolation
  isLoggedIn: boolean;
  loginMethod: 'credential' | 'guest' | null;
  isLoading: boolean;
}

interface StoredAuthData {
  user: AuthUser | null;
  token: string | null;
  userName: string | null;
  loginMethod: 'credential' | 'guest';
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsGuest: (name: string) => void;
  logout: () => Promise<void>;
}

const STORAGE_KEY = 'prepAI_auth';

function computeStorageId(user: AuthUser | null, userName: string | null, method: 'credential' | 'guest' | null): string {
  if (user?.id) {
    return `usr_${user.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  }
  if (user?.email) {
    return `email_${user.email.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
  }
  const safeGuest = (userName || 'guest').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return `guest_${safeGuest}`;
}

function loadInitialState(): Omit<AuthState, 'isLoading'> {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      userName: null,
      userEmail: null,
      userId: null,
      storageId: 'guest',
      isLoggedIn: false,
      loginMethod: null,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data: StoredAuthData = JSON.parse(raw);
      if (data && (data.user || data.userName)) {
        const user = data.user || null;
        const userName = user ? user.name : (data.userName || null);
        const method = data.loginMethod || (user ? 'credential' : 'guest');
        return {
          user,
          token: data.token || null,
          userName,
          userEmail: user?.email || null,
          userId: user?.id || null,
          storageId: computeStorageId(user, userName, method),
          isLoggedIn: true,
          loginMethod: method,
        };
      }
    }
  } catch (err) {
    console.error('[AuthContext] Failed to load stored auth state:', err);
  }

  return {
    user: null,
    token: null,
    userName: null,
    userEmail: null,
    userId: null,
    storageId: 'guest',
    isLoggedIn: false,
    loginMethod: null,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    ...loadInitialState(),
    isLoading: false,
  }));

  // Verify session validity on initial mount if authenticated via credentials
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      if (authState.loginMethod === 'credential' && authState.token) {
        try {
          const verifiedUser = await verifySession(authState.token);
          if (isMounted) {
            setAuthState(prev => ({
              ...prev,
              user: verifiedUser,
              userName: verifiedUser.name,
              userEmail: verifiedUser.email,
              userId: verifiedUser.id,
              storageId: computeStorageId(verifiedUser, verifiedUser.name, 'credential'),
              isLoggedIn: true,
            }));
          }
        } catch (err: any) {
          // If token has expired or is invalid, silently clear invalid credential session
          if (err?.code === 'session_expired' || err?.code === 'unauthorized') {
            console.warn('[AuthContext] Session expired, logging out.');
            if (isMounted) {
              logout();
            }
          }
        }
      }
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const { user, token } = await loginUser(email, pass);
      const newState: AuthState = {
        user,
        token,
        userName: user.name,
        userEmail: user.email,
        userId: user.id,
        storageId: computeStorageId(user, user.name, 'credential'),
        isLoggedIn: true,
        loginMethod: 'credential',
        isLoading: false,
      };

      setAuthState(newState);

      try {
        const stored: StoredAuthData = {
          user,
          token,
          userName: user.name,
          loginMethod: 'credential',
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch (err) {
        console.error('[AuthContext] Failed to persist credentials:', err);
      }
    } catch (err) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const { user, token } = await registerUser(name, email, pass);
      const newState: AuthState = {
        user,
        token,
        userName: user.name,
        userEmail: user.email,
        userId: user.id,
        storageId: computeStorageId(user, user.name, 'credential'),
        isLoggedIn: true,
        loginMethod: 'credential',
        isLoading: false,
      };

      setAuthState(newState);

      try {
        const stored: StoredAuthData = {
          user,
          token,
          userName: user.name,
          loginMethod: 'credential',
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch (err) {
        console.error('[AuthContext] Failed to persist credentials:', err);
      }
    } catch (err) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const loginAsGuest = (name: string) => {
    const cleanName = name.trim() || 'Candidate';
    const newState: AuthState = {
      user: null,
      token: null,
      userName: cleanName,
      userEmail: null,
      userId: null,
      storageId: computeStorageId(null, cleanName, 'guest'),
      isLoggedIn: true,
      loginMethod: 'guest',
      isLoading: false,
    };

    setAuthState(newState);

    try {
      const stored: StoredAuthData = {
        user: null,
        token: null,
        userName: cleanName,
        loginMethod: 'guest',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (err) {
      console.error('[AuthContext] Failed to persist guest session:', err);
    }
  };

  const logout = async () => {
    const currentToken = authState.token;
    const newState: AuthState = {
      user: null,
      token: null,
      userName: null,
      userEmail: null,
      userId: null,
      storageId: 'guest',
      isLoggedIn: false,
      loginMethod: null,
      isLoading: false,
    };

    setAuthState(newState);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[AuthContext] Failed to clear local auth state:', err);
    }

    if (currentToken) {
      await logoutUser(currentToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
