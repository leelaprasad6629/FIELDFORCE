import { useUser } from "@clerk/clerk-react";

export type UserRole = "manager" | "technician" | null;

export function useRole(): { role: UserRole; isLoaded: boolean } {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) return { role: null, isLoaded };
  const role = (user.publicMetadata?.role as UserRole) ?? null;
  return { role, isLoaded };
}
