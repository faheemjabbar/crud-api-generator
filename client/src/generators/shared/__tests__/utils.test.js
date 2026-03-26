import {
  capitalize,
  lcFirst,
  toPlural,
  hasPasswordField,
  hasEmailField,
  hasLoginEndpoint,
  toMongooseType,
  toSequelizeType,
  toTsType,
  toTypeOrmType,
  generateGitignore
} from '../utils';

describe('Utils', () => {
  describe('String utilities', () => {
    describe('capitalize', () => {
      it('should capitalize first letter', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(capitalize('HELLO')).toBe('HELLO');
        expect(capitalize('h')).toBe('H');
        expect(capitalize('')).toBe('');
      });
    });

    describe('lcFirst', () => {
      it('should lowercase first letter', () => {
        expect(lcFirst('Hello')).toBe('hello');
        expect(lcFirst('HELLO')).toBe('hELLO');
        expect(lcFirst('H')).toBe('h');
        expect(lcFirst('')).toBe('');
      });
    });

    describe('toPlural', () => {
      it('should convert to plural form', () => {
        expect(toPlural('User')).toBe('users');
        expect(toPlural('Product')).toBe('products');
        expect(toPlural('ITEM')).toBe('items');
      });
    });
  });

  describe('Entity utilities', () => {
    const mockEntityWithPassword = {
      fields: [
        { name: 'email', type: 'email' },
        { name: 'password', type: 'password' }
      ]
    };

    const mockEntityWithoutPassword = {
      fields: [
        { name: 'email', type: 'email' },
        { name: 'name', type: 'string' }
      ]
    };

    const mockEntityWithAuth = {
      auth: true,
      fields: [
        { name: 'email', type: 'email' },
        { name: 'password', type: 'password' }
      ]
    };

    describe('hasPasswordField', () => {
      it('should return true when entity has password field', () => {
        expect(hasPasswordField(mockEntityWithPassword)).toBe(true);
      });

      it('should return false when entity has no password field', () => {
        expect(hasPasswordField(mockEntityWithoutPassword)).toBe(false);
      });

      it('should return true when field name is password', () => {
        const entity = { fields: [{ name: 'password', type: 'string' }] };
        expect(hasPasswordField(entity)).toBe(true);
      });
    });

    describe('hasEmailField', () => {
      it('should return true when entity has email field', () => {
        expect(hasEmailField(mockEntityWithPassword)).toBe(true);
      });

      it('should return true when field name is email', () => {
        const entity = { fields: [{ name: 'email', type: 'string' }] };
        expect(hasEmailField(entity)).toBe(true);
      });

      it('should return false when entity has no email field', () => {
        const entity = { fields: [{ name: 'name', type: 'string' }] };
        expect(hasEmailField(entity)).toBe(false);
      });
    });

    describe('hasLoginEndpoint', () => {
      it('should return true when entity has auth, email, and password', () => {
        expect(hasLoginEndpoint(mockEntityWithAuth)).toBe(true);
      });

      it('should return false when entity has no auth', () => {
        const entity = { ...mockEntityWithAuth, auth: false };
        expect(hasLoginEndpoint(entity)).toBe(false);
      });

      it('should return false when entity has no password', () => {
        const entity = { ...mockEntityWithAuth, fields: [{ name: 'email', type: 'email' }] };
        expect(hasLoginEndpoint(entity)).toBe(false);
      });
    });
  });

  describe('Type mapping utilities', () => {
    describe('toMongooseType', () => {
      it('should map field types to Mongoose types', () => {
        expect(toMongooseType('string')).toBe('String');
        expect(toMongooseType('number')).toBe('Number');
        expect(toMongooseType('boolean')).toBe('Boolean');
        expect(toMongooseType('date')).toBe('Date');
        expect(toMongooseType('json')).toBe('mongoose.Schema.Types.Mixed');
        expect(toMongooseType('unknown')).toBe('String');
      });
    });

    describe('toSequelizeType', () => {
      it('should map field types to Sequelize types', () => {
        expect(toSequelizeType('string')).toBe('STRING');
        expect(toSequelizeType('number')).toBe('INTEGER');
        expect(toSequelizeType('boolean')).toBe('BOOLEAN');
        expect(toSequelizeType('uuid')).toBe('UUID');
        expect(toSequelizeType('unknown')).toBe('STRING');
      });
    });

    describe('toTsType', () => {
      it('should map field types to TypeScript types', () => {
        expect(toTsType('string')).toBe('string');
        expect(toTsType('number')).toBe('number');
        expect(toTsType('boolean')).toBe('boolean');
        expect(toTsType('date')).toBe('Date');
        expect(toTsType('json')).toBe('Record<string, any>');
        expect(toTsType('unknown')).toBe('string');
      });
    });

    describe('toTypeOrmType', () => {
      it('should map field types to TypeORM types', () => {
        expect(toTypeOrmType('string')).toBe('varchar');
        expect(toTypeOrmType('number')).toBe('int');
        expect(toTypeOrmType('boolean')).toBe('boolean');
        expect(toTypeOrmType('date')).toBe('timestamp');
        expect(toTypeOrmType('uuid')).toBe('uuid');
        expect(toTypeOrmType('unknown')).toBe('varchar');
      });
    });
  });

  describe('generateGitignore', () => {
    it('should generate standard gitignore content', () => {
      const gitignore = generateGitignore();
      
      expect(gitignore).toContain('node_modules/');
      expect(gitignore).toContain('.env');
      expect(gitignore).toContain('dist/');
      expect(gitignore).toContain('*.log');
    });
  });
});