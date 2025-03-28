"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import useMovieStore from "@/store/useMovieStore";
import { Skeleton } from "@/components/ui/skeleton";

const TvShowsPage = () => {
  const router = useRouter();
  const { content, loading, error, fetchAllContent } = useMovieStore();
  const [tvShows, setTvShows] = useState<any[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchTvShows = async () => {
      try {
        // Import auth store to check authentication
        const { useAuthStore } = await import('@/store/useAuthStore');
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        
        // If not authenticated, check auth status
        if (!isAuthenticated) {
          const checkAuth = useAuthStore.getState().checkAuth;
          await checkAuth();
        }
        
        await fetchAllContent();
      } catch (error) {
        console.error("Error fetching TV shows:", error);
      }
    };

    fetchTvShows();
  }, [fetchAllContent]);

  useEffect(() => {
    // Filter content to only include TV shows
    if (content && content.length > 0) {
      const filteredShows = content.filter(item => item.type === "TV_SHOW");
      setTvShows(filteredShows);
    }
  }, [content]);

  const handleCardClick = (id: string) => {
    router.push(`/tv/${id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
        <div className="absolute inset-0 bg-black/40 z-10" />
        {tvShows.length > 0 && (
          <Image
            src={tvShows[0]?.backdropImage || tvShows[0]?.posterImage}
            alt={tvShows[0]?.title || "TV Shows"}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            TV Shows
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Discover the latest and greatest television series from around the world.
            From drama to comedy, sci-fi to documentary - find your next binge-worthy show.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => fetchAllContent()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-6">All TV Shows</h2>
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {tvShows.map((show) => (
                <motion.div
                  key={show.id}
                  className="relative group cursor-pointer"
                  variants={cardVariants}
                  onMouseEnter={() => setHoveredCard(show.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleCardClick(show.id)}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <Image
                      src={show.posterImage}
                      alt={show.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {hoveredCard === show.id && (
                      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex space-x-2 mb-2">
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/tv/${show.id}/watch`);
                            }}
                          >
                            <Play className="h-4 w-4 mr-1" /> Play
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-white/10 hover:bg-white/20 border-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/tv/${show.id}`);
                            }}
                          >
                            <Info className="h-4 w-4 mr-1" /> Details
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-white/80">
                          {show.averageRating && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 mr-1" />
                              <span>{show.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                          {show.releaseYear && (
                            <span>{show.releaseYear}</span>
                          )}
                          {show.seasons && (
                            <span>{show.seasons.length} Seasons</span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {show.genres?.slice(0, 2).map((genre: any) => (
                            <Badge key={genre.id} variant="outline" className="bg-white/10 text-xs">
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <h3 className="font-medium text-foreground truncate text-sm sm:text-base">{show.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{show.releaseYear}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default TvShowsPage;
