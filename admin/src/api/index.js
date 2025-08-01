import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/',
  withCredentials: true, // Important: allows cookies to be sent with requests
});

// No need for token in request headers anymore as we're using HttpOnly cookies
// But we'll keep a simplified interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If we get a 401 Unauthorized error
    if (error.response?.status === 401) {
      // Try to refresh the token if we're not already trying to refresh
      if (!error.config._isRetry && !error.config.url.includes('/auth/refresh')) {
        try {
          // Call the refresh token endpoint
          await api.post('/auth/refresh');
          
          // If refresh successful, retry the original request
          error.config._isRetry = true;
          return api(error.config);
        } catch (refreshError) {
          // If refresh fails, clear admin data and redirect to login
          localStorage.removeItem('adminUser');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // If we're already trying to refresh or the refresh endpoint itself failed
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const loginAdmin = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  if (response.data.success) {
    localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
  }
  
  return response;
};

export const logoutAdmin = async () => {
  try {
    // Call the logout endpoint to clear cookies on the server
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage regardless of server response
    localStorage.removeItem('adminUser');
  }
};

export const getAdminFromStorage = () => {
  const user = localStorage.getItem('adminUser');
  return user ? JSON.parse(user) : null;
};

export const isAdminLoggedIn = async () => {
  // With HttpOnly cookies, we can't directly check if the user is logged in
  // Instead, we make a request to the /auth/me endpoint
  // If it succeeds, the user is logged in; if it fails, they're not
  const adminUser = getAdminFromStorage();
  
  // First check if we have admin data in localStorage
  if (!adminUser) {
    return false;
  }
  
  // Then verify with the server
  try {
    await api.get('/auth/me');
    return true;
  } catch {
    // If the request fails, the user is not logged in
    return false;
  }
};

// Synchronous version for initial checks
export const isAdminLoggedInSync = () => {
  // This is less secure but needed for initial UI rendering
  // The async version should be used for actual authentication checks
  return !!localStorage.getItem('adminUser');
};

// Dashboard API methods
export const getDashboardStats = async () => {
  return api.get('/admin/dashboard/stats');
};

export const getSystemAnalytics = async () => {
  return api.get('/admin/analytics');
};

export const getLowStockProducts = async () => {
  return api.get('/admin/low-stock');
};

export const getAdminOrders = async (params = {}) => {
  return api.get('/admin/orders', { params });
};

export const getAdminProducts = async (params = {}) => {
  return api.get('/admin/products', { params });
};

export const postProduct = async (formData) => {
  return api.post('/admin/product', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateProduct = async (productId, data) => {
  return api.put(`/admin/product/${productId}`, data);
};

export const deactivateProduct = async (productId) => {
  return api.put(`/admin/product/${productId}`, { deactivated: true });
};

export const activateProduct = async (productId) => {
  return api.put(`/admin/product/${productId}`, { deactivated: false });
};

export const bulkDeactivateProducts = async (productIds) => {
  return api.post('/admin/products/bulk-deactivate', { productIds });
};

export const bulkActivateProducts = async (productIds) => {
  return api.post('/admin/products/bulk-activate', { productIds });
};

export const deleteOrder = async (orderId) => {
  return api.delete(`/admin/order/${orderId}`);
};

export const deleteOrders = async (orderIds) => {
  return api.post('/admin/orders/bulk-delete', { orderIds });
};

export default api;
