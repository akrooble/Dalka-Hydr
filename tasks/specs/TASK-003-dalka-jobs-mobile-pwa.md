# TASK-003: Dalka Jobs Mobile App (Installable PWA & Touch UX)

- **Task ID:** `TASK-003`
- **Title:** Convert Dalka Jobs into an Installable Mobile PWA with Offline Caching & Thumb Navigation
- **Type:** `FEATURE`
- **Priority:** `P0`
- **Problem Statement:** Phase 3 requires a mobile app experience sharing the same codebase and Firebase database as Phase 1 (Public Website) and Phase 2 (Admin Panel). Currently the app has no Web App Manifest, Service Worker, install prompt UI, offline Firestore cache, or mobile bottom-tab navigation.
- **Current Behavior:** React + Vite SPA works responsively in browser tabs without PWA manifest, service worker, offline cache, or mobile bottom navigation bar.
- **Expected Behavior:** Users on Android, iOS Safari, and desktop can install Dalka Jobs directly to their home screen (`standalone` mode), browse cached jobs/tenders/marketplace/blogs offline with a visible offline indicator, and navigate effortlessly on mobile with a fixed thumb-zone bottom tab bar and touch-friendly mobile inspection sheets.
- **Root Cause (if known):** N/A (Phase 3 scheduled deliverable).
- **Repository Evidence:** `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/lib/firebase.ts`, `public/assets/aistudio/PROFILES-03_b5c8cc84.png`.
- **Scope:**
  - Install `vite-plugin-pwa` and generate compliant `192x192`, `512x512`, `maskable 512x512`, and `180x180` PNG icons from `PROFILES-03_b5c8cc84.png` plus `public/icon.svg`.
  - Configure `VitePWA` in `vite.config.ts` (preserving `copy-unbundled-src-assets` and `DISABLE_HMR`), update `tsconfig.json` types, and add iOS/Android PWA meta tags to `index.html`.
  - Enable Firestore persistent multi-tab local cache in `src/lib/firebase.ts` and register the service worker in `src/main.tsx`.
  - Add `usePWAInstall`, `useOnlineStatus`, `PWAInstallButton`, `OfflineIndicator`, and `MobileBottomNav`.
  - Enhance mobile sheet interaction on `JobsPage` and `TendersPage` for single-handed mobile viewing.
- **Out of Scope:**
  - Native Play Store / App Store binary wrappers (Capacitor/React Native) — can be wrapped later around this PWA build if store distribution is needed.
  - Push notifications backend.
- **Affected Components:** `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `public/*`, `src/main.tsx`, `src/lib/firebase.ts`, `src/hooks/*`, `src/components/*`, `src/pages/JobsPage.tsx`, `src/pages/TendersPage.tsx`, `src/App.tsx`.
- **Expected Files:**
  - `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-maskable-512x512.png`, `public/apple-touch-icon.png`, `public/icon.svg`
  - `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/lib/firebase.ts`
  - `src/hooks/usePWAInstall.ts`, `src/hooks/useOnlineStatus.ts`
  - `src/components/PWAInstallButton.tsx`, `src/components/OfflineIndicator.tsx`, `src/components/MobileBottomNav.tsx`
  - `src/components/Navbar.tsx`, `src/pages/JobsPage.tsx`, `src/pages/TendersPage.tsx`, `src/App.tsx`
- **Database Impact:** Enables client-side Firestore IndexedDB persistent cache; zero Firestore schema or security rule changes.
- **API Impact:** None.
- **Security Impact:** Service worker caches only public app shell assets and fonts (`CacheFirst`), never caching authenticated Firestore admin writes or PII tokens improperly; `firestore.rules` remains unchanged.
- **Tenant Impact:** No change to PII isolation (`visitorLeads` remains admin-only).
- **Implementation Approach:** `vite-plugin-pwa` with `autoUpdate` + Workbox caching + React `beforeinstallprompt` & iOS guide modal + mobile bottom navigation bar (`lg:hidden`) respecting 15% sticky viewport height cap.
- **Edge Cases:** iOS Safari lacking `beforeinstallprompt`, already-installed `standalone` mode hiding install button, IndexedDB unavailable in private browsing (fallback to standard `getFirestore`), offline submission feedback.
- **Test Plan:**
  1. Run `npm run lint` (`tsc --noEmit`).
  2. Run `npm run build` (`vite build`) and verify generated `dist/manifest.webmanifest` and `dist/sw.js`.
- **Acceptance Criteria:**
  1. Web App Manifest (`manifest.webmanifest`) includes `id`, `name`, `short_name` (`<= 12` chars), `display: standalone`, `192x192`, `512x512`, and padded `maskable` icons.
  2. Service worker registers cleanly and caches app shell; offline indicator activates when offline.
  3. In-app `PWAInstallButton` handles `beforeinstallprompt`, suppresses itself in standalone mode, and provides iOS Safari install instructions.
  4. Mobile viewport renders fixed thumb-zone bottom navigation (`Home`, `Jobs`, `Tenders`, `Market`, `Contacts`) and mobile detail sheet for jobs/tenders.
  5. `npm run lint` and `npm run build` pass with zero errors.
- **Risks:** Browser preview iframes may suppress `beforeinstallprompt` until opened in a top-level mobile browser tab (mitigated with clean iOS/browser install helper and mobile UI verification).
- **Dependencies:** `vite-plugin-pwa`, `TASK-001`, `TASK-002`.
- **Estimated Complexity:** `MEDIUM`
