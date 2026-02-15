---
paths:
  - "apps/frontend/**/*.{vue,ts}"
---

# Frontend Conventions

## Component Architecture: Atomic Design

| Level | Directory | Purpose | Example |
|-------|-----------|---------|---------|
| Atoms | `components/atoms/` | Basic UI parts | Button, Input, LoadingSpinner |
| Molecules | `components/molecules/` | Compound components | FormField, SearchBox |
| Organisms | `components/organisms/` | Complex UI | FamilyTreeCanvas, PersonModal |

## Vue Component Rules

- Always use `<script setup lang="ts">`
- PascalCase file names: `PersonModal.vue`, `BaseButton.vue`
- Section order in `<script setup>`: imports → Props/Emits (typed with `type`) → reactive data → computed → watchers → methods
- Use `withDefaults(defineProps<Props>(), ...)` for typed props with defaults
- Use typed `defineEmits<Emits>()` — never untyped arrays
- Add `data-testid` attributes for testable elements

## Styling

- **No UI frameworks**: Tailwind CSS, Bootstrap, etc. are prohibited
- **Scoped styles**: Use `<style scoped>` for component styles
- **CSS variables**: Use variables defined in `assets/css/main.css` for colors, sizes, spacing
- **kebab-case**: CSS class names (`.person-modal`, `.form-field`)
- **Gender colors**: `--color-male`, `--color-female`, `--color-unknown`

## State Management

- **Pinia**: For global state (`stores/`), store files lowercase: `person.ts`
- **Composables**: For reusable logic (`composables/`)
- Arrow functions for all frontend code (functional style)

## Reference implementations

- CSS variables: `apps/frontend/assets/css/main.css`
- Component examples: `apps/frontend/components/`
- Nuxt config: `apps/frontend/nuxt.config.ts`
