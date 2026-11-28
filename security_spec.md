# Dalka Jobs — Security Specification (`security_spec.md`)

## Data Invariants
1. **Admin & RBAC Authority:** Verified owner `akrooble@gmail.com` (`email_verified == true`) is always Super Admin. Additional verified team members must exist in `/admins/{uid}` with `status == 'active'` and explicit allowlisted `permissions` (`overview`, `jobs`, `tenders`, `marketplace`, `blogs`, `leads`, `newsletter`, `contacts`, `footer`, `team`).
2. **Prevent Self-Assigned Roles:** A newly registered verified user can only write `/accessRequests/{uid}` with `status == 'pending'` (no `role` or `permissions` fields). Only an existing `team` manager (`akrooble@gmail.com` or active `team` permission holder) can create `/teamInvites/{inviteId}`, approve `/accessRequests/{uid}`, or edit `/admins/{uid}`. An invited user may claim `/admins/{uid}` ONLY atomically alongside `/teamInvites/{inviteId}` (`status: 'pending' -> 'claimed'`) where `role` and `permissions` match the invite verbatim.
3. **PII Isolation (`visitorLeads`, `newsletterSubscribers`, `admins`, `teamInvites`, `accessRequests`):** Public visitors may create `visitorLeads` (`status == 'new'`) and `newsletterSubscribers` (`source == 'footer'`), but may never `get`, `list`, `update`, or `delete` PII records. Only active team members with matching permission (`leads`, `newsletter`, `team`) can read/manage them.
4. **Section-Scoped Site Settings:** Updating `siteSettings/public` enforces `hasPermission('contacts')` for Contact/Brand/About fields and `hasPermission('footer')` for Footer/Social fields.

## Dirty Dozen Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. Unauthenticated `get` or `list` on `/visitorLeads` or `/newsletterSubscribers` -> Denied.
2. Self-assigning `/admins/{uid}` with `role: 'super_admin'` without a matching pending `/teamInvites/{inviteId}` -> Denied.
3. Claiming `/admins/{uid}` with modified `permissions: ['team']` that differ from `/teamInvites/{inviteId}` -> Denied.
4. Re-claiming an already `claimed` `/teamInvites/{inviteId}` -> Denied.
5. Unverified email spoof (`email: "akrooble@gmail.com"`, `email_verified: false`) writing `/admins` or `/siteSettings/public` -> Denied.
6. Active `editor` (`permissions: ['overview', 'jobs']`) attempting to read/list `/visitorLeads` or `/newsletterSubscribers` or `/admins` -> Denied.
7. Active `editor` attempting to update `/siteSettings/public` footer or contacts fields -> Denied.
8. Suspended admin (`admins/{uid}.status == 'suspended'`) attempting any write or private read -> Denied.
9. Registered user creating `/accessRequests/{otherUid}` for another UID -> Denied (`request.auth.uid == requestId`).
10. Registered user creating `/accessRequests/{uid}` with `status: 'approved'` -> Denied (`status == 'pending'` required).
11. Public `create` on `/newsletterSubscribers/sub-1` with shadow key `role: 'admin'` -> Denied (`hasOnly`).
12. Invalid path ID (`teamInvites/bad$id!`) -> Denied (`isValidId`).
