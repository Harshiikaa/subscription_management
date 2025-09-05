import api from "./api";

export const adminService = {
  listUsers: () => api.get("/admin/users"),
  updateUserRole: (userId, role) =>
    api.put(`/admin/users/${userId}/role`, { role }),
  payments: () => api.get("/admin/payments"),
};

export default adminService;
