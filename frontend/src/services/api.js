const API_BASE = '/api';

/**
 * Custom fetch wrapper for API calls with token injection & error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('medilog_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('medilog_token');
        localStorage.removeItem('medilog_user');
      }
      const error = new Error(data?.message || `HTTP Error ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const netErr = new Error('Network unavailable. Operating in offline mode.');
      netErr.isNetworkError = true;
      throw netErr;
    }
    throw err;
  }
}
