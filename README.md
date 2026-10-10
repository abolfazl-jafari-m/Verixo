# Verixo

Verixo is a mobile-first, PWA-oriented order-management dashboard for small online and Instagram-based stores. It is being built as a realistic frontend MVP with structured mock data first, ready for a future Laravel API integration.

## Product focus

The primary workflow is to move an order through invoice, payment, customer-information, fulfillment, and shipment stages. The interface should always make the next blocking action clear.

Current work focuses on the application shell and dashboard. The dashboard currently includes:

- Monthly sales overview
- Daily order, payment, and shipment summary
- Today's shipment cards
- Orders requiring action

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS, shadcn/ui, and Base UI
- next-intl for Persian (RTL) and English (LTR)
- TanStack Query, Zustand, Axios, React Hook Form, and Zod
- Storybook, Vitest, and Testing Library

## Project structure

```text
src/
  app/             Routes, layouts, and route composition
  components/      Shared layout and low-level UI components
  features/        Feature-owned UI, types, constants, and business logic
  lib/             Shared infrastructure and utilities
  providers/       Theme, query, and internationalization providers
  locales/         Translation messages
```

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The default locale is Persian, and the dashboard is available at `/dashboard`.

## Available commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format:check
npm run storybook
npm run build-storybook
```

## Development principles

- Keep domain logic inside its owning feature, not route components.
- Use consistent mock data and valid order-state transitions before introducing an API.
- Prefer server components; add client components only for browser APIs or interaction.
- Keep Persian/English content in translation resources and verify both RTL and LTR layouts.
- Build accessible, responsive interfaces that work from 360px wide screens upward.
- Add tests for important order-workflow rules and user interactions.

## Current limitations

This is an in-progress frontend MVP. The order workflow, backend integration, full translation catalog, and feature pages beyond the dashboard are not complete.
