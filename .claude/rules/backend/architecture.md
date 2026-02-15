---
paths:
  - "apps/backend/**/*.ts"
---

# Backend Architecture Rules

## Layered Architecture (mandatory)

Routes → Services → Repositories (unidirectional dependency)

| Layer | Directory | Responsibility | Style |
|-------|-----------|---------------|-------|
| Route | `routes/` | HTTP handling + Zod validation (`@hono/zod-validator`) | Arrow functions |
| Service | `services/` | Business logic, DI via constructor | Class-based |
| Repository | `repositories/` | Data access via Drizzle ORM, `satisfies` for type mapping | Class-based |
| Middleware | `middlewares/` | Cross-cutting concerns (error handling) | Arrow functions |
| Utils | `utils/`, `config/` | Pure functions, env config | Arrow functions |

## Conventions

- Use `zValidator` with Zod schemas imported from `@shared/api/`
- Response format: `{ data: ... }` for success, `{ error: { statusCode, errorCode, details } }` for errors
- Type responses with Hono generic: `c.json<ResponseType>(...)`
- Import shared types/schemas from `@shared/api/` and constants from `@shared/constants/`

## Error Handling (3 layers)

1. `zValidator` catches ZodError → 400 VALIDATION_ERROR
2. Route handler try-catch → `DatabaseError` wrapping → 500
3. `errorHandler` middleware → catches all unhandled errors

Error classes defined in `errors/`: `AppError`, `DatabaseError`

## Reference implementations

- Route pattern: `apps/backend/routes/peopleRoute.ts`
- Service pattern: `apps/backend/services/personService.ts`
- Repository pattern: `apps/backend/repositories/personRepository.ts`
- Error handler: `apps/backend/middlewares/errorHandler.ts`
