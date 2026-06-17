import { Router } from "express";
import type { Request, Response } from "express";
import { requireApiUser, clerkClient } from "../../lib/clerkAuth.js";
import dbConnect from "../../models/mongodb.js";
import { Technician } from "../../models/Technician.js";

const router = Router();

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
      // Check if already linked
      const linked = await Technician.findOne({ clerkUserId: userId });
      if (!linked) {
        // Try to find an existing technician by email (manager pre-added them)
        const byEmail = primaryEmail
          ? await Technician.findOne({ email: primaryEmail, clerkUserId: null })
          : null;
        if (byEmail) {
          // Link the pre-existing record to this Clerk user — tasks assigned to this _id become visible
          byEmail.clerkUserId = userId;
          if (!byEmail.name || byEmail.name === "Field User") byEmail.name = displayName;
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
router.get("/user/me", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const technician = await Technician.findOne({ clerkUserId: auth.userId }).lean();
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
    await technician.save();
    res.json({ ok: true, status: technician.status });
  } catch (error) {
    req.log.error({ error }, "PATCH /api/user/me/status error");
    res.status(500).json({ error: "Failed to update status" });
  }
});

export default router;
