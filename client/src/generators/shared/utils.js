/** 
 * Capitalise first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} String with first letter capitalized
 */
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/** 
 * Lowercase first letter of a string
 * @param {string} str - The string to lowercase
 * @returns {string} String with first letter lowercased
 */
export const lcFirst = (str) => str.charAt(0).toLowerCase() + str.slice(1);

/** 
 * Convert entity name to plural route segment
 * @param {string} name - The entity name
 * @returns {string} Pluralized lowercase name
 */
export const toPlural = (name) => `${name.toLowerCase()}s`;

/** 
 * Check if entity has a password field
 * @param {Object} entity - The entity object
 * @returns {boolean} True if entity has password field
 */
export const hasPasswordField = (entity) =>
  entity.fields.some((f) => f.name === 'password' || f.type === 'password');

/** 
 * Check if entity has an email field
 * @param {Object} entity - The entity object
 * @returns {boolean} True if entity has email field
 */
export const hasEmailField = (entity) =>
  entity.fields.some((f) => f.type === 'email' || f.name === 'email');

/** 
 * Check if entity qualifies for login endpoint
 * @param {Object} entity - The entity object
 * @returns {boolean} True if entity has auth, email, and password
 */
export const hasLoginEndpoint = (entity) =>
  entity.auth && hasPasswordField(entity) && hasEmailField(entity);

/** 
 * Map field type to Mongoose type string
 * @param {string} type - The field type
 * @returns {string} Mongoose type string
 */
export const toMongooseType = (type) => {
  const map = {
    string: 'String',
    number: 'Number',
    boolean: 'Boolean',
    date: 'Date',
    email: 'String',
    password: 'String',
    enum: 'String',
    json: 'mongoose.Schema.Types.Mixed',
    uuid: 'String',
  };
  return map[type] || 'String';
};

/** 
 * Map field type to Sequelize DataTypes string
 * @param {string} type - The field type
 * @returns {string} Sequelize DataTypes string
 */
export const toSequelizeType = (type) => {
  const map = {
    string: 'STRING',
    number: 'INTEGER',
    boolean: 'BOOLEAN',
    date: 'DATE',
    email: 'STRING',
    password: 'STRING',
    enum: 'ENUM',
    json: 'JSON',
    uuid: 'UUID',
  };
  return map[type] || 'STRING';
};

/** 
 * Map field type to TypeScript primitive type
 * @param {string} type - The field type
 * @returns {string} TypeScript type string
 */
export const toTsType = (type) => {
  const map = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    date: 'Date',
    email: 'string',
    password: 'string',
    enum: 'string',
    json: 'Record<string, any>',
    uuid: 'string',
  };
  return map[type] || 'string';
};

/** 
 * Map field type to TypeORM column type
 * @param {string} type - The field type
 * @returns {string} TypeORM column type string
 */
export const toTypeOrmType = (type) => {
  const map = {
    string: 'varchar',
    number: 'int',
    boolean: 'boolean',
    date: 'timestamp',
    email: 'varchar',
    password: 'varchar',
    enum: 'enum',
    json: 'json',
    uuid: 'uuid',
  };
  return map[type] || 'varchar';
};

/** 
 * Generate standard .gitignore content
 * @returns {string} Standard .gitignore file content
 */
export const generateGitignore = () => `node_modules/
dist/
.env
.DS_Store
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.vscode/
.idea/
`;
