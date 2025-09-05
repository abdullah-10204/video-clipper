import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("video-clipper");

    const existing = await db.collection("users").findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const result = await db.collection("users").insertOne({
      email,
      password: hashed,
      role, // "STUDIO" | "AGENCY" | "EDITOR" | "CLIENT"
      createdAt: new Date(),
    });

    return res.status(201).json({ id: result.insertedId, email, role });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
