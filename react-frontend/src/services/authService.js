import apiClient from './api';

export const authService = {
  // Login user
  login: async (username, password) => {
    const response = await apiClient.post('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  // Register new user
  signup: async (email, username, password, fullName) => {
    const response = await apiClient.post('/api/auth/signup', {
      email,
      username,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
