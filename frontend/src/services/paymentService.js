import api from "./api";

// NOTE: These endpoints are placeholders. Implement on backend to initiate payment,
// verify callbacks, and record transactions. Gateways: eSewa, IME Pay
export const paymentService = {
  // Initiate eSewa payment; backend should return a form/action URL or redirect info
  initiateEsewa: (payload) => api.post("/payments/esewa/initiate", payload),
  verifyEsewa: (query) =>
    api.get(`/payments/esewa/verify${query ? `?${query}` : ""}`),

  // Initiate IME Pay; backend returns redirect URL/token
  initiateImePay: (payload) => api.post("/payments/imepay/initiate", payload),
  verifyImePay: (query) =>
    api.get(`/payments/imepay/verify${query ? `?${query}` : ""}`),
};

export default paymentService;
