import { Router } from "express";
import type { Request, Response } from "express";
import dbConnect from "../../models/mongodb.js";
import { requireApiUser, requireManagerApi } from "../../lib/clerkAuth.js";
import { Technician } from "../../models/Technician.js";

const router = Router();

function serialize(doc: Record<string, unknown>) {
  return {
    _id: String(doc._id),
    name: doc.name,
    status: doc.status,
    currentTask: doc.currentTask ?? null,
    location: doc.location,
    lat: doc.lat,
    lng: doc.lng,
    clerkUserId: doc.clerkUserId ?? null,
    email: doc.email ?? null,
    phone: doc.phone ?? null,
  };
}

router.get("/technicians", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const technicians = await Technician.find({}).sort({ name: 1 }).lean();
    res.json(technicians.map((d) => serialize(d as Record<string, unknown>)));
  } catch (error) {
    req.log.error({ error }, "GET /api/technicians error");
    res.status(500).json({ error: "Failed to fetch technicians" });
  }
});

router.post("/technicians", async (req: Request, res: Response) => {
  const auth = await requireManagerApi(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const { name, location, status, currentTask, lat, lng, clerkUserId, email, phone } = req.body;
    if (!name || !location) { res.status(400).json({ error: "name and location are required" }); return; }
    const technician = await Technician.create({
      name, status: status ?? "idle", currentTask: currentTask ?? null,
      location, lat: lat ?? 40.7128, lng: lng ?? -74.006,
      clerkUserId: clerkUserId ?? null,
      email: email ?? null,
      phone: phone ?? null,
    });
    res.status(201).json(serialize(technician.toObject() as Record<string, unknown>));
  } catch (error) {
    req.log.error({ error }, "POST /api/technicians error");
    res.status(500).json({ error: "Failed to create technician" });
  }
});

router.patch("/technicians/:id", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const technician = await Technician.findById(req.params.id);
    if (!technician) { res.status(404).json({ error: "Technician not found" }); return; }
    if (auth.role === "technician" && technician.clerkUserId && technician.clerkUserId !== auth.userId) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    const { status, lat, lng, location, currentTask, email, phone } = req.body;
    const VALID = ["on-route", "on-site", "idle", "break"];
    if (status && VALID.includes(status)) technician.status = status;
    if (typeof lat === "number") technician.lat = lat;
    if (typeof lng === "number") technician.lng = lng;
    if (location) technician.location = location;
    if (currentTask !== undefined) technician.currentTask = currentTask;
    if (email !== undefined) technician.email = email;
    if (phone !== undefined) technician.phone = phone;
    await technician.save();
    res.json(serialize(technician.toObject() as Record<string, unknown>));
  } catch (error) {
    req.log.error({ error }, "PATCH /api/technicians/:id error");
    res.status(500).json({ error: "Failed to update technician" });
  }
});

export default router;
