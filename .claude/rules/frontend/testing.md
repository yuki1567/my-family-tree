---
paths:
  - "apps/frontend/tests/**/*.ts"
  - "apps/frontend/**/*.test.ts"
---

# Frontend Testing Rules

## Test Ratio

- **Unit tests**: 70% — Components, composables, utils, stores
- **Integration tests**: 30% — Page-level feature flows

## Unit Test Scope

| Test | Don't test |
|------|------------|
| Vue components (props, events, computed, methods) | Pages (→ integration) |
| Composables in `composables/` | Layouts (→ integration) |
| Utility functions in `utils/` | Plugins (→ integration) |
| Pinia stores (actions, getters) | Middleware (→ integration) |

## Integration Test Scope

- Page rendering with layout
- Routing and parameter passing
- API integration flows (with mocked composables)
- Primary user interaction flows

## Test Environment

- **DOM**: happy-dom (faster than jsdom)
- **Component mounting**: `@vue/test-utils` `mount()`
- **Nuxt utilities**: `@nuxt/test-utils`
- **Mocking**: `vi.mock()` for API calls in composables

## Test File Structure

```
apps/frontend/tests/
├── unit/{components,composables,stores,utils}/
├── integration/features/
└── setup/setup.ts
```

File naming: `*.test.ts`

## Reference implementations

- Test examples: `apps/frontend/tests/`
