"use client";

import { useState, useEffect } from "react";

interface DayRating {
  id: string;
  userId: string;
  date: Date;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FriendRating {
  id: string;
  userId: string;
  date: Date;
  rating: number;
  user: {
    id: string;
    name: string | null;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarProps {
  userId: string;
}

const RATING_COLORS = {
  1: "bg-red-200 text-red-800", // Bad
  2: "bg-yellow-200 text-yellow-800", // Neutral
  3: "bg-green-200 text-green-800", // Good
};

const RATING_DOT_COLORS = {
  1: "bg-red-400", // Bad
  2: "bg-yellow-400", // Neutral
  3: "bg-green-400", // Good
};

const RATING_LABELS = {
  1: "Bad",
  2: "Neutral",
  3: "Good",
};

export default function Calendar({ userId }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [ratings, setRatings] = useState<DayRating[]>([]);
  const [friendsRatings, setFriendsRatings] = useState<FriendRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get first day of current month
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  // Get last day of current month
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  // Get first day of the week for the first day of the month
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetchRatings();
  }, [currentDate, userId]);

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/ratings?userId=${userId}&year=${currentDate.getFullYear()}&month=${currentDate.getMonth()}&includeFriends=true`
      );
      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings || []);
        setFriendsRatings(data.friendsRatings || []);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return ratings.find(
      (rating) => new Date(rating.date).toISOString().split("T")[0] === dateStr
    );
  };

  const getFriendsRatingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return friendsRatings.filter(
      (rating) => new Date(rating.date).toISOString().split("T")[0] === dateStr
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleRatingSelect = async (rating: number) => {
    if (!selectedDate) return;

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          date: selectedDate.toISOString(),
          rating,
        }),
      });

      if (response.ok) {
        await fetchRatings();
        setSelectedDate(null);
      }
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const generateCalendarDays = () => {
    const days = [];
    const currentCalendarDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const date = new Date(currentCalendarDate);
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = date.toDateString() === new Date().toDateString();
      const rating = getRatingForDate(date);
      const friendsRatingsForDate = getFriendsRatingsForDate(date);

      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(date)}
          className={`
            h-12 w-12 rounded-lg text-sm font-medium transition-colors relative
            ${!isCurrentMonth ? "text-gray-400" : "text-gray-900"}
            ${
              rating
                ? RATING_COLORS[rating.rating as keyof typeof RATING_COLORS]
                : !isCurrentMonth
                ? "bg-gray-50"
                : "bg-white hover:bg-gray-50"
            }
            ${isToday ? "ring-2 ring-blue-500" : ""}
            ${!isCurrentMonth && rating ? "opacity-50" : ""}
          `}>
          <div className="flex flex-col items-center justify-center h-full">
            <span className="leading-none">{date.getDate()}</span>

            {/* Friends' ratings dots */}
            {friendsRatingsForDate.length > 0 && (
              <div className="flex space-x-0.5 mt-1">
                {friendsRatingsForDate
                  .slice(0, 3)
                  .map((friendRating, index) => (
                    <div
                      key={`${friendRating.userId}-${index}`}
                      className={`w-1.5 h-1.5 rounded-full ${
                        RATING_DOT_COLORS[
                          friendRating.rating as keyof typeof RATING_DOT_COLORS
                        ]
                      }`}
                      title={`${
                        friendRating.user.name || friendRating.user.phone
                      }: ${
                        RATING_LABELS[
                          friendRating.rating as keyof typeof RATING_LABELS
                        ]
                      }`}
                    />
                  ))}
                {friendsRatingsForDate.length > 3 && (
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-gray-400"
                    title={`+${friendsRatingsForDate.length - 3} more`}
                  />
                )}
              </div>
            )}
          </div>
        </button>
      );

      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{monthYear}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-lg hover:bg-gray-100">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-lg hover:bg-gray-100">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {generateCalendarDays()}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-4 mb-4">
        {Object.entries(RATING_LABELS).map(([value, label]) => (
          <div key={value} className="flex items-center space-x-2">
            <div
              className={`w-4 h-4 rounded ${
                RATING_COLORS[parseInt(value) as keyof typeof RATING_COLORS]
              }`}
            />
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Rating Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Rate your day: {selectedDate.toLocaleDateString()}
            </h3>
            <div className="space-y-3">
              {Object.entries(RATING_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleRatingSelect(parseInt(value))}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    RATING_COLORS[parseInt(value) as keyof typeof RATING_COLORS]
                  } hover:opacity-80`}>
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="mt-4 w-full p-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
