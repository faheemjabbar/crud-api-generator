/**
 * Shared schema types consumed by all framework generators.
 */

export const FIELD_TYPES = [
  'string',
  'number',
  'boolean',
  'date',
  'email',
  'password',
  'enum',
  'json',
  'uuid',
];



export const RELATION_TYPES = ['one-to-one', 'one-to-many', 'many-to-many'];

// User-friendly relation descriptions
export const RELATION_TYPE_DESCRIPTIONS = {
  'one-to-one': 'One User has one Profile',
  'one-to-many': 'One User has many Posts',
  'many-to-many': 'Users can follow many Users'
};

export const DATABASES = ['mongodb', 'postgresql'];
export const FRAMEWORKS = ['express', 'nestjs'];

let idCounter = 0;

export const createDefaultEntity = () => ({
  id: Date.now() + (++idCounter),
  name: '',
  auth: false,
  fields: [createDefaultField()],
  relations: [],
});

export const createDefaultField = () => ({
  id: Date.now() + (++idCounter),
  name: '',
  type: 'string',
  required: false,
  unique: false,
  minLength: '',
  maxLength: '',
  min: '',
  max: '',
  regex: '',
  enumValues: [],
});

export const createDefaultRelation = () => ({
  id: Date.now() + (++idCounter),
  type: 'one-to-many',
  targetEntity: '',
  fieldName: '',
  eager: false,
});

export const createDefaultSchema = () => ({
  projectName: 'my-api',
  port: '3000',
  database: 'mongodb',
  framework: 'express',
  includeAuth: true,
  entities: [
    {
      id: 1,
      name: 'User',
      auth: true,
      fields: [
        { id: 1, name: 'email', type: 'email', required: true, unique: true, enumValues: [] },
        { id: 2, name: 'password', type: 'password', required: true, unique: false, enumValues: [] },
        { id: 3, name: 'name', type: 'string', required: true, unique: false, enumValues: [] },
      ],
      relations: [],
    },
  ],
});
