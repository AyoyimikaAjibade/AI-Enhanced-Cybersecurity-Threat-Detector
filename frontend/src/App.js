import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Alerts from './pages/Alerts';
import AlertDetail from './pages/AlertDetail';
import NetworkTraffic from './pages/NetworkTraffic';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';

// Create Authentication Context
export const AuthContext = createContext();

// Create theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  // Add JWT token to requests if available
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // In a real app, you would verify the token with the backend
          // const response = await axios.get('/auth/verify');
          // setUser(response.data.user);
          
          // For demo purposes, we'll just check if the token exists
          setIsAuthenticated(true);
          setUser({ username: 'demo_user', email: 'demo@example.com' });
        } catch (err) {
          console.error('Authentication error:', err);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      // In a real app, you would make an API call to login
      // const response = await axios.post('/auth/login', { email, password });
      // const { token, user } = response.data;
      
      // For demo purposes
      const token = 'demo_jwt_token';
      const userData = { username: 'demo_user', email };
      
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      // In a real app, you would make an API call to register
      // const response = await axios.post('/auth/register', { username, email, password });
      
      // For demo purposes
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/alerts" element={
              <ProtectedRoute>
                <Layout>
                  <Alerts />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/alerts/:id" element={
              <ProtectedRoute>
                <Layout>
                  <AlertDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/network" element={
              <ProtectedRoute>
                <Layout>
                  <NetworkTraffic />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;
