import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define paths that don't require authentication
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/landing',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
];

// Define auth paths that authenticated users should be redirected from
const authPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Define paths that require admin access
const adminPaths = [
  '/admin',
  '/admin/dashboard',
  '/admin/content',
  '/admin/users',
  '/admin/analytics',
  '/admin/settings',
  '/admin/subscriptions',
];

// Function to check if a path is public
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
};

// Function to check if a path is an auth path
const isAuthPath = (path: string) => {
  return authPaths.some(authPath => 
    path === authPath || path.startsWith(`${authPath}/`)
  );
};

// Function to check if a path is admin-only
const isAdminPath = (path: string) => {
  return adminPaths.some(adminPath => 
    path === adminPath || path.startsWith(`${adminPath}/`)
  );
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('role')?.value;
  const activeProfile = request.cookies.get('activeProfile')?.value;
  
  // If user is authenticated and trying to access auth pages, redirect to browse
  if (token && isAuthPath(pathname)) {
    return NextResponse.redirect(new URL('/browse', request.url));
  }
  
  // Always allow access to public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // If no token is found and the path is not public, redirect to login
  // if (!token) {
  //   const url = new URL('/auth/login', request.url);
  //   // Only add callback for non-login pages to prevent redirect loops
  //   if (pathname !== '/auth/login') {
  //     url.searchParams.set('callbackUrl', pathname);
  //   }
  //   return NextResponse.redirect(url);
  // }
  
  // Check if user has an active profile selected
  // if (pathname !== '/profiles' && !activeProfile && !isPublicPath(pathname)) {
  //   return NextResponse.redirect(new URL('/profiles', request.url));
  // }
  
  // Check if user is trying to access admin routes without admin role
  if (isAdminPath(pathname) && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/browse', request.url));
  }
  
  // Add user info to headers for server components if needed
  const requestHeaders = new Headers(request.headers);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
