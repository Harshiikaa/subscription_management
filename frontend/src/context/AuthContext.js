import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "auth.state";

const defaultAuthState = {
  isAuthenticated: false,
  user: null, // { id, name, email, role: 'admin' | 'user' }
  token: null,
};

const AuthContext = createContext({
  ...defaultAuthState,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  setUserRole: () => {},
});

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultAuthState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = async ({ email, password }) => {
    // TODO: Integrate with backend: POST http://localhost:5000/api/auth/login
    // Return shape expected: { success, data: { token, user: { id, name, email, role } } }
    // For demo purposes, we simulate:
    const isAdmin = email?.toLowerCase().includes("admin");
    const fake = {
      token: "demo-jwt-token",
      user: {
        id: "u_123",
        name: isAdmin ? "Admin User" : "Regular User",
        email,
        role: isAdmin ? "admin" : "user",
      },
    };
    setState({ isAuthenticated: true, user: fake.user, token: fake.token });
    return { success: true };
  };

  const signup = async ({ name, email, password }) => {
    // TODO: Integrate with backend: POST http://localhost:5000/api/auth/signup
    // For demo purposes auto-login as user
    const fake = {
      token: "demo-jwt-token",
      user: { id: "u_124", name, email, role: "user" },
    };
    setState({ isAuthenticated: true, user: fake.user, token: fake.token });
    return { success: true };
  };

  const logout = () => setState(defaultAuthState);

  const setUserRole = (role) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, role } : null,
    }));
  };

  const value = useMemo(
    () => ({ ...state, login, signup, logout, setUserRole }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
