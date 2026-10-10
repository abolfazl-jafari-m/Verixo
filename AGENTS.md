# Verixo repository guide

## Scope

These instructions apply to the entire repository.

## Product and architecture

- Verixo is a mobile-first order-management dashboard for small online stores.
- Keep routes and page composition in `src/app`.
- Keep domain-specific components, types, mock data, schemas, hooks, and business rules in `src/features/<feature>`.
- Keep reusable primitives in `src/components/ui` and shared application layout in `src/components/shared`.
- Do not move files merely to match an idealized architecture; prefer focused, incremental changes.

## Engineering conventions

- TypeScript strict mode is enabled. Avoid `any`.
- Prefer server components by default. Add `"use client"` only when interactivity, React hooks, or browser APIs require it.
- Use the `@/` alias for imports from `src`.
- Use `cn` from `@/lib/utils` for conditional class names.
- Reuse existing UI primitives and theme tokens. Do not introduce arbitrary colors when a token exists.
- Avoid hardcoded business data in presentational components. Use typed, feature-owned mock data until an API is available.
- Model order-state transitions explicitly; an action must only be available for valid states.

## Internationalization and accessibility

- Support both Persian (RTL) and English (LTR) using `next-intl`.
- Put user-visible strings in locale messages rather than hardcoding them in components.
- Use logical Tailwind properties (`ms`, `me`, `ps`, `pe`, `start`, `end`) where direction matters.
- Preserve semantic HTML, accessible labels, keyboard interaction, and visible focus states.

## Validation

- Run the narrowest relevant lint, type, test, or Storybook check after a change when practical.
- Do not change unrelated files or overwrite existing local work.
- Do not add dependencies without a clear, documented need.
