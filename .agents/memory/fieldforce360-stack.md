---
name: FieldForce360 stack
description: Key architecture decisions and constraints for the FieldForce360 field service app
---

## Stack
- Frontend: `artifacts/fieldforce360` — React + Vite + Tailwind v4 + Clerk + wouter + framer-motion
- Backend: `artifacts/api-server` — Express 5 + Mongoose (MongoDB)
- Auth: Clerk (`@clerk/clerk-react` frontend, `@clerk/backend` for token verify + user metadata)

## Required Secrets
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (frontend)
- `CLERK_SECRET_KEY` — Clerk secret key (backend token verify + updateUserMetadata)
- `MONGODB_URI` — MongoDB Atlas connection string

## Key Design Decisions
- Role stored in Clerk `publicMetadata.role` — set via `POST /api/user/role` after sign-up
- When a user picks "technician" role, a Technician document is auto-created in MongoDB with their clerkUserId
- Frontend API calls all go through `/api/*` (Replit proxy routes to api-server on port 8080)
- Smart dispatch: picks idle technician nearest (haversine) to request geofence center, creates Task + Alert + optionally sends email via Resend

**Why:** Clerk metadata avoids a separate users collection; Replit proxy means no CORS config needed.
