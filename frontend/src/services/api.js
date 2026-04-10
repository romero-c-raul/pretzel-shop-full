// API Service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Session ID management - initialize from localStorage on module load
const initializeSessionId = () => {
  try {
    return localStorage.getItem('sessionId') || null;
  } catch (error) {
    console.warn('Failed to read sessionId from localStorage:', error);
    return null;
  }
};

let sessionId = initializeSessionId();

// Get or set session ID from response headers
export const getSessionId = () => sessionId;

export const setSessionId = (id) => {
  sessionId = id;
  if (id) {
    try {
      localStorage.setItem('sessionId', id);
    } catch (error) {
      console.warn('Failed to save sessionId to localStorage:', error);
    }
  } else {
    try {
      localStorage.removeItem('sessionId');
    } catch (error) {
      console.warn('Failed to remove sessionId from localStorage:', error);
    }
  }
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Always read fresh session ID from localStorage before each request
  // This ensures we have the latest session ID even if it was updated by another request
  const currentSessionId = (() => {
    try {
      console.log('Reading sessionId from localStorage:', localStorage.getItem('sessionId'));
      return localStorage.getItem('sessionId');
    } catch (error) {
      return sessionId; // Fallback to in-memory value
    }
  })();

  // Add session ID to headers if available
  if (currentSessionId) {
    headers['X-Session-Id'] = currentSessionId;
    sessionId = currentSessionId; // Update in-memory value
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Extract session ID from response headers if present
    // This is critical - the backend always returns the session ID
    const responseSessionId = response.headers.get('X-Session-Id');
    if (responseSessionId) {
      setSessionId(responseSessionId);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Products API
export const productsApi = {
  getAll: () => apiRequest('/api/products'),
  getById: (id) => apiRequest(`/api/products/${id}`),
};

// Cart API
export const cartApi = {
  get: () => apiRequest('/api/cart'),
  addItem: (productId, quantity = 1) =>
    apiRequest('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  updateItem: (productId, quantity) =>
    apiRequest(`/api/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (productId) =>
    apiRequest(`/api/cart/${productId}`, {
      method: 'DELETE',
    }),
  clear: () =>
    apiRequest('/api/cart', {
      method: 'DELETE',
    }),
};

// Orders API
export const ordersApi = {
  create: (orderData) =>
    apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...orderData,
        sessionId: getSessionId(),
      }),
    }),
  getById: (id) => apiRequest(`/api/orders/${id}`),
};

// Health check
export const healthCheck = () => apiRequest('/health');

