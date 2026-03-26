/**
 * Validation utilities for the backend generator
 */

/**
 * Validates a project name according to naming conventions
 * @param {string} name - The project name to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateProjectName = (name) => {
  if (!name || !name.trim()) {
    return 'Project name is required';
  }
  
  if (!/^[a-z0-9-_]+$/i.test(name.trim())) {
    return 'Project name can only contain letters, numbers, hyphens, and underscores';
  }
  
  if (name.trim().length < 2) {
    return 'Project name must be at least 2 characters long';
  }
  
  if (name.trim().length > 50) {
    return 'Project name must be less than 50 characters';
  }
  
  return null;
};

/**
 * Validates an entity name according to naming conventions
 * @param {string} name - The entity name to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateEntityName = (name) => {
  if (!name || !name.trim()) {
    return 'Entity name is required';
  }
  
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name.trim())) {
    return 'Entity name must start with a capital letter and contain only letters and numbers';
  }
  
  if (name.trim().length < 2) {
    return 'Entity name must be at least 2 characters long';
  }
  
  return null;
};

/**
 * Validates a field name according to naming conventions
 * @param {string} name - The field name to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateFieldName = (name) => {
  if (!name || !name.trim()) {
    return 'Field name is required';
  }
  
  if (!/^[a-z][a-zA-Z0-9]*$/.test(name.trim())) {
    return 'Field name must start with a lowercase letter and contain only letters and numbers';
  }
  
  if (name.trim().length < 2) {
    return 'Field name must be at least 2 characters long';
  }
  
  return null;
};

/**
 * Validates a port number
 * @param {string|number} port - The port to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validatePort = (port) => {
  const portNum = parseInt(port);
  if (isNaN(portNum) || portNum < 1000 || portNum > 65535) {
    return 'Port must be a number between 1000 and 65535';
  }
  return null;
};

/**
 * Validates an entire schema object
 * @param {Object} schema - The schema to validate
 * @returns {string[]} Array of error messages, empty if valid
 */
export const validateSchema = (schema) => {
  const errors = [];
  
  const projectNameError = validateProjectName(schema.projectName);
  if (projectNameError) errors.push(projectNameError);
  
  const portError = validatePort(schema.port);
  if (portError) errors.push(portError);
  
  if (!schema.entities || schema.entities.length === 0) {
    errors.push('At least one entity is required');
  } else {
    schema.entities.forEach((entity, index) => {
      const entityNameError = validateEntityName(entity.name);
      if (entityNameError) errors.push(`Entity ${index + 1}: ${entityNameError}`);
      
      if (!entity.fields || entity.fields.length === 0) {
        errors.push(`Entity "${entity.name || index + 1}": At least one field is required`);
      } else {
        entity.fields.forEach((field, fieldIndex) => {
          const fieldNameError = validateFieldName(field.name);
          if (fieldNameError) {
            errors.push(`Entity "${entity.name}" field ${fieldIndex + 1}: ${fieldNameError}`);
          }
        });
      }
    });
  }
  
  return errors;
};