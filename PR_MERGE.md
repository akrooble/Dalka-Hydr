# PR_MERGE.md — Release Controller

No branch merge, commit, push, tag, or production deployment may occur without explicit user authorization and full satisfaction of the release gates below.

---

## Current Repository Constraint

- As discovered during repository setup, this workspace currently has **no `.git` directory**, no branches, and no CI pipeline configured.
- Until Git and CI are initialized with user approval, apply steps 3–5, 7, 9, and 10 to the workspace change set, and treat Git branch/CI checks (steps 1, 2, 6, 8) as prerequisites to establish before any branch-based workflow.

---

## Pre-Merge Verification Checklist

Before requesting or performing an authorized merge:

1. **Confirm Intended Base Branch:** Verify exact target branch (e.g., `main`).
2. **Confirm Source Branch:** Verify exact feature/fix branch matches the reviewed task.
3. **Verify PR Description:** Links to `tasks/specs/TASK-XXX-*.md`, summarizes changes, and lists executed checks.
4. **Verify Review Status:** Confirm `PR_REVIEW.md` outcome is `APPROVED`.
5. **Confirm All Blockers Resolved:** Zero open `BLOCKER` or `CRITICAL` review findings.
6. **Check CI / Verification Status:** Confirm `npm run lint` (`tsc --noEmit`), `npm run build` (`vite build`), and any configured test suites pass on the latest revision.
7. **Check Migration Safety:** Confirm any database migrations (if applicable) are backward-compatible, reversible, and non-destructive.
8. **Check Merge Conflicts:** Verify clean mergeability against the base branch.
9. **Confirm No Unrelated Changes:** Diff matches `Expected Files` in the approved spec; no `.env*` or secret files included.
10. **Verify Final Diff:** Inspect the complete diff one last time prior to merge.

---

## Merge Prohibitions

Merging is **strictly forbidden** when any of the following hold:
- Required lint, build, or test checks fail or were not executed.
- `CRITICAL` or `BLOCKER` security issues remain.
- Tenant isolation or authorization is unverified (when multi-tenancy/auth is present).
- Independent `PR_REVIEW.md` review is missing or not `APPROVED`.
- Unresolved `BLOCKER` findings exist.
- Database migrations are unsafe or unverified.

---

## Authorization & Post-Merge Verification

- **Never** merge to `main`, `staging`, or `production` without explicit user authorization.
- **Never** run `git commit`, `git push`, deploy, or destructive Git operations (`reset --hard`, `push --force`, branch deletion) without explicit user permission.
- After an authorized merge, inspect the resulting target branch (`git status`, `git log -n 3`, and re-run `npm run lint` / `npm run build`), then report the exact verified outcome.
