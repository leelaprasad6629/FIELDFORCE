import { createClerkClient } from "@clerk/backend";
import type { Request, Response } from "express";

export type UserRole = "manager" | "technician";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function requireApiUser(req: Request, res: Response): Promise<{ userId: string; role: UserRole | undefined } | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }
    const token = authHeader.slice(7);
    const payload = await clerkClient.verifyToken(token);
    const userId = payload.sub;
    const role = (payload as Record<string, unknown>).role as UserRole | undefined
      ?? ((payload as Record<string, unknown>).metadata as Record<string, unknown> | undefined)?.role as UserRole | undefined;
    return { userId, role };
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
}

export async function requireManagerApi(req: Request, res: Response): Promise<{ userId: string } | null> {
  const result = await requireApiUser(req, res);
  if (!result) return null;
  if (result.role !== "manager") {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return { userId: result.userId };
}

export { clerkClient };
