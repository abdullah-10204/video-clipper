import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'No token provided'
            }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({
                success: false,
                error: 'Invalid token'
            }, { status: 401 });
        }

        const { db } = await connectToDatabase();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(decoded.userId) },
            { projection: { password: 0 } }
        );

        if (!user || !user.isActive) {
            return NextResponse.json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                companyName: user.companyName,
                permissions: user.permissions
            }
        });

    } catch (error) {
        console.error('Auth verification error:', error);
        return NextResponse.json({
            success: false,
            error: 'Authentication failed'
        }, { status: 401 });
    }
}