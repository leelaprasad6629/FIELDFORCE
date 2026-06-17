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
    await clerkClient.users.updateUserMetadata(userId, { publicMetadata: { role } });
    if (role === "technician") {
      await dbConnect();
      const existing = await Technician.findOne({ clerkUserId: userId });
      if (!existing) {
        await Technician.create({ name: displayName, status: "idle", location: "Depot HQ", clerkUserId: userId, lat: 40.7128, lng: -74.006 });
      }
    }
    res.json({ role });
  } catch (error) {
    req.log.error({ error }, "POST /api/user/role error");
    res.status(500).json({ error: "Failed to set role" });
  }
});

export default router;
