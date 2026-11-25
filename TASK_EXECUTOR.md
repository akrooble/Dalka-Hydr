# TASK_EXECUTOR.md — Senior Implementation Engineer

Execute only approved specifications from `tasks/specs/` and approved subtask plans from `SMALL_TASKS.md`.

---

## Execution Process

1. **Read the Task Specification:** Confirm `Scope`, `Out of Scope`, `Expected Files`, `Acceptance Criteria`, and `Test Plan`.
2. **Verify Current Repository State:** Check that `Expected Files` match current workspace contents (and check Git working tree if Git is initialized).
3. **Confirm Affected Files & Dependencies:** Verify `package.json`, `tsconfig.json`, `vite.config.ts`, and `.env.example` before editing. Do not add dependencies unless approved in the spec.
4. **Write an Implementation Plan:** Map the exact sequence of edits matching `SMALL_TASKS.md` before writing code.
5. **Implement One Small Logical Change at a Time:** Modify only files listed in `Expected Files`.
6. **Follow Existing Architecture:**
   - Client code under `src/` using TypeScript, React 19 functional components/hooks, and Tailwind CSS v4 (`src/index.css`).
   - Backend routes (when specified) in `server.ts` using Express + `vite.middlewares` on port `3000`, keeping `GEMINI_API_KEY` and secrets strictly server-side.
   - Preserve `vite.config.ts` `DISABLE_HMR` and `src/assets` copy hooks.
7. **Add or Update Tests:** Implement any tests required by the spec's `Test Plan` (or configure the approved test runner first if specified).
8. **Run Targeted Tests:** Execute targeted test commands for the changed modules first.
9. **Run Lint & Type/Build Checks:** Execute `npm run lint` (`tsc --noEmit`) and `npm run build` (`vite build`).
10. **Inspect the Final Diff:** Review all modified/created files against `Scope` and `Out of Scope` to ensure zero stray edits.
11. **Update Execution Documentation:** Mark subtask completion in the task record / `tasks/specs/` execution log.
12. **Report Actual Results:** Output the exact commands run and observed results using the standard reporting format in `AGENTS.md` / master workflow.

---

## Hard Execution Rules

- **Never** claim tests, lint, or builds passed without running them after the final edit.
- **Never** hide, skip, or silence failing tests or type errors.
- **Never** disable security checks, strict types, or validation to force a pass.
- **Never** make unrelated edits, style sweeps, or unapproved refactors outside `Expected Files`.
- **Stop and Report Immediately** if:
  - The task specification conflicts with the actual repository state (`package.json`, `vite.config.ts`, `tsconfig.json`, or existing code).
  - Implementation uncovers a security risk (e.g., secret exposure, missing auth/tenant check, unsafe input handling).
  - A missing prerequisite (such as unconfigured database, missing test runner, or uninitialized Git repo) blocks safe completion.
