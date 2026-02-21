# CLAUDE.md

**IMPORTANT**: Think in English, but always respond in Japanese.

## Core Language & Communication Rules

### Response Language Enforcement

- **All responses**: Japanese (mandatory)
- **Commit messages**: Japanese (mandatory)
- **Technical explanations**: Include "why" and reasoning in Japanese
- **EXCEPTION**: CLAUDE.md file content remains in English

### Communication Requirements

- Always explain the reason and purpose before performing tasks
- Provide technical rationale for technology choices
- Present alternative approaches when possible

# Family Tree App Development Project

## Development Constraints (Critical)

### Technology Stack (Immutable)

- **Frontend**: Nuxt.js v3 + TypeScript + vanilla CSS
- **Backend**: Hono + Drizzle ORM + PostgreSQL
- **Shared**: `apps/shared/` - Shared types and API schemas (Zod)
- **Environment**: Docker + Docker Compose (for development commands)
- **TypeScript**: Strict mode required
- **Validation**: Zod (shared between frontend and backend)

### Source of Truth

Claude must read actual source files for implementation patterns, NOT code examples in docs.

- **Configuration** (always read directly): `package.json`, `tsconfig.json`, `biome.json`, `docker-compose.yml`, `ecosystem.config.cjs`
- **Code patterns** (read source): `apps/backend/{routes,services,repositories}/`, `apps/backend/database/schema/`, `apps/shared/`, `apps/frontend/components/`, `apps/*/tests/`
- **Design rationale** (WHY only): `docs/` - written in Japanese, translate internally for understanding
- **External library docs**: Use context7 MCP (`mcp__context7__resolve-library-id` → `mcp__context7__query-docs`) BEFORE relying on internal knowledge when researching APIs, options, or version-specific behavior of npm packages (Nuxt.js, Hono, Drizzle ORM, Zod, Vue.js, etc.)

### Priority Order for Implementation

1. **Error Resolution Protocol** (highest priority) - See `docs/03_development/05_error_resolution.md`
   - Root cause analysis REQUIRED before any fixes
   - Temporary workarounds PROHIBITED until exhaustive analysis complete
2. Source code patterns from actual implementation files
3. Design rationale from `docs/02_technical/`

### Prohibited Technologies

- ❌ Local Node.js execution (Docker only)
- ❌ Direct PostgreSQL operations (use Drizzle ORM)

### Command Execution Rules

- **Development commands** (npm, drizzle-kit, etc.): `docker compose exec apps [command]`

## Development Workflow (Mandatory)

### Implementation Process

1. **Analysis**: Understand requirements and technical impact
2. **Planning**: Create specific implementation plan using TodoWrite
3. **Explanation**: Explain what code will be written and why BEFORE coding
4. **Implementation**: Code in small increments with verification

### Critical Rules

- **Design Decision Docs**: Only update docs when design rationale (WHY) changes, not for code-only changes
- **Rules Update**: When coding conventions change, update corresponding `.claude/rules/` files
- **TodoWrite Usage**: Create task items as needed (doc/rules updates only when conventions or design decisions change)

## Important Reminders

- ALWAYS prefer editing existing files; NEVER create new files unless absolutely necessary
- NEVER proactively create documentation files unless explicitly requested
