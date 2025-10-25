import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user info from backend when app loads or refreshes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await api.getMe(); // always fetch latest role
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        console.error('AuthContext: Failed to fetch user info:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔹 Login
  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);

    // Fetch the latest user info (role, etc.)
    const userInfo = await api.getMe();
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);

    return userInfo;
  };

  // 🔹 Register
  const register = async (name, email, password, role = 'user') => {
    const data = await api.register(name, email, password, role);
    localStorage.setItem('token', data.token);

    // Fetch latest user details from backend (if available)
    const userInfo = await api.getMe();
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);

    return userInfo;
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // 🔹 Force update user (useful after profile edit)
  const updateUser = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
