import { NextRequest, NextResponse } from "next/server";
import { FriendshipService } from "@/lib/services/friendship.svc";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const phoneQuery = searchParams.get("phoneQuery");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (action === "search" && phoneQuery) {
      // Search for users by phone number
      const users = await FriendshipService.searchUsersByPhone(
        userId,
        phoneQuery
      );
      return NextResponse.json({ users });
    }

    // Default action: get friends
    const friends = await FriendshipService.getFriends(userId);
    return NextResponse.json({ friends });
  } catch (error) {
    console.error("Error in friendships GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, friendId } = body;

    if (!userId || !friendId) {
      return NextResponse.json(
        { error: "User ID and Friend ID are required" },
        { status: 400 }
      );
    }

    const result = await FriendshipService.addFriend(userId, friendId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in friendships POST:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to add friend" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const friendId = searchParams.get("friendId");

    if (!userId || !friendId) {
      return NextResponse.json(
        { error: "User ID and Friend ID are required" },
        { status: 400 }
      );
    }

    const result = await FriendshipService.removeFriend(userId, friendId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in friendships DELETE:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to remove friend" },
      { status: 500 }
    );
  }
}
