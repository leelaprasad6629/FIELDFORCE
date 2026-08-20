import { Router } from "express";
import type { Request, Response } from "express";
import { requireApiUser, clerkClient } from "../../lib/clerkAuth.js";
import dbConnect from "../../models/mongodb.js";
import { Technician } from "../../models/Technician.js";
import { ServiceRequest } from "../../models/ServiceRequest.js";
import { Alert } from "../../models/Alert.js";

const router = Router();

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.post("/user/role", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  const { userId, role: existingRole } = auth;
  if (existingRole) { res.status(409).json({ error: "Role already set" }); return; }
  const { role } = req.body;
  if (role !== "manager" && role !== "technician") { res.status(400).json({ error: "Invalid role" }); return; }
  try {
    const user = await clerkClient.users.getUser(userId);
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Field User";
    const primaryEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? null;
    await clerkClient.users.updateUserMetadata(userId, { publicMetadata: { role } });
    if (role === "technician") {
      await dbConnect();
      // Check if already linked by clerkUserId
      const linked = await Technician.findOne({ clerkUserId: userId });
      if (!linked) {
        // Try to find an existing technician by email (case-insensitive) — manager pre-added them
        let byEmail: typeof Technician.prototype | null = null;
        if (primaryEmail) {
          byEmail = await Technician.findOne({
            email: { $regex: new RegExp(`^${escapeRegex(primaryEmail)}$`, "i") },
          });
        }
        if (byEmail) {
          // Link the pre-existing record to this Clerk user
          // Tasks assigned to this _id become visible to this technician
          byEmail.clerkUserId = userId;
          if (!byEmail.name || byEmail.name === "Field User") byEmail.name = displayName;
          if (!byEmail.email) byEmail.email = primaryEmail;
          await byEmail.save();
        } else {
          // No pre-existing record; create a fresh one
          await Technician.create({
            name: displayName,
            status: "idle",
            location: "Depot HQ",
            clerkUserId: userId,
            lat: 40.7128,
            lng: -74.006,
            email: primaryEmail,
          });
        }
      }
    }
    res.json({ role });
  } catch (error) {
    req.log.error({ error }, "POST /api/user/role error");
    res.status(500).json({ error: "Failed to set role" });
  }
});

// Return the current user's linked technician profile (for TechnicianView)
// Also auto-links if the profile exists by email but hasn't been linked yet
router.get("/user/me", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    let technician = await Technician.findOne({ clerkUserId: auth.userId }).lean();
    
    // If no linked record found, try to auto-link by email
    // This handles the case where role was set directly in Clerk (bypassing onboarding)
    if (!technician && auth.role === "technician") {
      let primaryEmail = auth.email ?? null;
      // If email not available from auth (role was in JWT), fetch from Clerk
      if (!primaryEmail) {
        try {
          const user = await clerkClient.users.getUser(auth.userId);
          primaryEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? null;
        } catch {
          // Non-fatal
        }
      }
      if (primaryEmail) {
        const byEmail = await Technician.findOne({
          email: { $regex: new RegExp(`^${escapeRegex(primaryEmail)}$`, "i") },
        });
        if (byEmail) {
          // Link it
          byEmail.clerkUserId = auth.userId;
          await byEmail.save();
          technician = byEmail.toObject();
        }
      }
      // If still no record, create one (technician exists in Clerk but no profile)
      if (!technician) {
        let displayName = "Field User";
        try {
          const user = await clerkClient.users.getUser(auth.userId);
          displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Field User";
          if (!primaryEmail) {
            primaryEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? null;
          }
        } catch {
          // Non-fatal
        }
        const created = await Technician.create({
          name: displayName,
          status: "idle",
          location: "Depot HQ",
          clerkUserId: auth.userId,
          lat: 40.7128,
          lng: -74.006,
          email: primaryEmail,
        });
        technician = created.toObject();
      }
    }

    if (!technician) { res.json({ technician: null }); return; }
    res.json({
      technician: {
        _id: String(technician._id),
        name: technician.name,
        status: technician.status,
        location: technician.location,
        currentTask: technician.currentTask ?? null,
        email: technician.email ?? null,
        lat: technician.lat,
        lng: technician.lng,
      },
    });
  } catch (error) {
    req.log.error({ error }, "GET /api/user/me error");
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Technician updates their own status (e.g. on-site check-in)
// Also transitions associated ServiceRequest to "In-Progress" when checking in on-site
router.patch("/user/me/status", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const { status, lat, lng } = req.body;
    const VALID = ["on-route", "on-site", "idle", "break"];
    if (!status || !VALID.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
    const technician = await Technician.findOne({ clerkUserId: auth.userId });
    if (!technician) { res.status(404).json({ error: "Technician profile not found" }); return; }
    technician.status = status;
    if (typeof lat === "number") technician.lat = lat;
    if (typeof lng === "number") technician.lng = lng;
    if (typeof lat === "number" || typeof lng === "number") technician.lastLocationUpdate = new Date();
    await technician.save();
    // When technician checks in on-site, transition assigned ServiceRequest to In-Progress
    if (status === "on-site" && technician.currentTask) {
      await ServiceRequest.updateMany(
        { assignedTechnicianId: String(technician._id), status: "Assigned" },
        { $set: { status: "In-Progress" } }
      );
      await Alert.create({ message: `${technician.name} checked in on-site for "${technician.currentTask}"`, timestamp: new Date(), type: "info" });
    }
    res.json({ ok: true, status: technician.status });
  } catch (error) {
    req.log.error({ error }, "PATCH /api/user/me/status error");
    res.status(500).json({ error: "Failed to update status" });
  }
});


// Technician updates their own GPS location (without changing status)
// Called automatically by watchPosition in the frontend
router.patch("/user/me/location", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const { lat, lng } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number") {
      res.status(400).json({ error: "lat and lng must be numbers" });
      return;
    }
    // Bounds check: valid latitude/longitude ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ error: "Invalid coordinates" });
      return;
    }
    const technician = await Technician.findOne({ clerkUserId: auth.userId });
    if (!technician) {
      res.status(404).json({ error: "Technician profile not found" });
      return;
    }
    technician.lat = lat;
    technician.lng = lng;
    technician.lastLocationUpdate = new Date();
    await technician.save();
    res.json({ ok: true, lat: technician.lat, lng: technician.lng });
  } catch (error) {
    req.log.error({ error }, "PATCH /api/user/me/location error");
    res.status(500).json({ error: "Failed to update location" });
  }
});

export default router;
