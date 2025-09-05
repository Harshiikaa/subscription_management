import {
  mockPlans,
  mockSubscription,
  mockPayments,
  mockUser,
  mockAdminUsers,
  mockAdminPayments,
} from "./fixtures";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const respond = async (data, ok = true) => {
  await delay();
  if (ok) return { data: { success: true, data } };
  throw { response: { data: { success: false, message: "Mock error" } } };
};

const mockClient = {
  get: async (url) => {
    if (url === "/plans") return respond(mockPlans);
    if (url === "/subscriptions/me") return respond(mockSubscription);
    if (url === "/payments/history") return respond(mockPayments);
    if (url === "/admin/users") return respond(mockAdminUsers);
    if (url === "/admin/payments") return respond(mockAdminPayments);
    if (url.startsWith("/payments/esewa/verify"))
      return respond({ status: "success" });
    if (url.startsWith("/payments/imepay/verify"))
      return respond({ status: "success" });
    return respond(null);
  },
  post: async (url, body) => {
    if (url === "/auth/login") return respond(mockUser);
    if (url === "/auth/signup") return respond(mockUser);
    if (url === "/auth/logout") return respond(null);

    if (url === "/subscriptions") return respond({ id: "sub_mock" });
    if (url === "/subscriptions/upgrade") return respond({});
    if (url === "/subscriptions/downgrade") return respond({});
    if (url === "/subscriptions/cancel") return respond({});

    if (url === "/payments/esewa/initiate")
      return respond({ redirectUrl: "/payments/esewa/callback?ref=mock" });
    if (url === "/payments/imepay/initiate")
      return respond({ redirectUrl: "/payments/imepay/callback?ref=mock" });

    if (url === "/plans") return respond({});
    return respond(null);
  },
  put: async (url, body) => {
    if (url.startsWith("/admin/users/") && url.endsWith("/role"))
      return respond({});
    return respond({});
  },
  delete: async () => respond({}),
};

export default mockClient;
