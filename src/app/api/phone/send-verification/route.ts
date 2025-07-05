import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user.svc";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const result = await UserService.sendVerificationCode(phoneNumber);

    return NextResponse.json({ message: result.message }, { status: 200 });
  } catch (error) {
    console.error("Error in send-verification route:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
