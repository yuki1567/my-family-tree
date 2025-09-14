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
- **Backend**: Express.js + Prisma + MySQL
- **Environment**: Docker + Docker Compose (mandatory for ALL commands)
- **TypeScript**: Strict mode required

### Priority Order for Implementation
1. **Coding Standards** (highest priority) - See `docs/03_development/02_coding_standards.md`
2. Implementation examples from documentation
3. Reference document patterns

### Prohibited Technologies
- ❌ Tailwind CSS, UI frameworks
- ❌ Local Node.js execution (Docker only)
- ❌ Direct MySQL operations (use Prisma)
- ❌ enum usage

### Command Execution Rules
- **ALL commands** must use: `docker-compose exec apps [command]`
- **Tests**: Ensure test-db container is running first
- **process-issue command**: Follow `.claude/commands/process-issue.md` exactly
- **Error Resolution**: Follow 3-stage analysis protocol - See `docs/03_development/05_error_resolution.md`
- **Code Quality**: ESLint/Prettier configuration - See `docs/03_development/05_eslint_prettier_config.md`
- **Issue Management**: Follow structured workflow - See `docs/03_development/06_issue_management.md`

*Detailed execution procedures: [Docker Setup](./docs/04_infrastructure/01_docker_setup.md) | [Testing Guide](./docs/03_development/03_testing_guide.md)*

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

*Detailed workflow: [Development Guide](./docs/03_development/) | [Git Workflow](./docs/03_development/04_git_workflow.md)*

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

*Start here: [Getting Started](./docs/03_development/01_getting_started.md) | [Docker Setup](./docs/04_infrastructure/01_docker_setup.md)*

## Important Reminders

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files over creating new ones
- NEVER proactively create documentation files unless explicitly requested
