import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(
  async (request) => {
    try {
      return NextResponse.json({
        success: true,
        user: request.user, // comes from token
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch user" },
        { status: 500 }
      );
    }
  },
  ["studio", "agency", "editor"]
);
