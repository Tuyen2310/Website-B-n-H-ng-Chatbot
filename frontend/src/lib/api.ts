import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: Dùng đường dẫn tương đối để tận dụng Next.js Rewrites trên cổng 3000, tránh hoàn toàn CORS/PNA
    return '/api';
  }
  // Server-side (SSR): Kết nối trực tiếp đến backend NestJS cổng 3001
  return process.env.NEXT_PUBLIC_API_URL || 'http://smartshop.local:3001/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    // Ép trình duyệt KHÔNG BAO GIỜ dùng lại cache cũ cho mọi request gọi qua api.ts
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    let token = localStorage.getItem('token');
    
    // Fallback to Zustand store if direct token is missing
    if (!token) {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          token = parsed.state?.token;
        } catch (e) {}
      }
    }

    if (token) {
      // Ensure headers object exists and set Authorization
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor: Handle Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export interface PublicSettings {
  general: {
    shopName: string;
    tagline: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    logo?: string;
    favicon?: string;
    banner?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  payment: {
    bankEnabled: boolean;
    bankId: string;
    accountNo: string;
    accountName: string;
    momoEnabled: boolean;
    momoPhone: string;
  };
  security: {
    maintenance: boolean;
  };
  flashSale?: {
    startTime: string | null;
    endTime: string | null;
  };
}

export const publicApi = {
  getPublicSettings: (): Promise<PublicSettings> => api.get('/settings/public').then((res) => res.data),
  validatePromotion: (code: string) => api.get(`/promotions/code/${code}`).then((res) => res.data),
  createGuestOrder: (data: any) => api.post('/orders/guest', data).then((res) => res.data),
};

export const catalogApi = {
  getCategories: () => api.get('/categories').then((res) => res.data),
  getProducts: (params?: any) => api.get('/products', { params }).then((res) => res.data),
  getProduct: (id: number) => api.get(`/products/${id}`).then((res) => res.data),
  getProductRecommendations: (id: number) => api.get(`/products/${id}/recommendations`).then((res) => res.data),
  createOrder: (data: any) => api.post('/orders', data).then((res) => res.data),
  getOrders: (params?: any) => api.get('/orders', { params }).then((res) => res.data),
  getMyOrders: (params?: any) => api.get('/orders', { params }).then((res) => res.data),
  getOrderById: (id: number) => api.get(`/orders/${id}`).then((res) => res.data),
  sendMessage: (message: string) => api.post('/chatbot/chat', { message }).then((res) => res.data),
  getFaqs: () => api.get('/faqs').then((res) => res.data),
  createFaq: (data: any) => api.post('/faqs', data).then((res) => res.data),
  updateFaq: (id: number, data: any) => api.patch(`/faqs/${id}`, data).then((res) => res.data),
  deleteFaq: (id: number) => api.delete(`/faqs/${id}`).then((res) => res.data),
  getReviews: (productId: number) => api.get(`/reviews/product/${productId}`).then((res) => res.data),
  createReview: (productId: number, rating: number, comment: string) => api.post('/reviews', { productId, rating, comment }).then((res) => res.data),
  deleteReview: (reviewId: number) => api.delete(`/reviews/${reviewId}`).then((res) => res.data),
  getAdminStats: (params?: any) => api.get('/admin/stats', { params }).then((res) => res.data),
  getMe: () => api.get('/users/me').then((res) => res.data),
  updateMe: (data: any) => api.patch('/users/me', data).then((res) => res.data),
  changePassword: (data: any) => api.patch('/users/change-password', data).then((res) => res.data),
  getWishlist: () => api.get('/users/wishlist').then((res) => res.data),
  toggleWishlist: (productId: number) => api.post(`/users/wishlist/${productId}`).then((res) => res.data),
  cancelOrder: (id: number) => api.delete(`/orders/${id}`).then((res) => res.data),
  completeOrder: (id: number) => api.patch(`/orders/${id}/complete`).then((res) => res.data),
  replyToReview: (id: number, reply: string) => api.patch(`/reviews/${id}/reply`, { reply }).then((res) => res.data),
  adminDeleteReview: (id: number) => api.delete(`/reviews/${id}`).then((res) => res.data),
  sendOtp: () => api.post('/users/send-otp').then((res) => res.data),
};

export const paymentApi = {
  createPaymentLink: (orderId: number, method: string) => api.post('/payment/create-link', { orderId, method }).then((res) => res.data),
  verifyPayment: (paymentId: string) => api.get(`/payment/verify/${paymentId}`).then((res) => res.data),
  mockWebhook: (paymentId: string, status: string) => api.post('/payment/webhook', { paymentId, status }).then((res) => res.data),
};

export const adminApi = {
  getUsers: (params?: any) => api.get('/users', { params }).then((res) => res.data),
  getChatbotLogs: () => api.get('/admin/chatbot-logs').then((res) => res.data),
  createUser: (data: any) => api.post('/users', data).then((res) => res.data),
  updateUser: (id: number, data: any) => api.patch(`/users/${id}`, data).then((res) => res.data),
  deleteUser: (id: number) => api.delete(`/users/${id}`).then((res) => res.data),
  updateOrderStatus: (id: number, status: string) => api.patch(`/orders/${id}/status`, { status }).then((res) => res.data),
  updatePaymentStatus: (id: number, paymentStatus: boolean) => api.patch(`/orders/${id}/payment`, { paymentStatus }).then((res) => res.data),
  cancelOrder: (id: number) => api.delete(`/orders/${id}`).then((res) => res.data),
  getPromotions: (params?: any) => api.get('/promotions', { params }).then((res) => res.data),
  createPromotion: (data: any) => api.post('/promotions', data).then((res) => res.data),
  updatePromotion: (id: number, data: any) => api.patch(`/promotions/${id}`, data).then((res) => res.data),
  deletePromotion: (id: number) => api.delete(`/promotions/${id}`).then((res) => res.data),
  createCategory: (data: any) => api.post('/categories', data).then((res) => res.data),
  updateCategory: (id: number, data: any) => api.patch(`/categories/${id}`, data).then((res) => res.data),
  deleteCategory: (id: number) => api.delete(`/categories/${id}`).then((res) => res.data),
  createProduct: (data: any) => api.post('/products', data).then((res) => res.data),
  updateProduct: (id: number, data: any) => api.patch(`/products/${id}`, data).then((res) => res.data),
  deleteProduct: (id: number) => api.delete(`/products/${id}`).then((res) => res.data),
  getSettings: () => api.get('/settings').then((res) => res.data),
  updateSettings: (data: any) => api.post('/settings', data).then((res) => res.data),
  clearCache: () => api.post('/settings/clear-cache').then((res) => res.data),
  terminateSessions: () => api.post('/settings/terminate-sessions').then((res) => res.data),
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/settings/upload', formData).then((res) => res.data);
  },
  getAttributes: () => api.get('/attributes').then((res) => res.data),
  createAttribute: (data: any) => api.post('/attributes', data).then((res) => res.data),
  updateAttribute: (id: number, data: any) => api.patch(`/attributes/${id}`, data).then((res) => res.data),
  deleteAttribute: (id: number) => api.delete(`/attributes/${id}`).then((res) => res.data),
  getOrders: (params?: any) => api.get('/orders', { params }).then((res) => res.data),
  getCatalog: (params?: any) => api.get('/products', { params }).then((res) => res.data),
  // Import sản phẩm từ Excel
  importProductsExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },
  // Tải file Excel mẫu
  downloadImportTemplate: () =>
    api.get('/products/import/template', { responseType: 'blob' }).then((res) => res.data),
};

export const authApi = {
  login: (data: any) => api.post('/auth/login', data).then((res) => res.data),
  register: (data: any) => api.post('/auth/register', data).then((res) => res.data),
};

export const provinceApi = {
  getProvinces: () => axios.get('https://provinces.open-api.vn/api/p/').then(res => res.data),
  getDistricts: (provinceCode: number) => axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`).then(res => res.data),
  getWards: (districtCode: number) => axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`).then(res => res.data),
};
