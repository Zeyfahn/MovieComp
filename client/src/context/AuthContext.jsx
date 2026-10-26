import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('movie_duel_token'));
  const [loading, setLoading] = useState(true);
  const [authModalState, setAuthModalState] = useState({ open: false, mode: 'login' });
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('movie_duel_token', res.token);
      setToken(res.token);
      setUser(res.user);
      closeAuthModal();
      return res.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (email, password, name) => {
    const res = await api.register({ email, password, name });
    if (res.success && res.token) {
      localStorage.setItem('movie_duel_token', res.token);
      setToken(res.token);
      setUser(res.user);
      closeAuthModal();
      return res.user;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('movie_duel_token');
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (newPreferences) => {
    if (!user) return;
    const res = await api.updatePreferences(newPreferences);
    if (res.success && res.preferences) {
      setUser((prev) => ({
        ...prev,
        preferences: res.preferences,
      }));
    }
    return res;
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalState({ open: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModalState({ open: false, mode: 'login' });
  };

  const openPreferences = () => setIsPreferencesOpen(true);
  const closePreferences = () => setIsPreferencesOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updatePreferences,
        authModalOpen: authModalState.open,
        authModalMode: authModalState.mode,
        openAuthModal,
        closeAuthModal,
        isPreferencesOpen,
        openPreferences,
        closePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
