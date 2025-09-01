import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                error: 'Email and password are required'
            }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        // Find user
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Invalid credentials'
            }, { status: 401 });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({
                success: false,
                error: 'Invalid credentials'
            }, { status: 401 });
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json({
                success: false,
                error: 'Account is deactivated'
            }, { status: 403 });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        const userData = {
            id: user._id,
            email: user.email,
            role: user.role,
            companyName: user.companyName,
            permissions: user.permissions
        };

        return NextResponse.json({
            success: true,
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({
            success: false,
            error: 'Login failed'
        }, { status: 500 });
    }
}
