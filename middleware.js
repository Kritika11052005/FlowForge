import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes that require full authentication and onboarding
const protectedRoutes = [
    "/organization",
    "/project", 
    "/issue",
    "/sprint",
];

// Routes that require user to be authenticated but not necessarily onboarded
const authRequiredRoutes = [
    "/onboarding",
];

// Helper function to check if a route requires authentication (either onboarding or protected)
function requiresAuth(pathname) {
    if (!pathname || typeof pathname !== 'string') {
        return false; // Return false if pathname is invalid
    }
    
    // Check if pathname starts with any of the protected or authRequired routes
    return protectedRoutes.some(route => pathname.startsWith(route)) ||
        authRequiredRoutes.some(route => pathname.startsWith(route));
}

// Helper function to check if route is fully protected (like /project, /issue, etc.)
function isProtectedRoute(pathname) {
    if (!pathname || typeof pathname !== 'string') {
        return false; // Return false if pathname is invalid
    }
    
    // Check if pathname starts with any of the protectedRoutes
    return protectedRoutes.some(route => pathname.startsWith(route));
}

// Middleware runs on every request
export default clerkMiddleware(async (auth, request) => {
    try {
        // Get the authentication result using Clerk's helper
        const authResult = await auth(); 
        console.log('Auth result:', authResult);
        const userId = authResult?.userId; // Extract user ID
        
        // Attempt to extract pathname safely from request
        let pathname = null;
        try {
            pathname = request?.nextUrl?.pathname;
        } catch (e) {
            console.warn('Error extracting pathname:', e);
            return NextResponse.next(); // Let request proceed in case of error
        }
        
        // Validate pathname format
        if (!pathname || typeof pathname !== 'string') {
            console.warn('Invalid or missing pathname:', pathname);
            return NextResponse.next(); // Skip processing if pathname is invalid
        }
        
        console.log('Middleware processing:', { 
            pathname, 
            userId: userId || 'NOT_FOUND',
            hasUserId: !!userId,
            requiresAuth: requiresAuth(pathname),
            isProtected: isProtectedRoute(pathname)
        });
        
        // If user is NOT authenticated and tries to access a protected/auth-required route
        if (!userId && requiresAuth(pathname)) {
            console.log('Redirecting unauthenticated user to sign-in from:', pathname);
            try {
                const signInUrl = new URL("/sign-in", request.url); // Build redirect URL
                return NextResponse.redirect(signInUrl); // Redirect to sign-in
            } catch (redirectError) {
                console.error('Error creating redirect:', redirectError);
                return NextResponse.next(); // Fallback: let request continue
            }
        }

        // If authenticated or accessing a public route, allow access
        console.log('Allowing access to:', pathname);
        return NextResponse.next();
        
    } catch (error) {
        console.error('Middleware error:', error);
        return NextResponse.next(); // Allow request to continue in case of error
    }
});

// Configure the middleware matcher to exclude static files, images, and API routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files like images (svg, png, etc.)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
