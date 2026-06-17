import { verifyToken, createClerkClient } from "@clerk/backend";
import type { Request, Response } from "express";

export type UserRole = "manager" | "technician";

export const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function requireApiUser(
  req: Request,
  res: Response
): Promise<{ userId: string; role: UserRole | undefined } | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }
    const token = authHeader.slice(7);

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const userId = payload.sub;

    // Fetch actual publicMetadata from Clerk (JWT may not include it without a custom template)
    let role: UserRole | undefined;
    try {
      const user = await clerkClient.users.getUser(userId);
      role = (user.publicMetadata?.role as UserRole) ?? undefined;
    } catch {
      // Non-fatal — role will be undefined
    }

    return { userId, role };
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
}

export async function requireManagerApi(
  req: Request,
  res: Response
): Promise<{ userId: string } | null> {
  const result = await requireApiUser(req, res);
  if (!result) return null;
  if (result.role !== "manager") {
    res.status(403).json({ error: "Forbidden: manager role required" });
    return null;
  }
  return { userId: result.userId };
}
