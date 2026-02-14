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

### Architecture (Backend: apps/backend/)

- **Routes** (`routes/`) → **Services** (`services/`) → **Repositories** (`repositories/`)
- **Database**: `database/schema/` (Drizzle schema), `database/client.ts` (connection)
- **Middlewares**: `middlewares/` (error handling, validation)
- **Config**: `config/env.ts` (environment variables)

### Code Comment Guidelines

- **Comment Philosophy**: Comments must explain "WHY", never "WHAT"
- **Prohibited Comments**:
  - ❌ Self-explanatory comments that describe what code does
  - ❌ Comments redundant with code reading (e.g., "// Increment counter")
  - ❌ Paraphrasing code in natural language
- **Required Comments Only When**:
  - Implementation intent is non-obvious from reading the code
  - Explaining reasoning behind non-obvious technical decisions
  - Documenting why specific approach was chosen over alternatives
  - Warning about gotchas or non-intuitive behavior
- **Examples**:
  - ✅ Good: `// Use setTimeout to prevent race condition with DOM rendering lifecycle`
  - ✅ Good: `// Bypass cache here because upstream API returns stale data for 30s`
  - ❌ Bad: `// Loop through users array`
  - ❌ Bad: `// Set loading to true`

### Priority Order for Implementation

1. **Error Resolution Protocol** (highest priority) - MANDATORY root cause analysis - See `docs/03_development/05_error_resolution.md`
2. **Coding Standards** - See `docs/03_development/02_coding_standards.md`
3. Implementation examples from documentation
4. Reference document patterns

### Prohibited Technologies

- ❌ Tailwind CSS, UI frameworks
- ❌ Local Node.js execution (Docker only)
- ❌ Direct PostgreSQL operations (use Drizzle ORM)
- ❌ enum usage

### Command Execution Rules

- **Development commands** (npm, drizzle-kit, etc.): `docker compose exec apps [command]`
- **Infrastructure commands** (.claude/commands/\*.md): Execute on host environment
- **Tests**: Ensure test-db container is running first
- **Command files execution (CRITICAL)**:
  - `.claude/commands/` directory contains executable command files in markdown format
  - When user runs `/command-name`, read and execute `.claude/commands/command-name.md`
  - Execute bash command blocks (`bash...`) exactly as written in sequential order
  - DO NOT look for `.sh` files - `.claude/commands/` files are always `.md` format
  - DO NOT interpret, modify, substitute, or add commands
  - The markdown files contain executable instructions, not reference documentation
- **Error Resolution (MANDATORY)**: Follow 3-stage analysis protocol - See `docs/03_development/05_error_resolution.md`
  - Root cause analysis REQUIRED before any fixes
  - Temporary workarounds PROHIBITED until exhaustive analysis complete
  - Permanent solutions always prioritized over patches
- **Code Quality**: Biome configuration - See `docs/03_development/05_biome_config.md`
- **Issue Management**: Follow structured workflow - See `docs/03_development/06_issue_management.md`

_Detailed execution procedures: [Docker Setup](./docs/04_infrastructure/01_docker_setup.md) | [Testing Guide](./docs/03_development/03_testing_guide.md)_

## Development Workflow (Mandatory)

### Implementation Process

1. **Analysis**: Understand requirements and technical impact
2. **Planning**: Create specific implementation plan using TodoWrite
3. **Explanation**: Explain what code will be written and why BEFORE coding
4. **Implementation**: Code in small increments with verification
5. **Documentation**: Update relevant docs simultaneously with code changes

### Critical Rules

- **Code + Docs Together**: All code changes require simultaneous documentation updates
- **Explain Before Code**: Show concrete examples of what you plan to implement
- **TodoWrite Usage**: Create paired todo items: `[Implement X, Update docs for X]`
- **Error TodoWrite**: Always create analysis-first pairs: `[Analyze root cause of X, Fix X permanently]`

_Detailed workflow: [Development Guide](./docs/03_development/) | [Git Workflow](./docs/03_development/04_git_workflow.md)_

## Documentation Reference

### Documentation Structure

**All development must follow documents in `docs/` directory (written in Japanese - translate internally for understanding)**

- **Project Foundation**: `docs/01_project/` - Overview, requirements
- **Technical Design**: `docs/02_technical/` - Architecture, database, API, frontend, design system, TypeScript config, package.json design
- **Development Guide**: `docs/03_development/` - Setup, coding standards, testing, git workflow, error resolution, code quality, issue management
- **Infrastructure**: `docs/04_infrastructure/` - Docker, deployment, monitoring, PM2 configuration, security

### Documentation Update Rules

- **Technical changes** → Update corresponding technical design documents
- **Implementation decisions** → Record reasoning in relevant design documents
- **Progress tracking** → Update requirements document

_Start here: [Getting Started](./docs/03_development/01_getting_started.md) | [Docker Setup](./docs/04_infrastructure/01_docker_setup.md)_

## Important Reminders

- **Root Cause Priority**: Always identify and fix root causes - temporary fixes only as last resort after thorough analysis
- **Complete Resolution Required**: Do what has been asked AND ensure permanent, stable solutions
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files over creating new ones
- NEVER proactively create documentation files unless explicitly requested
