import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  getProfile: () => api.get('/auth/me'), // Fixed: backend uses /me not /profile
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Dashboard API
export const dashboardAPI = {
  getKPIs: () => api.get('/dashboard/kpis'),
  getRecentActivities: (params) => api.get('/dashboard/recent-activities', { params }),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
  search: (query) => api.get('/products/search', { params: { q: query } }),
};

// Operations API
export const operationsAPI = {
  // Receipts
  getReceipts: (params) => api.get('/operations/receipts', { params }),
  getReceiptById: (id) => api.get(`/operations/receipts/${id}`),
  createReceipt: (data) => api.post('/operations/receipts', data),
  updateReceipt: (id, data) => api.put(`/operations/receipts/${id}`, data),
  validateReceipt: (id) => api.put(`/operations/receipts/${id}/validate`), // Changed to PUT
  
  // Deliveries
  getDeliveries: (params) => api.get('/operations/deliveries', { params }),
  getDeliveryById: (id) => api.get(`/operations/deliveries/${id}`),
  createDelivery: (data) => api.post('/operations/deliveries', data),
  updateDelivery: (id, data) => api.put(`/operations/deliveries/${id}`, data),
  validateDelivery: (id) => api.put(`/operations/deliveries/${id}/validate`), // Changed to PUT
  
  // Transfers
  getTransfers: (params) => api.get('/operations/transfers', { params }),
  getTransferById: (id) => api.get(`/operations/transfers/${id}`),
  createTransfer: (data) => api.post('/operations/transfers', data),
  updateTransfer: (id, data) => api.put(`/operations/transfers/${id}`, data),
  validateTransfer: (id) => api.put(`/operations/transfers/${id}/validate`), // Changed to PUT
  
  // Adjustments
  getAdjustments: (params) => api.get('/operations/adjustments', { params }),
  getAdjustmentById: (id) => api.get(`/operations/adjustments/${id}`),
  createAdjustment: (data) => api.post('/operations/adjustments', data),
  updateAdjustment: (id, data) => api.put(`/operations/adjustments/${id}`, data),
  validateAdjustment: (id) => api.put(`/operations/adjustments/${id}/validate`), // Changed to PUT
  
  // Move History
  getMoveHistory: (params) => api.get('/operations/moves', { params }), // Fixed: backend uses /moves not /move-history
};

// AI API
export const aiAPI = {
  getDemandForecast: (productId) => api.get(`/ai/forecast/${productId}`),
  getReorderSuggestions: () => api.get('/ai/reorder-suggestions'),
  detectAnomalies: () => api.get('/ai/anomalies'),
  chat: (data) => api.post('/ai/chat', data),
  getInsights: () => api.get('/ai/insights'),
  speechToText: (audioBlob, language = 'en-IN') => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('language', language);
    return api.post('/ai/speech-to-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  textToSpeech: (text, language = 'en-IN', speaker = 'meera') => 
    api.post('/ai/text-to-speech', { text, language, speaker }, {
      responseType: 'blob',
    }),
};

// Warehouses API
export const warehousesAPI = {
  getAll: (params) => api.get('/warehouses', { params }),
  getById: (id) => api.get(`/warehouses/${id}`),
  create: (data) => api.post('/warehouses', data),
  update: (id, data) => api.put(`/warehouses/${id}`, data),
  delete: (id) => api.delete(`/warehouses/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export default api;
