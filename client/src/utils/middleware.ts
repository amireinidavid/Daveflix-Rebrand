import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const authRoutes = ["/auth/login", "/auth/register"];
const protectedRoutes = ["/browse", "/profiles", "/account", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("role")?.value;
  const isAdminRoute = pathname.startsWith("/admin");

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Handle auth routes (login/register)
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // Redirect based on user role
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        return NextResponse.redirect(new URL("/profiles", request.url));
      }
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect unauthenticated users to login page
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Handle admin routes
    if (isAdminRoute) {
      if (userRole !== "ADMIN") {
        // Redirect non-admin users to profiles page
        return NextResponse.redirect(new URL("/profiles", request.url));
      }
    }

    // // Handle browse route - redirect to profiles if no active profile
    // if (pathname === "/browse") {
    //   const hasActiveProfile = request.cookies.get("activeProfile")?.value;
    //   if (!hasActiveProfile) {
    //     return NextResponse.redirect(new URL("/profiles", request.url));
    //   }
    // }
  }

  // Allow access to public routes
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
