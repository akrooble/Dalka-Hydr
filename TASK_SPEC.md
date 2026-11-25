# TASK_SPEC.md — Task Specification Engineer

Every new feature, bug fix, refactor, dependency addition, or architectural change in this repository must have an approved written specification **before** any implementation begins.

- Save each specification as `tasks/specs/TASK-XXX-<short-slug>.md` (e.g., `tasks/specs/TASK-001-project-scaffold.md`).
- Create one specification per task.
- For low-risk changes (e.g., copy fixes or isolated UI tweaks), keep sections brief, but do not omit required fields.
- Never invent root causes or unverified file paths. If evidence is insufficient, set `Root Cause` to `UNKNOWN` and investigate before specifying a fix.
- Do not write application code until the specification is complete and approved.

---

## Mandatory Specification Template

Every file in `tasks/specs/` must include all of the following fields:

- **Task ID:** `TASK-XXX`
- **Title:** Concise imperative title
- **Type:** `FEATURE` | `BUGFIX` | `REFACTOR` | `SECURITY` | `INFRA` | `TEST`
- **Priority:** `P0` | `P1` | `P2` | `P3`
- **Problem Statement:** What problem or requirement is being addressed and why.
- **Current Behavior:** Verified behavior observed in the repository today (cite actual files/lines).
- **Expected Behavior:** Exact observable behavior after completion.
- **Root Cause (if known):** Verified cause or `UNKNOWN` (with investigation steps).
- **Repository Evidence:** Exact file paths, `package.json` entries, commands, or logs inspected.
- **Scope:** Explicit list of what will be changed.
- **Out of Scope:** Explicit boundaries to prevent scope creep and unrelated refactoring.
- **Affected Components:** Frontend (`src/`), build/config (`vite.config.ts`, `tsconfig.json`, `index.html`, `metadata.json`), backend (`server.ts` if introduced), or tests.
- **Expected Files:** Exact list of files to create, modify, or delete.
- **Database Impact:** `None (no database configured)` or exact schema/migration/backfill details if a DB is introduced.
- **API Impact:** `None (client-only)` or exact `/api/*` routes, payloads, status codes, and backward-compatibility impact.
- **Security Impact:** Secret handling (`GEMINI_API_KEY` server-side only), input validation, XSS/injection checks, or `VITE_*` exposure review.
- **Tenant Impact:** `N/A (no multi-tenancy or auth configured)` or exact tenant-isolation/authorization rules when auth/tenants exist.
- **Implementation Approach:** Concise technical design aligned with React 19, Vite 8, Tailwind CSS v4, and TypeScript.
- **Edge Cases:** Empty/loading/error states, iframe/port-3000 constraints, invalid inputs, concurrency.
- **Test Plan:** Exact commands (`npm run lint`, `npm run build`, targeted unit/E2E tests once configured) and manual verification steps.
- **Acceptance Criteria:** Numbered, objective pass/fail checks.
- **Risks:** Regression, dependency, environment, or runtime risks.
- **Dependencies:** Prerequisite tasks, packages, or environment variables (`.env.example`).
- **Estimated Complexity:** `LOW` | `MEDIUM` | `HIGH`

---

## Repository-Specific Spec Checks

Before finalizing any spec for this codebase, verify:
1. Does it require backend secret access (e.g., `GEMINI_API_KEY`)? If yes, specify `server.ts` + `/api/*` proxy rather than client calls.
2. Does it add or alter npm dependencies? Justify why existing packages (`react`, `lucide-react`, `motion`, `express`, `@google/genai`) are insufficient.
3. Does it touch `metadata.json` or `index.html`? Ensure app name/description consistency and preserve `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`.
4. Are verification commands realistic for what is actually installed in `package.json`?
