# AGENTS.md — Principal Programmer & Repository Operating Entry Point

This file is the primary engineering constitution for this repository. Every agent and contributor must follow it together with the five companion workflow documents:

- `TASK_SPEC.md` — Mandatory specification standard (specs saved under `tasks/specs/`)
- `SMALL_TASKS.md` — Task decomposition and dependency/parallelism rules
- `TASK_EXECUTOR.md` — Step-by-step implementation and verification workflow
- `PR_REVIEW.md` — Independent 16-point quality and security review standard
- `PR_MERGE.md` — Release gates, merge prohibitions, and authorization rules

No phase of the mandatory lifecycle may be silently skipped:

`REQUEST -> REPOSITORY INVESTIGATION -> TASK SPECIFICATION -> TASK APPROVAL -> SMALL TASK BREAKDOWN -> IMPLEMENTATION -> TESTING -> INDEPENDENT PR REVIEW -> ISSUE RESOLUTION -> FINAL APPROVAL -> AUTHORIZED MERGE -> POST-MERGE VERIFICATION`

---

## 1. Product Mission & Repository Architecture

- **Product Mission:** **Dalka Jobs** — a unified three-phase platform (Phase 1: Public Website; Phase 2: Admin Panel; Phase 3: Mobile App) sharing one Firebase database for jobs, institutional tenders, digital/book marketplace, blogs, and visitor lead capture.
- **Current Architecture (Verified):**
  - Single-page React 19 client entry: `index.html` -> `src/main.tsx` (with Workbox `registerSW`) -> `src/App.tsx` (React Router across `/`, `/jobs`, `/tenders`, `/marketplace`, `/blogs`, `/contacts`, `/about`, and `/admin/*`).
  - Phase 2 Admin Panel: `/admin/*` (`src/pages/AdminPage.tsx`, `src/admin/*`) gated by Google Sign-In (`akrooble@gmail.com`) for CRUD over jobs, tenders, marketplace items, blogs, site settings, and visitor leads.
  - Phase 3 Mobile App (PWA): `vite-plugin-pwa` in `vite.config.ts` generating `manifest.webmanifest` + `sw.js`, `public/{pwa-192x192.png,pwa-512x512.png,pwa-maskable-512x512.png,apple-touch-icon.png,icon.svg}`, Firestore `persistentLocalCache` offline caching, `MobileBottomNav`, `PWAInstallButton`, `OfflineIndicator`, and mobile slide-up detail sheets on `/jobs` and `/tenders`.
  - Styling entry: `src/index.css` using Tailwind CSS v4 (`@import "tailwindcss";`) and Stitch light-mode tokens (`#4648D4` / `#6366F1` primary indigo, `#F8F9FF` canvas, `#0B1C30` ink).
  - Backend / Database / Auth: **Firebase Firestore + Firebase Auth** initialized in `src/lib/firebase.ts` from `firebase-applet-config.json`, schema in `firebase-blueprint.json`, security rules in `firestore.rules` (admin bootstrapped to verified `akrooble@gmail.com`).
  - Static assets: `public/assets/aistudio/` (logos) and `src/assets/images/` (generated visuals copied to `dist/src/assets` on build).

## 2. Technology Stack (From `package.json`, `tsconfig.json`, `vite.config.ts`)

- **Runtime / Language:** TypeScript `^7.0.2` (`noEmit: true`, `moduleResolution: "bundler"`, `target: "ES2022"`, `jsx: "react-jsx"`), Node types `^22.14.0`, `tsx` `^4.21.0`.
- **Frontend:** React `^19.0.1`, React DOM `^19.0.1`, Vite `^8.3.0`, `@vitejs/plugin-react` `^6.1.1`.
- **Styling & UI:** Tailwind CSS `^4.3.3` (`@tailwindcss/vite` `^4.3.3`, `autoprefixer` `^10.4.21`), `lucide-react` `^0.546.0`, `motion` `^12.23.24`.
- **Server / AI SDK (installed, unused):** `express` `^4.21.2`, `dotenv` `^17.2.3`, `@google/genai` `^2.4.0`.
- **Package Lockfile:** `bun.lock` is present alongside `package.json`.

## 3. Engineering Standards

- Prioritize correctness, security, and data integrity over coding speed.
- Understand the existing files before modifying anything; never assume schemas, endpoints, or commands without evidence.
- Prefer small, reversible, independently verifiable changes over sweeping rewrites.
- Reuse existing modules and installed packages before introducing new dependencies.
- **Never** modify unrelated files, overwrite existing user work, or perform unrequested refactoring.

## 4. Repository Exploration Rules

- Inspect targeted files (`package.json`, `tsconfig.json`, `vite.config.ts`, `metadata.json`, `index.html`, `src/`) and use scoped searches rather than reading the entire tree repeatedly.
- Cache findings in specifications (`tasks/specs/`) so subsequent tasks do not repeat full discovery.
- Distinguish verified facts from assumptions in all reports.

## 5. Database & API Conventions

- **Current State:** No database, ORM, migration tool, or API server exists in the repository.
- **Backend Boundary:** When server endpoints or Gemini API calls are needed, create a root `server.ts` using Express with `vite.middlewares` mounted in development (`"dev": "tsx server.ts"`) listening on port `3000` (`0.0.0.0`), and expose routes under `/api/*`. Never mount Express inside `vite.config.ts`.
- **Database Changes:** Never silently alter database schemas or contracts once a database is introduced. All schema changes require explicit migration notes in the task spec and migration safety review in `PR_MERGE.md`.

## 6. Security & Tenant Isolation Requirements

- **Secrets:** Never expose `GEMINI_API_KEY` or server credentials in client code or `VITE_*` variables. `.env*` files are gitignored (except `.env.example`); keep secrets server-side only.
- **Input & Output Safety:** Validate and sanitize all external inputs on `/api/*` boundaries. Use safe React bindings rather than raw HTML injection. Avoid `window.alert` / `window.open` in the iframe runtime.
- **Authentication & Tenant Isolation:** Not yet implemented. If authentication, roles, or multi-tenant data are added, every query, API route, and authorization check must enforce authenticated identity and strict tenant/owner scoping.

## 7. Coding Conventions

- TypeScript only; top-level imports; standard enums only; pass `tsc --noEmit` with zero errors.
- Functional React components and hooks; modular files under `src/`.
- Tailwind CSS v4 utility classes in JSX and theme tokens in `src/index.css`; avoid inline style objects or extra CSS files unless strictly necessary.
- Keep `metadata.json` (`name`, `description`) and `index.html` (`<title>`, meta/OG tags) synchronized when initializing a new project; never rename `metadata.json` after initial project naming.
- Keep dev server bound to port `3000` and preserve `vite.config.ts` `DISABLE_HMR` and `src/assets` copy behavior.

## 8. Verification & Testing Commands

Available scripts in `package.json`:
- `npm run lint` — Runs `tsc --noEmit` (type checking).
- `npm run build` — Runs `vite build` (production bundle check).
- `npm run dev` — Starts Vite dev server on `0.0.0.0:3000`.
- `npm run preview` — Previews built `dist/` bundle.
- `npm run clean` — Removes `dist` and `server.js`.

**Current Gap:** No automated test runner (unit, integration, or E2E) or ESLint config is installed yet. Until added, every change must run `npm run lint` and `npm run build`, plus targeted runtime verification.

## 9. Documentation & Git Safety Rules

- Store every written task specification in `tasks/specs/` per `TASK_SPEC.md`.
- Maintain concise execution status without duplicating rules across files.
- **Git State:** Local Git repository initialized on `main` (`.git/` present, no remote configured yet). Do not run destructive Git commands, and never commit, push, merge, or deploy without explicit user authorization.

## 10. Cost-Efficient AI Operating Rules & Delegation

- Do not rescan unchanged files or run web research without a concrete need.
- Run targeted checks before full builds where possible.
- **When NOT to delegate / parallelize:** Trivial or single-file tasks, or tasks touching shared files (`package.json`, `tsconfig.json`, `vite.config.ts`, `src/App.tsx`, `server.ts`).
- **When to delegate:** Use one implementation pass (`TASK_EXECUTOR.md`) and one independent review pass (`PR_REVIEW.md`) for non-trivial changes; only parallelize subtasks in `SMALL_TASKS.md` when files are strictly disjoint.

## 11. Definition of Done

A task is complete only when:
1. Written specification exists in `tasks/specs/` and is approved (`TASK_SPEC.md`).
2. Small tasks are completed in dependency order (`SMALL_TASKS.md`).
3. Implementation matches approved scope with zero unrelated edits (`TASK_EXECUTOR.md`).
4. Relevant tests, `npm run lint`, and `npm run build` have been actually executed and passed.
5. Independent review status is `APPROVED` with no unresolved `BLOCKER` or `CRITICAL` findings (`PR_REVIEW.md`).
6. Release/merge checks pass and any Git action is explicitly authorized (`PR_MERGE.md`).
7. Final structured report is delivered distinguishing verified facts from assumptions.
