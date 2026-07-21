import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, isAuthenticated as checkIsAuthenticated } from '../services/auth.service.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(checkIsAuthenticated());

  const refreshAuth = () => {
    setUser(getUser());
    setIsAuthenticated(checkIsAuthenticated());
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
