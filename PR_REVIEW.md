# PR_REVIEW.md — Independent Quality Reviewer

Every non-trivial implementation must undergo an independent review after `TASK_EXECUTOR.md` completes and before `PR_MERGE.md` is evaluated. Never assume code is correct because the implementer reported success.

---

## 16-Point Independent Review Checklist

Inspect the actual diff/files and verify every applicable item:

1. **Functional Correctness:** Matches every Acceptance Criterion in the `tasks/specs/` specification.
2. **Business Logic:** Edge cases, state transitions, and calculations behave accurately.
3. **Security Vulnerabilities:** No XSS/raw HTML injection, no command/SQL injection, no `GEMINI_API_KEY` or secret exposure in client code or `VITE_*` vars.
4. **Authentication & Authorization:** Protected actions/routes verify identity and permissions server-side (when auth exists).
5. **Tenant Isolation & Data Leakage:** Queries, responses, and storage strictly scope data by tenant/user (when multi-tenancy/users exist).
6. **Database Integrity:** Constraints, schema alignment, and safe migrations (when DB exists).
7. **Transactions & Concurrency:** Multi-step writes are atomic and safe against partial failure.
8. **API Compatibility:** `/api/*` request/response shapes, HTTP status codes, and error contracts remain consistent.
9. **Input Validation:** Server endpoints and forms validate types, bounds, and required fields.
10. **Error Handling:** Explicit error handling without silent catches or leaked stack traces/secrets.
11. **Performance:** No redundant re-renders, blocking main-thread loops, or unbounded payloads/queries.
12. **Race Conditions:** Async effects, stale closures, debouncing, and concurrent requests are handled safely.
13. **Regression Risks:** Preserves port `3000` dev server, `DISABLE_HMR` setting, `src/assets` build copy in `vite.config.ts`, and existing functionality.
14. **Test Quality:** Tests/checks actually exercise new behavior and edge cases rather than mocking away failures; `npm run lint` and `npm run build` were genuinely executed.
15. **Maintainability:** Clean TypeScript types, modular React components, Tailwind CSS v4 conventions.
16. **Unnecessary Code Changes:** Zero edits outside `Expected Files` and `Scope`.

---

## Finding Format

Every issue identified must be recorded with all fields:

- **Finding ID:** `REV-XXX`
- **Severity:** `BLOCKER` | `CRITICAL` | `MAJOR` | `MINOR` | `INFO`
- **File and Line:** `<path>:<line>`
- **Problem:** Exact defect or risk.
- **Reproduction or Evidence:** Code snippet, failing check, or reproduction steps.
- **Expected Behavior:** What the code or spec requires instead.
- **Recommended Fix:** Concrete minimal remediation.

---

## Review Outcome Rules

Final review status must be exactly one of:
- `APPROVED` — Zero `BLOCKER` or `CRITICAL` findings; all acceptance criteria and verification checks verified.
- `CHANGES REQUIRED` — Non-blocking defects (`MAJOR`/`MINOR`) or missing verification must be fixed before approval.
- `BLOCKED` — Unresolved `BLOCKER` or `CRITICAL` security, data-integrity, or architectural issue.

**Prohibitions:** Never invent findings to appear thorough; never mark `APPROVED` for unverified behavior or unexecuted checks.
