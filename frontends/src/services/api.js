/**
 * API Service for iTunes Search Application
 * Handles communication with the backend server
 */

import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      // Could redirect to login here if needed
    }
    return Promise.reject(error);
  }
);

/**
 * Generate authentication token
 * @returns {Promise} Promise resolving to token data
 */
export const generateToken = async () => {
  try {
    const response = await api.post('/auth/token');
    const { token } = response.data;

    if (token) {
      localStorage.setItem('authToken', token);
    }

    return response;
  } catch (error) {
    console.error('Token generation failed:', error);
    throw error;
  }
};

/**
 * Search iTunes store
 * @param {string} term - Search term
 * @param {string} media - Media type (all, music, movie, podcast, etc.)
 * @param {number} limit - Number of results to return (default: 50)
 * @returns {Promise} Promise resolving to search results
 */
export const searchItunes = async (term, media = 'all', limit = 50) => {
  try {
    const params = {
      term: encodeURIComponent(term),
      limit,
    };

    // Add media type if not 'all'
    if (media && media !== 'all') {
      params.media = media;
    }

    const response = await api.get('/search', { params });
    return response;
  } catch (error) {
    console.error('iTunes search failed:', error);
    throw error;
  }
};

/**
 * Get detailed information about a specific item
 * @param {string} itemId - iTunes item ID
 * @returns {Promise} Promise resolving to item details
 */
export const getItemDetails = async (itemId) => {
  try {
    const response = await api.get(`/item/${itemId}`);
    return response;
  } catch (error) {
    console.error('Failed to get item details:', error);
    throw error;
  }
};

/**
 * Save search history (if backend supports it)
 * @param {string} term - Search term
 * @param {string} media - Media type
 * @returns {Promise} Promise resolving to save confirmation
 */
export const saveSearchHistory = async (term, media) => {
  try {
    const response = await api.post('/search/history', {
      term,
      media,
      timestamp: new Date().toISOString(),
    });
    return response;
  } catch (error) {
    console.error('Failed to save search history:', error);
    // Don't throw error for this non-critical operation
    return null;
  }
};

/**
 * Get search suggestions based on partial input
 * @param {string} partial - Partial search term
 * @returns {Promise} Promise resolving to suggestions
 */
export const getSearchSuggestions = async (partial) => {
  try {
    const response = await api.get('/search/suggestions', {
      params: { q: partial }
    });
    return response;
  } catch (error) {
    console.error('Failed to get search suggestions:', error);
    return { data: { suggestions: [] } };
  }
};

export default api;