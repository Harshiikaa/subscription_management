const API_BASE_URL = "http://localhost:5000/api";

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  planType: "basic" | "premium" | "enterprise" | "custom";
  pricing: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: Array<{
    name: string;
    description?: string;
    included: boolean;
    limit?: string;
  }>;
  billingCycles: string[];
  trialPeriod: {
    enabled: boolean;
    days: number;
  };
  limits: {
    maxUsers?: number;
    maxStorage?: string;
    maxApiCalls?: number;
    maxProjects?: number;
  };
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanData {
  name: string;
  description: string;
  planType: "basic" | "premium" | "enterprise" | "custom";
  pricing: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: Array<{
    name: string;
    description?: string;
    included: boolean;
    limit?: string;
  }>;
  billingCycles: string[];
  trialPeriod: {
    enabled: boolean;
    days: number;
  };
  limits: {
    maxUsers?: number;
    maxStorage?: string;
    maxApiCalls?: number;
    maxProjects?: number;
  };
  isPopular: boolean;
  sortOrder: number;
  tags: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ListResponse {
  items: SubscriptionPlan[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Get authorization token (you can implement this based on your auth system)
const getAuthToken = (): string | null => {
  // Return the stored auth token or null
  return localStorage.getItem("authToken");
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

// Subscription Plan API functions
export const subscriptionPlanApi = {
  // List all subscription plans
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    planType?: string;
    isPopular?: boolean;
    minPrice?: number;
    maxPrice?: number;
    includeInactive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<ApiResponse<ListResponse>> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.planType) searchParams.set("planType", params.planType);
    if (params?.isPopular !== undefined)
      searchParams.set("isPopular", params.isPopular.toString());
    if (params?.minPrice)
      searchParams.set("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      searchParams.set("maxPrice", params.maxPrice.toString());
    if (params?.includeInactive)
      searchParams.set("includeInactive", params.includeInactive.toString());
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/subscription-plans?${queryString}`
      : "/subscription-plans";

    return apiRequest<ListResponse>(endpoint);
  },

  // Get a single subscription plan
  get: async (id: string): Promise<ApiResponse<SubscriptionPlan>> => {
    return apiRequest<SubscriptionPlan>(`/subscription-plans/${id}`);
  },

  // Create a new subscription plan
  create: async (
    data: CreateSubscriptionPlanData
  ): Promise<ApiResponse<SubscriptionPlan>> => {
    return apiRequest<SubscriptionPlan>("/subscription-plans", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update a subscription plan
  update: async (
    id: string,
    data: Partial<CreateSubscriptionPlanData>
  ): Promise<ApiResponse<SubscriptionPlan>> => {
    return apiRequest<SubscriptionPlan>(`/subscription-plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete a subscription plan
  delete: async (id: string): Promise<ApiResponse<SubscriptionPlan>> => {
    return apiRequest<SubscriptionPlan>(`/subscription-plans/${id}`, {
      method: "DELETE",
    });
  },

  // Get popular plans
  getPopular: async (
    limit?: number
  ): Promise<ApiResponse<SubscriptionPlan[]>> => {
    const endpoint = limit
      ? `/subscription-plans/popular?limit=${limit}`
      : "/subscription-plans/popular";
    return apiRequest<SubscriptionPlan[]>(endpoint);
  },

  // Get plans by type
  getByType: async (
    planType: string
  ): Promise<ApiResponse<SubscriptionPlan[]>> => {
    return apiRequest<SubscriptionPlan[]>(
      `/subscription-plans/type/${planType}`
    );
  },

  // Search plans
  search: async (
    query: string,
    options?: {
      planType?: string;
      minPrice?: number;
      maxPrice?: number;
      tags?: string[];
    }
  ): Promise<ApiResponse<SubscriptionPlan[]>> => {
    const searchParams = new URLSearchParams({ q: query });

    if (options?.planType) searchParams.set("planType", options.planType);
    if (options?.minPrice)
      searchParams.set("minPrice", options.minPrice.toString());
    if (options?.maxPrice)
      searchParams.set("maxPrice", options.maxPrice.toString());
    if (options?.tags) searchParams.set("tags", options.tags.join(","));

    return apiRequest<SubscriptionPlan[]>(
      `/subscription-plans/search?${searchParams.toString()}`
    );
  },

  // Get active plans
  getActive: async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
    return apiRequest<SubscriptionPlan[]>("/subscription-plans/active");
  },

  // Toggle plan status
  toggleStatus: async (id: string): Promise<ApiResponse<SubscriptionPlan>> => {
    return apiRequest<SubscriptionPlan>(
      `/subscription-plans/${id}/toggle-status`,
      {
        method: "PATCH",
      }
    );
  },

  // Set popular plan
  setPopular: async (
    id: string,
    isPopular: boolean
  ): Promise<ApiResponse<SubscriptionPlan>> => {
    return apiRequest<SubscriptionPlan>(`/subscription-plans/${id}/popular`, {
      method: "PATCH",
      body: JSON.stringify({ isPopular }),
    });
  },

  // Update sort order
  updateSortOrder: async (
    id: string,
    sortOrder: number
  ): Promise<ApiResponse<SubscriptionPlan>> => {
    return apiRequest<SubscriptionPlan>(
      `/subscription-plans/${id}/sort-order`,
      {
        method: "PATCH",
        body: JSON.stringify({ sortOrder }),
      }
    );
  },

  // Bulk update plans
  bulkUpdate: async (
    updates: Array<{
      planId: string;
      updateData: Partial<CreateSubscriptionPlanData>;
    }>
  ): Promise<ApiResponse<any>> => {
    return apiRequest<any>("/subscription-plans/bulk-update", {
      method: "PATCH",
      body: JSON.stringify({ updates }),
    });
  },
};

export default subscriptionPlanApi;
