import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
    try {
        const { email, password, role, companyName } = await request.json();

        if (!email || !password || !role) {
            return NextResponse.json({
                success: false,
                error: 'Email, password, and role are required'
            }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return NextResponse.json({
                success: false,
                error: 'User already exists with this email'
            }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = {
            email,
            password: hashedPassword,
            role, // 'studio', 'agency', 'editor'
            companyName: companyName || null,
            createdAt: new Date(),
            isActive: true,
            permissions: getDefaultPermissions(role)
        };

        const result = await db.collection('users').insertOne(user);

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: result.insertedId,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        const userData = {
            id: result.insertedId,
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
        console.error('Registration error:', error);
        return NextResponse.json({
            success: false,
            error: 'Registration failed'
        }, { status: 500 });
    }
}

function getDefaultPermissions(role) {
    switch (role) {
        case 'studio':
            return {
                canUpload: true,
                canShare: true,
                canManagePodcasts: true,
                canViewAnalytics: true
            };
        case 'agency':
            return {
                canCreateClips: true,
                canShareClips: true,
                canManageEditors: true,
                canViewAssignedPodcasts: true
            };
        case 'editor':
            return {
                canDownloadClips: true,
                canViewAssignedClips: true
            };
        default:
            return {};
    }
}
