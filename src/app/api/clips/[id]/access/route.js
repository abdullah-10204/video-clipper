import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

// Grant clip access to editor
export const POST = withAuth(async (request, { params }) => {
    try {
        const data = await request.json();
        const user = request.user;
        const clipId = params.id;
        const { editorEmails } = data;

        if (!Array.isArray(editorEmails) || editorEmails.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Editor emails are required'
            }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        // Verify clip belongs to agency
        const clip = await db.collection('clips').findOne({
            _id: new ObjectId(clipId),
            agencyId: new ObjectId(user.userId)
        });

        if (!clip) {
            return NextResponse.json({
                success: false,
                error: 'Clip not found'
            }, { status: 404 });
        }

        // Find editor users
        const editors = await db.collection('users').find({
            email: { $in: editorEmails },
            role: 'editor'
        }).toArray();

        const foundEmails = editors.map(e => e.email);
        const notFoundEmails = editorEmails.filter(email => !foundEmails.includes(email));

        // Create access records for existing editors
        const accessPromises = editors.map(async (editor) => {
            // Check if access already exists
            const existingAccess = await db.collection('clip_access').findOne({
                clipId: new ObjectId(clipId),
                editorId: editor._id
            });

            if (!existingAccess) {
                await db.collection('clip_access').insertOne({
                    clipId: new ObjectId(clipId),
                    editorId: editor._id,
                    agencyId: new ObjectId(user.userId),
                    grantedAt: new Date(),
                    isActive: true,
                    downloadCount: 0
                });
            }
        });

        await Promise.all(accessPromises);

        // Send invites to non-existing editors
        const invitePromises = notFoundEmails.map(async (email) => {
            const inviteToken = uuidv4();
            await db.collection('invites').insertOne({
                token: inviteToken,
                type: 'clip_access',
                clipId: new ObjectId(clipId),
                agencyId: new ObjectId(user.userId),
                recipientEmail: email,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                isUsed: false
            });

            // Send email invite
            await sendClipInviteEmail(email, {
                agencyName: user.companyName || user.email,
                clipTitle: clip.title,
                inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${inviteToken}`
            });
        });

        await Promise.all(invitePromises);

        return NextResponse.json({
            success: true,
            message: `Access granted to ${editors.length} editors, ${notFoundEmails.length} invites sent`,
            grantedToExisting: foundEmails,
            invitesSent: notFoundEmails
        });

    } catch (error) {
        console.error('Grant clip access error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to grant clip access'
        }, { status: 500 });
    }
}, ['agency']);

async function sendClipInviteEmail(email, data) {
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
        subject: `Clip Access Granted - ${data.clipTitle}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been granted access to a clip!</h2>
        <p>Hello,</p>
        <p><strong>${data.agencyName}</strong> has shared a clip with you: <strong>${data.clipTitle}</strong></p>
        <p>Click the button below to join as an editor and download the clip:</p>
        <a href="${data.inviteLink}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #2563eb); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Join as Editor</a>
        <p>This invitation expires in 7 days.</p>
        <p>Best regards,<br>The PodClip Pro Team</p>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);
}