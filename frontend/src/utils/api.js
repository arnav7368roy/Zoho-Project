// Zoho Project Backend — runs locally on port 8001
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export async function apiRequest(endpoint, method = 'GET', body = null, customHeaders = {}) {
  try {
    const token = localStorage.getItem('access_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      credentials: 'include',
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    let result = {};
    try {
      result = await response.json();
    } catch (e) {
      result = {};
    }

    return {
      ok: response.ok,
      status: response.status,
      data: result,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      ok: false,
      status: 500,
      data: { message: 'Failed to connect to backend service.' },
    };
  }
}
