import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Hello from the API!",
    timestamp: new Date().toISOString(),
    status: "success",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      message: "Data received successfully!",
      receivedData: body,
      timestamp: new Date().toISOString(),
      status: "success",
    });
  } catch {
    return NextResponse.json(
      {
        message: "Invalid JSON data",
        status: "error",
      },
      { status: 400 }
    );
  }
}
