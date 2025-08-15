import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
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
    console.error('API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/api/login', credentials),

  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) =>
    api.post('/api/register', data),

  logout: () => api.post('/api/logout'),

  getUser: () => api.get('/api/user'),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/api/products'),
  getById: (id: number) => api.get(`/api/products/${id}`),
  update: (id: number, data: any) => api.put(`/api/products/${id}`, data),
  create: (data: any) => api.post('/api/products', data),
  delete: (id: number) => api.delete(`/api/products/${id}`),
};

// Orders API
export const ordersAPI = {
  create: (data: { product_id: number; quantity: number }) =>
    api.post('/api/orders', data),
  
  getMyOrders: () => api.get('/api/orders'),
  
  getById: (id: number) => api.get(`/api/orders/${id}`),
};

// Transactions API
export const transactionsAPI = {
  create: (data: { type: string; amount: number; description: string }) =>
    api.post('/api/transactions', data),

  getMyTransactions: () => api.get('/api/transactions'),
};

// Auto Deposits API
export const autoDepositsAPI = {
  create: (data: { amount: number }) => api.post('/api/auto-deposits', data),

  getMyDeposits: () => api.get('/api/auto-deposits'),

  checkStatus: (id: number) => api.get(`/api/auto-deposits/${id}/status`),
};

// SePay API
export const sepayAPI = {
  createDeposit: (data: { amount: number }) => api.post('/api/sepay/deposit', data),
  
  checkStatus: (id: number) => api.get(`/api/sepay/deposit/${id}/status`),
  
  getTransactionHistory: () => api.get('/api/sepay/transactions'),
};

// Admin API
export const adminAPI = {
  bulkUploadAccounts: (data: { product_id: number; accounts: any[] }) =>
    api.post('/api/admin/accounts/bulk-upload', data),

  getStats: () => api.get('/api/admin/stats'),

  updateUserBalance: (data: { user_id: number; balance: number }) =>
    api.post('/api/admin/users/update-balance', data),
};

// Download API
export const downloadAPI = {
  downloadOrder: (orderId: number) => 
    api.get(`/api/download/order/${orderId}`, { responseType: 'blob' }),
  
  downloadMultiple: (orderIds: number[]) =>
    api.post('/api/download/multiple', { order_ids: orderIds }, { responseType: 'blob' }),
  
  downloadAll: () =>
    api.get('/api/download/all', { responseType: 'blob' }),
};

export default api;
