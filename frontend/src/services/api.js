import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User APIs
export const userAPI = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/login', data),
  logout: () => api.get('/user/logout'),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/update', data),
  forgetPassword: (email) => api.post('/user/forget-password', { email }),
  resetPassword: (token, newPassword) =>
    api.post(`/user/reset-password/${token}`, { newPassword }),
};

// Product APIs
export const productAPI = {
  getAllProducts: (filters = {}) =>
    api.get('/product/all', { params: filters }),
  getFeaturedProducts: () => api.get('/product/featured/all'),
  getProductsByCategory: (category) =>
    api.get(`/product/category/${category}`),
  getSingleProduct: (id) => api.get(`/product/${id}`),
  createProduct: (data) => api.post('/product/add', data),
  updateProduct: (id, data) => api.put(`/product/${id}`, data),
  deleteProduct: (id) => api.delete(`/product/${id}`),
};

// Cart APIs
export const cartAPI = {
  addToCart: (item) => api.post('/cart/add', { item }),
  getCart: () => api.get('/cart/all'),
  removeFromCart: (productId) => api.delete(`/cart/product/${productId}`),
  updateQuantity: (productId, quantity) =>
    api.put(`/cart/product/${productId}`, { quantity }),
};

// Order APIs
export const orderAPI = {
  createOrder: (items) => api.post('/order/add', { items }),
  getOrders: () => api.get('/order/all'),
  getOrder: (id) => api.get(`/order/${id}`),
  cancelOrder: (id) => api.delete(`/order/${id}`),
};

// Payment APIs
export const paymentAPI = {
  createPaymentIntent: (amount, currency) =>
    api.post('/payment/create', { amount, currency }),
  confirmPayment: (paymentIntentId, orderId) =>
    api.post('/payment/confirm', { paymentIntentId, orderId }),
};

// Wishlist APIs
export const wishlistAPI = {
  addToWishlist: (productId) => api.post('/wishlist/add', { productId }),
  getWishlist: () => api.get('/wishlist/all'),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
};

// Chat APIs
export const chatAPI = {
  getHistory: (room) => api.get(`/chat/history/${room}`),
  getConversations: () => api.get('/chat/conversations'),
  sendMessage: (message) => api.post('/bot', { message }), // Existing bot API
};

// Admin APIs
export const adminAPI = {
  getAllUsers: () => api.get('/admin/all/user'),
  deleteUser: (id) => api.delete(`/admin/user/${id}`),
  updateUserRole: (id, role) =>
    api.put(`/admin/user/${id}/role`, { role }),
};

export default api;