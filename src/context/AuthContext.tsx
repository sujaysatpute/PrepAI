import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthState {
  userName: string | null;
  isLoggedIn: boolean;
  loginMethod: 'guest' | null;
}

interface AuthContextType extends AuthState {
  loginAsGuest: (name: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'prepAI_auth';

function loadInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return { userName: null, isLoggedIn: false, loginMethod: null };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed.userName === 'string' && parsed.isLoggedIn) {
        return {
          userName: parsed.userName,
          isLoggedIn: true,
          loginMethod: 'guest',
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse auth state', e);
  }
  return { userName: null, isLoggedIn: false, loginMethod: null };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Synchronous initialization so protected routes don't bounce on page refresh
  const [authState, setAuthState] = useState<AuthState>(loadInitialState);

  const loginAsGuest = (name: string) => {
    const cleanName = name.trim() || 'Candidate';
    const newState: AuthState = {
      userName: cleanName,
      isLoggedIn: true,
      loginMethod: 'guest',
    };
    setAuthState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
  };

  const logout = () => {
    const newState: AuthState = {
      userName: null,
      isLoggedIn: false,
      loginMethod: null,
    };
    setAuthState(newState);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear auth state', e);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, loginAsGuest, logout }}>
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
