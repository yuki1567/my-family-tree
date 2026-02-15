---
paths:
  - "apps/backend/tests/**/*.ts"
---

# Backend Testing Rules

## Test Ratio

- **Integration tests**: 60% — API endpoint full-stack verification
- **Unit tests**: 40% — Service logic, Zod validations, utility functions

## Unit Test Scope

| Test | Don't test |
|------|------------|
| Service layer (mock repositories with `vi.fn()`) | Config (no logic) |
| Zod validations — all rules, boundary values, edge cases | Routes (HTTP layer → integration) |
| Utility functions in `utils/` | Repository (Drizzle mock doesn't verify real DB) |

## Integration Test Scope

| Test | Don't test |
|------|------------|
| API request/response flow (Route → Service → Repository → DB) | All validation patterns (→ unit tests) |
| Representative error patterns (one per error type) | Edge cases and boundary values (→ unit tests) |
| Data persistence (verify DB state after API call) | |

## Integration Test Rules

- **Serial execution**: Must run with `singleThread: true` (data race prevention)
- **Cleanup**: Delete test data in `beforeEach`
- **Use Hono built-in**: `app.request()` method, not supertest
- **DB verification**: Look up by created ID, not full-table search

## Test File Structure

```
apps/backend/tests/
├── unit/{services,validations,utils}/
├── integration/api/
└── setup/globalSetup.ts
```

File naming: `*.test.ts`

## Reference implementations

- Integration test: `apps/backend/tests/integration/`
- Unit test: `apps/backend/tests/unit/`
- Global setup: `apps/backend/tests/setup/globalSetup.ts`
