export type UserRole = "manager" | "technician";

export const MANAGER_ROUTES = ["/dashboard", "/map", "/requests", "/analytics"] as const;
export const TECHNICIAN_ROUTES = ["/technician"] as const;

export function isManagerRoute(pathname: string): boolean {
  return MANAGER_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isTechnicianRoute(pathname: string): boolean {
  return pathname === "/technician" || pathname.startsWith("/technician/");
}

export function homePathForRole(role: UserRole): string {
  return role === "manager" ? "/dashboard" : "/technician";
}
