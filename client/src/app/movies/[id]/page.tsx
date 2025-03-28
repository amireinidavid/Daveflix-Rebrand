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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import useMovieStore from "@/store/useMovieStore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const MovieDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { 
    fetchContentById, 
    currentContent: movie, 
    loading, 
    error,
    toggleWatchlist,
    toggleLike,
    watchlist,
    getWatchlist,
    getLikes
  } = useMovieStore();
  const { isAuthenticated } = useAuthStore();
  
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        await fetchContentById(id as string);
        // Also fetch the watchlist and likes to check if this movie is in them
        await Promise.all([getWatchlist(), getLikes()]);
      }
    };
    
    fetchData();
  }, [id, fetchContentById, getWatchlist, getLikes]);

  // Check if the current movie is in the watchlist whenever watchlist or movie changes
  useEffect(() => {
    if (watchlist && movie) {
      const isInList = watchlist.some(item => item.contentId === movie.id);
      setIsInWatchlist(isInList);
    }
  }, [watchlist, movie]);

  // Check if the current movie is liked
  useEffect(() => {
    if (movie?.likes && movie.likes.length > 0) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [movie]);

  const handleWatchlistToggle = async () => {
    if (isAuthenticated && movie) {
      try {
        setIsAddingToWatchlist(true);
        await toggleWatchlist(movie.id);
        setIsInWatchlist(!isInWatchlist);
        
        toast.success(isInWatchlist 
          ? "Removed from your watchlist" 
          : "Added to your watchlist"
        );
      } catch (error) {
        console.error("Error toggling watchlist:", error);
        toast.error("Failed to update watchlist");
      } finally {
        setIsAddingToWatchlist(false);
      }
    } else if (!isAuthenticated) {
      toast.error("Please sign in to add to watchlist");
    }
  };

  const handleLikeToggle = async () => {
    if (isAuthenticated && movie) {
      try {
        setIsLiking(true);
        await toggleLike(movie.id);
        setIsLiked(!isLiked);
        
        toast.success(isLiked 
          ? "Removed from your likes" 
          : "Added to your likes"
        );
      } catch (error) {
        console.error("Error toggling like:", error);
        toast.error("Failed to update like status");
      } finally {
        setIsLiking(false);
      }
    } else if (!isAuthenticated) {
      toast.error("Please sign in to like content");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie?.title || 'Check out this movie',
          text: `Check out ${movie?.title} on Daveflix`,
          url: window.location.href,
        });
        toast.success("Shared successfully");
      } catch (error) {
        console.error("Error sharing:", error);
        // User probably canceled the share
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleDownload = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to download content");
      return;
    }
    
    if (!movie) return;
    
    try {
      setIsDownloading(true);
      
      // Determine which video quality to download based on availability
      const videoUrl = movie.videoHD || movie.videoSD || movie.videoUrl || movie.videoFile;
      
      if (!videoUrl) {
        toast.error("No downloadable content available");
        return;
      }
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${movie.title.replace(/\s+/g, '_')}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error("Failed to download content");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePlayTrailer = () => {
    setShowTrailer(true);
    
    // For uploaded videos, we need to wait for the DOM to update before playing
    setTimeout(() => {
      if (movie?.trailerType === "UPLOADED" && videoRef.current) {
        videoRef.current.muted = isMuted;
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Error playing video:", error);
            // Some browsers require user interaction before playing
            setIsPlaying(false);
          });
      }
    }, 100);
  };

  const handleCloseTrailer = () => {
    setShowTrailer(false);
    setIsPlaying(false);
    
    // Make sure to pause the video when closing
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-5xl">⚠️</div>
          <h2 className="text-2xl font-bold">Error Loading Movie</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground text-5xl">🎬</div>
          <h2 className="text-2xl font-bold">Movie Not Found</h2>
          <p className="text-muted-foreground">The movie you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/movies')}>Browse Movies</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Backdrop */}
      <div className="relative w-full h-[70vh]">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        {movie.backdropImage ? (
          <Image
            src={movie.backdropImage}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <Image
            src={movie.posterImage}
            alt={movie.title}
            fill
            className="object-cover object-top"
            priority
          />
        )}
        
        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-40 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Poster Column */}
          <div className="md:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl"
            >
              <Image
                src={movie.posterImage}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 grid grid-cols-2 gap-3"
            >
              <Button 
                variant="default" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handlePlayTrailer}
              >
                <Play className="h-4 w-4" />
                <span>Play Trailer</span>
              </Button>
              <Button 
                variant="default" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => router.push(`/watch/${movie.id}`)}
              >
                <Play className="h-4 w-4" />
                <span>Play</span>
              </Button>
              
              <Button 
                variant={isInWatchlist ? "secondary" : "outline"}
                className={`w-full flex items-center justify-center gap-2 ${
                  isInWatchlist ? "bg-green-600 hover:bg-green-700 text-white" : ""
                }`}
                onClick={handleWatchlistToggle}
                disabled={isAddingToWatchlist}
              >
                {isAddingToWatchlist ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isInWatchlist ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{isInWatchlist ? "Added" : "Watchlist"}</span>
              </Button>
              
              <Button 
                variant={isLiked ? "secondary" : "outline"}
                className={`w-full flex items-center justify-center gap-2 ${
                  isLiked ? "bg-red-600 hover:bg-red-700 text-white" : ""
                }`}
                onClick={handleLikeToggle}
                disabled={isLiking}
              >
                {isLiking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                )}
                <span>{isLiked ? "Liked" : "Like"}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 col-span-2"
                onClick={handleDownload}
                disabled={isDownloading || !movie.videoUrl && !movie.videoFile && !movie.videoSD && !movie.videoHD}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>Download</span>
              </Button>
            </motion.div>
          </div>
          
          {/* Details Column */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
                {movie.releaseYear && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{movie.releaseYear}</span>
                  </div>
                )}
                
                {movie.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                  </div>
                )}
                
                {movie.maturityRating && (
                  <Badge variant="outline" className="text-xs">
                    {movie.maturityRating.replace('_', '-')}
                  </Badge>
                )}
                
                {movie.averageRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{movie.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              <p className="text-base text-muted-foreground mb-6">{movie.description}</p>
              
              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    <span>Genres</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <Badge key={genre.id} variant="secondary" className="text-xs">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator className="my-6" />
              
              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {movie.director && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>Director</span>
                    </h3>
                    <p className="text-muted-foreground">{movie.director}</p>
                  </div>
                )}
                
                {movie.studio && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>Studio</span>
                    </h3>
                    <p className="text-muted-foreground">{movie.studio}</p>
                  </div>
                )}
                
                {movie.language && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Language</span>
                    </h3>
                    <p className="text-muted-foreground">{movie.language}</p>
                  </div>
                )}
                
                {movie.country && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Country</span>
                    </h3>
                    <p className="text-muted-foreground">{movie.country}</p>
                  </div>
                )}
              </div>
              
              {/* Cast Section */}
              {movie.cast && movie.cast.length > 0 && (
                <>
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span>Cast</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {movie.cast.slice(0, 6).map((castMember) => (
                        <div key={castMember.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {castMember.profileImage ? (
                              <Image
                                src={castMember.profileImage}
                                alt={castMember.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <Users className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{castMember.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {castMember.character || castMember.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
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
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={handleCloseTrailer}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="w-full max-w-5xl aspect-video bg-black relative rounded-lg overflow-hidden">
              {movie?.trailerType === "URL" && movie.trailerUrl ? (
                <iframe
                  ref={iframeRef}
                  src={movie.trailerUrl}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                ></iframe>
              ) : movie?.trailerType === "UPLOADED" && movie.trailerFile ? (
                <>
                  <video
                    ref={videoRef}
                    src={movie.trailerFile}
                    className="absolute inset-0 w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                    controls={false}
                  ></video>
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <Progress value={progress} className="h-1 mb-4" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/10"
                          onClick={handlePlayPause}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/10"
                          onClick={handleMuteToggle}
                        >
                          {isMuted ? (
                            <VolumeX className="h-5 w-5" />
                          ) : (
                            <Volume2 className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={handleFullscreen}
                      >
                        <Maximize className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white">Trailer not available</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieDetailsPage;
