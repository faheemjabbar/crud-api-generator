import {
  validateProjectName,
  validateEntityName,
  validateFieldName,
  validatePort,
  validateSchema
} from '../validation';

describe('Validation utilities', () => {
  describe('validateProjectName', () => {
    it('should return null for valid project names', () => {
      expect(validateProjectName('my-api')).toBeNull();
      expect(validateProjectName('project_name')).toBeNull();
      expect(validateProjectName('Project123')).toBeNull();
    });

    it('should return error for empty names', () => {
      expect(validateProjectName('')).toBe('Project name is required');
      expect(validateProjectName('   ')).toBe('Project name is required');
      expect(validateProjectName(null)).toBe('Project name is required');
    });

    it('should return error for invalid characters', () => {
      expect(validateProjectName('my api')).toBe('Project name can only contain letters, numbers, hyphens, and underscores');
      expect(validateProjectName('my@api')).toBe('Project name can only contain letters, numbers, hyphens, and underscores');
    });

    it('should return error for too short names', () => {
      expect(validateProjectName('a')).toBe('Project name must be at least 2 characters long');
    });

    it('should return error for too long names', () => {
      const longName = 'a'.repeat(51);
      expect(validateProjectName(longName)).toBe('Project name must be less than 50 characters');
    });
  });

  describe('validateEntityName', () => {
    it('should return null for valid entity names', () => {
      expect(validateEntityName('User')).toBeNull();
      expect(validateEntityName('ProductCategory')).toBeNull();
      expect(validateEntityName('Item123')).toBeNull();
    });

    it('should return error for empty names', () => {
      expect(validateEntityName('')).toBe('Entity name is required');
      expect(validateEntityName('   ')).toBe('Entity name is required');
    });

    it('should return error for names not starting with capital letter', () => {
      expect(validateEntityName('user')).toBe('Entity name must start with a capital letter and contain only letters and numbers');
      expect(validateEntityName('123User')).toBe('Entity name must start with a capital letter and contain only letters and numbers');
    });

    it('should return error for invalid characters', () => {
      expect(validateEntityName('User-Name')).toBe('Entity name must start with a capital letter and contain only letters and numbers');
      expect(validateEntityName('User_Name')).toBe('Entity name must start with a capital letter and contain only letters and numbers');
    });

    it('should return error for too short names', () => {
      expect(validateEntityName('U')).toBe('Entity name must be at least 2 characters long');
    });
  });

  describe('validateFieldName', () => {
    it('should return null for valid field names', () => {
      expect(validateFieldName('email')).toBeNull();
      expect(validateFieldName('firstName')).toBeNull();
      expect(validateFieldName('field123')).toBeNull();
    });

    it('should return error for empty names', () => {
      expect(validateFieldName('')).toBe('Field name is required');
      expect(validateFieldName('   ')).toBe('Field name is required');
    });

    it('should return error for names not starting with lowercase letter', () => {
      expect(validateFieldName('Email')).toBe('Field name must start with a lowercase letter and contain only letters and numbers');
      expect(validateFieldName('123field')).toBe('Field name must start with a lowercase letter and contain only letters and numbers');
    });

    it('should return error for invalid characters', () => {
      expect(validateFieldName('field-name')).toBe('Field name must start with a lowercase letter and contain only letters and numbers');
      expect(validateFieldName('field_name')).toBe('Field name must start with a lowercase letter and contain only letters and numbers');
    });

    it('should return error for too short names', () => {
      expect(validateFieldName('f')).toBe('Field name must be at least 2 characters long');
    });
  });

  describe('validatePort', () => {
    it('should return null for valid ports', () => {
      expect(validatePort('3000')).toBeNull();
      expect(validatePort('8080')).toBeNull();
      expect(validatePort('65535')).toBeNull();
    });

    it('should return error for invalid ports', () => {
      expect(validatePort('999')).toBe('Port must be a number between 1000 and 65535');
      expect(validatePort('65536')).toBe('Port must be a number between 1000 and 65535');
      expect(validatePort('abc')).toBe('Port must be a number between 1000 and 65535');
      expect(validatePort('')).toBe('Port must be a number between 1000 and 65535');
    });
  });

  describe('validateSchema', () => {
    const validSchema = {
      projectName: 'my-api',
      port: '3000',
      entities: [
        {
          name: 'User',
          fields: [
            { name: 'email', type: 'email' }
          ]
        }
      ]
    };

    it('should return empty array for valid schema', () => {
      expect(validateSchema(validSchema)).toEqual([]);
    });

    it('should return errors for invalid project name', () => {
      const schema = { ...validSchema, projectName: '' };
      const errors = validateSchema(schema);
      expect(errors).toContain('Project name is required');
    });

    it('should return errors for invalid port', () => {
      const schema = { ...validSchema, port: '999' };
      const errors = validateSchema(schema);
      expect(errors).toContain('Port must be a number between 1000 and 65535');
    });

    it('should return errors for missing entities', () => {
      const schema = { ...validSchema, entities: [] };
      const errors = validateSchema(schema);
      expect(errors).toContain('At least one entity is required');
    });

    it('should return errors for invalid entity names', () => {
      const schema = {
        ...validSchema,
        entities: [{ ...validSchema.entities[0], name: 'user' }]
      };
      const errors = validateSchema(schema);
      expect(errors[0]).toContain('Entity 1:');
    });

    it('should return errors for missing fields', () => {
      const schema = {
        ...validSchema,
        entities: [{ ...validSchema.entities[0], fields: [] }]
      };
      const errors = validateSchema(schema);
      expect(errors).toContain('Entity "User": At least one field is required');
    });

    it('should return errors for invalid field names', () => {
      const schema = {
        ...validSchema,
        entities: [{
          ...validSchema.entities[0],
          fields: [{ name: 'Email', type: 'email' }]
        }]
      };
      const errors = validateSchema(schema);
      expect(errors[0]).toContain('field 1:');
    });
  });
});