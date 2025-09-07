export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// -----------------------------
// Real backend integration
// -----------------------------

const API_BASE = "http://localhost:5000/api/auth"; // adjust if needed

// Login with email/password
export const authenticateUser = async (
  email: string,
  password: string
): Promise<{
  user: User;
  tokens: { accessToken: string; refreshToken: string };
} | null> => {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.success) {
      // Save token in localStorage
      localStorage.setItem("accessToken", data.data.tokens.accessToken);
      // for now ill save in localstorage for accessibility
      localStorage.setItem("refreshToken", data.data.tokens.refreshToken);

      // Return user object
      return {
        user: data.data.user as User,
        tokens: data.data.tokens,
      };
    }
    return null;
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
};

// Register new user
export const registerUser = async (
  email: string,
  password: string,
  name: string
): Promise<{
  user: User;
  tokens?: { accessToken: string; refreshToken: string };
} | null> => {
  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();
    if (data.success) {
      // If backend issues tokens on signup, save them
      if (data.data.tokens) {
        localStorage.setItem("accessToken", data.data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
      }

      return {
        user: data.data.user ?? data.data, // backend might send either user or raw data
        tokens: data.data.tokens,
      };
    }
    return null;
  } catch (err) {
    console.error("Register error:", err);
    return null;
  }
};

// Refresh access token
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("accessToken", data.data.accessToken);
      return data.data.accessToken;
    }
    return null;
  } catch (err) {
    console.error("Refresh token error:", err);
    return null;
  }
};

// -----------------------------
// Utility functions
// -----------------------------

export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin";
};

export const requireAuth = (user: User | null): boolean => {
  return !!user;
};

// export interface User {
//   id: string
//   email: string
//   name: string
//   role: "user" | "admin"
//   avatar?: string
//   isVerified: boolean
//   createdAt: string
// }

// export interface AuthState {
//   user: User | null
//   isLoading: boolean
//   isAuthenticated: boolean
// }

// // Mock users for development
// export const mockUsers: User[] = [
//   {
//     id: "1",
//     email: "admin@saas.com",
//     name: "Admin User",
//     role: "admin",
//     isVerified: true,
//     createdAt: "2024-01-01T00:00:00Z",
//   },
//   {
//     id: "2",
//     email: "user@example.com",
//     name: "John Doe",
//     role: "user",
//     isVerified: true,
//     createdAt: "2024-01-15T00:00:00Z",
//   },
//   {
//     id: "3",
//     email: "jane@example.com",
//     name: "Jane Smith",
//     role: "user",
//     isVerified: false,
//     createdAt: "2024-02-01T00:00:00Z",
//   },
//   {
//     id: "4",
//     email: "bob@company.com",
//     name: "Bob Johnson",
//     role: "user",
//     isVerified: true,
//     createdAt: "2023-12-01T00:00:00Z",
//   },
//   {
//     id: "5",
//     email: "alice@startup.com",
//     name: "Alice Brown",
//     role: "user",
//     isVerified: false,
//     createdAt: "2024-02-20T00:00:00Z",
//   },
//   {
//     id: "6",
//     email: "charlie@enterprise.com",
//     name: "Charlie Wilson",
//     role: "user",
//     isVerified: true,
//     createdAt: "2024-02-25T00:00:00Z",
//   },
//   {
//     id: "7",
//     email: "support@saas.com",
//     name: "Support Admin",
//     role: "admin",
//     isVerified: true,
//     createdAt: "2024-01-01T00:00:00Z",
//   },
// ]

// // Authentication utilities
// export const authenticateUser = (email: string, password: string): User | null => {
//   // Mock authentication - in real app, this would call your backend
//   const user = mockUsers.find((u) => u.email === email)
//   if (user && password === "password123") {
//     return user
//   }
//   return null
// }

// export const registerUser = (email: string, password: string, name: string): User => {
//   // Mock registration - in real app, this would call your backend
//   const newUser: User = {
//     id: Date.now().toString(),
//     email,
//     name,
//     role: "user",
//     isVerified: false,
//     createdAt: new Date().toISOString(),
//   }
//   mockUsers.push(newUser)
//   return newUser
// }

// export const isAdmin = (user: User | null): boolean => {
//   return user?.role === "admin"
// }

// export const requireAuth = (user: User | null): boolean => {
//   return !!user
// }
