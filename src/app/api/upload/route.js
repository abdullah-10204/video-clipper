// import { NextRequest, NextResponse } from 'next/server';
// import { writeFile, mkdir } from 'fs/promises';
// import { existsSync } from 'fs';
// import path from 'path';

// export async function POST(request) {
//     try {
//         const data = await request.formData();
//         const file = data.get('podcast');

//         if (!file) {
//             return NextResponse.json({ success: false, error: 'No file uploaded' });
//         }

//         // Create uploads directory if it doesn't exist
//         const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
//         if (!existsSync(uploadsDir)) {
//             await mkdir(uploadsDir, { recursive: true });
//         }

//         const bytes = await file.arrayBuffer();
//         const buffer = Buffer.from(bytes);

//         // Generate unique filename
//         const timestamp = Date.now();
//         const extension = path.extname(file.name);
//         const filename = `podcast_${timestamp}${extension}`;
//         const filepath = path.join(uploadsDir, filename);

//         await writeFile(filepath, buffer);

//         return NextResponse.json({
//             success: true,
//             filename,
//             url: `/uploads/${filename}`,
//             originalName: file.name
//         });
//     } catch (error) {
//         console.error('Upload error:', error);
//         return NextResponse.json({ success: false, error: 'Upload failed' });
//     }
// }