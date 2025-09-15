const API_BASE_URL = "http://localhost:5000/api";

export interface Payment {
  _id: string;
  userId: string;
  subscriptionId?: string;
  productId?: string;
  paymentType: "subscription" | "product" | "plan";
  orderId: string;
  transactionUUID: string;
  amount: number;
  currency: string;
  paymentMethod: "esewa" | "khalti" | "stripe" | "card" | "bank_transfer";
  providerRefId?: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  gatewayData?: any;
  paidAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  failureReason?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  subscription?: {
    _id: string;
    subscriptionType: string;
    status: string;
    billingCycle: string;
    amount: number;
  };
  product?: {
    _id: string;
    name: string;
    description: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface CreatePaymentData {
  userId: string;
  subscriptionId?: string;
  productId?: string;
  paymentType: "subscription" | "product" | "plan";
  amount: number;
  currency?: string;
  paymentMethod: "esewa" | "khalti" | "stripe" | "card" | "bank_transfer";
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ListResponse {
  items: Payment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Get authorization token (you can implement this based on your auth system)
const getAuthToken = (): string | null => {
  // Return the stored auth token or null
  return localStorage.getItem("accessToken");
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

// Payment API functions
export const paymentApi = {
  // Get user's payments (invoices)
  getMyPayments: async (params?: {
    page?: number;
    limit?: number;
    paymentType?: "subscription" | "product" | "plan";
    status?:
      | "pending"
      | "processing"
      | "completed"
      | "failed"
      | "cancelled"
      | "refunded";
  }): Promise<ApiResponse<ListResponse>> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.paymentType)
      searchParams.set("paymentType", params.paymentType);
    if (params?.status) searchParams.set("status", params.status);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/payments/me?${queryString}`
      : "/payments/me";

    return apiRequest<ListResponse>(endpoint);
  },

  // Get a single payment
  get: async (id: string): Promise<ApiResponse<Payment>> => {
    return apiRequest<Payment>(`/payments/${id}`);
  },

  // Get payments by subscription
  getBySubscription: async (
    subscriptionId: string
  ): Promise<ApiResponse<Payment[]>> => {
    return apiRequest<Payment[]>(`/payments/subscription/${subscriptionId}`);
  },

  // Get payments by product
  getByProduct: async (productId: string): Promise<ApiResponse<Payment[]>> => {
    return apiRequest<Payment[]>(`/payments/product/${productId}`);
  },

  // Create subscription payment
  createSubscriptionPayment: async (data: {
    subscriptionId: string;
    paymentMethod: string;
  }): Promise<ApiResponse<Payment>> => {
    return apiRequest<Payment>("/payments/subscription", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Create product payment
  createProductPayment: async (data: {
    productId: string;
    paymentMethod: string;
    amount: number;
    currency?: string;
  }): Promise<ApiResponse<Payment>> => {
    return apiRequest<Payment>("/payments/product", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Create eSewa payment
  createEsewaPayment: async (data: {
    productId?: string;
    subscriptionId?: string;
    amount: number;
    currency?: string;
  }): Promise<ApiResponse<Payment>> => {
    return apiRequest<Payment>("/payments/esewa", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Create Khalti payment
  createKhaltiPayment: async (data: {
    productId?: string;
    subscriptionId?: string;
    amount: number;
    currency?: string;
  }): Promise<ApiResponse<Payment>> => {
    return apiRequest<Payment>("/payments/khalti", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update payment status
  updateStatus: async (
    id: string,
    status: string,
    additionalData?: any
  ): Promise<ApiResponse<Payment>> => {
    return apiRequest<Payment>(`/payments/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, ...additionalData }),
    });
  },

  // Process refund
  processRefund: async (
    id: string,
    reason?: string
  ): Promise<ApiResponse<Payment>> => {
    return apiRequest<Payment>(`/payments/${id}/refund`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  // Get completed payments (admin only)
  getCompleted: async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ApiResponse<Payment[]>> => {
    const searchParams = new URLSearchParams();

    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/payments/admin/completed?${queryString}`
      : "/payments/admin/completed";

    return apiRequest<Payment[]>(endpoint);
  },

  // Get payment stats (admin only)
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>("/payments/admin/stats");
  },
};

export default paymentApi;
