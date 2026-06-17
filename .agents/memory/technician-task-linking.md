---
name: Technician task linking
description: How manager-pre-added technicians get linked to signed-up Clerk users so tasks appear correctly
---

## The Rule
When a user signs up and picks "technician" role (POST /user/role), check for an existing Technician doc with matching email AND clerkUserId=null. If found, update that record's clerkUserId instead of creating a new one.

**Why:** Managers add technicians via Dashboard before those users sign up. Smart Assign assigns tasks to the pre-added Technician's `_id`. If sign-up creates a NEW Technician record (different `_id`), `GET /tasks?mine=true` finds the new `_id` and returns zero tasks. Email-matching bridges the gap automatically.

**How to apply:** In `artifacts/api-server/src/routes/api/userRole.ts`, POST /user/role handler — before `Technician.create()`, run `Technician.findOne({ email: primaryEmail, clerkUserId: null })`. If found, set `clerkUserId` and save; skip create.

The Dashboard "Add Technician" modal shows a hint: "Enter the same email they'll use to sign up — tasks will auto-link to their account."
