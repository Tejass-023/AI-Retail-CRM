import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional API methods wrapper
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getOne: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getPurchases: (id) => api.get(`/customers/${id}/purchases`),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getCategories: () => api.get('/products/categories'),
  createCategory: (data) => api.post('/products/categories', data),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
};

export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getAlerts: () => api.get('/inventory/alerts'),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getSales: () => api.get('/analytics/sales'),
  getTopProducts: () => api.get('/analytics/top-products'),
  getCustomerSegments: () => api.get('/analytics/customer-segments'),
};

export const aiAPI = {
  getForecast: (productId) => api.get(`/ai/forecast/${productId}`),
  getRecommendations: () => api.get('/ai/recommendations'),
};

export const marketAPI = {
  getTrends: () => api.get('/market/trends'),
};

export default api;
