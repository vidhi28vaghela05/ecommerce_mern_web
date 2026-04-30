const API_BASE = `${window.location.origin}/api`;
const STORAGE_KEY = "ecom-auth-token";
const USER_KEY = "ecom-user";
const THEME_KEY = "ecom-theme";

export const storage = {
  getToken: () => localStorage.getItem(STORAGE_KEY) || "",
  setToken: (token) => localStorage.setItem(STORAGE_KEY, token),
  clearToken: () => localStorage.removeItem(STORAGE_KEY),
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(USER_KEY),
  getTheme: () => localStorage.getItem(THEME_KEY) || "light",
  setTheme: (theme) => localStorage.setItem(THEME_KEY, theme),
};

const request = async (endpoint, options = {}) => {
  const headers = new Headers(options.headers || {});
  const token = storage.getToken();

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const authApi = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  adminLogin: (payload) =>
    request("/auth/admin/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  updateProfile: (payload) => request("/auth/me", { method: "PUT", body: JSON.stringify(payload) }),
  logout: () => request("/auth/logout", { method: "POST" }),
};

export const catalogApi = {
  featured: () => request("/products/featured"),
  products: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    );
    return request(`/products?${query.toString()}`);
  },
  product: (id) => request(`/products/${id}`),
  categories: () => request("/categories"),
};

export const cartApi = {
  get: () => request("/cart"),
  add: (payload) => request("/cart", { method: "POST", body: JSON.stringify(payload) }),
  update: (productId, payload) =>
    request(`/cart/${productId}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (productId) => request(`/cart/${productId}`, { method: "DELETE" }),
};

export const orderApi = {
  checkout: (payload) =>
    request("/orders/checkout", { method: "POST", body: JSON.stringify(payload) }),
  mine: () => request("/orders"),
};

export const paymentApi = {
  createCheckoutSession: (payload) =>
    request("/payments/create-checkout-session", { method: "POST", body: JSON.stringify(payload) }),
  verifyPayment: (sessionId) =>
    request(`/payments/verify-payment?session_id=${sessionId}`),
};

export const wishlistApi = {
  get: () => request("/wishlist"),
  add: (productId) => request("/wishlist/add", { method: "POST", body: JSON.stringify({ productId }) }),
  remove: (productId) => request(`/wishlist/remove/${productId}`, { method: "DELETE" }),
};

export const adminApi = {
  stats: () => request("/admin/dashboard"),
  users: () => request("/admin/users"),
  removeUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
  orders: () => request("/admin/orders"),
  updateOrderStatus: (id, status) =>
    request(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  categories: () => request("/admin/categories"),
  createCategory: (payload) =>
    request("/admin/categories", { method: "POST", body: JSON.stringify(payload) }),
  updateCategory: (id, payload) =>
    request(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: "DELETE" }),
  createProduct: (formData) =>
    request("/admin/products", { method: "POST", body: formData }),
  updateProduct: (id, formData) =>
    request(`/admin/products/${id}`, { method: "PUT", body: formData }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: "DELETE" }),
};
