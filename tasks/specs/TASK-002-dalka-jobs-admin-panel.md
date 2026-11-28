# TASK-002: Dalka Jobs Admin Panel (`/admin`)

- **Task ID:** `TASK-002`
- **Title:** Build Protected Dalka Jobs Admin Panel for Listings, Site Settings, and Visitor Leads
- **Type:** `FEATURE`
- **Priority:** `P0`
- **Problem Statement:** Phase 1 launched the public Dalka Jobs website reading from Firestore and collecting visitor leads (`visitorLeads`), but there is no authenticated management interface yet for the owner (`akrooble@gmail.com`) to upload/manage jobs, tenders, marketplace items, blogs, edit contact placeholders (`siteSettings/public`), or view/export collected visitor names and phone numbers.
- **Current Behavior:** Only public routes (`/`, `/jobs`, `/tenders`, `/marketplace`, `/blogs`, `/contacts`, `/about`) exist; no `/admin` route, Google sign-in gate, or admin CRUD module exists.
- **Expected Behavior:** Verified admin (`akrooble@gmail.com`) can sign in via Google at `/admin` and manage Jobs, Tenders, Marketplace Items, Blogs, Site Settings (Contacts & About), and Visitor Leads (`new` / `contacted` status updates, delete, search, filter, and CSV export), plus optionally import the starter catalog into Firestore in one click.
- **Root Cause (if known):** N/A (Phase 2 scheduled deliverable).
- **Repository Evidence:** `firestore.rules` (enforces `akrooble@gmail.com` + `email_verified == true` for admin CRUD and `visitorLeads` reads), `firebase-blueprint.json`, `src/lib/firebase.ts`, `src/types/dalka.ts`, `src/App.tsx`.
- **Scope:**
  - Extend `src/types/dalka.ts` with `VisitorLead` and admin form input types.
  - Create `src/lib/adminFirestore.ts` for validated Firestore CRUD across all collections and starter catalog import.
  - Create `src/hooks/useAdminData.ts` gated strictly on verified admin authentication.
  - Create modular Admin UI under `src/admin/` and `src/pages/AdminPage.tsx` following Stitch light-mode design tokens and `3_saas_dashboard.md`.
  - Wire `/admin` route in `src/App.tsx` and add a subtle Admin link in `src/components/Footer.tsx`.
- **Out of Scope:**
  - Phase 3 Mobile App / PWA offline packaging (`TASK-003`).
  - Online payment checkout integration.
  - Multi-admin role management UI (single verified owner `akrooble@gmail.com` per current requirements).
- **Affected Components:** `src/types/dalka.ts`, `src/lib/adminFirestore.ts`, `src/hooks/useAdminData.ts`, `src/admin/*`, `src/pages/AdminPage.tsx`, `src/App.tsx`, `src/components/Footer.tsx`.
- **Expected Files:**
  - `src/types/dalka.ts`
  - `src/lib/adminFirestore.ts`
  - `src/hooks/useAdminData.ts`
  - `src/admin/AdminLayout.tsx`
  - `src/admin/AdminOverviewTab.tsx`
  - `src/admin/AdminJobsTab.tsx`
  - `src/admin/AdminTendersTab.tsx`
  - `src/admin/AdminMarketplaceTab.tsx`
  - `src/admin/AdminBlogsTab.tsx`
  - `src/admin/AdminLeadsTab.tsx`
  - `src/admin/AdminSettingsTab.tsx`
  - `src/pages/AdminPage.tsx`
  - `src/App.tsx`, `src/components/Footer.tsx`
- **Database Impact:** Reads/writes existing Firestore collections (`jobs`, `tenders`, `marketplaceItems`, `blogs`, `siteSettings/public`, `visitorLeads`); no schema changes required.
- **API Impact:** None (client-side Firebase Auth & Firestore SDK protected by `firestore.rules`).
- **Security Impact:** Uses Firebase `signInWithPopup` Google Auth; attaches admin `onSnapshot` listeners only when `email_verified === true && email === 'akrooble@gmail.com'`; validates payload lengths/types before writes to match `firestore.rules`; avoids `window.alert`/`window.confirm`.
- **Tenant Impact:** Visitor PII (`visitorLeads`) remains strictly readable only by verified admin.
- **Implementation Approach:** Sidebar SaaS admin console at `/admin` with tabular tables, inline delete confirmation, slide-over/modal editors, and CSV export for visitor leads.
- **Edge Cases:** Non-admin Google account sign-in rejection, empty Firestore collections on first login, clearing optional fields (`externalUrl`, `applyEmail`, `imageUrl`, `whatsapp`) via `deleteField()`, invalid slug formatting on blogs, network/permission errors caught via `handleFirestoreError`.
- **Test Plan:**
  1. Run `npm run lint` (`tsc --noEmit`).
  2. Run `npm run build` (`vite build`).
  3. Verify `npx eslint firestore.rules`.
- **Acceptance Criteria:**
  1. `/admin` requires Google Sign-In and blocks non-admin accounts cleanly.
  2. Admin can create, edit, and delete Jobs, Tenders, Marketplace Items, and Blogs in Firestore, reflecting live on the public site.
  3. Admin can update Contacts & About details (`siteSettings/public`), reflecting live on `/contacts`, `/about`, and Footer.
  4. Admin can view, filter, update status (`new`/`contacted`), delete, and export CSV of `visitorLeads` (including Name, Phone, Location, Email, Higher Education, Source, Item, Message).
  5. `npm run lint` and `npm run build` pass with zero errors.
- **Risks:** Popup blockers in embedded browsers (mitigated with clear error notice and retry button).
- **Dependencies:** `TASK-001` (Firebase provisioning, `firestore.rules`, `src/lib/firebase.ts`).
- **Estimated Complexity:** `HIGH`
