"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaPlay, FaInfoCircle, FaTrash } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";

import useMovieStore from "@/store/useMovieStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const WatchlistPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { watchlist, loading, error, getWatchlist, toggleWatchlist } = useMovieStore();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (!user?.activeProfile) {
      router.replace("/profiles");
      return;
    }

    getWatchlist();
  }, [isAuthenticated, user, router, getWatchlist]);

  const handleRemove = async (contentId: string) => {
    try {
      setIsRemoving(contentId);
      await toggleWatchlist(contentId);
      await getWatchlist(); // Refresh the list
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    } finally {
      setIsRemoving(null);
    }
  };

  const handlePlay = (contentId: string) => {
    router.push(`/watch/${contentId}`);
  };

  const handleDetails = (contentId: string) => {
    router.push(`/movies/${contentId}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading && watchlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-white">My Watchlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden bg-gray-800/50">
              <Skeleton className="w-full h-64" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-white">My Watchlist</h1>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}
      
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 mb-6 opacity-30">
            <Image 
              src="/images/empty-watchlist.png" 
              alt="Empty watchlist" 
              width={96} 
              height={96}
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Your watchlist is empty</h2>
          <p className="text-gray-400 mb-8 max-w-md">
            Browse our collection and add titles to your watchlist to watch later.
          </p>
          <Button 
            onClick={() => router.push('/browse')}
            className="bg-primary hover:bg-primary/90"
          >
            Browse Content
          </Button>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          {watchlist.map((item) => (
            <motion.div 
              key={item.id} 
              className="bg-gray-900/60 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <Image
                  src={item.content.posterImage || '/images/placeholder.png'}
                  alt={item.content.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex space-x-2 mb-4">
                    <Button 
                      size="sm" 
                      className="bg-white text-black hover:bg-white/90 flex items-center gap-2"
                      onClick={() => handlePlay(item.content.id)}
                    >
                      <FaPlay size={12} />
                      Play
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-white text-white hover:bg-white/20"
                      onClick={() => handleDetails(item.content.id)}
                    >
                      <FaInfoCircle size={14} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500/20 ml-auto"
                      onClick={() => handleRemove(item.content.id)}
                      disabled={isRemoving === item.content.id}
                    >
                      {isRemoving === item.content.id ? (
                        <BiLoaderAlt className="animate-spin" size={14} />
                      ) : (
                        <FaTrash size={14} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">
                  {item.content.title}
                </h3>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {item.content.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.content.releaseYear}
                  </Badge>
                  {item.content.maturityRating && (
                    <Badge variant="outline" className="text-xs">
                      {item.content.maturityRating}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {item.content.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.content.genres?.slice(0, 3).map((genre) => (
                    <span 
                      key={genre.id} 
                      className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default WatchlistPage;
