import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(() => {
    try {
      const saved = localStorage.getItem('skine_latest_result');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const saveAnalysis = (result) => {
    setAnalysisResult(result);
    try {
      localStorage.setItem('skine_latest_result', JSON.stringify(result));
    } catch {}
  };

  const checkAuth = async () => {
    try {
      // Fetch current session profile if available
      const res = await api.get('/api/me');
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setUnreadCount(res.data.unread_count || 0);
      } else {
        setUser(null);
      }
    } catch {
      // Fallback check from localStorage or guest mode
      const savedUser = localStorage.getItem('skine_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/login', { email, password });
      if (res.data && res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('skine_user', JSON.stringify(res.data.user));
        addToast(`Welcome back, ${res.data.user.full_name}!`, 'success');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Invalid credentials.' };
    } catch (err) {
      // Demo mock fallback if backend is offline
      if (email === 'user@skinai.com' && password === 'password123') {
        const demoUser = {
          id: 2,
          full_name: 'Aastha Sharma',
          email: 'user@skinai.com',
          role: 'user',
          skin_type: 'Oily',
        };
        setUser(demoUser);
        localStorage.setItem('skine_user', JSON.stringify(demoUser));
        addToast('Welcome back, Aastha Sharma!', 'success');
        return { success: true };
      } else if (email === 'admin@skinai.com' && password === 'admin123') {
        const adminUser = {
          id: 1,
          full_name: 'Skiné Admin',
          email: 'admin@skinai.com',
          role: 'admin',
          skin_type: 'Normal',
        };
        setUser(adminUser);
        localStorage.setItem('skine_user', JSON.stringify(adminUser));
        addToast('Welcome back, Admin!', 'success');
        return { success: true };
      }
      const msg = err.response?.data?.message || 'Invalid email or password.';
      addToast(msg, 'danger');
      return { success: false, message: msg };
    }
  };

  const register = async (fullName, email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'danger');
      return { success: false, message: 'Passwords do not match.' };
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters.', 'danger');
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    try {
      const res = await api.post('/register', {
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      });
      if (res.data && res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('skine_user', JSON.stringify(res.data.user));
        addToast('Account created successfully! Welcome to Skiné.', 'success');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Registration failed.' };
    } catch (err) {
      // Local fallback simulator for React standalone testing
      const newUser = {
        id: Date.now(),
        full_name: fullName,
        email: email.toLowerCase(),
        role: 'user',
        skin_type: 'Normal',
      };
      setUser(newUser);
      localStorage.setItem('skine_user', JSON.stringify(newUser));
      addToast('Account created successfully! Welcome to Skiné.', 'success');
      return { success: true };
    }
  };

  const logout = async () => {
    try {
      await api.get('/logout');
    } catch {}
    setUser(null);
    localStorage.removeItem('skine_user');
    addToast('You have been signed out.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        login,
        register,
        logout,
        analysisResult,
        saveAnalysis,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
