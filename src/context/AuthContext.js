import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on page load
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setCurrentUser(response.user);
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setCurrentUser(response.user);
      return response;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
