# Backend Generator

Generate production-ready **Express** or **NestJS** backends instantly — no AI delays, just deterministic code generation.

Define your data model → pick your framework → download a complete, working API.

---

## Project structure

```
backend-generator-app/
├── client/                          # React frontend (the generator UI)
│   ├── public/
│   └── src/
│       ├── generators/
│       │   ├── shared/
│       │   │   ├── types.js         # Schema shape + default factories
│       │   │   └── utils.js         # Shared helpers (type maps, flags)
│       │   ├── express/
│       │   │   └── index.js         # ExpressGenerator — implements IFrameworkGenerator
│       │   ├── nestjs/
│       │   │   └── index.js         # NestJSGenerator — implements IFrameworkGenerator
│       │   └── orchestrator.js      # Picks strategy, zips, triggers download
│       ├── hooks/
│       │   └── useSchema.js         # All schema state + localStorage templates
│       └── App.js                   # Pure UI — zero generation logic
└── server/                          # Node.js backend (for Phase 2 shareable links)
    └── src/
        └── index.js
```

---

## Architecture

The generator follows the **strategy pattern**. All framework generators implement the same contract:

```js
interface IFrameworkGenerator {
  generateFiles(schema) → { [filePath: string]: string }
}
```

Adding a new framework (e.g. Fastify, Hono) means:
1. Create `src/generators/fastify/index.js`
2. Export a `FastifyGenerator` with `generateFiles(schema)`
3. Register it in `orchestrator.js`

The UI and state management never touch generation logic.

---

## Quick start

```bash
# Install everything
npm run install:all

# Run client + server together
npm run dev
```

- React UI: http://localhost:3000
- API server: http://localhost:5000

---

## What gets generated

### Express output
```
my-api/
├── config/database.js
├── controllers/<Entity>Controller.js
├── middleware/auth.js
├── middleware/validation.js
├── models/<Entity>.js
├── routes/<Entity>Routes.js
├── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### NestJS output
```
my-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt.strategy.ts
│   └── <entity>/
│       ├── <entity>.entity.ts
│       ├── <entity>.controller.ts
│       ├── <entity>.service.ts
│       ├── <entity>.module.ts
│       └── dto/create-<entity>.dto.ts
├── tsconfig.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Roadmap

### Phase 1 — done ✅
- [x] Express backend generation
- [x] NestJS backend generation
- [x] MongoDB + PostgreSQL
- [x] JWT authentication
- [x] Input validation
- [x] ZIP download
- [x] Save/load templates (localStorage)
- [x] File preview before download
- [x] Strategy pattern architecture

### Phase 2 — in progress 🚧
- [ ] Entity relationships (one-to-many, many-to-many)
- [ ] Pagination, filtering, sorting on generated endpoints
- [ ] Advanced field validation (min, max, regex)
- [ ] File upload handling

### Phase 3 — planned 📋
- [ ] Shareable links (server-side template storage, no auth needed)
- [ ] Docker + docker-compose generation
- [ ] Test scaffolding (Jest / Vitest)
- [ ] Deployment config (Railway, Render, Heroku)
