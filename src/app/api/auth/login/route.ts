import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { generateToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing email or password" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("video-clipper"); // same as signup
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Create JWT
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
