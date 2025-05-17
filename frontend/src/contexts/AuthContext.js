import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

// Create context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || '/api';
  
  // Add token to requests if available
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if token is valid on initial load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Check if token is expired
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token is expired
          logout();
          setLoading(false);
          return;
        }

        // Verify token with backend
        const response = await axios.get('/auth/profile');
        setCurrentUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      const response = await axios.post('/auth/login', { email, password });
      const { token: newToken, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      return false;
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      setError('');
      await axios.post('/auth/register', { username, email, password });
      return true;
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
