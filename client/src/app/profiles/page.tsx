"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { FiEdit2, FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";

const ProfilesPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
      return;
    }

    // Redirect admin without profiles directly to admin dashboard
    if (user.role === "ADMIN" && (!user.profile || user.profile.length === 0)) {
      router.replace("/admin");
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, router]);

  const handleProfileSelect = (profile: any) => {
    try {
      // Use the profile ID directly instead of the whole profile object
      useAuthStore.getState().setActiveProfile(profile.id);
      
      // Check user role and redirect accordingly
      if (user?.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/browse");
      }
    } catch (error) {
      console.error("Error selecting profile:", error);
    }
  };

  const handleEditProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    router.push(`/profiles/edit/${profileId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Get profiles from the user object
  const profiles = user?.profile || [];
  console.log("User object:", user);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-center text-4xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Who's watching?
        </h1>

        <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
          {/* Existing Profiles */}
          {Array.isArray(profiles) && profiles.map((profile) => (
            <div key={profile.id} className="group flex flex-col items-center">
              <div className="relative">
                <button
                  onClick={() => handleProfileSelect(profile)}
                  className="relative group-hover:ring-4 ring-red-600 rounded-md duration-200 overflow-hidden"
                >
                  <Image
                    src={profile.avatar || "/images/default-avatar.png"}
                    alt={profile.name}
                    width={150}
                    height={150}
                    className="rounded-md object-cover group-hover:scale-105 duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 duration-300" />
                </button>
                <button
                  onClick={(e) => handleEditProfile(e, profile.id)}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 duration-200 transform translate-y-2 group-hover:translate-y-0"
                >
                  <FiEdit2 className="text-white" size={16} />
                </button>
              </div>
              <span className="mt-3 text-lg font-medium">{profile.name}</span>
              {profile.isKids && (
                <span className="mt-1 text-xs px-2 py-1 bg-blue-500 rounded-full">
                  Kids
                </span>
              )}
            </div>
          ))}

          {/* Add Profile Button */}
          {Array.isArray(profiles) && profiles.length < 5 && (
            <div className="flex flex-col items-center">
              <button
                onClick={() => router.push("/profiles/create")}
                className="w-[150px] h-[150px] rounded-md bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center group duration-300 border-2 border-transparent hover:border-red-600"
              >
                <FiPlus
                  size={50}
                  className="text-neutral-400 group-hover:text-white duration-300"
                />
              </button>
              <span className="mt-3 text-lg font-medium">Add Profile</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilesPage;
