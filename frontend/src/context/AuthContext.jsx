import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on initial load
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      // First, try to load user from localStorage for immediate availability
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('user');
        }
      } else {
      }
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Then verify with server
      const response = await authApi.getMe();
      if (response.user) {
        const serverUser = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role
        };
        setUser(serverUser);
        localStorage.setItem('user', JSON.stringify(serverUser));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token but keep user from localStorage if API fails
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (userData) => {
    try {
      const response = await authApi.login(userData);
      if (response.token) {
        localStorage.setItem('token', response.token);
        
        const userInfo = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role || 'student'
        };
        
        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        return userInfo;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    // Call logout API if needed
    authApi.logout().catch(console.error);
    
    // Clear local storage and state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Redirect to login page
    navigate('/');
  }, [navigate]);

  const hasRole = useCallback((requiredRole) => {
    if (!user || !user.role) return false;
    return user.role === requiredRole;
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
