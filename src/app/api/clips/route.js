import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Clip } from "@/lib/models/Clip";

// Get clips for authenticated user
export const GET = withAuth(
  async (request) => {
    try {
      const { db } = await connectToDatabase();
      const user = request.user;
      const url = new URL(request.url);
      const podcastId = url.searchParams.get("podcastId");

      let clips = [];

      if (user.role === "studio") {
        // Studio sees all clips from their podcasts
        const query = { studioId: new ObjectId(user.userId) };
        if (podcastId) {
          query.podcastId = new ObjectId(podcastId);
        }

        clips = await db
          .collection("clips")
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
      } else if (user.role === "agency") {
        // Agency sees their own clips
        const query = { agencyId: new ObjectId(user.userId) };
        if (podcastId) {
          query.podcastId = new ObjectId(podcastId);
        }

        clips = await db
          .collection("clips")
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        // Add access count for each clip
        for (let clip of clips) {
          const accessCount = await db
            .collection("clip_access")
            .countDocuments({ clipId: clip._id, isActive: true });
          clip.editorAccessCount = accessCount;
        }
      } else if (user.role === "editor") {
        // Editor sees clips they have access to
        const accessRecords = await db
          .collection("clip_access")
          .find({
            editorId: new ObjectId(user.userId),
            isActive: true,
          })
          .toArray();

        if (accessRecords.length > 0) {
          const clipIds = accessRecords.map((record) => record.clipId);
          clips = await db
            .collection("clips")
            .find({ _id: { $in: clipIds } })
            .sort({ createdAt: -1 })
            .toArray();

          // Add download info
          clips = clips.map((clip) => {
            const access = accessRecords.find(
              (record) => record.clipId.toString() === clip._id.toString()
            );
            return {
              ...clip,
              downloadCount: access?.downloadCount || 0,
              lastDownloadAt: access?.lastDownloadAt,
            };
          });
        }
      }

      // Populate podcast info for clips
      if (clips.length > 0) {
        const podcastIds = [...new Set(clips.map((clip) => clip.podcastId))];
        const podcasts = await db
          .collection("podcasts")
          .find({ _id: { $in: podcastIds } })
          .toArray();

        clips = clips.map((clip) => ({
          ...clip,
          podcastInfo: podcasts.find(
            (p) => p._id.toString() === clip.podcastId.toString()
          ),
        }));
      }

      return NextResponse.json({
        success: true,
        clips,
      });
    } catch (error) {
      console.error("Get clips error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch clips",
        },
        { status: 500 }
      );
    }
  },
  ["studio", "agency", "editor"]
);

// Create new clip (agency + studio)
export const POST = withAuth(
  async (request) => {
    try {
      const data = await request.json();
      const user = request.user;

      const { db } = await connectToDatabase();

      // If it's an agency, verify they have access to the podcast
      if (user.role === "agency") {
        const access = await db.collection("podcast_access").findOne({
          podcastId: new ObjectId(data.podcastId),
          agencyId: new ObjectId(user.userId),
          isActive: true,
        });

        if (!access) {
          return NextResponse.json(
            { success: false, error: "No access to this podcast" },
            { status: 403 }
          );
        }
      }

      // Get studio ID from podcast
      const podcast = await db.collection("podcasts").findOne({
        _id: new ObjectId(data.podcastId),
      });

      if (!podcast) {
        return NextResponse.json(
          { success: false, error: "Podcast not found" },
          { status: 404 }
        );
      }

      const clip = new Clip({
        ...data,
        agencyId: user.role === "agency" ? new ObjectId(user.userId) : null,
        studioId: podcast.studioId || new ObjectId(user.userId),
      });

      const result = await db.collection("clips").insertOne(clip);

      return NextResponse.json({
        success: true,
        clipId: result.insertedId,
        clip: { ...clip, _id: result.insertedId },
      });
    } catch (error) {
      console.error("Create clip error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create clip" },
        { status: 500 }
      );
    }
  },
  ["agency", "studio"]
);
