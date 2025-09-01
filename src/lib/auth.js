import jwt from 'jsonwebtoken';

export function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Middleware to verify authentication
export function withAuth(handler, allowedRoles = []) {
    return async (request) => {
        try {
            const token = request.headers.get('authorization')?.replace('Bearer ', '');

            if (!token) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'No token provided'
                }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const decoded = verifyToken(token);
            if (!decoded) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Invalid token'
                }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Check role permissions
            if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Insufficient permissions'
                }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Add user info to request
            request.user = decoded;

            return handler(request);
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Authentication failed'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    };
}