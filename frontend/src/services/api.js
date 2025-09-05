import axios from "axios";

const useMocks =
  String(process.env.REACT_APP_USE_MOCKS || "").toLowerCase() === "true";

let api;
if (useMocks) {
  // eslint-disable-next-line global-require
  const mockClient = require("./mock/client").default;
  api = mockClient;
} else {
  const BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

  api = axios.create({ baseURL: BASE_URL });

  api.interceptors.request.use((config) => {
    try {
      const raw = localStorage.getItem("auth.state");
      if (raw) {
        const { token } = JSON.parse(raw) || {};
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  });
  api.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        try {
          localStorage.removeItem("auth.state");
        } catch (_) {}
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(err);
    }
  );
}

export default api;
