const API_BASE_URL = "http://localhost:5000/api";

export interface Subscription {
  _id: string;
  userId: string;
  productId?:
    | string
    | {
        _id: string;
        name: string;
        description: string;
        price: {
          monthly: number;
          yearly: number;
        };
        formattedPrice: {
          monthly: string;
          yearly: string;
        };
        features: string[];
        image: string;
        category: string;
        isActive: boolean;
        isPopular: boolean;
        rating: number;
        reviews: number;
        tags: string[];
        trialDays: number;
        yearlySavings: number;
        url: string;
        availability: string;
        maxUsers?: number;
        storage?: string;
        support?: string;
        createdAt: string;
        updatedAt: string;
        createdBy?: string;
        updatedBy?: string;
        __v: number;
        id: string;
      };
  subscriptionPlanId?: string;
  subscriptionType: "product" | "plan";
  status: "active" | "inactive" | "cancelled" | "expired" | "trial";
  billingCycle: "monthly" | "yearly" | "quarterly" | "weekly";
  currency: string;
  amount: number;
  startDate: string;
  endDate?: string;
  nextBilling?: string;
  trialEndsAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  failureReason?: string;
  paymentMethod: "esewa" | "khalti" | "stripe" | "card" | "bank_transfer";
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  // Computed fields
  daysRemaining?: number;
  isActive?: boolean;
  isInTrial?: boolean;
  id: string;
  // Populated fields (for backward compatibility)
  product?: {
    _id: string;
    name: string;
    description: string;
  };
  subscriptionPlan?: {
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

export interface CreateSubscriptionData {
  userId: string;
  productId?: string;
  subscriptionPlanId?: string;
  subscriptionType: "product" | "plan";
  billingCycle: "monthly" | "yearly" | "quarterly" | "weekly";
  currency: string;
  amount: number;
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ListResponse {
  items: Subscription[];
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

// Subscription API functions
export const subscriptionApi = {
  // List all subscriptions (admin only)
  listAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    subscriptionType?: string;
    userId?: string;
    productId?: string;
    subscriptionPlanId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<ApiResponse<ListResponse>> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.subscriptionType)
      searchParams.set("type", params.subscriptionType);
    if (params?.userId) searchParams.set("userId", params.userId);
    if (params?.productId) searchParams.set("productId", params.productId);
    if (params?.subscriptionPlanId)
      searchParams.set("subscriptionPlanId", params.subscriptionPlanId);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/subscriptions?${queryString}`
      : "/subscriptions";

    return apiRequest<ListResponse>(endpoint);
  },

  // List user's subscriptions
  listMy: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    subscriptionType?: string;
  }): Promise<ApiResponse<ListResponse>> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.subscriptionType)
      searchParams.set("type", params.subscriptionType);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/subscriptions/me?${queryString}`
      : "/subscriptions/me";

    return apiRequest<ListResponse>(endpoint);
  },

  // Get a single subscription
  get: async (id: string): Promise<ApiResponse<Subscription>> => {
    return apiRequest<Subscription>(`/subscriptions/${id}`);
  },

  // Create subscription from product
  createFromProduct: async (data: {
    productId: string;
    billingCycle: string;
    currency?: string;
  }): Promise<ApiResponse<Subscription>> => {
    return apiRequest<Subscription>("/subscriptions/product", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Create subscription from plan
  createFromPlan: async (data: {
    subscriptionPlanId: string;
    billingCycle: string;
    currency?: string;
  }): Promise<ApiResponse<Subscription>> => {
    return apiRequest<Subscription>("/subscriptions/plan", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update subscription
  update: async (
    id: string,
    data: Partial<CreateSubscriptionData>
  ): Promise<ApiResponse<Subscription>> => {
    return apiRequest<Subscription>(`/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Cancel subscription
  cancel: async (id: string): Promise<ApiResponse<Subscription>> => {
    return apiRequest<Subscription>(`/subscriptions/${id}/cancel`, {
      method: "PATCH",
    });
  },

  // Renew subscription
  renew: async (id: string): Promise<ApiResponse<Subscription>> => {
    return apiRequest<Subscription>(`/subscriptions/${id}/renew`, {
      method: "PATCH",
    });
  },

  // Set reminder days for a subscription
  setReminder: async (
    id: string,
    reminderDaysBefore: number
  ): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/subscriptions/${id}/reminder`, {
      method: "POST",
      body: JSON.stringify({ reminderDaysBefore }),
    });
  },

  // Get subscriptions by product
  getByProduct: async (
    productId: string
  ): Promise<ApiResponse<Subscription[]>> => {
    return apiRequest<Subscription[]>(`/subscriptions/product/${productId}`);
  },

  // Get subscriptions by plan
  getByPlan: async (planId: string): Promise<ApiResponse<Subscription[]>> => {
    return apiRequest<Subscription[]>(`/subscriptions/plan/${planId}`);
  },

  // Get subscriptions by type
  getByType: async (type: string): Promise<ApiResponse<Subscription[]>> => {
    return apiRequest<Subscription[]>(`/subscriptions/type/${type}`);
  },

  // Get active subscriptions
  getActive: async (userId?: string): Promise<ApiResponse<Subscription[]>> => {
    const endpoint = userId
      ? `/subscriptions/active/${userId}`
      : "/subscriptions/active";
    return apiRequest<Subscription[]>(endpoint);
  },

  // Admin: Get subscriptions for a specific user
  getByUser: async (userId: string): Promise<ApiResponse<Subscription[]>> => {
    return apiRequest<Subscription[]>(`/subscriptions/user/${userId}`);
  },

  // Get expiring subscriptions
  getExpiring: async (days?: number): Promise<ApiResponse<Subscription[]>> => {
    const endpoint = days
      ? `/subscriptions/expiring?days=${days}`
      : "/subscriptions/expiring";
    return apiRequest<Subscription[]>(endpoint);
  },
};

export default subscriptionApi;
