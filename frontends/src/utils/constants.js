/**
 * Application Constants
 * Contains all configuration constants for the iTunes Search application
 */

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// iTunes Search API Configuration
export const ITUNES_API = {
  BASE_URL: 'https://itunes.apple.com',
  SEARCH_ENDPOINT: '/search',
  LOOKUP_ENDPOINT: '/lookup',
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 200,
  DEFAULT_COUNTRY: 'US',
  DEFAULT_MEDIA: 'all'
};

// Media Type Mappings
export const MEDIA_TYPES = {
  ALL: 'all',
  MUSIC: 'music',
  MOVIE: 'movie',
  PODCAST: 'podcast',
  MUSIC_VIDEO: 'musicVideo',
  AUDIOBOOK: 'audiobook',
  SHORT_FILM: 'shortFilm',
  TV_SHOW: 'tvShow',
  SOFTWARE: 'software',
  EBOOK: 'ebook'
};

// Entity Type Mappings for iTunes API
export const ENTITY_TYPES = {
  [MEDIA_TYPES.MUSIC]: ['musicArtist', 'musicTrack', 'album', 'musicVideo', 'mix', 'song'],
  [MEDIA_TYPES.MOVIE]: ['movieArtist', 'movie'],
  [MEDIA_TYPES.PODCAST]: ['podcastAuthor', 'podcast'],
  [MEDIA_TYPES.MUSIC_VIDEO]: ['musicArtist', 'musicVideo'],
  [MEDIA_TYPES.AUDIOBOOK]: ['audiobookAuthor', 'audiobook'],
  [MEDIA_TYPES.SHORT_FILM]: ['shortFilmArtist', 'shortFilm'],
  [MEDIA_TYPES.TV_SHOW]: ['tvEpisode', 'tvSeason'],
  [MEDIA_TYPES.SOFTWARE]: ['softwareDeveloper', 'software', 'iPadSoftware', 'macSoftware'],
  [MEDIA_TYPES.EBOOK]: ['ebookAuthor', 'ebook']
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'iTunes Search',
  VERSION: '1.0.0',
  DESCRIPTION: 'Search and discover content from the iTunes Store',
  AUTHOR: 'iTunes Search Team',

  // Feature flags
  FEATURES: {
    FAVORITES: true,
    SEARCH_HISTORY: true,
    OFFLINE_MODE: false,
    ANALYTICS: false
  },

  // UI Configuration
  UI: {
    RESULTS_PER_PAGE: 20,
    MAX_SEARCH_HISTORY: 10,
    MAX_FAVORITES: 100,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500
  },

  // Cache Configuration
  CACHE: {
    SEARCH_RESULTS_TTL: 5 * 60 * 1000, // 5 minutes
    ARTWORK_CACHE_SIZE: 100,
    ENABLE_CACHE: true
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  FAVORITES: 'itunes_favorites',
  SEARCH_HISTORY: 'itunes_search_history',
  USER_PREFERENCES: 'itunes_user_preferences',
  CACHE_PREFIX: 'itunes_cache_'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SEARCH_FAILED: 'Search failed. Please try again with different terms.',
  NO_RESULTS: 'No results found. Try different search terms or media type.',
  INVALID_SEARCH: 'Please enter a valid search term.',
  AUTH_FAILED: 'Authentication failed. Please refresh the page.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timeout. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SEARCH_COMPLETE: 'Search completed successfully.',
  FAVORITE_ADDED: 'Added to favorites.',
  FAVORITE_REMOVED: 'Removed from favorites.',
  HISTORY_CLEARED: 'Search history cleared.'
};

// Validation Rules
export const VALIDATION = {
  SEARCH_TERM: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-_.,!?'"()&]+$/
  },

  PAGINATION: {
    MIN_LIMIT: 1,
    MAX_LIMIT: 200,
    DEFAULT_LIMIT: 50
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    TOKEN: '/auth/token',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },

  SEARCH: {
    ITUNES: '/search',
    SUGGESTIONS: '/search/suggestions',
    HISTORY: '/search/history'
  },

  ITEMS: {
    DETAILS: '/item/:id',
    RELATED: '/item/:id/related'
  },

  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    FAVORITES: '/user/favorites'
  }
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain'
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  TIMESTAMP: 'YYYY-MM-DD HH:mm:ss',
  ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ'
};

// File/Image Configuration
export const ASSETS = {
  ARTWORK_SIZES: [30, 60, 100, 512, 1024],
  DEFAULT_ARTWORK_SIZE: 300,
  PLACEHOLDER_IMAGE: '/images/placeholder.png',
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  MAX_IMAGE_SIZE: 1024 * 1024 // 1MB
};

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: '#8B5CF6',
    SECONDARY: '#EC4899',
    ACCENT: '#10B981',
    BACKGROUND: '#1F2937',
    SURFACE: '#374151',
    TEXT: '#F9FAFB',
    TEXT_SECONDARY: '#D1D5DB'
  },

  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  },

  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    '2XL': '3rem'
  }
};

export default {
  API_BASE_URL,
  ITUNES_API,
  MEDIA_TYPES,
  ENTITY_TYPES,
  APP_CONFIG,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
  API_ENDPOINTS,
  HTTP_STATUS,
  CONTENT_TYPES,
  DATE_FORMATS,
  ASSETS,
  THEME
};