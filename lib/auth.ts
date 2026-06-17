import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/roles";

type SessionMetadata = {
  role?: UserRole;
};

export async function getSessionRole(): Promise<UserRole | undefined> {
  const { sessionClaims } = await auth();
  const metadata = sessionClaims?.metadata as SessionMetadata | undefined;
  return metadata?.role;
}

export async function requireApiUser(): Promise<
  { userId: string; role: UserRole | undefined } | NextResponse
> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = await getSessionRole();
  return { userId, role };
}

export async function requireManagerApi(): Promise<
  { userId: string } | NextResponse
> {
  const result = await requireApiUser();
  if (result instanceof NextResponse) return result;
  if (result.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { userId: result.userId };
}

export async function requireTechnicianApi(): Promise<
  { userId: string } | NextResponse
> {
  const result = await requireApiUser();
  if (result instanceof NextResponse) return result;
  if (result.role !== "technician") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { userId: result.userId };
}

export async function setUserRole(userId: string, role: UserRole, displayName: string) {
  await clerkClient().users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });

  if (role === "technician") {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const { Technician } = await import("@/models/Technician");
    await dbConnect();
    const existing = await Technician.findOne({ clerkUserId: userId });
    if (!existing) {
      await Technician.create({
        name: displayName,
        status: "idle",
        location: "Depot HQ",
        clerkUserId: userId,
        lat: 40.7128,
        lng: -74.006,
      });
    }
  }
}

export async function getCurrentUserName(): Promise<string> {
  const user = await currentUser();
  if (!user) return "Unknown";
  return (
    user.fullName ??
    [user.firstName, user.lastName].filter(Boolean).join(" ") ??
    user.username ??
    "Field User"
  );
}
