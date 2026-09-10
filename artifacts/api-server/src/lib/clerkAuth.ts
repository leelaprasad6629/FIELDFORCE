import { verifyToken, createClerkClient } from "@clerk/backend";
import type { Request, Response } from "express";
import dbConnect from "../models/mongodb.js";
import { Technician } from "../models/Technician.js";

export type UserRole = "manager" | "technician";

export function getClerkSecretKey(): string {
  const key = process.env.CLERK_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("CLERK_SECRET_KEY is not configured in environment variables");
  }
  return key;
}

export function getClerkClient() {
  return createClerkClient({ secretKey: getClerkSecretKey() });
}

// Dynamic proxy so any call to clerkClient always evaluates the current secret key
export const clerkClient = new Proxy({} as ReturnType<typeof createClerkClient>, {
  get(_target, prop) {
    const client = getClerkClient();
    const value = (client as Record<string, any>)[prop as string];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

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
    const token = authHeader.slice(7).trim();
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }

    let secretKey: string;
    try {
      secretKey = getClerkSecretKey();
    } catch (err) {
      req.log?.error({ err }, "[clerkAuth] CLERK_SECRET_KEY is not configured");
      res.status(500).json({ error: "Server configuration error: CLERK_SECRET_KEY missing" });
      return null;
    }

    const payload = await verifyToken(token, {
      secretKey,
    });

    const userId = payload.sub;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: token missing subject" });
      return null;
    }

    // Comprehensive role extraction across all standard Clerk token claim formats:
    // 1. metadata.role (Clerk session token customized with metadata)
    // 2. publicMetadata.role
    // 3. public_metadata.role
    // 4. unsafeMetadata.role
    // 5. unsafe_metadata.role
    // 6. role
    const claims = payload as Record<string, any>;
    let role: UserRole | undefined =
      (claims.metadata?.role as UserRole | undefined) ||
      (claims.publicMetadata?.role as UserRole | undefined) ||
      (claims.public_metadata?.role as UserRole | undefined) ||
      (claims.unsafeMetadata?.role as UserRole | undefined) ||
      (claims.unsafe_metadata?.role as UserRole | undefined) ||
      (claims.role as UserRole | undefined);

    let email: string | null | undefined;

    // Fallback 1: Query Clerk Backend API if role not present in token claims
    if (!role) {
      try {
        const client = getClerkClient();
        const user = await client.users.getUser(userId);
        role =
          (user.publicMetadata?.role as UserRole) ||
          ((user as any).metadata?.role as UserRole) ||
          (user.unsafeMetadata?.role as UserRole) ||
          undefined;
        email = user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? null;
      } catch (err) {
        req.log?.warn({ err }, `[clerkAuth] Failed to retrieve user ${userId} from Clerk API`);
      }
    }

    // Fallback 2: Check MongoDB Technician collection
    if (!role) {
      try {
        await dbConnect();
        const linked = await Technician.findOne({ clerkUserId: userId });
        if (linked) {
          role = "technician";
        }
      } catch {
        // Non-fatal database check
      }
    }

    return { userId, role, email };
  } catch (err) {
    req.log?.error({ err }, "[clerkAuth] Token verification failed");
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

