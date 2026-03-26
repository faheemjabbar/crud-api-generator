import {
  toPlural,
  toMongooseType,
  toSequelizeType,
  hasPasswordField,
  hasLoginEndpoint,
  generateGitignore,
  capitalize,
} from '../shared/utils.js';

// ─── package.json ────────────────────────────────────────────────────────────

const generatePackageJson = (schema) => {
  const { projectName, database } = schema;
  const deps = {
    express: '^4.18.2',
    jsonwebtoken: '^9.0.2',
    bcryptjs: '^2.4.3',
    dotenv: '^16.3.1',
    cors: '^2.8.5',
    'express-validator': '^7.0.1',
    helmet: '^7.1.0',
    'express-rate-limit': '^7.1.5',
  };
  if (database === 'mongodb') deps.mongoose = '^8.0.0';
  if (database === 'postgresql') {
    deps.pg = '^8.11.3';
    deps['pg-hstore'] = '^2.3.4';
    deps.sequelize = '^6.35.0';
  }
  return JSON.stringify(
    {
      name: projectName,
      version: '1.0.0',
      description: 'Generated Express API with JWT authentication',
      main: 'server.js',
      scripts: { start: 'node server.js', dev: 'nodemon server.js' },
      dependencies: deps,
      devDependencies: { nodemon: '^3.0.2' },
    },
    null,
    2
  );
};

// ─── .env.example ────────────────────────────────────────────────────────────

const generateEnvExample = (schema) => {
  const { port, database, projectName } = schema;
  return `PORT=${port}
NODE_ENV=development

# Database
${database === 'mongodb'
  ? `MONGODB_URI=mongodb://localhost:27017/${projectName}`
  : `DATABASE_URL=postgresql://user:password@localhost:5432/${projectName}`
}

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
`;
};

// ─── server.js ───────────────────────────────────────────────────────────────

const generateServerJs = (schema) => {
  const { database, entities, port } = schema;

  const dbImport =
    database === 'mongodb'
      ? "const connectDB = require('./config/database');"
      : "const { sequelize } = require('./config/database');";

  // Sequelize associations block
  const hasRelations = entities.some((e) => (e.relations || []).length > 0);
  const assocBlock = database === 'postgresql' && hasRelations
    ? `\n// ─── Associations ────────────────────────────────────────────────────────────\n${
        entities.flatMap((e) =>
          (e.relations || [])
            .filter((r) => r.targetEntity && r.fieldName)
            .map((r) => {
              if (r.type === 'one-to-one')   return `${e.name}.hasOne(${r.targetEntity},   { foreignKey: '${e.name.toLowerCase()}Id' });\n${r.targetEntity}.belongsTo(${e.name}, { foreignKey: '${e.name.toLowerCase()}Id' });`;
              if (r.type === 'one-to-many')  return `${e.name}.hasMany(${r.targetEntity},  { foreignKey: '${e.name.toLowerCase()}Id' });\n${r.targetEntity}.belongsTo(${e.name}, { foreignKey: '${e.name.toLowerCase()}Id' });`;
              if (r.type === 'many-to-many') return `${e.name}.belongsToMany(${r.targetEntity}, { through: '${e.name}${r.targetEntity}', foreignKey: '${e.name.toLowerCase()}Id' });\n${r.targetEntity}.belongsToMany(${e.name}, { through: '${e.name}${r.targetEntity}', foreignKey: '${r.targetEntity.toLowerCase()}Id' });`;
              return '';
            })
        ).join('\n')
      }\n`
    : '';

  const modelRequires = database === 'postgresql' && hasRelations
    ? entities.map((e) => `const ${e.name} = require('./models/${e.name}');`).join('\n') + '\n'
    : '';

  const dbStart =
    database === 'mongodb'
      ? `connectDB().then(() => {
  app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
});`
      : `sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
});`;

  return `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
${dbImport}
${modelRequires}
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
${assocBlock}
// Routes
${entities
  .map((e) => `app.use('/api/${toPlural(e.name)}', require('./routes/${e.name.toLowerCase()}Routes'));`)
  .join('\n')}

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || ${port};
${dbStart}
`;
};

// ─── config/database.js ──────────────────────────────────────────────────────

const generateDatabaseConfig = (schema) => {
  if (schema.database === 'mongodb') {
    return `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
`;
  }
  return `const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

sequelize.authenticate()
  .then(() => console.log('PostgreSQL connected'))
  .catch((err) => console.error('Unable to connect to PostgreSQL:', err));

module.exports = { sequelize };
`;
};

// ─── models/ ─────────────────────────────────────────────────────────────────

const generateModel = (entity, schema) => {
  const { database } = schema;
  const { name, fields, auth, relations = [] } = entity;
  const needsBcrypt = auth && hasPasswordField(entity);

  if (database === 'mongodb') {
    const fieldDefs = fields
      .map((f) => {
        let def = `  ${f.name}: {\n    type: ${toMongooseType(f.type)}`;
        if (f.required) def += `,\n    required: [true, 'Please provide ${f.name}']`;
        if (f.unique)   def += ',\n    unique: true';
        if (f.type === 'email')    def += ',\n    lowercase: true,\n    match: [/^\\S+@\\S+\\.\\S+$/, \'Please provide a valid email\']';
        if (f.type === 'password') def += ',\n    select: false';
        if (f.type === 'enum' && (f.enumValues || []).length > 0)
          def += `,\n    enum: [${f.enumValues.map((v) => `'${v}'`).join(', ')}]`;
        if (f.type === 'uuid')     def += ',\n    default: () => require(\'crypto\').randomUUID()';
        if (f.minLength) def += `,\n    minlength: ${f.minLength}`;
        if (f.maxLength) def += `,\n    maxlength: ${f.maxLength}`;
        if (f.min)       def += `,\n    min: ${f.min}`;
        if (f.max)       def += `,\n    max: ${f.max}`;
        if (f.regex)     def += `,\n    match: [/${f.regex}/, 'Invalid format for ${f.name}']`;
        def += '\n  }';
        return def;
      })
      .join(',\n');

    // Mongoose relation refs
    const refDefs = relations
      .filter((r) => r.targetEntity && r.fieldName)
      .map((r) => {
        if (r.type === 'one-to-one' || r.type === 'one-to-many') {
          const isArray = r.type === 'one-to-many';
          return `  ${r.fieldName}: ${isArray ? '[' : ''}{ type: mongoose.Schema.Types.ObjectId, ref: '${r.targetEntity}'${r.eager ? '' : ''} }${isArray ? ']' : ''}`;
        }
        if (r.type === 'many-to-many') {
          return `  ${r.fieldName}: [{ type: mongoose.Schema.Types.ObjectId, ref: '${r.targetEntity}' }]`;
        }
        return '';
      })
      .filter(Boolean)
      .join(',\n');

    const allDefs = [fieldDefs, refDefs].filter(Boolean).join(',\n');

    return `const mongoose = require('mongoose');
${needsBcrypt ? "const bcrypt = require('bcryptjs');\n" : ''}
const ${name}Schema = new mongoose.Schema({
${allDefs}
}, { timestamps: true });
${
  needsBcrypt
    ? `
${name}Schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

${name}Schema.methods.comparePassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};`
    : ''
}

module.exports = mongoose.model('${name}', ${name}Schema);
`;
  }

  // PostgreSQL / Sequelize
  const fieldDefs = fields
    .map((f) => {
      let def = `  ${f.name}: {\n    type: DataTypes.${toSequelizeType(f.type)}`;
      if (f.type === 'enum' && (f.enumValues || []).length > 0)
        def = `  ${f.name}: {\n    type: DataTypes.ENUM(${f.enumValues.map((v) => `'${v}'`).join(', ')})`;
      if (f.type === 'uuid')     def += ',\n    defaultValue: DataTypes.UUIDV4';
      if (f.required) def += ',\n    allowNull: false';
      if (f.unique)   def += ',\n    unique: true';
      if (f.type === 'email') def += ',\n    validate: { isEmail: true }';
      if (f.minLength) def += `,\n    validate: { len: [${f.minLength}, ${f.maxLength || 255}] }`;
      if (f.min !== '' && f.min !== undefined) def += `,\n    validate: { ...(def.includes('validate:') ? {} : {}), min: ${f.min}${f.max !== '' ? `, max: ${f.max}` : ''} }`;
      def += '\n  }';
      return def;
    })
    .join(',\n');

  return `const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
${needsBcrypt ? "const bcrypt = require('bcryptjs');\n" : ''}
const ${name} = sequelize.define('${name}', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
${fieldDefs}
}, { timestamps: true, tableName: '${toPlural(name)}' });
${
  needsBcrypt
    ? `
const hashPassword = async (instance) => {
  if (instance.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    instance.password = await bcrypt.hash(instance.password, salt);
  }
};

${name}.beforeCreate(hashPassword);
${name}.beforeUpdate(hashPassword);

${name}.prototype.comparePassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};`
    : ''
}

module.exports = ${name};
`;
};

// ─── controllers/ ────────────────────────────────────────────────────────────

const generateController = (entity, schema) => {
  const { database } = schema;
  const { name, auth, relations = [] } = entity;
  const isMongo = database === 'mongodb';
  const loginEndpoint = hasLoginEndpoint(entity);
  const idField = isMongo ? '_id' : 'id';

  // Build populate / include for eager relations
  const eagerRelations = relations.filter((r) => r.eager && r.targetEntity && r.fieldName);
  const mongoPopulate = isMongo && eagerRelations.length > 0
    ? `.populate(${eagerRelations.map((r) => `'${r.fieldName}'`).join(', ')})`
    : '';
  const seqInclude = !isMongo && eagerRelations.length > 0
    ? `,\n    include: [${eagerRelations.map((r) => `require('../models/${r.targetEntity}')`).join(', ')}]`
    : '';

  const findAll  = isMongo ? `find(filter)${mongoPopulate}` : `findAll({ where: filter${seqInclude} })`;
  const findById = isMongo ? `findById(req.params.id)${mongoPopulate}` : `findByPk(req.params.id${seqInclude ? `, {${seqInclude}\n  }` : ''})`;

  return `const ${name} = require('../models/${name}');
const jwt = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// GET /api/${toPlural(name)}  — supports ?page, ?limit, ?sortBy, ?sortOrder, ?search
exports.getAll${name}s = async (req, res, next) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page)  || 1);
    const limit     = Math.min(100, parseInt(req.query.limit) || 20);
    const skip      = (page - 1) * limit;
    const sortBy    = req.query.sortBy    || '${isMongo ? 'createdAt' : 'createdAt'}';
    const sortOrder = req.query.sortOrder === 'asc' ? ${isMongo ? '1' : "'ASC'"} : ${isMongo ? '-1' : "'DESC'"};
    ${isMongo ? `const search = req.query.search;
    const filter  = search ? { $or: [{ name: { $regex: search, $options: 'i' } }] } : {};` : `const filter = {};`}

${isMongo
  ? `    const [items, total] = await Promise.all([
      ${name}.${findAll}.sort({ [sortBy]: sortOrder }).skip(skip).limit(limit),
      ${name}.countDocuments(filter),
    ]);`
  : `    const { count: total, rows: items } = await ${name}.findAndCountAll({
      where: filter,
      order: [[sortBy, sortOrder]],
      offset: skip,
      limit,${seqInclude}
    });`}

    res.json({
      success: true,
      count: items.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: items,
    });
  } catch (err) { next(err); }
};

// GET /api/${toPlural(name)}/:id
exports.get${name} = async (req, res, next) => {
  try {
    const item = await ${name}.${findById};
    if (!item) return res.status(404).json({ success: false, message: '${name} not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

// POST /api/${toPlural(name)}
exports.create${name} = async (req, res, next) => {
  try {
    const item = await ${name}.create(req.body);
    ${
      auth && hasPasswordField(entity)
        ? `const token = signToken(item.${idField});
    res.status(201).json({ success: true, data: item, token });`
        : `res.status(201).json({ success: true, data: item });`
    }
  } catch (err) { next(err); }
};

// PUT /api/${toPlural(name)}/:id
exports.update${name} = async (req, res, next) => {
  try {
    ${
      isMongo
        ? `const item = await ${name}.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: '${name} not found' });`
        : `const [updated] = await ${name}.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ success: false, message: '${name} not found' });
    const item = await ${name}.findByPk(req.params.id);`
    }
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

// DELETE /api/${toPlural(name)}/:id
exports.delete${name} = async (req, res, next) => {
  try {
    ${
      isMongo
        ? `const item = await ${name}.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: '${name} not found' });`
        : `const deleted = await ${name}.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ success: false, message: '${name} not found' });`
    }
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
${
  loginEndpoint
    ? `
// POST /api/${toPlural(name)}/login
exports.login${name} = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const item = await ${name}.${isMongo ? `findOne({ email }).select('+password')` : `findOne({ where: { email } })`};
    if (!item || !(await item.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(item.${idField});
    res.json({ success: true, token, data: item });
  } catch (err) { next(err); }
};`
    : ''
}
`;
};

// ─── routes/ ─────────────────────────────────────────────────────────────────

const generateRoutes = (entity) => {
  const { name, auth } = entity;
  const varName = name.toLowerCase();
  const loginEndpoint = hasLoginEndpoint(entity);
  const protect = auth ? 'protect, ' : '';

  return `const express = require('express');
const router = express.Router();
const {
  getAll${name}s,
  get${name},
  create${name},
  update${name},
  delete${name}${loginEndpoint ? `,\n  login${name}` : ''}
} = require('../controllers/${varName}Controller');
const { validate${name} } = require('../middleware/validation');
${auth ? "const { protect } = require('../middleware/auth');\n" : ''}
${loginEndpoint ? `router.post('/login', login${name});\n` : ''}
router.route('/')
  .get(${protect}getAll${name}s)
  .post(validate${name}, create${name});

router.route('/:id')
  .get(${protect}get${name})
  .put(${protect}validate${name}, update${name})
  .delete(${protect}delete${name});

module.exports = router;
`;
};

// ─── middleware/auth.js ───────────────────────────────────────────────────────

const generateAuthMiddleware = () => `const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};
`;

// ─── middleware/validation.js ─────────────────────────────────────────────────

const generateValidationMiddleware = (entities) => {
  const blocks = entities.map((entity) => {
    const rules = entity.fields.map((f) => {
      const lines = [];
      // base type validation
      if (f.type === 'email')   lines.push(`  body('${f.name}').isEmail().withMessage('Please provide a valid email').normalizeEmail(),`);
      else if (f.type === 'password') lines.push(`  body('${f.name}').isLength({ min: ${f.minLength || 6} }).withMessage('Password must be at least ${f.minLength || 6} characters'),`);
      else if (f.type === 'number')   lines.push(`  body('${f.name}').optional({ nullable: true }).isNumeric().withMessage('${f.name} must be a number')${f.min !== '' && f.min !== undefined ? `.isFloat({ min: ${f.min}${f.max !== '' && f.max !== undefined ? `, max: ${f.max}` : ''} }).withMessage('${f.name} out of range')` : ''},`);
      else if (f.type === 'boolean')  lines.push(`  body('${f.name}').optional({ nullable: true }).isBoolean().withMessage('${f.name} must be a boolean'),`);
      else if (f.type === 'date')     lines.push(`  body('${f.name}').optional({ nullable: true }).isISO8601().withMessage('${f.name} must be a valid date'),`);
      else if (f.type === 'uuid')     lines.push(`  body('${f.name}').optional({ nullable: true }).isUUID().withMessage('${f.name} must be a valid UUID'),`);
      else if (f.type === 'enum' && (f.enumValues || []).length > 0)
        lines.push(`  body('${f.name}').optional({ nullable: true }).isIn([${f.enumValues.map((v) => `'${v}'`).join(', ')}]).withMessage('${f.name} must be one of: ${(f.enumValues || []).join(', ')}'),`);
      else {
        // string
        let chain = `  body('${f.name}')`;
        if (!f.required) chain += `.optional({ nullable: true })`;
        else             chain += `.notEmpty().withMessage('${f.name} is required')`;
        if (f.minLength) chain += `.isLength({ min: ${f.minLength} }).withMessage('${f.name} must be at least ${f.minLength} characters')`;
        if (f.maxLength) chain += `.isLength({ max: ${f.maxLength} }).withMessage('${f.name} must be at most ${f.maxLength} characters')`;
        if (f.regex)     chain += `.matches(/${f.regex}/).withMessage('${f.name} format is invalid')`;
        lines.push(chain + ',');
      }
      return lines.join('\n');
    });

    return `exports.validate${entity.name} = [
${rules.join('\n')}
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });
    next();
  },
];`;
  });

  return `const { body, validationResult } = require('express-validator');

${blocks.join('\n\n')}
`;
};

// ─── README.md ────────────────────────────────────────────────────────────────

const generateReadme = (schema) => {
  const { projectName, database, port, entities } = schema;
  const dbName = database === 'mongodb' ? 'MongoDB' : 'PostgreSQL';

  return `# ${projectName}

Generated Express API — production-ready, no fluff.

## Stack
- Express.js + ${dbName}
- JWT authentication · bcrypt · express-validator
- Helmet · CORS · Rate limiting
- Pagination · filtering · sorting on all list endpoints

## Entities
${entities.map((e) => {
  const rels = (e.relations || []).filter((r) => r.targetEntity && r.fieldName);
  return `- **${e.name}** — ${e.fields.length} field(s)${e.auth ? ' · protected' : ''}${rels.length > 0 ? ` · ${rels.map((r) => `${r.type} → ${r.targetEntity}`).join(', ')}` : ''}`;
}).join('\n')}

## Quick start

\`\`\`bash
npm install
cp .env.example .env   # fill in your DB connection & JWT secret
npm run dev
\`\`\`

Server starts at \`http://localhost:${port}\`

## Endpoints

All list endpoints support query params:
- \`?page=1&limit=20\` — pagination
- \`?sortBy=createdAt&sortOrder=desc\` — sorting
- \`?search=keyword\` — basic search (MongoDB)

${entities
  .map((e) => {
    const route = `/api/${toPlural(e.name)}`;
    const login = hasLoginEndpoint(e);
    return `### ${e.name}
${login ? `- \`POST ${route}/login\` — authenticate\n` : ''}${e.auth ? '> Protected routes require \`Authorization: Bearer <token>\`\n' : ''}
- \`GET    ${route}\` — list (paginated)
- \`GET    ${route}/:id\`
- \`POST   ${route}\`
- \`PUT    ${route}/:id\`
- \`DELETE ${route}/:id\``;
  })
  .join('\n\n')}
`;
};

// ─── IFrameworkGenerator interface implementation ─────────────────────────────

export const ExpressGenerator = {
  generateFiles(schema) {
    const files = {};
    const { entities } = schema;

    files['package.json']           = generatePackageJson(schema);
    files['.env.example']           = generateEnvExample(schema);
    files['server.js']              = generateServerJs(schema);
    files['README.md']              = generateReadme(schema);
    files['.gitignore']             = generateGitignore();
    files['config/database.js']     = generateDatabaseConfig(schema);
    files['middleware/auth.js']     = generateAuthMiddleware();
    files['middleware/validation.js'] = generateValidationMiddleware(entities);

    entities.forEach((entity) => {
      files[`models/${entity.name}.js`]                                = generateModel(entity, schema);
      files[`controllers/${entity.name.toLowerCase()}Controller.js`]   = generateController(entity, schema);
      files[`routes/${entity.name.toLowerCase()}Routes.js`]            = generateRoutes(entity);
    });

    return files;
  },
};
