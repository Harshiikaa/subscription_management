"use client";

import {
  type AuthState,
  authenticateUser,
  refreshAccessToken,
  registerUser,
} from "@/lib/auth";
import { auth, facebookProvider, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loginWithGoogle: () => Promise<boolean>;
  loginWithFacebook: () => Promise<boolean>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("saas_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem("saas_user");
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authenticateUser(email, password); // 👈 add await
      if (result) {
        localStorage.setItem("saas_user", JSON.stringify(result.user));
        setAuthState({
          user: result.user,
          isLoading: false,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      const result = await registerUser(email, password, name);
      if (result) {
        localStorage.setItem("saas_user", JSON.stringify(result.user));
        setAuthState({
          user: result.user,
          isLoading: false,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("saas_user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      // 1. Open Google popup
      const result = await signInWithPopup(auth, googleProvider);

      // 2. Get Firebase ID token
      const token = await result.user.getIdToken();

      // 3. Send token to your backend
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("accessToken", data.data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
        localStorage.setItem("saas_user", JSON.stringify(data.data.user));
        setAuthState({
          user: data.data.user,
          isLoading: false,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Google login error:", err);
      return false;
    }
  };

  const loginWithFacebook = async (): Promise<boolean> => {
    try {
      // 1. Open Facebook popup
      const result = await signInWithPopup(auth, facebookProvider);

      // 2. Get Firebase ID token
      const token = await result.user.getIdToken();

      // 3. Send token to your backend
      const res = await fetch("http://localhost:5000/api/auth/facebook-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("accessToken", data.data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
        localStorage.setItem("saas_user", JSON.stringify(data.data.user));
        setAuthState({
          user: data.data.user,
          isLoading: false,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Facebook login error:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithFacebook,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
