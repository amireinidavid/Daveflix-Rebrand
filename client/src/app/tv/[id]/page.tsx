"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Play, 
  Star, 
  Clock, 
  Calendar, 
  Info, 
  Plus, 
  Check, 
  Heart, 
  Share2, 
  Download, 
  Volume2, 
  VolumeX,
  Maximize,
  Pause,
  ChevronLeft,
  Loader2,
  Globe,
  Film,
  Award,
  Users,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import useMovieStore from "@/store/useMovieStore";

const TVShowDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { 
    fetchContentById, 
    currentContent: tvShow, 
    loading, 
    error,
    toggleWatchlist,
    toggleLike,
    fetchTVShowSeasons,
    fetchSeasonDetails,
    currentSeason,
    currentEpisode,
    seasons
  } = useMovieStore();
  const { isAuthenticated } = useAuthStore();
  
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSeasonTab, setActiveSeasonTab] = useState<string>("1");
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (id) {
      fetchContentById(id as string);
    }
  }, [id, fetchContentById]);

  useEffect(() => {
    if (tvShow && tvShow.type === "TV_SHOW" && tvShow.seasons && tvShow.seasons.length > 0) {
      // Set the active tab to the first season
      setActiveSeasonTab(tvShow.seasons[0].seasonNumber.toString());
      
      // Fetch details for the first season
      fetchSeasonDetails(tvShow.id, tvShow.seasons[0].seasonNumber);
    }
  }, [tvShow, fetchSeasonDetails]);

  const handleWatchlistToggle = async () => {
    if (isAuthenticated && tvShow) {
      try {
        await toggleWatchlist(tvShow.id);
        setIsInWatchlist(!isInWatchlist);
      } catch (error) {
        console.error("Error toggling watchlist:", error);
      }
    }
  };

  const handleLikeToggle = async () => {
    if (isAuthenticated && tvShow) {
      try {
        await toggleLike(tvShow.id);
        setIsLiked(!isLiked);
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    }
  };

  const handlePlayTrailer = () => {
    setShowTrailer(true);
    setIsPlaying(true);
  };

  const handleCloseTrailer = () => {
    setShowTrailer(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const extractYouTubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = tvShow?.trailerUrl ? extractYouTubeId(tvShow.trailerUrl) : null;

  const handleSeasonChange = (seasonNumber: string) => {
    setActiveSeasonTab(seasonNumber);
    if (tvShow) {
      fetchSeasonDetails(tvShow.id, parseInt(seasonNumber));
    }
  };

  const handlePlayEpisode = (episodeId: string) => {
    router.push(`/watch/${tvShow?.id}/season/${currentSeason?.seasonNumber}/episode/${episodeId}`);
  };

  if (loading && !tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !tvShow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading TV Show</h1>
        <p className="text-muted-foreground mb-6">{error || "TV Show not found"}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Hero section with backdrop */}
        <div 
          className="relative w-full bg-cover bg-center pt-24 pb-12"
          style={{
            backgroundImage: tvShow.backdropImage 
              ? `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${tvShow.backdropImage})`
              : 'none',
            backgroundColor: !tvShow.backdropImage ? 'rgba(0,0,0,0.8)' : 'transparent'
          }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left column - Poster and quick actions */}
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-white/10"
                >
                  {tvShow.posterImage ? (
                    <Image
                      src={tvShow.posterImage}
                      alt={tvShow.title}
                      fill
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-card flex items-center justify-center">
                      <span className="text-muted-foreground">No Image</span>
                    </div>
                  )}
                </motion.div>

                {/* Quick action buttons */}
                <div className="space-y-3">
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handlePlayTrailer}
                  >
                    <Play className="h-5 w-5" />
                    Watch Trailer
                  </Button>
                  
                  {currentSeason && currentSeason.episodes && currentSeason.episodes.length > 0 && (
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full flex items-center justify-center gap-2 bg-primary/90 hover:bg-primary text-primary-foreground"
                      onClick={() => handlePlayEpisode(currentSeason.episodes[0].id)}
                    >
                      <Play className="h-5 w-5" />
                      Watch First Episode
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="aspect-square h-auto py-4 flex flex-col items-center justify-center gap-1 border-white/10 hover:bg-white/10"
                      onClick={handleWatchlistToggle}
                    >
                      {isInWatchlist ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                      <span className="text-xs">My List</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="aspect-square h-auto py-4 flex flex-col items-center justify-center gap-1 border-white/10 hover:bg-white/10"
                      onClick={handleLikeToggle}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-xs">Like</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="aspect-square h-auto py-4 flex flex-col items-center justify-center gap-1 border-white/10 hover:bg-white/10"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="text-xs">Share</span>
                    </Button>
                  </div>
                </div>
                
                {/* Technical details */}
                <div className="space-y-6 bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="capitalize">TV Show</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Release Year</p>
                      <p>{tvShow.releaseYear}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Seasons</p>
                      <p>{tvShow.seasons?.length || 0}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p>{tvShow.maturityRating}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Available Quality</p>
                    <div className="flex flex-wrap gap-2">
                      {tvShow.videoSD && (
                        <Badge variant="outline" className="bg-card/50">SD</Badge>
                      )}
                      {tvShow.videoHD && (
                        <Badge variant="outline" className="bg-card/50">HD</Badge>
                      )}
                      {tvShow.video4K && (
                        <Badge variant="outline" className="bg-card/50">4K</Badge>
                      )}
                      {tvShow.videoHDR && (
                        <Badge variant="outline" className="bg-card/50">HDR</Badge>
                      )}
                      {!tvShow.videoSD && !tvShow.videoHD && !tvShow.video4K && !tvShow.videoHDR && (
                        <span className="text-sm text-muted-foreground">Not specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - TV Show details */}
              <div className="md:col-span-2 space-y-8">
                <div className="space-y-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl font-bold"
                  >
                    {tvShow.title}
                  </motion.h1>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-wrap items-center gap-3"
                  >
                    {tvShow.releaseYear && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{tvShow.releaseYear}</span>
                      </div>
                    )}
                    
                    {tvShow.seasons && (
                      <div className="flex items-center">
                        <Film className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{tvShow.seasons.length} Seasons</span>
                      </div>
                    )}
                    
                    {tvShow.maturityRating && (
                      <Badge variant="outline" className="border-muted-foreground">
                        {tvShow.maturityRating}
                      </Badge>
                    )}
                    
                    {tvShow.averageRating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        <span>{tvShow.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap gap-2"
                  >
                    {tvShow.genres && tvShow.genres.map((genre: any) => (
                      <Badge key={genre.id || genre.name} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold">Synopsis</h2>
                  <p className="text-muted-foreground leading-relaxed">{tvShow.description}</p>
                </motion.div>
                
                {/* Seasons and Episodes Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold">Seasons & Episodes</h2>
                  
                  {tvShow.seasons && tvShow.seasons.length > 0 ? (
                    <Tabs 
                      defaultValue={activeSeasonTab} 
                      onValueChange={(value) => {
                        setActiveSeasonTab(value);
                        fetchSeasonDetails(tvShow.id, parseInt(value));
                      }}
                      className="w-full"
                    >
                      <TabsList className="mb-4 flex flex-wrap">
                        {tvShow.seasons.map((season: any) => (
                          <TabsTrigger 
                            key={season.id} 
                            value={season.seasonNumber.toString()}
                            className="data-[state=active]:bg-primary"
                          >
                            Season {season.seasonNumber}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {tvShow.seasons.map((season: any) => (
                        <TabsContent 
                          key={season.id} 
                          value={season.seasonNumber.toString()}
                          className="space-y-4"
                        >
                          {season.overview && (
                            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                              <p className="text-sm text-muted-foreground">{season.overview}</p>
                            </div>
                          )}
                          
                          {currentSeason && currentSeason.episodes ? (
                            <div className="space-y-4">
                              {currentSeason.episodes.map((episode: any) => (
                                <div 
                                  key={episode.id}
                                  className="bg-card/30 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 hover:bg-card/50 transition-colors"
                                >
                                  <div className="flex flex-col md:flex-row">
                                    {/* Episode thumbnail */}
                                    <div className="relative w-full md:w-64 h-40">
                                      {episode.thumbnailImage ? (
                                        <Image
                                          src={episode.thumbnailImage}
                                          alt={episode.title}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                          <Film className="h-10 w-10 text-muted-foreground" />
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          className="rounded-full bg-white/20 hover:bg-white/30 text-white"
                                          onClick={() => router.push(`/watch/${tvShow.id}?season=${season.seasonNumber}&episode=${episode.episodeNumber}`)}
                                        >
                                          <Play className="h-6 w-6" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    {/* Episode details */}
                                    <div className="p-4 flex-1">
                                      <div className="flex items-center justify-between mb-2">
                                        <div>
                                          <span className="text-sm text-muted-foreground">Episode {episode.episodeNumber}</span>
                                          <h3 className="text-lg font-medium">{episode.title}</h3>
                                        </div>
                                        {episode.duration && (
                                          <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4 mr-1" />
                                            <span>{Math.floor(episode.duration / 60)}m {episode.duration % 60}s</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {episode.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
                                          {episode.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-8">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <div className="bg-card/30 backdrop-blur-sm rounded-lg p-6 border border-white/10 text-center">
                      <p className="text-muted-foreground">No seasons available for this TV show.</p>
                    </div>
                  )}
                </motion.div>
                
                {/* Cast Section */}
                {tvShow.cast && tvShow.cast.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-semibold">Cast</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {tvShow.cast.map((castMember: any) => (
                        <div key={castMember.id} className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            {castMember.profileImage ? (
                              <Image
                                src={castMember.profileImage}
                                alt={castMember.name}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <Users className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{castMember.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {castMember.character || castMember.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {tvShow.director && (
                        <div className="flex items-start gap-3">
                          <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Director</p>
                            <p>{tvShow.director}</p>
                          </div>
                        </div>
                      )}
                      
                      {tvShow.studio && (
                        <div className="flex items-start gap-3">
                          <Film className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Studio</p>
                            <p>{tvShow.studio}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {tvShow.language && (
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Language</p>
                            <p>{tvShow.language}</p>
                          </div>
                        </div>
                      )}
                      
                      {tvShow.country && (
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Country</p>
                            <p>{tvShow.country}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
          >
            <div className="w-full h-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 flex items-center"
                  onClick={handleCloseTrailer}
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Back to movie
                </Button>
                
                {tvShow?.title && (
                  <h2 className="text-white text-lg font-medium hidden md:block">
                    {tvShow.title} - Official Trailer
                  </h2>
                )}
                
                <div className="w-[100px]"></div> {/* Spacer for alignment */}
              </div>
              
              <div className="flex-1 w-full flex items-center justify-center px-4">
                <div className="w-full h-full max-w-[90vw] max-h-[80vh]">
                  {tvShow?.trailerType === "URL" && youtubeId ? (
                    <iframe
                      ref={iframeRef}
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                      title={`${tvShow.title} Trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                      style={{ minHeight: "70vh" }}
                    ></iframe>
                  ) : tvShow?.trailerType === "UPLOADED" && (tvShow.trailerUrl || tvShow.trailerFile) ? (
                    <div className="relative w-full h-full" style={{ minHeight: "70vh" }}>
                      <video
                        ref={videoRef}
                        src={tvShow.trailerUrl || tvShow.trailerFile}
                        className="w-full h-full object-contain rounded-lg"
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                      />
                      
                      {/* Video Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex flex-col space-y-2">
                          <Progress value={progress} className="h-1.5 bg-gray-600" />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/10"
                                onClick={togglePlay}
                              >
                                {isPlaying ? (
                                  <Pause className="h-6 w-6" />
                                ) : (
                                  <Play className="h-6 w-6" />
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/10"
                                onClick={toggleMute}
                              >
                                {isMuted ? (
                                  <VolumeX className="h-6 w-6" />
                                ) : (
                                  <Volume2 className="h-6 w-6" />
                                )}
                              </Button>
                              
                              {videoRef.current && (
                                <div className="text-white text-sm">
                                  {formatTime(videoRef.current.currentTime)} / {formatTime(videoRef.current.duration)}
                                </div>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:bg-white/10"
                              onClick={handleFullscreen}
                            >
                              <Maximize className="h-6 w-6" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ minHeight: "70vh" }}>
                      <p className="text-white">No trailer available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TVShowDetailsPage;
