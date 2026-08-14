import { verifyToken, createClerkClient } from "@clerk/backend";
import type { Request, Response } from "express";

export type UserRole = "manager" | "technician";

export const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function requireApiUser(
  req: Request,
  res: Response
): Promise<{ userId: string; role: UserRole | undefined; email?: string | null } | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }
    const token = authHeader.slice(7);

    if (!process.env.CLERK_SECRET_KEY) {
      console.error("[clerkAuth] CLERK_SECRET_KEY is not set — token verification impossible");
      res.status(500).json({ error: "Server misconfigured: CLERK_SECRET_KEY not set" });
      return null;
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const userId = payload.sub;

    // Fast path: read role from JWT public metadata claims (no extra API call)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let role: UserRole | undefined = (payload as any).publicMetadata?.role as UserRole | undefined;
    let email: string | null | undefined;

    // Only hit Clerk API if role not in JWT (e.g. just after role is set)
    if (!role) {
      try {
        const user = await clerkClient.users.getUser(userId);
        role = (user.publicMetadata?.role as UserRole) ?? undefined;
        email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? null;
      } catch {
        // Non-fatal
      }
    }

    return { userId, role, email };
  } catch (err) {
    console.error("[clerkAuth] Token verification failed:", err instanceof Error ? err.message : String(err));
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
