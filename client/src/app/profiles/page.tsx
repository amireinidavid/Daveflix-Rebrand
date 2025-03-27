"use client";

import React from "react";
import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";
import { FiEdit2, FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";

const ProfilesPage = () => {
  const { user, setActiveProfile } = useUserStore();
  const router = useRouter();

  const handleProfileSelect = (profile: any) => {
    setActiveProfile(profile);
    // Check user role and redirect accordingly
    if (user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/browse");
    }
  };

  const handleEditProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    router.push(`/profiles/edit/${profileId}`);
  };

  console.log(user);

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  // Redirect admin without profiles directly to admin dashboard
  if (user.role === "ADMIN" && (!user.profiles || user.profiles.length === 0)) {
    router.push("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-center text-4xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Who's watching?
        </h1>

        <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
          {/* Existing Profiles */}
          {user.profiles.map((profile) => (
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
                  <FiEdit2 size={16} />
                </button>
              </div>
              <span className="mt-4 text-lg font-medium text-gray-400 group-hover:text-white duration-200">
                {profile.name}
              </span>
            </div>
          ))}

          {/* Add Profile Button */}
          {user.profiles.length < (user.subscription?.maxProfiles || 5) && (
            <div className="flex flex-col items-center">
              <button
                onClick={() => router.push("/profiles/new")}
                className="w-[150px] h-[150px] rounded-md border-2 border-gray-600 flex items-center justify-center hover:border-red-600 hover:bg-red-600/10 duration-300 group"
              >
                <FiPlus
                  size={40}
                  className="text-gray-600 group-hover:text-red-600 duration-300"
                />
              </button>
              <span className="mt-4 text-lg font-medium text-gray-400 group-hover:text-white duration-200">
                Add Profile
              </span>
            </div>
          )}
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => router.push("/profiles/manage")}
            className="px-8 py-3 text-lg border-2 border-gray-600 hover:border-white hover:bg-white/5 rounded-md duration-300 tracking-wide"
          >
            Manage Profiles
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilesPage;
