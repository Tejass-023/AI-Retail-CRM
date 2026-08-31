import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crm_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.me()
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          // Token invalid or offline fallback default user for easy demoing
          setUser({
            id: 1,
            full_name: 'Rajesh Sharma (Shop Owner)',
            email: 'owner@apnacrm.com',
            role: 'SHOP_OWNER',
            shop_id: 1
          });
        })
        .finally(() => setLoading(false));
    } else {
      // Default demo logged in state so user can immediately view dashboard without forced block
      setUser({
        id: 1,
        full_name: 'Rajesh Sharma (Shop Owner)',
        email: 'owner@apnacrm.com',
        role: 'SHOP_OWNER',
        shop_id: 1
      });
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const data = res.data;
      localStorage.setItem('crm_token', data.access_token);
      setToken(data.access_token);
      setUser({
        id: data.user_id,
        full_name: data.full_name,
        role: data.role,
        shop_id: data.shop_id,
        email: email
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Invalid email or password' };
    }
  };

  const register = async (name, email, password, shopName) => {
    try {
      const res = await authAPI.register({ full_name: name, email, password, shop_name: shopName });
      const data = res.data;
      localStorage.setItem('crm_token', data.access_token);
      setToken(data.access_token);
      setUser({
        id: data.user_id,
        full_name: data.full_name,
        role: data.role,
        shop_id: data.shop_id,
        email: email
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('crm_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
