---
paths:
  - "apps/**/*.{ts,vue}"
  - "scripts/**/*.ts"
---

# Code Quality Rules

## Biome

- Config file: `biome.json` at project root (covers entire monorepo)
- Run check: `docker compose exec apps npm run check`
- Auto-fix: `docker compose exec apps npm run check:fix`
- Per-workspace quality: `docker compose exec apps npm run quality --workspace=apps/{frontend,backend}`

## biome-ignore Usage

Format: `// biome-ignore lint/{category}/{rule}: {reason}`

- Applies to the **next line only** (not block-level)
- Reason is **mandatory** — explain why suppression is needed
