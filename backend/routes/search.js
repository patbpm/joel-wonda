/**
 * Search Routes
 * Handles iTunes Search API integration and search functionality
 */

const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// iTunes API configuration
const ITUNES_BASE_URL = 'https://itunes.apple.com';
const ITUNES_SEARCH_ENDPOINT = `${ITUNES_BASE_URL}/search`;
const ITUNES_LOOKUP_ENDPOINT = `${ITUNES_BASE_URL}/lookup`;

// Rate limiting for search endpoints
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit to 20 requests per minute (iTunes API limit)
  message: {
    error: 'Search rate limit exceeded',
    message: 'Too many search requests. iTunes API allows maximum 20 calls per minute.',
  },
});

// Valid media types according to iTunes API
const VALID_MEDIA_TYPES = [
  'all', 'movie', 'podcast', 'music', 'musicVideo', 
  'audiobook', 'shortFilm', 'tvShow', 'software', 'ebook'
];

// Valid entities for different media types
const MEDIA_ENTITIES = {
  movie: ['movieArtist', 'movie'],
  podcast: ['podcastAuthor', 'podcast'],
  music: ['musicArtist', 'musicTrack', 'album', 'musicVideo', 'mix', 'song'],
  musicVideo: ['musicArtist', 'musicVideo'],
  audiobook: ['audiobookAuthor', 'audiobook'],
  shortFilm: ['shortFilmArtist', 'shortFilm'],
  tvShow: ['tvEpisode', 'tvSeason'],
  software: ['software', 'iPadSoftware', 'macSoftware'],
  ebook: ['ebook'],
  all: ['movie', 'album', 'allArtist', 'podcast', 'musicVideo', 'mix', 'audiobook', 'tvSeason', 'allTrack']
};

/**
 * Validate search parameters
 * @param {Object} params - Search parameters
 * @returns {Object} - Validation result with isValid and errors
 */
const validateSearchParams = (params) => {
  const errors = [];
  
  // Check required term parameter
  if (!params.term || typeof params.term !== 'string' || params.term.trim().length === 0) {
    errors.push('Search term is required and must be a non-empty string');
  }
  
  // Validate media type
  if (params.media && !VALID_MEDIA_TYPES.includes(params.media)) {
    errors.push(`Invalid media type. Valid types: ${VALID_MEDIA_TYPES.join(', ')}`);
  }
  
  // Validate limit
  if (params.limit) {
    const limit = parseInt(params.limit);
    if (isNaN(limit) || limit < 1 || limit > 200) {
      errors.push('Limit must be a number between 1 and 200');
    }
  }
  
  // Validate country code (if provided)
  if (params.country && !/^[A-Z]{2}$/.test(params.country)) {
    errors.push('Country must be a valid 2-letter country code (e.g., US, CA, GB)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Build iTunes API URL with proper encoding
 * @param {Object} params - Search parameters
 * @returns {string} - Formatted iTunes API URL
 */
const buildItunesUrl = (params) => {
  const searchParams = new URLSearchParams();
  
  // Required term parameter
  searchParams.append('term', params.term.trim());
  
  // Optional parameters with defaults
  searchParams.append('media', params.media || 'all');
  searchParams.append('limit', params.limit || '50');
  searchParams.append('country', params.country || 'US');
  searchParams.append('explicit', params.explicit || 'Yes');
  
  // Add entity if specified and valid for the media type
  if (params.entity) {
    const mediaType = params.media || 'all';
    const validEntities = MEDIA_ENTITIES[mediaType] || [];
    if (validEntities.includes(params.entity)) {
      searchParams.append('entity', params.entity);
    }
  }
  
  return `${ITUNES_SEARCH_ENDPOINT}?${searchParams.toString()}`;
};

/**
 * Process and enhance iTunes API response
 * @param {Object} data - Raw iTunes API response
 * @returns {Object} - Enhanced response with additional metadata
 */
const processItunesResponse = (data) => {
  const results = data.results || [];
  
  // Enhance each result with additional formatting
  const enhancedResults = results.map(item => ({
    ...item,
    // Ensure consistent image URLs (prefer high-resolution)
    artworkUrl: item.artworkUrl100?.replace('100x100', '300x300') || 
               item.artworkUrl60?.replace('60x60', '300x300') || 
               item.artworkUrl30?.replace('30x30', '300x300') || 
               item.artworkUrl100,
    
    // Format release date
    releaseDate: item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : null,
    
    // Add formatted price
    formattedPrice: item.trackPrice ? `${item.trackPrice}` : 
                   item.collectionPrice ? `${item.collectionPrice}` : 'N/A',
    
    // Add media type for consistent handling
    mediaType: item.wrapperType || item.kind || 'unknown',
    
    // Clean up genre information
    primaryGenre: item.primaryGenreName || item.genres?.[0] || 'Unknown',
    
    // Add unique identifier for favorites
    uniqueId: item.trackId || item.collectionId || item.artistId || Date.now()
  }));
  
  return {
    resultCount: data.resultCount || 0,
    results: enhancedResults,
    searchInfo: {
      totalResults: data.resultCount || 0,
      hasResults: (data.resultCount || 0) > 0,
      searchedAt: new Date().toISOString()
    }
  };
};

/**
 * GET /api/search
 * Main search endpoint that queries the iTunes Search API
 * 
 * Query Parameters:
 * - term (required): Search term
 * - media (optional): Media type (movie, podcast, music, etc.)
 * - limit (optional): Number of results (1-200, default: 50)
 * - country (optional): Country code (default: US)
 * - entity (optional): Specific entity type
 * - explicit (optional): Include explicit content (Yes/No, default: Yes)
 */
router.get('/', authenticateToken, searchLimiter, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Extract and validate parameters
    const searchParams = {
      term: req.query.term,
      media: req.query.media,
      limit: req.query.limit,
      country: req.query.country,
      entity: req.query.entity,
      explicit: req.query.explicit
    };
    
    // Validate parameters
    const validation = validateSearchParams(searchParams);
    if (!validation.isValid) {
      logger.warn('Invalid search parameters', {
        errors: validation.errors,
        params: searchParams,
        userId: req.user?.userId,
        ip: req.ip
      });
      
      return res.status(400).json({
        error: 'Invalid Parameters',
        message: 'One or more search parameters are invalid',
        errors: validation.errors,
        validMediaTypes: VALID_MEDIA_TYPES
      });
    }
    
    // Build iTunes API URL
    const itunesUrl = buildItunesUrl(searchParams);
    
    logger.info('iTunes API search request', {
      url: itunesUrl,
      term: searchParams.term,
      media: searchParams.media,
      userId: req.user?.userId,
      ip: req.ip
    });
    
    // Make request to iTunes API
    const response = await axios.get(itunesUrl, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'iTunes-Search-App/1.0',
        'Accept': 'application/json'
      }
    });
    
    // Process the response
    const processedData = processItunesResponse(response.data);
    const responseTime = Date.now() - startTime;
    
    logger.info('iTunes API search completed', {
      term: searchParams.term,
      resultCount: processedData.resultCount,
      responseTime: `${responseTime}ms`,
      userId: req.user?.userId
    });
    
    // Return enhanced results
    res.json({
      success: true,
      data: processedData,
      searchParams: {
        term: searchParams.term,
        media: searchParams.media || 'all',
        limit: parseInt(searchParams.limit) || 50,
        country: searchParams.country || 'US'
      },
      metadata: {
        responseTime: `${responseTime}ms`,
        searchedAt: new Date().toISOString(),
        apiVersion: '1.0'
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logger.error('iTunes API search failed', {
      error: error.message,
      stack: error.stack,
      url: error.config?.url,
      status: error.response?.status,
      responseTime: `${responseTime}ms`,
      userId: req.user?.userId,
      ip: req.ip
    });
    
    // Handle specific error types
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(408).json({
        error: 'Request Timeout',
        message: 'iTunes API request timed out. Please try again.',
      });
    }
    
    if (error.response?.status === 403) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'iTunes API is currently unavailable. Please try again later.',
      });
    }
    
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request to iTunes API. Please check your search parameters.',
      });
    }
    
    // Generic error response
    res.status(500).json({
      error: 'Search Failed',
      message: 'Unable to complete search request. Please try again later.',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message 
      })
    });
  }
});

/**
 * GET /api/search/lookup/:id
 * Lookup specific item by iTunes ID
 * 
 * Path Parameters:
 * - id: iTunes ID for the item
 */
router.get('/lookup/:itemId', authenticateToken, searchLimiter, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const itemId = req.params.itemId;
    
    // Validate ID
    if (!itemId || !/^\d+$/.test(itemId)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Item ID must be a valid number',
      });
    }
    
    const lookupUrl = `${ITUNES_LOOKUP_ENDPOINT}?id=${itemId}`;
    
    logger.info('iTunes API lookup request', {
      url: lookupUrl,
      itemId,
      userId: req.user?.userId,
      ip: req.ip
    });
    
    const response = await axios.get(lookupUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'iTunes-Search-App/1.0',
        'Accept': 'application/json'
      }
    });
    
    const processedData = processItunesResponse(response.data);
    const responseTime = Date.now() - startTime;
    
    if (processedData.resultCount === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No item found with ID: ${itemId}`,
      });
    }
    
    logger.info('iTunes API lookup completed', {
      itemId,
      found: processedData.resultCount > 0,
      responseTime: `${responseTime}ms`,
      userId: req.user?.userId
    });
    
    res.json({
      success: true,
      data: processedData,
      metadata: {
        responseTime: `${responseTime}ms`,
        lookedUpAt: new Date().toISOString(),
        apiVersion: '1.0'
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logger.error('iTunes API lookup failed', {
      error: error.message,
      itemId: req.params.itemId,
      responseTime: `${responseTime}ms`,
      userId: req.user?.userId,
      ip: req.ip
    });
    
    res.status(500).json({
      error: 'Lookup Failed',
      message: 'Unable to lookup item. Please try again later.',
    });
  }
});

/**
 * GET /api/search/suggestions
 * Get search suggestions (mock endpoint for demo)
 * In a real app, this might return popular searches or user history
 */
router.get('/suggestions', authenticateToken, (req, res) => {
  const suggestions = [
    { term: 'Taylor Swift', media: 'music', category: 'Popular Artists' },
    { term: 'Marvel', media: 'movie', category: 'Popular Movies' },
    { term: 'Joe Rogan', media: 'podcast', category: 'Popular Podcasts' },
    { term: 'The Office', media: 'tvShow', category: 'Popular TV Shows' },
    { term: 'Harry Potter', media: 'audiobook', category: 'Popular Audiobooks' },
    { term: 'Photoshop', media: 'software', category: 'Popular Software' },
  ];
  
  logger.info('Search suggestions requested', {
    userId: req.user?.userId,
    ip: req.ip
  });
  
  res.json({
    success: true,
    suggestions,
    metadata: {
      generatedAt: new Date().toISOString(),
      count: suggestions.length
    }
  });
});

module.exports = router;