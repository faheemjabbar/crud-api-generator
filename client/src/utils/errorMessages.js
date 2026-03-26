/**
 * Centralized error message definitions and utilities
 */

/**
 * Error message categories and their specific messages
 */
export const ERROR_MESSAGES = {
  VALIDATION: {
    PROJECT_NAME_REQUIRED: 'Project name is required',
    PROJECT_NAME_INVALID: 'Project name can only contain letters, numbers, hyphens, and underscores',
    PROJECT_NAME_TOO_SHORT: 'Project name must be at least 2 characters long',
    PROJECT_NAME_TOO_LONG: 'Project name must be less than 50 characters',
    
    ENTITY_NAME_REQUIRED: 'Entity name is required',
    ENTITY_NAME_INVALID: 'Entity name must start with a capital letter and contain only letters and numbers',
    ENTITY_NAME_TOO_SHORT: 'Entity name must be at least 2 characters long',
    
    FIELD_NAME_REQUIRED: 'Field name is required',
    FIELD_NAME_INVALID: 'Field name must start with a lowercase letter and contain only letters and numbers',
    FIELD_NAME_TOO_SHORT: 'Field name must be at least 2 characters long',
    
    PORT_INVALID: 'Port must be a number between 1000 and 65535',
    
    ENTITIES_REQUIRED: 'At least one entity is required',
    FIELDS_REQUIRED: 'At least one field is required per entity',
  },
  
  GENERATION: {
    UNKNOWN_FRAMEWORK: 'Unknown framework specified',
    NO_FILES_GENERATED: 'No files were generated - please check your schema',
    INVALID_SCHEMA: 'Schema validation failed',
    ZIP_CREATION_FAILED: 'Failed to create download package',
    DOWNLOAD_FAILED: 'Failed to trigger download',
  },
  
  NETWORK: {
    CONNECTION_FAILED: 'Network connection failed',
    TIMEOUT: 'Request timed out',
    SERVER_ERROR: 'Server error occurred',
  },
  
  STORAGE: {
    SAVE_FAILED: 'Failed to save template',
    LOAD_FAILED: 'Failed to load template',
    DELETE_FAILED: 'Failed to delete template',
    STORAGE_FULL: 'Local storage is full',
  }
};

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  GENERATION: 'generation',
  NETWORK: 'network',
  STORAGE: 'storage',
  UNKNOWN: 'unknown'
};

/**
 * Determine error type from error message or error object
 * @param {Error|string} error - The error to categorize
 * @returns {string} Error type
 */
export const getErrorType = (error) => {
  const message = typeof error === 'string' ? error : error?.message || '';
  
  if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
    return ERROR_TYPES.VALIDATION;
  }
  
  if (message.includes('generation') || message.includes('framework') || message.includes('files')) {
    return ERROR_TYPES.GENERATION;
  }
  
  if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
    return ERROR_TYPES.NETWORK;
  }
  
  if (message.includes('storage') || message.includes('template') || message.includes('save')) {
    return ERROR_TYPES.STORAGE;
  }
  
  return ERROR_TYPES.UNKNOWN;
};

/**
 * Get user-friendly error message with suggestions
 * @param {Error|string} error - The error to format
 * @returns {Object} Object with message and suggestion
 */
export const formatError = (error) => {
  const message = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';
  const type = getErrorType(error);
  
  const suggestions = {
    [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
    [ERROR_TYPES.GENERATION]: 'Please verify your schema configuration and try again.',
    [ERROR_TYPES.NETWORK]: 'Please check your internet connection and try again.',
    [ERROR_TYPES.STORAGE]: 'Please clear some browser storage and try again.',
    [ERROR_TYPES.UNKNOWN]: 'Please refresh the page and try again.'
  };
  
  return {
    message,
    suggestion: suggestions[type],
    type
  };
};

/**
 * Create a detailed error report for debugging
 * @param {Error} error - The error object
 * @param {Object} context - Additional context information
 * @returns {Object} Detailed error report
 */
export const createErrorReport = (error, context = {}) => {
  return {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    type: getErrorType(error),
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
};