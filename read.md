"use client";
DATABASE_URL=postgresql://daveflix:daveflix@localhost:5433/daveflix

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BiPlus } from "react-icons/bi";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

const container = {
hidden: { opacity: 0 },
show: {
opacity: 1,
transition: {
staggerChildren: 0.1,
},
},
};

const item = {
hidden: { opacity: 0, y: 20 },
show: { opacity: 1, y: 0 },
};

export default function ProfilesPage() {
const router = useRouter();
const { user, setActiveProfile, fetchUser, isLoading, initialized } =
useUserStore();
const { isAuthenticated, token, checkAuth } = useAuthStore();

// Add console logging to debug
useEffect(() => {
console.log("Current user state:", user);
console.log("Profiles:", user?.profiles);
}, [user]);

useEffect(() => {
const init = async () => {
if (!token) {
router.push("/auth/login");
return;
}

      const isAuthed = await checkAuth();
      if (!isAuthed) {
        router.push("/auth/login");
        return;
      }

      if (!initialized) {
        await fetchUser();
      }
    };
    init();

}, [token, initialized]);

// Show loading state while initializing or loading
if (!initialized || isLoading) {
return (
<div className="flex items-center justify-center min-h-screen">
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
</div>
);
}

// Add additional check for profiles
if (!user?.profiles || user.profiles.length === 0) {
return (
<div className="flex items-center justify-center min-h-screen">
<p className="text-white">No profiles found</p>
</div>
);
}

// Show nothing if not authenticated or no user
if (!isAuthenticated || !user) {
return null;
}

return (
<div className="container mx-auto px-4 py-16">
<motion.div
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
className="max-w-4xl mx-auto space-y-12" >
<div className="text-center space-y-4">
<h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
Who's Watching?
</h1>
<p className="text-gray-400 text-lg">
Choose your profile to continue
</p>
</div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8"
        >
          {Array.isArray(user.profiles) &&
            user.profiles.map((profile) => (
              <motion.div
                key={profile.id}
                variants={item}
                className="group bg-white relative"
              >
                <Button
                  onClick={() => {
                    setActiveProfile(profile);
                    router.push("/browse");
                  }}
                  className="w-full aspect-square relative rounded-2xl overflow-hidden
                  transform transition-all duration-300 group-hover:scale-105
                  group-hover:shadow-2xl group-hover:shadow-primary/20
                  focus:outline-none focus:ring-4 focus:ring-primary/30"
                >
                  <Image
                    src={profile?.avatar || "/images/default-avatar.png"}
                    alt={profile?.name || "Default Profile"}
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                  opacity-60 group-hover:opacity-40 transition-opacity duration-300"
                  />

                  <div
                    className="absolute bottom-0 left-0 right-0 p-4 text-center transform
                  transition-transform duration-300 group-hover:translate-y-0"
                  >
                    <p className="text-lg font-semibold text-white">
                      {profile?.name || "Default Profile"}
                    </p>
                    {profile?.isKids && (
                      <span
                        className="inline-block px-2 py-1 mt-2 text-xs font-medium text-primary
                      bg-primary/10 rounded-full"
                      >
                        Kids Profile
                      </span>
                    )}
                  </div>
                </Button>
                <div className="text-black">hi</div>
                <Link
                  href={`/profiles/edit/${profile?.id}`}
                  className="absolute top-2 right-2 p-2 bg-black/60 rounded-full
                  opacity-0 group-hover:opacity-100 transition-all duration-300
                  hover:bg-primary/80 hover:scale-110 transform"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </Link>
              </motion.div>
            ))}

          {user?.profiles?.length < 4 && (
            <motion.div variants={item}>
              <Link
                href="/profiles/add"
                className="group flex flex-col items-center justify-center w-full aspect-square
                  rounded-2xl border-2 border-dashed border-gray-700 hover:border-primary
                  transition-all duration-300 transform hover:scale-105
                  hover:shadow-2xl hover:shadow-primary/20"
              >
                <div className="relative">
                  <BiPlus
                    className="w-16 h-16 text-gray-600 group-hover:text-primary
                    transition-colors duration-300"
                  />
                  <div
                    className="absolute inset-0 blur-2xl bg-primary/20 opacity-0
                    group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <span
                  className="mt-4 text-gray-400 group-hover:text-primary font-medium
                  transition-colors duration-300"
                >
                  Add Profile
                </span>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>

);
}
