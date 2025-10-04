/**
 * Logger Utility
 * Simple logging system with different levels and formatting
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Current log level based on environment
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? 
  (process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG);

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 * @returns {string} - Formatted log string
 */
const formatLog = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logObject = {
    timestamp,
    level,
    message,
    ...data,
  };
  
  return JSON.stringify(logObject, null, process.env.NODE_ENV === 'development' ? 2 : 0);
};

/**
 * Write log to file
 * @param {string} level - Log level
 * @param {string} formattedLog - Formatted log string
 */
const writeToFile = (level, formattedLog) => {
  if (process.env.NODE_ENV === 'test') return; // Don't write logs during tests
  
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const logFile = path.join(logsDir, `${date}.log`);
  const errorLogFile = path.join(logsDir, `${date}-error.log`);
  
  // Always write to main log file
  fs.appendFileSync(logFile, formattedLog + '\n');
  
  // Write errors to separate error log file
  if (level === 'ERROR') {
    fs.appendFileSync(errorLogFile, formattedLog + '\n');
  }
};

/**
 * Console output with colors (for development)
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
const consoleOutput = (level, message, data = {}) => {
  const colors = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[35m', // Magenta
  };
  
  const reset = '\x1b[0m';
  const timestamp = new Date().toISOString();
  
  console.log(
    `${colors[level]}[${timestamp}] ${level}:${reset} ${message}`,
    Object.keys(data).length > 0 ? data : ''
  );
};

/**
 * Generic log function
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
const log = (level, message, data = {}) => {
  const levelValue = LOG_LEVELS[level];
  
  // Check if we should log this level
  if (levelValue > CURRENT_LOG_LEVEL) return;
  
  // Ensure message is a string
  const logMessage = typeof message === 'string' ? message : JSON.stringify(message);
  
  // Format the log
  const formattedLog = formatLog(level, logMessage, data);
  
  // Output to console in development
  if (process.env.NODE_ENV !== 'production') {
    consoleOutput(level, logMessage, data);
  }
  
  // Write to file
  try {
    writeToFile(level, formattedLog);
  } catch (error) {
    console.error('Failed to write log to file:', error);
  }
};

/**
 * Logger object with convenience methods
 */
const logger = {
  /**
   * Log error messages
   * @param {string} message - Error message
   * @param {Object} data - Additional error data
   */
  error: (message, data = {}) => {
    log('ERROR', message, data);
  },

  /**
   * Log warning messages
   * @param {string} message - Warning message
   * @param {Object} data - Additional warning data
   */
  warn: (message, data = {}) => {
    log('WARN', message, data);
  },

  /**
   * Log info messages
   * @param {string} message - Info message
   * @param {Object} data - Additional info data
   */
  info: (message, data = {}) => {
    log('INFO', message, data);
  },

  /**
   * Log debug messages
   * @param {string} message - Debug message
   * @param {Object} data - Additional debug data
   */
  debug: (message, data = {}) => {
    log('DEBUG', message, data);
  },

  /**
   * Log HTTP requests
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in milliseconds
   */
  http: (req, res, responseTime) => {
    const data = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId,
    };
    
    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
    log(level, `HTTP ${req.method} ${req.originalUrl}`, data);
  },

  /**
   * Get log file path for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {string} - Path to log file
   */
  getLogFile: (date = new Date().toISOString().split('T')[0]) => {
    return path.join(logsDir, `${date}.log`);
  },

  /**
   * Get error log file path for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {string} - Path to error log file
   */
  getErrorLogFile: (date = new Date().toISOString().split('T')[0]) => {
    return path.join(logsDir, `${date}-error.log`);
  },

  /**
   * Clean up old log files (keep last 30 days)
   */
  cleanup: () => {
    try {
      const files = fs.readdirSync(logsDir);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        const fileDate = file.split('.')[0].split('-')[0]; // Extract date from filename
        
        if (fileDate && new Date(fileDate) < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          logger.info(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Failed to cleanup log files:', error);
    }
  },
};

// Run cleanup on startup
if (process.env.NODE_ENV === 'production') {
  logger.cleanup();
}

module.exports = logger;