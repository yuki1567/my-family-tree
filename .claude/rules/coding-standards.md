---
paths:
  - "apps/**/*.{ts,vue}"
  - "scripts/**/*.ts"
---

# Coding Standards

## TypeScript Rules

- **strict mode**: Always enabled
- **`type` over `interface`**: Use `type` for all type definitions
- **No `enum`**: Use Union Types instead
- **No `any`**: Use `unknown` when type is uncertain
- **No type assertion (`as`)**: Only `as const` is allowed. Use type guards, Zod validation, or type narrowing instead
- **No non-null assertion (`!`)**: Use proper null checks
- **Explicit return types**: Always declare function return types
- **`readonly`**: Use for immutable fields
- **Utility types**: Prefer `Omit`, `Partial`, `Pick` over manual retyping

## Naming Conventions

| Target | Style | Example |
|--------|-------|---------|
| Variables, functions | camelCase | `userName`, `calculateAge` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Types, classes | PascalCase | `PersonData`, `FamilyTreeService` |
| Directories | lowercase | `components/` |

## Import Order

- Auto-sorted by Biome — no manual ordering needed

## Comment Philosophy

- Comments explain **WHY**, never **WHAT**
- No self-explanatory comments
- No Arrange/Act/Assert comments in tests
- Required only for: non-obvious intent, technical decision rationale, gotchas

