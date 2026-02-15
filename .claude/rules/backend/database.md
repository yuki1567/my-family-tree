---
paths:
  - "apps/backend/database/**/*.ts"
---

# Database Rules

## Naming Conventions

| Target | Style | Example |
|--------|-------|---------|
| Table names | lowercase, snake_case, **plural** | `people`, `relationships` |
| n:n tables | `{plural}_{plural}` | `users_people`, `people_tags` |
| Columns | snake_case, no abbreviations | `birth_date` (not `birth_dt`) |
| Required columns | Every table must have | `id` (UUID), `created_at`, `updated_at` |
| Foreign keys | `{singular_table}_id` | `person_id`, `user_id` |
| Time (datetime) | `*_at` | `created_at`, `verified_at` |
| Time (date only) | `*_on` | `published_on` |
| Flags | `is_*`, `has_*` | `is_active`, `has_children` |
| Index | `idx_{table}_{column}` | `idx_people_name` |
| Unique constraint | `uk_{table}_{column}` | `uk_users_email` |
| Foreign key constraint | `fk_{source}_{target}_{column}` | `fk_relationships_people_parent` |
| Check constraint | `chk_{table}_{description}` | `chk_people_gender` |

## Prohibited

- **No ENUM types**: Use `smallint` with application-level constants
- **No uppercase**: All identifiers lowercase

## Drizzle Schema Conventions

- Place schema files in `apps/backend/database/schema/`
- Export barrel from `schema/index.ts`
- Use `$onUpdate` for `updated_at` auto-update (PostgreSQL has no ON UPDATE CURRENT_TIMESTAMP)
- Infer types with `typeof table.$inferSelect` and `typeof table.$inferInsert`

## Migration Workflow

1. Edit schema file in `database/schema/`
2. `docker compose exec apps npm run db:generate`
3. Review generated migration in `database/migrations/`
4. `docker compose exec apps npm run db:migrate`

## Reference implementation

- Schema example: `apps/backend/database/schema/people.ts`
