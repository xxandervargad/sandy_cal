import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user.svc";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, code, name } = body;

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: "Phone number and verification code are required" },
        { status: 400 }
      );
    }

    const user = await UserService.verifyPhoneAndCreateUser(
      phoneNumber,
      code,
      name
    );

    // Create session after successful verification
    await createSession(user);

    return NextResponse.json(
      {
        message: "Phone number verified successfully",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in verify-code route:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
