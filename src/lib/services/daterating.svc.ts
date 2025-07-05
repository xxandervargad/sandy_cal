import { prisma } from "@/lib/prisma";
import { FriendshipService } from "./friendship.svc";

export class DateRatingService {
  /**
   * Floor a date to the beginning of the day (midnight)
   */
  static floorDateToDay(date: Date): Date {
    const flooredDate = new Date(date);
    flooredDate.setHours(0, 0, 0, 0);
    return flooredDate;
  }

  /**
   * Upsert a rating for a specific day and user
   */
  static async upsertDayRating(userId: string, date: Date, rating: number) {
    const flooredDate = this.floorDateToDay(date);

    // First, try to find existing rating
    const existingRating = await prisma.dayRating.findUnique({
      where: {
        userId_date: {
          userId,
          date: flooredDate,
        },
      },
    });

    if (existingRating) {
      // Update existing rating
      return await prisma.dayRating.update({
        where: {
          userId_date: {
            userId,
            date: flooredDate,
          },
        },
        data: {
          rating,
        },
      });
    } else {
      // Create new rating
      return await prisma.dayRating.create({
        data: {
          userId,
          date: flooredDate,
          rating,
        },
      });
    }
  }

  /**
   * Get rating for a specific day and user
   */
  static async getDayRating(userId: string, date: Date) {
    const flooredDate = this.floorDateToDay(date);

    return await prisma.dayRating.findUnique({
      where: {
        userId_date: {
          userId,
          date: flooredDate,
        },
      },
    });
  }

  /**
   * Get all ratings for a user within a date range
   */
  static async getUserRatingsInRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    const flooredStartDate = this.floorDateToDay(startDate);
    const flooredEndDate = this.floorDateToDay(endDate);

    return await prisma.dayRating.findMany({
      where: {
        userId,
        date: {
          gte: flooredStartDate,
          lte: flooredEndDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });
  }

  /**
   * Get all ratings for a user in a specific month
   */
  static async getUserRatingsForMonth(
    userId: string,
    year: number,
    month: number
  ) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of the month

    return this.getUserRatingsInRange(userId, startDate, endDate);
  }

  /**
   * Get all ratings for a user
   */
  static async getAllUserRatings(userId: string) {
    return await prisma.dayRating.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  /**
   * Delete a rating for a specific day and user
   */
  static async deleteDayRating(userId: string, date: Date) {
    const flooredDate = this.floorDateToDay(date);

    return await prisma.dayRating.delete({
      where: {
        userId_date: {
          userId,
          date: flooredDate,
        },
      },
    });
  }

  /**
   * Get friends' ratings for a specific date
   */
  static async getFriendsRatingsForDate(userId: string, date: Date) {
    const flooredDate = this.floorDateToDay(date);

    // Get friend IDs
    const friendIds = await FriendshipService.getFriendIds(userId);

    if (friendIds.length === 0) {
      return [];
    }

    // Get ratings for all friends on this date
    const friendsRatings = await prisma.dayRating.findMany({
      where: {
        userId: {
          in: friendIds,
        },
        date: flooredDate,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return friendsRatings.map((rating) => ({
      id: rating.id,
      userId: rating.userId,
      date: rating.date,
      rating: rating.rating,
      user: rating.user,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    }));
  }

  /**
   * Get friends' ratings for a date range
   */
  static async getFriendsRatingsInRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    const flooredStartDate = this.floorDateToDay(startDate);
    const flooredEndDate = this.floorDateToDay(endDate);

    // Get friend IDs
    const friendIds = await FriendshipService.getFriendIds(userId);

    if (friendIds.length === 0) {
      return [];
    }

    // Get ratings for all friends in the date range
    const friendsRatings = await prisma.dayRating.findMany({
      where: {
        userId: {
          in: friendIds,
        },
        date: {
          gte: flooredStartDate,
          lte: flooredEndDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return friendsRatings.map((rating) => ({
      id: rating.id,
      userId: rating.userId,
      date: rating.date,
      rating: rating.rating,
      user: rating.user,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    }));
  }

  /**
   * Get friends' ratings for a specific month
   */
  static async getFriendsRatingsForMonth(
    userId: string,
    year: number,
    month: number
  ) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of the month

    return this.getFriendsRatingsInRange(userId, startDate, endDate);
  }

  /**
   * Get user's ratings and friends' ratings for a specific month
   */
  static async getUserAndFriendsRatingsForMonth(
    userId: string,
    year: number,
    month: number
  ) {
    const [userRatings, friendsRatings] = await Promise.all([
      this.getUserRatingsForMonth(userId, year, month),
      this.getFriendsRatingsForMonth(userId, year, month),
    ]);

    return {
      userRatings,
      friendsRatings,
    };
  }
}
