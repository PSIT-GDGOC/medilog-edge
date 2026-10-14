import { apiRequest } from './api';

export const authService = {
  async register({ name, email, password, role, center }) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, center })
    });
    if (data.token) {
      localStorage.setItem('medilog_token', data.token);
      localStorage.setItem('medilog_user', JSON.stringify(data.user));
    }
    return data;
  },

  async login({ email, password }) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      localStorage.setItem('medilog_token', data.token);
      localStorage.setItem('medilog_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe() {
    return await apiRequest('/auth/me', {
      method: 'GET'
    });
  },

  logout() {
    localStorage.removeItem('medilog_token');
    localStorage.removeItem('medilog_user');
  },

  getCurrentStoredUser() {
    try {
      const u = localStorage.getItem('medilog_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('medilog_token');
  }
};
