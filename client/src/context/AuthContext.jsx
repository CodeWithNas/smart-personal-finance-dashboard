import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.token) setUser({ token: data.token });
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setUser({ token });
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
