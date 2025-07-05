import { NextRequest, NextResponse } from "next/server";
import { DateRatingService } from "@/lib/services/daterating.svc";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const includeFriends = searchParams.get("includeFriends") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    let ratings;
    let friendsRatings: any[] = [];

    if (year && month) {
      // Get ratings for specific month
      if (includeFriends) {
        const result = await DateRatingService.getUserAndFriendsRatingsForMonth(
          userId,
          parseInt(year),
          parseInt(month)
        );
        ratings = result.userRatings;
        friendsRatings = result.friendsRatings;
      } else {
        ratings = await DateRatingService.getUserRatingsForMonth(
          userId,
          parseInt(year),
          parseInt(month)
        );
      }
    } else if (startDate && endDate) {
      // Get ratings for date range
      ratings = await DateRatingService.getUserRatingsInRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      );

      if (includeFriends) {
        friendsRatings = await DateRatingService.getFriendsRatingsInRange(
          userId,
          new Date(startDate),
          new Date(endDate)
        );
      }
    } else {
      // Get all ratings for user
      ratings = await DateRatingService.getAllUserRatings(userId);
    }

    return NextResponse.json({
      ratings,
      friendsRatings: includeFriends ? friendsRatings : undefined,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date, rating } = body;

    if (!userId || !date || rating === undefined) {
      return NextResponse.json(
        { error: "User ID, date, and rating are required" },
        { status: 400 }
      );
    }

    if (typeof rating !== "number") {
      return NextResponse.json(
        { error: "Rating must be a number" },
        { status: 400 }
      );
    }

    const dayRating = await DateRatingService.upsertDayRating(
      userId,
      new Date(date),
      rating
    );

    return NextResponse.json({ rating: dayRating }, { status: 200 });
  } catch (error) {
    console.error("Error creating/updating rating:", error);
    return NextResponse.json(
      { error: "Failed to create/update rating" },
      { status: 500 }
    );
  }
}
