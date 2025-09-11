import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(
  async (request) => {
    try {
      const data = await request.formData();
      const file = data.get("podcast");
      const user = request.user; // from withAuth

      if (!file) {
        return NextResponse.json({ success: false, error: "No file uploaded" });
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(file.name);
      const filename = `podcast_${timestamp}${extension}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file locally
      await writeFile(filepath, buffer);

      // Save record in MongoDB
      const { db } = await connectToDatabase();
      const podcastDoc = {
        filename,
        originalName: file.name,
        url: `/uploads/${filename}`,
        studioId: new ObjectId(user.userId), // studio uploading
        createdAt: new Date(),
      };

      const result = await db.collection("podcasts").insertOne(podcastDoc);

      return NextResponse.json({
        success: true,
        uploadId: result.insertedId.toString(), // ✅ Mongo _id
        filename,
        originalName: file.name,
        url: `/uploads/${filename}`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ success: false, error: "Upload failed" });
    }
  },
  ["studio"]
); // only studios can upload
