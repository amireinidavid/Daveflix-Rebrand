"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import useMovieStore from "@/store/useMovieStore";
import { Skeleton } from "@/components/ui/skeleton";

const NewReleasesPage = () => {
  const router = useRouter();
  const { content, loading, error, fetchAllContent } = useMovieStore();
  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [trendingContent, setTrendingContent] = useState<any[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("new");

  useEffect(() => {
    const fetchContent = async () => {
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
        console.error("Error fetching content:", error);
      }
    };

    fetchContent();
  }, [fetchAllContent]);

  useEffect(() => {
    // Filter content to include only new releases and trending
    if (content && content.length > 0) {
      const newReleasesFiltered = content.filter(item => item.newRelease);
      const trendingFiltered = content.filter(item => item.trending);
      
      setNewReleases(newReleasesFiltered);
      setTrendingContent(trendingFiltered);
    }
  }, [content]);

  const handleCardClick = (id: string) => {
    const item = [...newReleases, ...trendingContent].find(item => item.id === id);
    if (item) {
      if (item.type === "TV_SHOW") {
        router.push(`/tv/${id}`);
      } else {
        router.push(`/movies/${id}`);
      }
    }
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

  const getFeaturedContent = () => {
    if (activeTab === "new" && newReleases.length > 0) {
      return newReleases[0];
    } else if (activeTab === "trending" && trendingContent.length > 0) {
      return trendingContent[0];
    }
    return null;
  };

  const featuredContent = getFeaturedContent();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
        <div className="absolute inset-0 bg-black/40 z-10" />
        {featuredContent && (
          <Image
            src={featuredContent?.backdropImage || featuredContent?.posterImage}
            alt={featuredContent?.title || "Featured Content"}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {activeTab === "new" ? "New Releases" : "Trending Now"}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            {activeTab === "new" 
              ? "Discover the latest movies and shows that just arrived on our platform."
              : "See what everyone's watching right now - the hottest titles trending across our platform."}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="new" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>New Releases</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trending Now</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="new">
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
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {newReleases.map((item) => (
                    <motion.div
                      key={item.id}
                      className="relative group cursor-pointer"
                      variants={cardVariants}
                      onMouseEnter={() => setHoveredCard(item.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => handleCardClick(item.id)}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                        <Image
                          src={item.posterImage}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {hoveredCard === item.id && (
                          <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex space-x-2 mb-2">
                              <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/${item.type === "TV_SHOW" ? "tv" : "movies"}/${item.id}/watch`);
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
                                  router.push(`/${item.type === "TV_SHOW" ? "tv" : "movies"}/${item.id}`);
                                }}
                              >
                                <Info className="h-4 w-4 mr-1" /> Details
                              </Button>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-white/80">
                              {item.averageRating && (
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                  <span>{item.averageRating.toFixed(1)}</span>
                                </div>
                              )}
                              {item.releaseYear && (
                                <span>{item.releaseYear}</span>
                              )}
                              {item.duration && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{Math.floor(item.duration / 60)}h {item.duration % 60}m</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="secondary" className="bg-primary/20 text-xs">
                                {item.type === "TV_SHOW" ? "Series" : "Movie"}
                              </Badge>
                              {item.genres?.slice(0, 2).map((genre: any) => (
                                <Badge key={genre.id} variant="outline" className="bg-white/10 text-xs">
                                  {genre.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <h3 className="font-medium text-foreground truncate text-sm sm:text-base">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.releaseYear}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                {newReleases.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No new releases available at the moment.</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="trending">
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
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {trendingContent.map((item) => (
                    <motion.div
                      key={item.id}
                      className="relative group cursor-pointer"
                      variants={cardVariants}
                      onMouseEnter={() => setHoveredCard(item.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => handleCardClick(item.id)}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                        <Image
                          src={item.posterImage}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {hoveredCard === item.id && (
                          <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex space-x-2 mb-2">
                              <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/${item.type === "TV_SHOW" ? "tv" : "movies"}/${item.id}/watch`);
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
                                  router.push(`/${item.type === "TV_SHOW" ? "tv" : "movies"}/${item.id}`);
                                }}
                              >
                                <Info className="h-4 w-4 mr-1" /> Details
                              </Button>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-white/80">
                              {item.averageRating && (
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                  <span>{item.averageRating.toFixed(1)}</span>
                                </div>
                              )}
                              {item.releaseYear && (
                                <span>{item.releaseYear}</span>
                              )}
                              {item.duration && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{Math.floor(item.duration / 60)}h {item.duration % 60}m</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="secondary" className="bg-primary/20 text-xs">
                                {item.type === "TV_SHOW" ? "Series" : "Movie"}
                              </Badge>
                              {item.genres?.slice(0, 2).map((genre: any) => (
                                <Badge key={genre.id} variant="outline" className="bg-white/10 text-xs">
                                  {genre.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <h3 className="font-medium text-foreground truncate text-sm sm:text-base">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.releaseYear}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                {trendingContent.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No trending content available at the moment.</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewReleasesPage;