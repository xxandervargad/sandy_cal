import { prisma } from "@/lib/prisma";

export class FriendshipService {
  /**
   * Add a friend relationship between two users
   * Creates bidirectional friendship records
   */
  static async addFriend(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new Error("Cannot add yourself as a friend");
    }

    // Check if friendship already exists
    const existingFriendship = await this.areFriends(userId, friendId);
    if (existingFriendship) {
      throw new Error("Friendship already exists");
    }

    // Create both directions of the friendship
    await prisma.$transaction([
      prisma.friendship.create({
        data: {
          userId,
          friendId,
        },
      }),
      prisma.friendship.create({
        data: {
          userId: friendId,
          friendId: userId,
        },
      }),
    ]);

    return { success: true, message: "Friend added successfully" };
  }

  /**
   * Remove a friend relationship between two users
   * Removes both directions of the friendship
   */
  static async removeFriend(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new Error("Cannot remove yourself as a friend");
    }

    // Remove both directions of the friendship
    await prisma.$transaction([
      prisma.friendship.deleteMany({
        where: {
          userId,
          friendId,
        },
      }),
      prisma.friendship.deleteMany({
        where: {
          userId: friendId,
          friendId: userId,
        },
      }),
    ]);

    return { success: true, message: "Friend removed successfully" };
  }

  /**
   * Check if two users are friends
   */
  static async areFriends(userId: string, friendId: string): Promise<boolean> {
    if (userId === friendId) {
      return false;
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        userId,
        friendId,
      },
    });

    return !!friendship;
  }

  /**
   * Get all friends of a user
   */
  static async getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: {
        userId,
      },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return friendships.map((friendship) => ({
      id: friendship.friend.id,
      name: friendship.friend.name,
      phone: friendship.friend.phone,
      createdAt: friendship.friend.createdAt,
      friendshipCreatedAt: friendship.createdAt,
    }));
  }

  /**
   * Get friend IDs for a user (useful for quick lookups)
   */
  static async getFriendIds(userId: string): Promise<string[]> {
    const friendships = await prisma.friendship.findMany({
      where: {
        userId,
      },
      select: {
        friendId: true,
      },
    });

    return friendships.map((friendship) => friendship.friendId);
  }

  /**
   * Search for users by phone number (excluding current user and existing friends)
   */
  static async searchUsersByPhone(currentUserId: string, phoneQuery: string) {
    // Get current user's friend IDs
    const friendIds = await this.getFriendIds(currentUserId);

    // Search for users by phone, excluding current user and existing friends
    const users = await prisma.user.findMany({
      where: {
        phone: {
          contains: phoneQuery,
        },
        id: {
          not: currentUserId,
          notIn: friendIds,
        },
        isPhoneVerified: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
      },
      take: 10, // Limit results
    });

    return users;
  }
}
