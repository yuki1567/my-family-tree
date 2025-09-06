# CLAUDE.md

**IMPORTANT**: Think in English, but always respond in Japanese.

## Required Response Guidelines

### Level of Explanation

- **Why is essential**: Always explain the reason and purpose concretely before performing any task
- **Technical rationale**: When making technology choices or configuration changes, provide detailed technical background
- **Impact scope**: Clearly state the impact changes will have on other components
- **Alternative approaches**: When possible, present other options and their comparisons
- **Anticipated issues**: Explain potential problems during implementation and their countermeasures in advance

### Communication Policy

- Explain background reasons even for simple tasks
- Ensure users understand "why" in your responses
- When using technical terms, add supplementary explanations as needed

# Family Tree App Development Project

## Critical Constraints & Instructions for Development

### Required Development Environment

- **Docker mandatory**: All development work must be executed within Docker containers
- **TypeScript strict mode**: strict mode required
- **Responsive support**: Mobile-first approach

### Prohibited Items (Strict Violation)

- ❌ Tailwind CSS, UI framework usage prohibited
- ❌ Local Node.js environment execution prohibited
- ❌ Direct MySQL operations prohibited (must use Prisma)
- ❌ enum usage prohibited

### Technology Stack (Immutable)

- Frontend: Nuxt.js v3 + TypeScript + vanilla CSS
- Backend: Express.js + Prisma + MySQL
- Environment: Docker + Docker Compose

## Implementation Workflow (Mandatory)

### Step-by-Step Implementation Process

All implementation work must follow these procedures:

1. **Analysis Phase**: Analyze requirements, technology choices, and impact scope in thinking
2. **Plan Development**: Formulate specific implementation plan
3. **Plan Validation**: Review plan validity and risks
4. **Document Updates**: Update related documents as necessary
5. **Incremental Implementation**: Implement in small increments rather than all at once

### Implementation Notes

- Verify and confirm at each stage
- If problems occur, go back to previous steps for review
- Use TodoWrite tool to manage progress

### **CRITICAL: Code Modification = Documentation Update (Mandatory)**

**When modifying any code, documentation update is MANDATORY and SIMULTANEOUS**:

1. **TodoWrite Tool Usage**: Always create todo items as a SET:

   ```
   - Implement [technical change]
   - Update related documentation
   ```

2. **Completion Criteria**: Code modification is NOT complete until both code AND documentation are updated

3. **Document Update Targets**:
   - Technical specifications changed → Update relevant technical design documents
   - Implementation decisions made → Record reasoning in design documents
   - Progress achieved → Update development phase section in `02_requirements.md`

4. **Process Flow**:
   ```
   Code Change → Identify Related Docs → Update Docs → Mark as Complete
   ```

**This rule prevents documentation drift and ensures project consistency.**

## **There are comprehensive documents in the `docs/` directory for project development. You must understand and develop according to these documents. Here's when to reference each document:**

### Document Reading Instructions

**IMPORTANT**: Since all documents in the `docs/` directory are written in Japanese, you MUST:

1. **Translation Process**: When reading any Japanese document, first translate the content into English internally for proper understanding
2. **Comprehension Verification**: Ensure you understand the technical requirements, constraints, and specifications after translation
3. **Implementation Alignment**: Use the translated understanding to ensure your implementation aligns with the documented requirements
4. **Context Preservation**: Maintain the original intent and technical details during translation

This translation step is crucial for accurate project execution since you think in English but the project documentation is in Japanese.

### Documentation Update Guidelines

**Documentation update rules during implementation**:

1. **Technical configuration details**: Record in relevant technology design documents
   - Frontend technical implementation → `04_frontend_design.md`
   - Backend API specifications → `03_api_design.md`
   - Database schema and structure → `02_database_design.md`
   - Infrastructure and Docker setup → `04_infrastructure/01_docker_setup.md`
   - Visual design specifications → `05_design_system.md`
   - TypeScript configuration → `06_typescript_config.md`

2. **Implementation progress**: Record in development phase section of `02_requirements.md`

3. **Design decisions/reasons**: Record "why that choice was made" in relevant technical field design documents

### Project Foundation (01_project/)

1. **[Project Overview](./docs/01_project/01_overview.md)** - Project purpose, vision, target users
2. **[Requirements Document](./docs/01_project/02_requirements.md)** - Functional requirements, non-functional requirements, development phases

### Technical Design (02_technical/)

3. **[System Architecture](./docs/02_technical/01_architecture.md)** - Layered architecture, overall system design
4. **[Database Design](./docs/02_technical/02_database_design.md)** - Schema structure, data model, migration strategy
5. **[API Design Document](./docs/02_technical/03_api_design.md)** - RESTful API specifications, endpoint definitions
6. **[Frontend Design](./docs/02_technical/04_frontend_design.md)** - Component architecture, technical implementation
7. **[Design System](./docs/02_technical/05_design_system.md)** - Visual specifications, color palette, layout rules
8. **[TypeScript Configuration](./docs/02_technical/06_typescript_config.md)** - TypeScript setup, monorepo configuration

### 👥 Development Guide (03_development/)

9. **[Development Environment Setup](./docs/03_development/01_getting_started.md)** - Environment setup, initial configuration
10. **[Coding Standards](./docs/03_development/02_coding_standards.md)** - TypeScript, Vue.js, CSS conventions, performance optimization
11. **[Testing Guide](./docs/03_development/03_testing_guide.md)** - Test strategy, implementation methods
12. **[Git Workflow Rules](./docs/03_development/04_git_workflow.md)** - Branch strategy, commit conventions

### Infrastructure & Operations (04_infrastructure/)

13. **[Docker Environment Setup](./docs/04_infrastructure/01_docker_setup.md)** - Docker configuration, setup procedures
14. **[Deployment Guide](./docs/04_infrastructure/02_deployment_guide.md)** - Production environment setup, CI/CD
15. **[Monitoring & Log Management](./docs/04_infrastructure/03_monitoring.md)** - Performance monitoring, alert settings
16. **[Security Measures](./docs/04_infrastructure/04_security.md)** - Security requirements, implementation guidelines

## 🔧 Development Start Procedures

### 1. Environment Setup

See [Docker Environment Setup](./docs/04_infrastructure/01_docker_setup.md) for details

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
