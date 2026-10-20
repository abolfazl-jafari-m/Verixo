# Verixo

Verixo is a mobile-first order-management application for small online and Instagram-based shops. It is a learning and portfolio project with an interactive frontend MVP, browser-local demo data, and a planned Laravel API integration. PWA support is planned, not implemented.

## Product focus

The primary workflow is to move an order through invoice, payment, customer-information, fulfillment, and shipment stages. The interface should always make the next blocking action clear.

| Area               | Current frontend behavior                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Application layout | Sidebar, mobile navigation, theme switching, Persian RTL and English LTR routing                                 |
| Dashboard          | Sales charts, KPI cards, daily summaries, shipments, and orders requiring action; much of the data is static     |
| Products           | Create/edit simple and variable products, attributes, variants, price/cost/stock fields, filters, and pagination |
| Inventory          | Per-item stock, reservations, alerts, adjustments, and paid-order inventory exceptions                           |
| Orders             | Creation from the catalog, Kanban board, status transitions, customer-information form, and archive/restore      |
| Invoices           | Lists, editing before payment, historical shop snapshots, public-token demo pages, and browser printing          |
| Customers          | Search, filters, details, and order history derived from demo contacts and orders                                |
| Reports            | Date ranges, comparisons, financial/order/product summaries, charts, CSV/XLSX exports, and print-to-PDF          |
| Shipping labels    | Recipient validation, bulk selection, preview, and local PDF generation for A6 and 4×6 labels                    |
| Settings           | Shop identity, invoice presentation, shipping defaults, report preferences, appearance, and language             |
| Authentication UI  | Phone and OTP forms with validation and navigation; no real authentication or session                            |

## Stack

- Next.js App Router, React, and strict TypeScript. The current Next.js dependency is a canary release; exact versions are in `package.json`.
- Tailwind CSS v4, shadcn/ui, Base UI, and Lucide icons.
- next-intl for locales and next-themes for themes.
- TanStack Query for the demo product catalog; React Context and storage adapters for orders/settings.
- React Hook Form and Zod for forms and validation.
- dnd-kit, TanStack Table, and Recharts for interactive data displays.
- ExcelJS for XLSX and jsPDF with an embedded Persian font for shipping labels.
- Storybook, Vitest, Testing Library, and Playwright tooling are installed; this does not imply complete feature coverage or an E2E setup.

Axios and Zustand are installed but are not currently used by the application source. Do not assume there is an API client or Zustand store to extend.

## Project structure

```text
src/
  app/             Routes, layouts, and route composition
  components/      Shared layout and low-level UI components
  features/        Auth, dashboard, products, orders, invoices, customers,
                   inventory, reports, shipping labels, and settings
  lib/             Shared infrastructure and utilities
  providers/       Theme, query, and internationalization providers
  locales/         Translation messages
  styles/          Design tokens and themes
  stories/         Starter Storybook examples
```

## Getting started

```bash
npm ci
npm run dev
```

Use Node.js and npm compatible with the versions in `package.json` and the lockfile. Open `http://localhost:3000/dashboard`. Persian is the default locale and uses unprefixed URLs. English uses `/en`, for example `/en/orders`. Locale detection is disabled; the URL controls the language.

On-screen tables share shadcn/ui and TanStack Table filtering and pagination. Existing feature filters remain available; invoice printing includes every line regardless of the on-screen page or search. Report exports retain their full selected report scope.

The dashboard action list derives invoice, customer-information, packing, and dispatch actions from active orders. Its send-invoice action marks the invoice sent in the browser-local demo; no message is delivered. Product forms accept image URLs and local PNG/JPEG/WebP files (up to 2 MB and 4096 × 4096 pixels per image); local images remain in the browser-local catalog and are not uploaded to a server. The header avatar uses the saved shop logo with shop-name initials as a fallback.

No backend credentials are required for the demo. Products, inventory, orders and saved business settings persist only in this browser and origin.

## Available commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npx tsc --noEmit --incremental false
npm run format:check
npm run storybook
npm run build-storybook
```

`npm run start` requires a production build. Storybook runs on port 6006. `npm run format` rewrites formatting across the repository; prefer targeted formatting for small changes.

There is no `npm test` script. The retained Vitest project named `reports` covers several feature directories. Cancellation business-logic tests are included by explicit request. Run `npx vitest run --project reports`. Starter stories use `npx vitest run --project storybook`, which requires its browser runtime.

## Data ownership and demo boundaries

| Data      | Source and lifetime                                                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Products  | `features/products/services/product-service.ts`: browser-local inventory repository shared through the product query key; persists products and reservation receipts |
| Orders    | `OrdersProvider`: mock seeds merged with validated per-order `localStorage` records                                                                                  |
| Settings  | `features/settings/storage.ts`: versioned, section-specific browser records; unsaved drafts are separate                                                             |
| Customers | Demo contacts plus customer information grouped from orders; no backend customer identity                                                                            |
| Reports   | Pure calculations over orders and the demo ledger, with explicit completeness flags                                                                                  |
| Dashboard | Largely independent fixtures rather than live summaries of the order workflow                                                                                        |

- Order lines snapshot selling price and purchase cost on submission. Later catalog edits must not change historical costs.
- Invoice branding/contact settings are snapshotted on creation; changes apply to future invoices.
- Unknown costs and incomplete expenses are different from zero; incomplete data must not be presented as authoritative profit.
- Archiving is separate from cancellation or deletion and must preserve financial history.
- Public invoice/customer-form tokens are local demo identifiers. New links cannot retrieve this browser's records on another device.
- Marking an invoice as sent or an order as paid is a simulation, not proof of delivery or a verified payment.

## Inventory behavior and persistence

The existing product/variant `stock` field is physical stock. Missing inventory fields default to tracking enabled, zero reserved and a threshold of five. Available stock is physical minus reserved. Untracked items do not block sales or generate alerts; active variants contribute independently to summaries. Inventory cost value is intentionally omitted where cost coverage is unknown.

Payment confirmation (including creation as paid) reserves all required tracked items together. Duplicate lines are aggregated. Insufficient or missing stock preserves payment, creates an inventory exception and blocks fulfillment; sellers can adjust stock and retry. Delivery commits physical deductions exactly once. Historical delivered orders without inventory metadata are not deducted retroactively. Paid unfinished demo orders are checked on initialization. Existing order snapshots and timestamps remain unchanged.

`features/inventory/domain.ts` owns calculations, reservation, completion, release and adjustment rules. `repository.ts` publishes products and per-order receipts in one versioned localStorage snapshot. Order records remain in their existing per-order store. Receipts recover inventory metadata/payment and missing orders if the later order write fails. Storage failures remain visible; unsaved stock edits stay in the dialog. Active reservations prevent removal, disabling or untracking of affected variants. Archive/restore does not mutate inventory. Cancellation is available before carrier handoff (pending payment, paid, or packaged). A reason and timestamp are recorded; payment, invoice, customer and price/cost snapshots stay intact. Cancelled orders have a dedicated `/orders/cancelled` history page with search, payment/reason filters, pagination, desktop tables and mobile cards and cannot re-enter fulfillment or be archived. The cancellation receipt and reservation release are saved in one inventory snapshot; retries are idempotent and the receipt recovers a failed secondary order write. Missing or inconsistent active reservations block cancellation. Committed inventory cannot be cancelled or automatically restocked; returns/refunds remain future work. Reports exclude cancelled sales and costs while preserving dated cash receipts.

These are frontend demo protections, not durable storage or cross-tab/client concurrency guarantees. Large image data can exhaust browser storage. The authoritative Laravel implementation must combine stock checks, reservations, completion/release and event deduplication in database transactions. No backend, movement ledger, warehouse, payment verification or synchronization is implemented.

## Development principles

- Keep domain logic inside its owning feature, not route components.
- Use consistent mock data and valid order-state transitions before introducing an API.
- Prefer server components; add client components only for browser APIs or interaction.
- Keep Persian/English content in translation resources and verify both RTL and LTR layouts.
- Build accessible, responsive interfaces that work from 360px wide screens upward.
- Keep route-level page composition in `src/app`; avoid redundant feature-level page wrappers.
- Follow `components/<component-name>/<component-name>.tsx` and existing barrel exports. Keep private helpers beside their owner.
- Test writing is reserved for the owner unless explicitly delegated. See [AGENTS.md](AGENTS.md).

## Testing and learning

Agent-written feature tests were intentionally removed so the owner can practice test writing. Test dependencies/configuration and starter Storybook examples remain. Agents must not add, restore, rewrite, or delete tests unless explicitly asked. Scenarios and explanations may be suggested without implementing the exercises.

Suggested learning sequence:

1. Trace order creation through types, schemas, the form, provider, and storage adapter.
2. Write your own tests for totals, normalization, transitions, archiving, and report calculations.
3. Practice component behavior tests, then a complete order workflow in E2E tests.
4. Add stories for Verixo components, including RTL/LTR, themes, empty, error, and disabled states.
5. Connect the dashboard to shared order data, then introduce API behavior with an explicit backend contract.
6. Add PWA installation/offline behavior and CI as separate, scoped improvements.

## Current limitations

- No Laravel API, durable server storage, real OTP/session handling, route authorization, payment gateway, or cross-device public-link service.
- Catalog stock fields are not a complete inventory transaction/reservation system. Product images use URLs rather than a durable upload service.
- Dashboard fixtures and some actions still need connection to the order workflow.
- English dashboard translations are incomplete, and some values are hard-coded in Persian.
- Reports depend on incomplete demo receipt, expense, adjustment, and cancellation data; coverage warnings are intentional.
- Storybook contains starter examples. Application stories and provider/style integration remain to be added.
- A web app manifest, service worker, and offline/synchronization strategy are not implemented.
- Browser interactions, responsive layouts, accessibility, and physical label printing need further verification.

In the 2026-10-13 review, TypeScript and the Next.js production build passed. ESLint reported one error in `components/ui/carousel.tsx` and four warnings. This is a dated observation, not a guarantee about future changes; rerun relevant checks before reporting success.

## Feature documentation

- [Report data contract and financial semantics](src/features/reports/README.md)
- [Settings ownership, persistence, and integration audit](src/features/settings/AUDIT.md)
- [Shipping label generation and printing](src/features/shipping-labels/README.md)

Some historical verification notes in these documents refer to tests subsequently removed for the owner's learning exercises.
