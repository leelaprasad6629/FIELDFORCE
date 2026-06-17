import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { homePathForRole, isManagerRoute, isTechnicianRoute, type UserRole } from "@/lib/roles";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding/role"]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(request)) {
    return;
  }

  const authState = await auth();
  if (!authState.userId) {
    authState.protect();
    return;
  }

  const role = (authState.sessionClaims?.metadata as { role?: UserRole } | undefined)?.role;

  if (isOnboardingRoute(request)) {
    if (role) {
      return NextResponse.redirect(new URL(homePathForRole(role), request.url));
    }
    return;
  }

  if (!role) {
    return NextResponse.redirect(new URL("/onboarding/role", request.url));
  }

  if (isManagerRoute(pathname) && role !== "manager") {
    return NextResponse.redirect(new URL("/technician", request.url));
  }

  if (isTechnicianRoute(pathname) && role !== "technician") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
