# TASK-001: Dalka Jobs Public Website & Shared Firebase Schema

- **Task ID:** `TASK-001`
- **Title:** Build Dalka Jobs Light-Mode Public Website and Provision Shared Firebase Schema
- **Type:** `FEATURE`
- **Priority:** `P0`
- **Problem Statement:** Dalka Jobs needs its Phase 1 public website (`Home`, `Jobs`, `Tenders`, `Marketplace`, `Blogs`, `Contacts`, `About`) styled from the uploaded `dalkajobs` logos and Stitch `design_3d157499.markdown` system, backed by a shared Firebase Firestore schema ready for Phase 2 (Admin Panel) and Phase 3 (Mobile App).
- **Current Behavior:** Workspace has an empty `src/App.tsx` placeholder, blank `metadata.json`, default `index.html`, no Firebase configuration, and local Git initialized on `main`.
- **Expected Behavior:** Visitors can browse the Dalka Jobs homepage and navigate across `Home`, `Jobs`, `Tenders`, `Marketplace`, `Blogs`, `Contacts`, and `About`; filter and inspect jobs and tenders with optional external hiring links or emails; browse digital goods, books, and small e-commerce products (without online payment); read blog articles; view About and placeholder Contacts (stored in Firestore for future Admin edits); and submit visitor lead/inquiry forms on both Contacts and Marketplace capturing required `fullName` and `phone` plus optional `location`, `email`, and `higherEducation` into Firestore.
- **Root Cause (if known):** N/A (greenfield Phase 1 build).
- **Repository Evidence:** `package.json` (React `19.0.1`, Vite `8.3.0`, Tailwind CSS `4.3.3`, `lucide-react`, `motion`), `src/App.tsx`, `src/index.css`, `metadata.json`, `public/assets/aistudio/PROFILES-01_30dae6ba.png`, `public/assets/aistudio/design_3d157499.markdown`.
- **Scope:**
  - Provision Firebase (Firestore + Google Auth) and define `firebase-blueprint.json` + `firestore.rules`.
  - Install `firebase`, `react-router-dom`, and `@firebase/eslint-plugin-security-rules` (dev).
  - Configure `metadata.json`, `index.html`, and Tailwind v4 design tokens in `src/index.css` matching the Stitch light-mode system and `dalkajobs` brand colors.
  - Build shared navigation header (`Home`, `Jobs`, `Tenders`, `Marketplace`, `Blogs`, `Contacts`, `About`), footer, and page components under `src/`.
  - Implement Firestore data hooks with `testConnection()` and structured `handleFirestoreError`, plus realistic initial catalog/settings fallback or admin seed capability.
  - Implement validated lead capture forms on `Contacts` and `Marketplace` saving to `visitorLeads`.
- **Out of Scope:**
  - Phase 2 Admin Panel management UI (`/admin` CRUD & leads dashboard — reserved for `TASK-002`).
  - Phase 3 Mobile App / PWA offline packaging (reserved for `TASK-003`).
  - Online payment gateway integration and on-site CV file uploads.
  - Dark mode toggle (light mode first per user specification).
- **Affected Components:** Root config (`package.json`, `metadata.json`, `index.html`, `firebase-blueprint.json`, `firestore.rules`), `src/index.css`, `src/lib/firebase.ts`, `src/types/`, `src/components/`, `src/pages/`, `src/App.tsx`.
- **Expected Files:**
  - `firebase-blueprint.json`, `firestore.rules`, `eslint.config.js`, `security_spec.md`
  - `src/types/dalka.ts`
  - `src/lib/firebase.ts`, `src/lib/seedData.ts`, `src/hooks/useFirestoreData.ts`
  - `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/components/LeadForm.tsx`, `src/components/ErrorBoundary.tsx`
  - `src/pages/HomePage.tsx`, `src/pages/JobsPage.tsx`, `src/pages/TendersPage.tsx`, `src/pages/MarketplacePage.tsx`, `src/pages/BlogsPage.tsx`, `src/pages/ContactsPage.tsx`, `src/pages/AboutPage.tsx`
  - `src/App.tsx`, `src/index.css`, `index.html`, `metadata.json`
- **Database Impact:** Creates Firestore collections `jobs`, `tenders`, `marketplaceItems`, `blogs`, `siteSettings`, `visitorLeads`, and `admins` (bootstrapped for `akrooble@gmail.com`).
- **API Impact:** None (client-side Firebase SDK with Firestore Security Rules).
- **Security Impact:** Strict `firestore.rules` enforcing Eight Pillars validation: public `read` only on published listings/blogs/public `siteSettings`; public `create` on `visitorLeads` with strict field/size checks and no `read`/`list`/`update`/`delete` access for non-admins; all admin writes and lead reads restricted to verified `akrooble@gmail.com`.
- **Tenant Impact:** Single-platform catalog; visitor PII (`visitorLeads`) strictly isolated from public reads and accessible only to verified admin (`akrooble@gmail.com`).
- **Implementation Approach:** Modular React + TypeScript pages routed via `react-router-dom`, styled with Tailwind CSS v4 tokens from `design_3d157499.markdown`, displaying `dalkajobs` logo assets (`/assets/aistudio/PROFILES-01_30dae6ba.png`), dual-pane / filterable job & tender boards, product inquiry modal/drawer on Marketplace, and shared validated `LeadForm`.
- **Edge Cases:** Empty Firestore collections on first boot, invalid URLs/emails on external job/tender links, offline Firestore errors, malformed phone/email inputs, missing optional fields (`location`, `email`, `higherEducation`, `externalUrl`, `applyEmail`), mobile drawer navigation.
- **Test Plan:**
  1. Lint Firestore rules with `@firebase/eslint-plugin-security-rules`.
  2. Run `npm run lint` (`tsc --noEmit`).
  3. Run `npm run build` (`vite build`).
  4. Verify live runtime rendering, navigation across all 7 pages, filters, and Firestore lead submission in browser.
- **Acceptance Criteria:**
  1. All 7 pages (`Home`, `Jobs`, `Tenders`, `Marketplace`, `Blogs`, `Contacts`, `About`) render cleanly in light mode with `dalkajobs` branding and Stitch design styling.
  2. Jobs & Tenders display company/org, location, deadline, category, salary/budget, and optional external link / hiring email.
  3. Marketplace displays digital goods, books, and small e-commerce products with inquiry/request flow and no online payment.
  4. Both Contacts and Marketplace forms capture required Name + Phone Number and optional Location, Email, and Higher Education, persisting to `visitorLeads` in Firestore.
  5. `firestore.rules` passes ESLint security checks and blocks public reads of `visitorLeads`.
  6. `npm run lint` and `npm run build` succeed with zero errors.
- **Risks:** Firebase provisioning requires user confirmation in UI; initial Firestore collections are empty until seeded or created via Admin Panel (mitigated with clean default display data / admin seed action).
- **Dependencies:** Firebase project provisioning, `firebase`, `react-router-dom`, `@firebase/eslint-plugin-security-rules`.
- **Estimated Complexity:** `HIGH`
