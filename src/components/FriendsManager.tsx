"use client";

import { useState, useEffect, useRef } from "react";

interface Friend {
  id: string;
  name: string | null;
  phone: string;
  createdAt: Date;
  friendshipCreatedAt: Date;
}

interface User {
  id: string;
  name: string | null;
  phone: string;
  createdAt: Date;
}

interface FriendsManagerProps {
  userId: string;
}

export default function FriendsManager({ userId }: FriendsManagerProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [phoneQuery, setPhoneQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFriends();
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (phoneQuery.trim()) {
        searchUsers();
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [phoneQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/friendships?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      setIsSearching(true);
      const response = await fetch(
        `/api/friendships?userId=${userId}&action=search&phoneQuery=${encodeURIComponent(
          phoneQuery
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
        setShowDropdown(data.users?.length > 0);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addFriend = async (friendId: string) => {
    try {
      const response = await fetch("/api/friendships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          friendId,
        }),
      });

      if (response.ok) {
        await fetchFriends();
        setSearchResults([]);
        setPhoneQuery("");
        setShowDropdown(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add friend");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("Failed to add friend");
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/friendships?userId=${userId}&friendId=${friendId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchFriends();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Failed to remove friend");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Friends</h2>

      {/* Search Section */}
      <div className="mb-6 relative">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Add Friends
        </h3>
        <div className="relative">
          <input
            ref={searchRef}
            type="text"
            value={phoneQuery}
            onChange={(e) => setPhoneQuery(e.target.value)}
            onFocus={() => phoneQuery && setShowDropdown(true)}
            placeholder="Search by phone number..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSearching && (
            <div className="absolute right-3 top-3">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-sm">
                {isSearching ? "Searching..." : "No users found"}
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-100 last:border-b-0"
                  onClick={() => addFriend(user.id)}>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.name || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </div>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Friends List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Your Friends ({friends.length})
        </h3>

        {isLoading ? (
          <div className="text-center py-4">Loading friends...</div>
        ) : friends.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No friends yet. Search for friends by phone number above.
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <span className="font-medium">
                    {friend.name || "Unknown"}
                  </span>
                  <span className="text-gray-500 ml-2">{friend.phone}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    Friends since{" "}
                    {new Date(friend.friendshipCreatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => removeFriend(friend.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
