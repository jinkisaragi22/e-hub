import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ehub_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('ehub_token');
        setToken(null);
      });
  }, [token]);

  function saveSession({ token: newToken, user: newUser }) {
    localStorage.setItem('ehub_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    saveSession(res.data);
  }

  async function register(email, password) {
    const res = await api.post('/auth/register', { email, password });
    saveSession(res.data);
  }

  function logout() {
    localStorage.removeItem('ehub_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
