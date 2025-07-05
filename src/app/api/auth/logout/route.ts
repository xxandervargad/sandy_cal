import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
