import api from "./api";

export const authService = {
  login: (payload) => api.post("/auth/login", payload),
  signup: (payload) => api.post("/auth/signup", payload),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export default authService;
