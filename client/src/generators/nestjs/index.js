import {
  toPlural,
  toTsType,
  toTypeOrmType,
  hasPasswordField,
  hasLoginEndpoint,
  capitalize,
  lcFirst,
  generateGitignore,
} from '../shared/utils.js';

// ─── package.json ─────────────────────────────────────────────────────────────

const generatePackageJson = (schema) => {
  const { projectName, database } = schema;
  const deps = {
    '@nestjs/common': '^10.0.0',
    '@nestjs/core': '^10.0.0',
    '@nestjs/platform-express': '^10.0.0',
    '@nestjs/jwt': '^10.1.0',
    '@nestjs/config': '^3.0.0',
    '@nestjs/typeorm': database === 'mongodb' ? undefined : '^10.0.0',
    '@nestjs/mongoose': database === 'mongodb' ? '^10.0.0' : undefined,
    typeorm: database === 'postgresql' ? '^0.3.17' : undefined,
    mongoose: database === 'mongodb' ? '^8.0.0' : undefined,
    pg: database === 'postgresql' ? '^8.11.3' : undefined,
    bcryptjs: '^2.4.3',
    'class-validator': '^0.14.0',
    'class-transformer': '^0.5.1',
    'reflect-metadata': '^0.1.13',
    rxjs: '^7.8.1',
  };
  Object.keys(deps).forEach((k) => deps[k] === undefined && delete deps[k]);
  return JSON.stringify(
    {
      name: projectName,
      version: '1.0.0',
      description: 'Generated NestJS API',
      scripts: {
        build: 'nest build',
        start: 'node dist/main',
        'start:dev': 'nest start --watch',
        'start:prod': 'node dist/main',
      },
      dependencies: deps,
      devDependencies: {
        '@nestjs/cli': '^10.0.0',
        '@nestjs/schematics': '^10.0.0',
        '@types/bcryptjs': '^2.4.5',
        '@types/node': '^20.0.0',
        typescript: '^5.1.3',
        'ts-node': '^10.9.1',
      },
    },
    null,
    2
  );
};

// ─── tsconfig.json ────────────────────────────────────────────────────────────

const generateTsConfig = () =>
  JSON.stringify(
    {
      compilerOptions: {
        module: 'commonjs',
        declaration: true,
        removeComments: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        allowSyntheticDefaultImports: true,
        target: 'ES2021',
        sourceMap: true,
        outDir: './dist',
        baseUrl: './',
        incremental: true,
        skipLibCheck: true,
        strictNullChecks: false,
        noImplicitAny: false,
        strictBindCallApply: false,
        forceConsistentCasingInFileNames: false,
        noFallthroughCasesInSwitch: false,
      },
    },
    null,
    2
  );

// ─── .env.example ─────────────────────────────────────────────────────────────

const generateEnvExample = (schema) => {
  const { port, database, projectName } = schema;
  return `PORT=${port}
NODE_ENV=development

${
  database === 'mongodb'
    ? `MONGODB_URI=mongodb://localhost:27017/${projectName}`
    : `DATABASE_URL=postgresql://user:password@localhost:5432/${projectName}`
}

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
`;
};

// ─── src/main.ts ──────────────────────────────────────────────────────────────

const generateMain = (schema) => {
  const { port } = schema;
  return `import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.CORS_ORIGIN || '*', credentials: true });

  await app.listen(process.env.PORT || ${port});
  console.log(\`Server running on port \${process.env.PORT || ${port}}\`);
}

bootstrap();
`;
};

// ─── src/app.module.ts ────────────────────────────────────────────────────────

const generateAppModule = (schema) => {
  const { database, entities, projectName } = schema;
  const entityNames = entities.map((e) => e.name);
  const moduleImports = entityNames.map((n) => `${n}Module`);
  const moduleRequires = entityNames
    .map((n) => `import { ${n}Module } from './${n.toLowerCase()}/${n.toLowerCase()}.module';`)
    .join('\n');

  const dbModule =
    database === 'mongodb'
      ? `MongooseModule.forRoot(process.env.MONGODB_URI)`
      : `TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    })`;

  const dbImport =
    database === 'mongodb'
      ? "import { MongooseModule } from '@nestjs/mongoose';"
      : "import { TypeOrmModule } from '@nestjs/typeorm';";

  return `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
${dbImport}
${moduleRequires}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ${dbModule},
    ${moduleImports.join(',\n    ')},
  ],
})
export class AppModule {}
`;
};

// ─── src/{entity}/{entity}.entity.ts ─────────────────────────────────────────

const generateEntity = (entity, schema) => {
  const { name, fields, relations = [] } = entity;
  const { database } = schema;

  if (database === 'mongodb') {
    const propLines = fields.map((f) => {
      const opts = [];
      if (f.required) opts.push('required: true');
      if (f.unique)   opts.push('unique: true');
      if (f.type === 'enum' && (f.enumValues || []).length > 0)
        opts.push(`enum: [${f.enumValues.map((v) => `'${v}'`).join(', ')}]`);
      const decorator = opts.length > 0 ? `@Prop({ ${opts.join(', ')} })` : `@Prop()`;
      let tsType = toTsType(f.type);
      if (f.type === 'enum' && (f.enumValues || []).length > 0) tsType = `'${f.enumValues.join("' | '")}'`;
      return `  ${decorator}\n  ${f.name}: ${tsType};`;
    });

    // Mongoose relation refs
    const relLines = relations
      .filter((r) => r.targetEntity && r.fieldName)
      .map((r) => {
        const isArray = r.type !== 'one-to-one';
        const decorator = `@Prop({ type: ${isArray ? '[' : ''}mongoose.Schema.Types.ObjectId${isArray ? ']' : ''}, ref: '${r.targetEntity}'${r.eager ? ', autopopulate: true' : ''} })`;
        const tsType = isArray ? `string[]` : `string`;
        return `  ${decorator}\n  ${r.fieldName}: ${tsType};`;
      });

    const allPropLines = [...propLines, ...relLines];

    return `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type ${name}Document = ${name} & Document;

@Schema({ timestamps: true })
export class ${name} {
${allPropLines.join('\n\n')}
}

export const ${name}Schema = SchemaFactory.createForClass(${name});
`;
  }

  // TypeORM (PostgreSQL)
  const extraImports = new Set(['Entity', 'PrimaryGeneratedColumn', 'Column', 'CreateDateColumn', 'UpdateDateColumn']);
  const relationImportMap = {
    'one-to-one':   ['OneToOne', 'JoinColumn'],
    'one-to-many':  ['OneToMany'],
    'many-to-many': ['ManyToMany', 'JoinTable'],
  };
  relations.forEach((r) => {
    if (r.targetEntity && r.fieldName) {
      (relationImportMap[r.type] || []).forEach((i) => extraImports.add(i));
    }
  });

  const columnLines = fields.map((f) => {
    const opts = [];
    opts.push(`type: '${toTypeOrmType(f.type)}'`);
    if (f.unique)    opts.push('unique: true');
    if (!f.required) opts.push('nullable: true');
    if (f.type === 'enum' && (f.enumValues || []).length > 0) {
      opts.push(`enum: [${f.enumValues.map((v) => `'${v}'`).join(', ')}]`);
    }
    let tsType = toTsType(f.type);
    if (f.type === 'enum' && (f.enumValues || []).length > 0) tsType = `'${f.enumValues.join("' | '")}'`;
    return `  @Column({ ${opts.join(', ')} })\n  ${f.name}: ${tsType};`;
  });

  const entityRelLines = relations
    .filter((r) => r.targetEntity && r.fieldName)
    .map((r) => {
      const lazyStr = r.eager ? ', { eager: true }' : '';
      if (r.type === 'one-to-one') {
        return `  @OneToOne(() => ${r.targetEntity}${lazyStr})\n  @JoinColumn()\n  ${r.fieldName}: ${r.targetEntity};`;
      }
      if (r.type === 'one-to-many') {
        return `  @OneToMany(() => ${r.targetEntity}, (item) => item.${lcFirst(name)}${lazyStr})\n  ${r.fieldName}: ${r.targetEntity}[];`;
      }
      if (r.type === 'many-to-many') {
        return `  @ManyToMany(() => ${r.targetEntity}${lazyStr})\n  @JoinTable()\n  ${r.fieldName}: ${r.targetEntity}[];`;
      }
      return '';
    })
    .filter(Boolean);

  // imports for related entity classes
  const relEntityImports = relations
    .filter((r) => r.targetEntity && r.fieldName)
    .map((r) => `import { ${r.targetEntity} } from '../${r.targetEntity.toLowerCase()}/${r.targetEntity.toLowerCase()}.entity';`)
    .join('\n');

  return `import { ${[...extraImports].join(', ')} } from 'typeorm';
${relEntityImports ? relEntityImports + '\n' : ''}
@Entity('${toPlural(name)}')
export class ${name} {
  @PrimaryGeneratedColumn()
  id: number;

${columnLines.join('\n\n')}
${entityRelLines.length > 0 ? '\n' + entityRelLines.join('\n\n') : ''}

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`;
};

// ─── src/{entity}/dto/create-{entity}.dto.ts ─────────────────────────────────

const generateCreateDto = (entity) => {
  const { name, fields } = entity;

  const imports = new Set(['IsOptional', 'IsString', 'IsNotEmpty']);

  const propLines = fields.map((f) => {
    const decorators = [];

    if (!f.required) decorators.push('  @IsOptional()');

    if (f.type === 'email') {
      imports.add('IsEmail');
      decorators.push('  @IsEmail()');
    } else if (f.type === 'number') {
      imports.add('IsNumber');
      decorators.push('  @IsNumber()');
      if (f.min !== '' && f.min !== undefined) { imports.add('Min'); decorators.push(`  @Min(${f.min})`); }
      if (f.max !== '' && f.max !== undefined) { imports.add('Max'); decorators.push(`  @Max(${f.max})`); }
    } else if (f.type === 'boolean') {
      imports.add('IsBoolean');
      decorators.push('  @IsBoolean()');
    } else if (f.type === 'date') {
      imports.add('IsDateString');
      decorators.push('  @IsDateString()');
    } else if (f.type === 'uuid') {
      imports.add('IsUUID');
      decorators.push('  @IsUUID()');
    } else if (f.type === 'enum' && (f.enumValues || []).length > 0) {
      imports.add('IsIn');
      decorators.push(`  @IsIn([${f.enumValues.map((v) => `'${v}'`).join(', ')}])`);
    } else {
      // string, password, json
      if (f.required) { decorators.push('  @IsNotEmpty()'); }
      else             { decorators.push('  @IsString()'); }
      if (f.minLength) { imports.add('MinLength'); decorators.push(`  @MinLength(${f.minLength})`); }
      if (f.maxLength) { imports.add('MaxLength'); decorators.push(`  @MaxLength(${f.maxLength})`); }
      if (f.regex)     { imports.add('Matches');   decorators.push(`  @Matches(/${f.regex}/)`); }
      if (f.type === 'password') { imports.add('MinLength'); decorators.push(`  @MinLength(${f.minLength || 6})`); }
    }

    let tsType = toTsType(f.type);
    if (f.type === 'enum' && (f.enumValues || []).length > 0) tsType = `'${f.enumValues.join("' | '")}'`;

    return `${decorators.join('\n')}\n  ${f.name}${f.required ? '' : '?'}: ${tsType};`;
  });

  return `import { ${[...imports].join(', ')} } from 'class-validator';

export class Create${name}Dto {
${propLines.join('\n\n')}
}
`;
};

// ─── src/{entity}/{entity}.service.ts ────────────────────────────────────────

const generateService = (entity, schema) => {
  const { name, relations = [] } = entity;
  const { database } = schema;
  const isMongo = database === 'mongodb';
  const varName = lcFirst(name);
  const needsBcrypt = entity.auth && hasPasswordField(entity);
  const loginEndpoint = hasLoginEndpoint(entity);

  const eagerRelations = relations.filter((r) => r.eager && r.targetEntity && r.fieldName);

  const modelDep = isMongo
    ? `@InjectModel(${name}.name) private ${varName}Model: Model<${name}Document>`
    : `@InjectRepository(${name}) private ${varName}Repo: Repository<${name}>`;

  const modelImport = isMongo
    ? `import { InjectModel } from '@nestjs/mongoose';\nimport { Model } from 'mongoose';\nimport { ${name}, ${name}Document } from './${varName}.entity';`
    : `import { InjectRepository } from '@nestjs/typeorm';\nimport { Repository } from 'typeorm';\nimport { ${name} } from './${varName}.entity';`;

  const mongoPopulate = isMongo && eagerRelations.length > 0
    ? `.populate(${eagerRelations.map((r) => `'${r.fieldName}'`).join(', ')})`
    : '';
  const seqRelations = !isMongo && eagerRelations.length > 0
    ? `, relations: [${eagerRelations.map((r) => `'${r.fieldName}'`).join(', ')}]`
    : '';

  const findAll = isMongo
    ? `this.${varName}Model.find(filter)${mongoPopulate}.sort(sort).skip(skip).limit(limit)`
    : `this.${varName}Repo.findAndCountAll({ where: filter, order: [[sortBy, sortOrder]], skip, limit${seqRelations} })`;

  const findOne = isMongo
    ? `this.${varName}Model.findById(id)${mongoPopulate}`
    : `this.${varName}Repo.findOne({ where: { id }${seqRelations} })`;

  const create = isMongo
    ? `new this.${varName}Model(dto).save()`
    : `this.${varName}Repo.save(this.${varName}Repo.create(dto))`;

  const update = isMongo
    ? `this.${varName}Model.findByIdAndUpdate(id, dto, { new: true })`
    : `this.${varName}Repo.save({ ...await this.findOne(id), ...dto })`;

  const remove = isMongo
    ? `this.${varName}Model.findByIdAndDelete(id)`
    : `this.${varName}Repo.delete(id)`;

  return `import { Injectable, NotFoundException } from '@nestjs/common';
${modelImport}
import { Create${name}Dto } from './dto/create-${varName}.dto';
${needsBcrypt ? "import * as bcrypt from 'bcryptjs';" : ''}

@Injectable()
export class ${name}Service {
  constructor(${modelDep}) {}

  async findAll(query: {
    page?: number; limit?: number; sortBy?: string; sortOrder?: string; search?: string;
  } = {}) {
    const page      = Math.max(1, query.page  || 1);
    const limit     = Math.min(100, query.limit || 20);
    const skip      = (page - 1) * limit;
    const sortBy    = query.sortBy    || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? ${isMongo ? '1' : "'ASC'"} : ${isMongo ? '-1' : "'DESC'"};
    ${isMongo
      ? `const filter = query.search ? { $or: [{ name: { $regex: query.search, $options: 'i' } }] } : {};
    const [items, total] = await Promise.all([
      ${findAll},
      this.${varName}Model.countDocuments(filter),
    ]);`
      : `const filter = {};
    const { count: total, rows: items } = await ${findAll};`}
    return { data: items, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: ${isMongo ? 'string' : 'number'}) {
    const item = await ${findOne};
    if (!item) throw new NotFoundException('${name} not found');
    return item;
  }

  async create(dto: Create${name}Dto) {
    ${needsBcrypt ? `if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);\n    ` : ''}return ${create};
  }

  async update(id: ${isMongo ? 'string' : 'number'}, dto: Partial<Create${name}Dto>) {
    ${needsBcrypt ? `if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);\n    ` : ''}return ${update};
  }

  async remove(id: ${isMongo ? 'string' : 'number'}) {
    await this.findOne(id);
    ${remove};
    return { deleted: true };
  }
${
  loginEndpoint
    ? `
  async validateCredentials(email: string, password: string) {
    const item = await ${
      isMongo
        ? `this.${varName}Model.findOne({ email }).select('+password')`
        : `this.${varName}Repo.findOne({ where: { email } })`
    };
    if (!item || !(await bcrypt.compare(password, item.password))) return null;
    return item;
  }`
    : ''
}
}
`;
};

// ─── src/{entity}/{entity}.controller.ts ─────────────────────────────────────

const generateController = (entity, schema) => {
  const { name, auth } = entity;
  const { database } = schema;
  const isMongo = database === 'mongodb';
  const varName = lcFirst(name);
  const idType = isMongo ? 'string' : 'number';
  const loginEndpoint = hasLoginEndpoint(entity);

  const guards = auth ? `\n  @UseGuards(JwtAuthGuard)` : '';
  const guardImport = auth
    ? `import { UseGuards } from '@nestjs/common';\nimport { JwtAuthGuard } from '../auth/jwt-auth.guard';`
    : '';
  const parseIntImport = !isMongo ? ', ParseIntPipe' : '';
  const queryImport = ', Query';

  return `import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode${parseIntImport}${queryImport} } from '@nestjs/common';
${guardImport}
import { ${name}Service } from './${varName}.service';
import { Create${name}Dto } from './dto/create-${varName}.dto';

@Controller('${toPlural(name)}')
export class ${name}Controller {
  constructor(private readonly ${varName}Service: ${name}Service) {}
${loginEndpoint ? `
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    const item = await this.${varName}Service.validateCredentials(body.email, body.password);
    if (!item) throw new Error('Invalid credentials');
    return { success: true, data: item };
  }
` : ''}${guards}
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('search') search?: string,
  ) {
    return this.${varName}Service.findAll({ page, limit, sortBy, sortOrder, search });
  }
${guards}
  @Get(':id')
  findOne(@Param('id'${!isMongo ? ', ParseIntPipe' : ''}) id: ${idType}) {
    return this.${varName}Service.findOne(id);
  }

  @Post()
  create(@Body() dto: Create${name}Dto) {
    return this.${varName}Service.create(dto);
  }
${guards}
  @Put(':id')
  update(@Param('id'${!isMongo ? ', ParseIntPipe' : ''}) id: ${idType}, @Body() dto: Partial<Create${name}Dto>) {
    return this.${varName}Service.update(id, dto);
  }
${guards}
  @Delete(':id')
  remove(@Param('id'${!isMongo ? ', ParseIntPipe' : ''}) id: ${idType}) {
    return this.${varName}Service.remove(id);
  }
}
`;
};

// ─── src/{entity}/{entity}.module.ts ─────────────────────────────────────────

const generateModule = (entity, schema) => {
  const { name } = entity;
  const { database } = schema;
  const isMongo = database === 'mongodb';
  const varName = lcFirst(name);

  const dbImport = isMongo
    ? `import { MongooseModule } from '@nestjs/mongoose';\nimport { ${name}, ${name}Schema } from './${varName}.entity';`
    : `import { TypeOrmModule } from '@nestjs/typeorm';\nimport { ${name} } from './${varName}.entity';`;

  const dbDeclaration = isMongo
    ? `MongooseModule.forFeature([{ name: ${name}.name, schema: ${name}Schema }])`
    : `TypeOrmModule.forFeature([${name}])`;

  return `import { Module } from '@nestjs/common';
${dbImport}
import { ${name}Controller } from './${varName}.controller';
import { ${name}Service } from './${varName}.service';

@Module({
  imports: [${dbDeclaration}],
  controllers: [${name}Controller],
  providers: [${name}Service],
  exports: [${name}Service],
})
export class ${name}Module {}
`;
};

// ─── src/auth/ ────────────────────────────────────────────────────────────────

const generateJwtGuard = () => `import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
`;

const generateJwtStrategy = () => `import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { id: payload.id };
  }
}
`;

// ─── README.md ────────────────────────────────────────────────────────────────

const generateReadme = (schema) => {
  const { projectName, database, port, entities } = schema;
  const dbName = database === 'mongodb' ? 'MongoDB + Mongoose' : 'PostgreSQL + TypeORM';

  return `# ${projectName}

Generated NestJS API — production-ready, no fluff.

## Stack
- NestJS · TypeScript
- ${dbName}
- JWT · bcrypt · class-validator
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
npm run start:dev
\`\`\`

Server starts at \`http://localhost:${port}/api\`

## Endpoints

All list endpoints support query params:
- \`?page=1&limit=20\` — pagination
- \`?sortBy=createdAt&sortOrder=desc\` — sorting
- \`?search=keyword\` — basic search (MongoDB)

${entities
  .map((e) => {
    const route = `/api/${toPlural(e.name)}`;
    return `### ${e.name}
${hasLoginEndpoint(e) ? `- \`POST ${route}/login\`\n` : ''}${e.auth ? '> Protected routes require \`Authorization: Bearer <token>\`\n' : ''}
- \`GET    ${route}\` — list (paginated)
- \`GET    ${route}/:id\`
- \`POST   ${route}\`
- \`PUT    ${route}/:id\`
- \`DELETE ${route}/:id\``;
  })
  .join('\n\n')}
`;
};

// ─── IFrameworkGenerator implementation ───────────────────────────────────────

export const NestJSGenerator = {
  generateFiles(schema) {
    const files = {};
    const { entities } = schema;

    files['package.json']     = generatePackageJson(schema);
    files['tsconfig.json']    = generateTsConfig();
    files['.env.example']     = generateEnvExample(schema);
    files['README.md']        = generateReadme(schema);
    files['.gitignore']       = generateGitignore();
    files['src/main.ts']      = generateMain(schema);
    files['src/app.module.ts'] = generateAppModule(schema);

    const hasAnyAuth = entities.some((e) => e.auth);
    if (hasAnyAuth) {
      files['src/auth/jwt-auth.guard.ts'] = generateJwtGuard();
      files['src/auth/jwt.strategy.ts']   = generateJwtStrategy();
    }

    entities.forEach((entity) => {
      const varName = entity.name.toLowerCase();
      files[`src/${varName}/${varName}.entity.ts`]              = generateEntity(entity, schema);
      files[`src/${varName}/dto/create-${varName}.dto.ts`]      = generateCreateDto(entity);
      files[`src/${varName}/${varName}.service.ts`]             = generateService(entity, schema);
      files[`src/${varName}/${varName}.controller.ts`]          = generateController(entity, schema);
      files[`src/${varName}/${varName}.module.ts`]              = generateModule(entity, schema);
    });

    return files;
  },
};
