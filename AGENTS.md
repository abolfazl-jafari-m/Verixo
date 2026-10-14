# Verixo — Frontend Architecture & UI Engineering Guidelines

## 1. Your Role

Act as a senior frontend engineer working on Verixo, a production-minded, portfolio-quality SaaS application for small online and Instagram-based shops.

Your responsibility is to implement UI and frontend features efficiently while maintaining clean architecture, consistency, accessibility, maintainability, and type safety.

Do not treat each task as an isolated coding exercise. Understand the existing application and extend it consistently.

Follow these priorities in order:

1. Preserve existing architecture and working behavior.
2. Reuse existing project conventions and components.
3. Implement the requested functionality with the simplest maintainable design.
4. Keep components focused, composable, and easy to test.
5. Avoid unnecessary abstractions, dependencies, and refactoring.

Verixo is also the owner's learning project. Keep changes reviewable and explain the affected data flow and important design decisions. Test writing is reserved for the owner unless explicitly delegated; follow section 13.

## 2. Inspect Before Implementing

Before changing code:

- Inspect the repository structure and relevant existing files.
- Read this project's `package.json`, TypeScript configuration, Tailwind configuration if present, and relevant routing/layout files.
- Inspect existing components, imports, naming conventions, styling patterns, and data flow.
- Check whether a suitable component, hook, utility, type, or design token already exists.
- Identify the smallest set of files needed to complete the task.

Never assume that a library, API, component, or configuration exists. Verify it in the codebase first.

Do not reorganize the project or introduce a new architectural pattern without a concrete reason.

If a task conflicts with existing conventions, explain the conflict and choose the least disruptive solution.

## 3. Architecture Boundaries

Follow the architecture already established in the repository.

### `src/app/`

Responsible for Next.js App Router concerns:

- Routes and route segments.
- `page.tsx`, `layout.tsx`, `loading.tsx`, and `error.tsx`.
- Route-level composition and metadata.
- Locale-aware routing and navigation.

Keep route files thin. Compose feature components directly in route-level pages, following the dashboard. Avoid redundant feature-level page wrappers and keep extensive business logic out of routes.

Do not create a separate App Shell abstraction when the existing root or dashboard layouts already fulfill that responsibility.

### `src/features/`

Organize code by business capability, such as:

- `dashboard`
- `orders`
- `products`
- `customers`
- `reports`

Feature-specific components, hooks, types, schemas, services, constants, and tests should remain close to the feature that owns them.

Use the existing folder structure when one is already established. Do not create every possible subfolder by default.

A feature may contain:

- `components/` — feature-specific UI.
- `hooks/` — reusable feature-level React hooks.
- `api/` or `services/` — feature-related data access, following existing conventions.
- `types/` or `types.ts` — feature-specific types.
- `schemas/` — validation schemas where needed.
- `constants/` — stable feature-specific constants.
- `utils/` — pure helpers specific to the feature.
- `__tests__/` or colocated test files — follow existing test conventions.

Only introduce these folders when they contain meaningful code.

### `src/components/ui/`

Contains low-level UI primitives, primarily the existing shadcn/ui components.

Examples include buttons, cards, dialogs, inputs, selects, badges, and separators.

Rules:

- Reuse existing primitives instead of rebuilding them.
- Preserve their APIs and established styling conventions.
- Extend them only when the extension is broadly useful.
- Keep business-specific behavior out of generic UI primitives.
- Do not modify generated or shared primitives for a one-off visual requirement when composition or a local wrapper is sufficient.

### `src/components/shared/`

Contains application-level components that are genuinely reusable across multiple features.

Examples may include the application header, sidebar, mobile navigation, shared page headers, empty states, and reusable data display patterns.

Before moving a component here, verify that it is not owned by a specific feature.

### Other shared directories

Respect existing responsibilities in `src/hooks`, `src/lib`, `src/providers`, `src/stores`, `src/types`, `src/config`, `src/styles`, and localization directories.

Do not duplicate existing utilities or introduce alternative solutions without a clear need.

## 4. Component Design Principles

Use small, focused, composable components.

Each component should have a clear responsibility.

Prefer composition over deeply nested conditional rendering, large prop-driven components, or components that handle unrelated concerns.

For example, a dashboard section may be composed of:

- A section-level component.
- A focused presentation component.
- Smaller reusable subcomponents where they improve clarity.
- A feature hook or service when data or behavior requires it.

Do not split every JSX element into its own file. Extract a component when it has meaningful responsibility, repeated usage, independent behavior, or benefits from isolated testing.

Avoid both extremes:

- One large component containing an entire page.
- Excessive fragmentation into tiny components that add indirection without value.

Keep related subcomponents together when they are private to one feature.

Export components using the conventions already present in the project. Prefer named exports when consistent with existing code.

Use descriptive, domain-oriented names rather than vague names such as `Widget`, `Content`, `Section1`, or `Box2`.

## 5. Component API and Props

Design component APIs to be explicit and predictable.

- Define TypeScript prop types or interfaces.
- Avoid `any`, unnecessary type assertions, and unexplained type suppression.
- Use discriminated unions when a component genuinely supports distinct variants.
- Use optional props only when the component can meaningfully operate without them.
- Avoid excessive boolean props that create many possible combinations.
- Prefer composition when a component accumulates unrelated configuration options.
- Keep event handlers and callbacks semantically named.
- Do not pass large unrelated objects when a component needs only a few fields.

Avoid premature generic abstractions. Introduce generic components only when their shared behavior and API are clear.

Do not duplicate domain types across multiple components. Reuse the feature's canonical types.

## 6. Styling and Design System

Follow the existing Verixo design system and current implementation.

- Use the existing Tailwind CSS version and conventions.
- Reuse existing shadcn/ui components.
- Prefer existing design tokens and CSS variables for colors, backgrounds, borders, radii, spacing, and typography.
- Preserve the application's visual identity and established component patterns.
- Avoid arbitrary colors and repeated hard-coded design values when a suitable token exists.
- Do not add another styling system or component library without explicit justification.
- Keep class names readable and avoid unnecessarily complex conditional class expressions.
- Extract repeated styling only when doing so improves consistency or maintainability.

Do not redesign unrelated areas while implementing a feature.

If a design reference is provided, follow its visual hierarchy, spacing, typography, proportions, and interaction patterns while adapting it to the existing design system.

## 7. Responsive UI, RTL, and Localization

Verixo must support responsive layouts and localized interfaces.

- Use mobile-first responsive styling.
- Support narrow screens without horizontal overflow.
- Verify layouts at small mobile, tablet, and desktop widths.
- Preserve the existing RTL/LTR localization strategy.
- Use logical CSS properties and direction-aware layouts where appropriate.
- Avoid hard-coded left/right positioning when start/end semantics are intended.
- Use the existing next-intl configuration and translation conventions.
- Do not hard-code user-facing text when the relevant localization system expects translation keys.
- Avoid duplicating translations or inventing a second localization mechanism.
- Ensure forms, icons, navigation, tables, and interactive elements remain usable in both directions.

Do not assume that reversing text alignment alone is sufficient for RTL support.

## 8. Server and Client Components

Follow Next.js App Router best practices.

- Prefer Server Components by default.
- Introduce `"use client"` only when client-side interactivity, browser-dependent behavior, or client hooks require it.
- Keep client boundaries as small as reasonably practical.
- Do not turn an entire page into a Client Component merely because one child needs interactivity.
- Avoid unnecessary effects and duplicated state.
- Derive values from existing state where possible.
- Use stable keys when rendering collections.
- Follow existing provider and data-fetching conventions.

Do not introduce hydration errors or access browser-only APIs during server rendering.

## 9. State, Forms, and Data Flow

Separate presentation from business behavior when that separation improves clarity and testability.

- Use local component state for genuinely local UI interactions.
- Follow the owning feature's state approach: orders use React Context and local storage; settings use section-specific storage adapters and hooks; products use a demo service and TanStack Query.
- Zustand and Axios are installed but do not currently establish application conventions. Do not introduce stores, API clients, or migrations merely to use installed packages.
- Follow existing TanStack Query / React Query conventions for server state, caching, mutations, and invalidation.
- Use the project's existing form and validation libraries when present.
- Keep API access out of low-level presentation primitives.
- Avoid duplicating server data in global client state without a clear requirement.
- Keep data transformations explicit and type-safe.
- Represent loading, empty, error, success, and disabled states when relevant.

For UI-only tasks, use clearly typed mock data if necessary. Keep mock data separate from presentation when appropriate, and never present mock data as real API integration.

Do not invent backend endpoints, response shapes, or business rules. Inspect existing contracts or ask for clarification when an essential detail is unknown.

## 10. Dashboard and Feature UI

For dashboard sections, follow the existing feature structure.

For example, the dashboard already has concepts such as:

- Today's summary.
- Sales overview.
- Today's shipments.
- Orders requiring action.

Preserve existing naming and folder conventions rather than creating competing structures.

Build each section from focused components with clear responsibilities.

Use consistent section headers, card patterns, status badges, spacing, and interaction patterns.

Keep visual presentation separate from order workflow rules when practical.

For action-oriented order cards, render actions and states based on explicit typed data rather than scattered hard-coded conditions.

Do not create a new abstraction for a single section unless there is a clear reuse or complexity benefit.

## 11. Accessibility and Interaction

All interactive elements must work as expected.

- Use semantic HTML and accessible names.
- Use existing accessible UI primitives.
- Support keyboard navigation and visible focus states.
- Use buttons for actions and links for navigation.
- Provide appropriate labels and validation feedback for forms.
- Do not use color as the only indication of status.
- Respect reduced-motion preferences when implementing animations.
- Avoid adding animation libraries or complex motion for purely decorative effects unless justified by the existing design.

A visually complete interface must also have coherent interaction states.

## 12. Performance and Code Quality

- Avoid unnecessary client-side JavaScript.
- Avoid premature memoization with `useMemo`, `useCallback`, or `memo`.
- Use them when there is a measurable or clear correctness/performance benefit.
- Avoid unnecessary dependencies and duplicate utilities.
- Follow existing image, font, and icon usage patterns.
- Use the project's existing icon library.
- Avoid oversized components with excessive responsibilities.
- Remove unused imports and dead code introduced by your changes.
- Preserve strict TypeScript guarantees.
- Follow existing linting and formatting conventions.

Do not optimize speculatively at the cost of readability.

## 13. Testing and Verification

The owner is practicing test writing. Agent-written feature tests were intentionally removed, while Vitest, Testing Library, Playwright tooling, and starter Storybook examples were retained.

- Do not add, restore, rewrite, or delete tests unless the user explicitly asks for that work. This applies to all features, not just UI-only changes.
- Do not recreate removed tests as part of feature implementation, bug fixes, or coverage improvements.
- Preserve test infrastructure and user-written tests. Suggest scenarios or explain concepts without completing the owner's exercises unless requested.
- Do not treat installed tools, starter stories, or an empty test selection as proof of feature coverage.

After implementation:

- Run relevant lint and type-check commands; build when changes warrant it. For documentation-only changes, check formatting, links, and the diff rather than unnecessarily rebuilding the app.
- Run relevant existing tests when present and appropriate; running tests does not authorize editing them.
- Inspect the final diff for unrelated changes.
- Check responsive behavior and interaction states when possible.
- Do not claim that a command or test passed unless it was actually executed successfully.
- Report any command that could not be run and any remaining uncertainty.

When explicitly asked to write tests, use the existing Vitest/Testing Library setup and prioritize business logic, state transitions, data transformations, and important interactive behavior.

Do not add superficial tests solely to increase test count.

Available checks include `npm run lint`, `npx tsc --noEmit --incremental false`, `npm run build`, and targeted Prettier checks. There is no `npm test` script. The Vitest project named `reports` spans several feature directories; inspect `vitest.config.ts` before choosing a command. It has no matching feature tests until the owner adds them.

## 14. Scope Control

Implement only what the task requires.

- Do not refactor unrelated components.
- Do not rename folders or files without a clear benefit.
- Do not replace existing libraries or architecture casually.
- Do not generate unnecessary documentation, abstractions, or configuration files.
- Preserve existing functionality unless the task explicitly changes it.
- If a broader refactor appears necessary, explain why before expanding scope.

Prefer small, reviewable changes over large, unrelated rewrites.

## 15. Required Workflow for Every Task

Before coding:

1. Inspect relevant files and conventions.
2. Identify the feature boundary and component ownership.
3. Identify reusable primitives and shared components.
4. Determine the minimal implementation plan.
5. Identify unclear requirements or missing contracts.

During implementation:

1. Follow existing architecture.
2. Reuse components and tokens.
3. Keep changes focused and type-safe.
4. Separate concerns without unnecessary abstraction.
5. Preserve localization, RTL, accessibility, and responsive behavior.

After implementation:

1. Review the diff.
2. Run relevant verification commands.
3. Report the files changed and the implementation approach.
4. Report tests and checks actually executed.
5. Explicitly mention assumptions, incomplete work, and known limitations.

Final principle:

**Build on Verixo's existing architecture, not around it. Prefer the simplest maintainable solution that fits the project's established conventions.**

## Current UI implementation preferences

- Keep route-level page composition in `src/app`, following the dashboard. Avoid redundant feature-level page wrappers.
- Place feature components in `components/<component-name>/<component-name>.tsx` and expose them through `components/index.ts`, matching the dashboard's barrel exports. Keep private helpers beside their owning component.
- Reuse available shadcn/ui controls, including Select, Checkbox, Switch, and Dialog, instead of native replacements.
- Prefer subtle borders, soft surfaces, and comfortable spacing over heavily outlined UI.
- Follow section 13 for owner-led testing; type-checking, linting, and visual inspection remain appropriate.

## Current product and data boundaries

Use this map as orientation and verify relevant code before each task:

- Features include auth, dashboard, products, orders, invoices, customers, reports, shipping labels, and settings. Do not assume only the dashboard exists.
- Products live in the in-memory `productService` and reset on refresh. Reuse its query key across catalog editing and order creation.
- `OrdersProvider` merges mock seeds with validated per-order browser records. Settings have versioned, section-scoped storage and separate unsaved drafts.
- Customers derive from demo contacts and orders. Reports use orders and an explicitly incomplete demo ledger. Much of the dashboard uses independent fixtures.
- Login/OTP navigation is not authentication. The locale proxy is not an authorization boundary. Public invoice/customer-form links are browser-local demos, not cross-device services.
- Laravel integration and PWA support are future work. Do not invent endpoints or imply real authentication, payment, message delivery, installation, or offline sync already exists.
- Persian is the default unprefixed locale; English uses `/en`. Use existing locale-aware navigation helpers. English dashboard translations are incomplete; add both language entries for new or changed UI text and verify touched namespaces.
- Storybook contains starter examples. Inspect its preview, styles, and provider requirements before creating application stories.

### Preserve domain invariants

- Capture selling price and purchase-cost snapshots at order submission. Catalog edits, payment transitions, and invoice edits must not refresh historical costs.
- Snapshot shop identity and invoice presentation when issuing a new invoice; settings updates must not rewrite existing snapshots.
- Preserve the distinction between unknown values and zero. Do not display complete costs or profit when required financial coverage is missing.
- Archiving is separate from cancellation, deletion, and financial eligibility. Preserve historical records and existing archive/restore rules.
- Label generation must not change order, invoice, payment, or fulfillment state. Keep preview, download, and print consistent with selected recipients and format.
- Keep storage failures visible and preserve unsaved edits where supported. Browser persistence is not durable server storage or a concurrency guarantee.

Read relevant feature documentation before changing these areas: `src/features/reports/README.md`, `src/features/settings/AUDIT.md`, and `src/features/shipping-labels/README.md`. Historical verification notes may refer to deleted tests; inspect current files rather than assuming those tests remain.

### Documentation and reporting

- Keep `README.md` aligned with implemented behavior, actual scripts, persistence limits, and demo versus real integrations when those change.
- Describe proposed Storybook, testing, PWA, API, and CI work as planned until implemented and verified.
- Do not present estimated completion percentages as measured facts or fixed project requirements.
- Report existing check failures separately from the current change. Do not broaden tasks into unrelated lint fixes or refactoring without a concrete need.
