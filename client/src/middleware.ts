import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

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

// Function to check if a path is admin-only
const isAdminPath = (path: string) => {
  return adminPaths.some(adminPath => 
    path === adminPath || path.startsWith(`${adminPath}/`)
  );
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // If no token is found and the path is not public, redirect to login
  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  try {
    // Verify the JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    // Check if user has an active profile selected
    if (pathname !== '/profiles' && !payload.activeProfile && !isPublicPath(pathname)) {
      return NextResponse.redirect(new URL('/profiles', request.url));
    }
    
    // Check if user is trying to access admin routes without admin role
    if (isAdminPath(pathname) && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/browse', request.url));
    }
    
    // Check if subscription is required and user doesn't have one
    if (
      !isPublicPath(pathname) && 
      !isAdminPath(pathname) && 
      pathname !== '/subscription' && 
      payload.subscriptionStatus !== 'ACTIVE'
    ) {
      return NextResponse.redirect(new URL('/subscription', request.url));
    }
    
    // Rate limiting for API routes
    if (pathname.startsWith('/api/') && !isPublicPath(pathname)) {
      const ip = request.ip || '';
      const rateLimit = request.headers.get('x-rate-limit');
      
      if (rateLimit && parseInt(rateLimit) > 100) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Rate limit exceeded' }),
          { status: 429, headers: { 'content-type': 'application/json' } }
        );
      }
    }
    
    // Add user info to headers for server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', payload.role as string);
    
    if (payload.activeProfile) {
      requestHeaders.set('x-profile-id', payload.activeProfile as string);
    }
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
  } catch (error) {
    // If token verification fails, clear the invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('token');
    return response;
  }
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
    '/api/:path*',
  ],
}; 