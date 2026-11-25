# SMALL_TASKS.md — Task Decomposition Engine

Break medium/large or multi-layer specifications (`tasks/specs/TASK-XXX-*.md`) into small, independently verifiable subtasks before implementation begins. Keep trivial single-file tasks to 1–2 subtasks; do not create excessive micro-tasks.

---

## Small Task Schema

Every subtask must define:

- **Small Task ID:** `TASK-XXX-S01`
- **Objective:** Single clear outcome.
- **Dependencies:** `None` or prior Small Task IDs (e.g., `TASK-XXX-S01`).
- **Exact Scope:** What this subtask implements and nothing else.
- **Expected Files:** Exact file paths touched by this subtask.
- **Implementation Steps:** Numbered, concrete edits.
- **Verification Command:** Exact command to verify this subtask (e.g., `npm run lint`, targeted test command, or `npm run build`).
- **Acceptance Criteria:** Objective conditions proving the subtask works.
- **Completion Status:** `PENDING` | `IN_PROGRESS` | `DONE` | `BLOCKED`

---

## Decomposition & Ordering Rules

1. **Dependency Order:** Sequence foundational work before dependents:
   - Config / dependencies / environment (`package.json`, `.env.example`)
   - Backend / schema / API contracts (`server.ts`, `/api/*`, DB schemas if any)
   - Shared types & client utilities (`src/types/`, `src/lib/`)
   - UI components & pages (`src/components/`, `src/App.tsx`)
   - Automated tests & final build verification
2. **Independent Verifiability:** Each subtask should leave the repository able to pass `npm run lint` (`tsc --noEmit`) after completion whenever possible.
3. **Concurrency & File Isolation:**
   - Parallel execution is allowed **only** when subtasks are genuinely independent and touch strictly disjoint files (or isolated Git worktrees once Git is initialized).
   - **Never** allow two agents or parallel subtasks to modify the same file concurrently—especially shared hubs like `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `metadata.json`, `src/App.tsx`, `src/index.css`, or `server.ts`.
4. **Token Discipline:** Prefer a single sequential executor for small features; reserve parallel subtasks for genuinely separate modules (e.g., independent UI components with frozen shared types).
