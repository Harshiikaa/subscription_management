const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type Product = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  pricing?: { monthly?: number; yearly?: number; currency?: string };
  currency?: string;
  category?: string;
  status?: string;
  createdAt?: string;
};

type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

async function apiGet<T>(endpoint: string): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  const json = await res.json();
  if (!json?.success) {
    throw new Error(json?.message || `Request failed: ${res.status}`);
  }
  return json.data as T;
}

export const productsApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return apiGet<Paginated<Product>>(`/api/products${query}`);
  },
  get: async (id: string) => apiGet<Product>(`/api/products/${id}`),
};

export default productsApi;
