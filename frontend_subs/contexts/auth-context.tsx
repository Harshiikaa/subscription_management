"use client";

import { type AuthState, authenticateUser, registerUser } from "@/lib/auth";
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
      const user = authenticateUser(email, password);
      if (user) {
        localStorage.setItem("saas_user", JSON.stringify(user));
        setAuthState({
          user,
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
      const user = registerUser(email, password, name);
      localStorage.setItem("saas_user", JSON.stringify(user));
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("saas_user");
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  // const loginWithGoogle = async (): Promise<boolean> => {
  //   // Mock OAuth login - in real app, integrate with Google OAuth
  //   const mockGoogleUser: User = {
  //     id: "google_" + Date.now(),
  //     email: "google.user@gmail.com",
  //     name: "Google User",
  //     role: "user",
  //     isVerified: true,
  //     createdAt: new Date().toISOString(),
  //   }

  //   localStorage.setItem("saas_user", JSON.stringify(mockGoogleUser))
  //   setAuthState({
  //     user: mockGoogleUser,
  //     isLoading: false,
  //     isAuthenticated: true,
  //   })
  //   return true
  // }
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

  // const loginWithFacebook = async (): Promise<boolean> => {
  //   // Mock OAuth login - in real app, integrate with Facebook OAuth
  //   const mockFacebookUser: User = {
  //     id: "facebook_" + Date.now(),
  //     email: "facebook.user@facebook.com",
  //     name: "Facebook User",
  //     role: "user",
  //     isVerified: true,
  //     createdAt: new Date().toISOString(),
  //   }

  //   localStorage.setItem("saas_user", JSON.stringify(mockFacebookUser))
  //   setAuthState({
  //     user: mockFacebookUser,
  //     isLoading: false,
  //     isAuthenticated: true,
  //   })
  //   return true
  // }
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
