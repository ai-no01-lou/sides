import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import * as AuthService from './AuthService';
import {saveTokens, loadTokens, clearTokens} from './keychain';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userEmail: string | null;
  userName: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    userEmail: null,
    userName: null,
  });

  // Boot: try loading tokens from keychain
  useEffect(() => {
    (async () => {
      const tokens = await loadTokens();
      if (tokens) {
        // Try refreshing to validate
        try {
          const fresh = await AuthService.refreshTokens(tokens.refreshToken);
          await saveTokens({
            ...fresh,
            userEmail: tokens.userEmail,
            userName: tokens.userName,
          });
          setState(s => ({
            ...s,
            isLoading: false,
            isAuthenticated: true,
            accessToken: fresh.accessToken,
            refreshToken: fresh.refreshToken,
            userEmail: tokens.userEmail || null,
            userName: tokens.userName || null,
          }));
        } catch {
          // Refresh failed — tokens expired
          await clearTokens();
          setState({
            isLoading: false,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            userEmail: null,
            userName: null,
          });
        }
      } else {
        setState(s => ({...s, isLoading: false}));
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await AuthService.login(email, password);
    await saveTokens({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      userEmail: res.user.email,
      userName: res.user.name,
    });
    setState({
      isLoading: false,
      isAuthenticated: true,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      userEmail: res.user.email,
      userName: res.user.name || null,
    });
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const res = await AuthService.register(email, password, name);
      await saveTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        userEmail: res.user.email,
        userName: res.user.name,
      });
      setState({
        isLoading: false,
        isAuthenticated: true,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        userEmail: res.user.email,
        userName: res.user.name || null,
      });
    },
    [],
  );

  const logout = useCallback(async () => {
    await clearTokens();
    setState({
      isLoading: false,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      userEmail: null,
      userName: null,
    });
  }, []);

  const refresh = useCallback(async (): Promise<string | null> => {
    if (!state.refreshToken) {
      return null;
    }
    try {
      const res = await AuthService.refreshTokens(state.refreshToken);
      await saveTokens(res);
      setState(s => ({
        ...s,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      }));
      return res.accessToken;
    } catch {
      await logout();
      return null;
    }
  }, [state.refreshToken, logout]);

  return (
    <AuthContext.Provider
      value={{...state, login, register, logout, refresh}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
