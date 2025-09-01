import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request) {
    // Protected routes
    const protectedRoutes = ['/dashboard', '/clip'];
    const authRoutes = ['/login', '/register'];

    const { pathname } = request.nextUrl;

    // Check if the route needs protection
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    const isAuthRoute = authRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Get token from cookies or header
    const token = request.cookies.get('auth-token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    if (isProtectedRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Verify token
        const user = verifyToken(token);
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Add user info to headers for API routes
        const response = NextResponse.next();
        response.headers.set('x-user-id', user.userId);
        response.headers.set('x-user-role', user.role);
        response.headers.set('x-user-email', user.email);

        return response;
    }

    if (isAuthRoute && token) {
        const user = verifyToken(token);
        if (user) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/clip/:path*',
        '/login',
        '/register',
        '/api/:path*'
    ]
};