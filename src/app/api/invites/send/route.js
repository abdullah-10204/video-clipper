import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        const decoded = verifyToken(token);

        if (!decoded || decoded.role !== 'studio') {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 403 });
        }

        const { podcastId, agencyEmail } = await request.json();

        if (!podcastId || !agencyEmail) {
            return NextResponse.json({
                success: false,
                error: 'Podcast ID and agency email are required'
            }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        // Verify podcast belongs to user
        const podcast = await db.collection('podcasts').findOne({
            _id: new ObjectId(podcastId),
            studioId: new ObjectId(decoded.userId)
        });

        if (!podcast) {
            return NextResponse.json({
                success: false,
                error: 'Podcast not found'
            }, { status: 404 });
        }

        // Create invite token
        const inviteToken = uuidv4();
        const invite = {
            token: inviteToken,
            podcastId: new ObjectId(podcastId),
            studioId: new ObjectId(decoded.userId),
            agencyEmail,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            isUsed: false
        };

        await db.collection('invites').insertOne(invite);

        // Send email
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${inviteToken}`;

        await sendInviteEmail(agencyEmail, {
            studioName: decoded.companyName || decoded.email,
            podcastTitle: podcast.title,
            inviteLink
        });

        return NextResponse.json({
            success: true,
            message: 'Invite sent successfully'
        });

    } catch (error) {
        console.error('Invite sending error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to send invite'
        }, { status: 500 });
    }
}

async function sendInviteEmail(email, data) {
    const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: `Podcast Access Granted - ${data.podcastTitle}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been granted access to a podcast!</h2>
        <p>Hello,</p>
        <p><strong>${data.studioName}</strong> has granted you access to their podcast: <strong>${data.podcastTitle}</strong></p>
        <p>Click the button below to accept the invitation and start creating clips:</p>
        <a href="${data.inviteLink}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #2563eb); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Accept Invitation</a>
        <p>This invitation expires in 7 days.</p>
        <p>Best regards,<br>The PodClip Pro Team</p>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);
}
