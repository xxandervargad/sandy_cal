"use client";

import PhoneVerification from "@/components/PhoneVerification";
import Calendar from "@/components/Calendar";
import FriendsManager from "@/components/FriendsManager";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface User {
  id: string;
  phone: string;
  name: string | null;
  isPhoneVerified?: boolean;
  phoneVerifiedAt?: Date | null;
}

type TabType = "calendar" | "friends";

export default function Home() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("calendar");

  const handleVerificationSuccess = (user: User) => {
    login(user);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Sandy Cal
        </h1>
        {!isAuthenticated ? (
          <div className="max-w-2xl mx-auto">
            <PhoneVerification
              onVerificationSuccess={handleVerificationSuccess}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* User info bar */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Welcome{user?.name ? `, ${user.name}` : ""}!
                    </h2>
                    <p className="text-sm text-gray-600">
                      {user?.phone} • Verified
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                  Logout
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`flex-1 py-4 px-6 text-center font-medium rounded-tl-lg transition-colors ${
                    activeTab === "calendar"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}>
                  📅 Calendar
                </button>
                <button
                  onClick={() => setActiveTab("friends")}
                  className={`flex-1 py-4 px-6 text-center font-medium rounded-tr-lg transition-colors ${
                    activeTab === "friends"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}>
                  👥 Friends
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-0">
                {activeTab === "calendar" && (
                  <Calendar userId={user?.id || ""} />
                )}
                {activeTab === "friends" && (
                  <FriendsManager userId={user?.id || ""} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
