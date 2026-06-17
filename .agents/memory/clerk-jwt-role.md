---
name: Clerk JWT role claims
description: Role is available in JWT publicMetadata, avoiding a costly extra Clerk API call per request
---

## The Rule
Read the user's role from `(payload as any).publicMetadata?.role` on the verified JWT payload in `requireApiUser()`. Only fall back to `clerkClient.users.getUser(userId)` if the role is missing from the token.

**Why:** Without this, every API request made two Clerk network calls (verifyToken + getUser), adding ~200-400ms latency per request. The role is written to `publicMetadata` via `clerkClient.users.updateUserMetadata()` in POST /user/role and is included in Clerk's JWT by default.

**How to apply:** In `artifacts/api-server/src/lib/clerkAuth.ts`, after `verifyToken()`, check `(payload as any).publicMetadata?.role` first. Only call `clerkClient.users.getUser()` when that is falsy (e.g. during the onboarding role-selection flow, before metadata is set).
