import {
  FIELD_TYPES,
  RELATION_TYPES,
  DATABASES,
  FRAMEWORKS,
  createDefaultEntity,
  createDefaultField,
  createDefaultRelation,
  createDefaultSchema
} from '../types';

describe('Types and Factories', () => {
  describe('Constants', () => {
    it('should have correct field types', () => {
      expect(FIELD_TYPES).toEqual([
        'string',
        'number',
        'boolean',
        'date',
        'email',
        'password',
        'enum',
        'json',
        'uuid',
      ]);
    });

    it('should have correct relation types', () => {
      expect(RELATION_TYPES).toEqual(['one-to-one', 'one-to-many', 'many-to-many']);
    });

    it('should have correct databases', () => {
      expect(DATABASES).toEqual(['mongodb', 'postgresql']);
    });

    it('should have correct frameworks', () => {
      expect(FRAMEWORKS).toEqual(['express', 'nestjs']);
    });
  });

  describe('Factory Functions', () => {
    describe('createDefaultField', () => {
      it('should create a field with default values', () => {
        const field = createDefaultField();
        
        expect(field).toHaveProperty('id');
        expect(field.name).toBe('');
        expect(field.type).toBe('string');
        expect(field.required).toBe(false);
        expect(field.unique).toBe(false);
        expect(field.enumValues).toEqual([]);
      });

      it('should create unique IDs', () => {
        const field1 = createDefaultField();
        const field2 = createDefaultField();
        
        expect(field1.id).not.toBe(field2.id);
      });
    });

    describe('createDefaultRelation', () => {
      it('should create a relation with default values', () => {
        const relation = createDefaultRelation();
        
        expect(relation).toHaveProperty('id');
        expect(relation.type).toBe('one-to-many');
        expect(relation.targetEntity).toBe('');
        expect(relation.fieldName).toBe('');
        expect(relation.eager).toBe(false);
      });
    });

    describe('createDefaultEntity', () => {
      it('should create an entity with default values', () => {
        const entity = createDefaultEntity();
        
        expect(entity).toHaveProperty('id');
        expect(entity.name).toBe('');
        expect(entity.auth).toBe(false);
        expect(entity.fields).toHaveLength(1);
        expect(entity.relations).toEqual([]);
      });

      it('should create entity with default field', () => {
        const entity = createDefaultEntity();
        const defaultField = entity.fields[0];
        
        expect(defaultField.type).toBe('string');
        expect(defaultField.required).toBe(false);
      });
    });

    describe('createDefaultSchema', () => {
      it('should create a schema with default values', () => {
        const schema = createDefaultSchema();
        
        expect(schema.projectName).toBe('my-api');
        expect(schema.port).toBe('3000');
        expect(schema.database).toBe('mongodb');
        expect(schema.framework).toBe('express');
        expect(schema.includeAuth).toBe(true);
        expect(schema.entities).toHaveLength(1);
      });

      it('should create schema with default User entity', () => {
        const schema = createDefaultSchema();
        const userEntity = schema.entities[0];
        
        expect(userEntity.name).toBe('User');
        expect(userEntity.auth).toBe(true);
        expect(userEntity.fields).toHaveLength(3);
        
        const [emailField, passwordField, nameField] = userEntity.fields;
        expect(emailField.type).toBe('email');
        expect(passwordField.type).toBe('password');
        expect(nameField.type).toBe('string');
      });
    });
  });
});