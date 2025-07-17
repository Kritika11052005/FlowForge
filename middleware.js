import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = [
    "/organization",
    "/project", 
    "/issue",
    "/sprint",
];

// Routes that authenticated users can access (like onboarding)
const authRequiredRoutes = [
    "/onboarding",
];

// Helper function to check if a route requires authentication 
function requiresAuth(pathname) {
    if (!pathname || typeof pathname !== 'string') {
        return false;
    }
    
    return protectedRoutes.some(route => pathname.startsWith(route)) ||
        authRequiredRoutes.some(route => pathname.startsWith(route));
}

// Helper function to check if route is protected (requires full onboarding)
function isProtectedRoute(pathname) {
    if (!pathname || typeof pathname !== 'string') {
        return false;
    }
    
    return protectedRoutes.some(route => pathname.startsWith(route));
}

export default clerkMiddleware(async (auth, request) => {
    try {
        // Get user authentication status - AWAIT the promise
        const authResult = await auth();
        console.log('Auth result:', authResult);
        const userId = authResult?.userId;
        
        // Safely extract pathname
        let pathname = null;
        try {
            pathname = request?.nextUrl?.pathname;
        } catch (e) {
            console.warn('Error extracting pathname:', e);
            return NextResponse.next();
        }
        
        // Validate pathname
        if (!pathname || typeof pathname !== 'string') {
            console.warn('Invalid or missing pathname:', pathname);
            return NextResponse.next();
        }
        
        console.log('Middleware processing:', { 
            pathname, 
            userId: userId || 'NOT_FOUND',
            hasUserId: !!userId,
            requiresAuth: requiresAuth(pathname),
            isProtected: isProtectedRoute(pathname)
        });
        
        // If user is not authenticated and tries to access any protected route
        if (!userId && requiresAuth(pathname)) {
            console.log('Redirecting unauthenticated user to sign-in from:', pathname);
            try {
                const signInUrl = new URL("/sign-in", request.url);
                return NextResponse.redirect(signInUrl);
            } catch (redirectError) {
                console.error('Error creating redirect:', redirectError);
                return NextResponse.next();
            }
        }

        console.log('Allowing access to:', pathname);
        return NextResponse.next();
        
    } catch (error) {
        console.error('Middleware error:', error);
        // In case of any error, allow the request to continue
        return NextResponse.next();
    }
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};