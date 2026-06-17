import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserName, requireApiUser, setUserRole } from "@/lib/auth";
import type { UserRole } from "@/lib/roles";

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  const { userId, role: existingRole } = authResult;
  if (existingRole) {
    return NextResponse.json({ error: "Role already set" }, { status: 409 });
  }

  const body = await req.json();
  const role = body.role as UserRole;
  if (role !== "manager" && role !== "technician") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const displayName = await getCurrentUserName();
  await setUserRole(userId, role, displayName);

  return NextResponse.json({ role });
}
