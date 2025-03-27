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
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import useMovieStore from "@/store/useMovieStore";

const MoviesDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { 
    fetchContentById, 
    currentContent: movie, 
    loading, 
    error,
    toggleWatchlist,
    toggleLike
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

  useEffect(() => {
    if (id) {
      fetchContentById(id as string);
    }
  }, [id, fetchContentById]);

  const handleWatchlistToggle = async () => {
    if (isAuthenticated && movie) {
      try {
        await toggleWatchlist(movie.id);
        setIsInWatchlist(!isInWatchlist);
      } catch (error) {
        console.error("Error toggling watchlist:", error);
      }
    }
  };

  const handleLikeToggle = async () => {
    if (isAuthenticated && movie) {
      try {
        await toggleLike(movie.id);
        setIsLiked(!isLiked);
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    }
  };

  const handlePlayTrailer = () => {
    setShowTrailer(true);
    if (movie?.trailerType === "UPLOADED" && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleCloseTrailer = () => {
    if (movie?.trailerType === "UPLOADED" && videoRef.current) {
      videoRef.current.pause();
    }
    setShowTrailer(false);
    setIsPlaying(false);
  };

  const handleWatchFullMovie = () => {
    if (movie) {
      router.push(`/watch/${movie.id}`);
    }
  };

  const handleDownloadMovie = () => {
    // Implement download functionality based on your requirements
    if (movie) {
      // For example, if you have different quality options:
      const downloadUrl = movie.videoSD || movie.videoHD || movie.video4K || movie.videoUrl;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
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
    } else if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Format duration to hours and minutes
  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Error Loading Movie</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => fetchContentById(id as string)}>Try Again</Button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Movie Not Found</h2>
        <p className="text-muted-foreground mb-6">The movie you're looking for doesn't exist or has been removed.</p>
        <Link href="/movies">
          <Button>Browse Movies</Button>
        </Link>
      </div>
    );
  }

  const youtubeId = movie.trailerUrl ? getYoutubeVideoId(movie.trailerUrl) : null;

  return (
    <>
      <div className="relative min-h-screen">
        {/* Backdrop Image */}
        <div className="absolute inset-0 z-0">
          {movie.backdropImage ? (
            <Image
              src={movie.backdropImage}
              alt={movie.title}
              fill
              priority
              className="object-cover"
            />
          ) : movie.posterImage ? (
            <Image
              src={movie.posterImage}
              alt={movie.title}
              fill
              priority
              className="object-cover blur-sm scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-background/20 to-background" />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 pt-8 pb-16">
          <div className="container mx-auto px-4">
            {/* Back to movies link */}
            <Link href="/movies" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Movies
            </Link>

            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 lg:gap-12">
              {/* Left column - Poster and quick actions */}
              <div className="space-y-6">
                {/* Poster with glow effect */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-white/10"
                >
                  {movie.posterImage ? (
                    <Image
                      src={movie.posterImage}
                      alt={movie.title}
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
                  
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="w-full flex items-center justify-center gap-2 bg-primary/90 hover:bg-primary text-primary-foreground"
                    onClick={handleWatchFullMovie}
                  >
                    <Play className="h-5 w-5" />
                    Watch Full Movie
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="aspect-square h-12"
                      onClick={handleWatchlistToggle}
                    >
                      {isInWatchlist ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="aspect-square h-12"
                      onClick={handleLikeToggle}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="aspect-square h-12"
                      onClick={handleDownloadMovie}
                      disabled={!movie.videoUrl && !movie.videoFile && !movie.videoSD && !movie.videoHD && !movie.video4K}
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Technical details card */}
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 space-y-4">
                  <h3 className="font-medium">Movie Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="capitalize">{movie.type.replace('_', ' ').toLowerCase()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Release Year</p>
                      <p>{movie.releaseYear}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p>{formatDuration(movie.duration)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p>{movie.maturityRating}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Available Quality</p>
                    <div className="flex flex-wrap gap-2">
                      {movie.videoSD && (
                        <Badge variant="outline" className="bg-card/50">SD</Badge>
                      )}
                      {movie.videoHD && (
                        <Badge variant="outline" className="bg-card/50">HD</Badge>
                      )}
                      {movie.video4K && (
                        <Badge variant="outline" className="bg-card/50">4K</Badge>
                      )}
                      {movie.videoHDR && (
                        <Badge variant="outline" className="bg-card/50">HDR</Badge>
                      )}
                      {!movie.videoSD && !movie.videoHD && !movie.video4K && !movie.videoHDR && (
                        <span className="text-sm text-muted-foreground">Not specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Movie details */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl font-bold"
                  >
                    {movie.title}
                  </motion.h1>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-wrap items-center gap-3"
                  >
                    {movie.releaseYear && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{movie.releaseYear}</span>
                      </div>
                    )}
                    
                    {movie.duration && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{formatDuration(movie.duration)}</span>
                      </div>
                    )}
                    
                    {movie.maturityRating && (
                      <Badge variant="outline" className="border-muted-foreground">
                        {movie.maturityRating}
                      </Badge>
                    )}
                    
                    {movie.averageRating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        <span>{movie.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap gap-2"
                  >
                    {movie.genres && movie.genres.map((genre: any) => (
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
                  <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
                </motion.div>
                
                {movie.cast && movie.cast.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-semibold">Cast</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {movie.cast.map((castMember: any) => (
                        <div key={castMember.id} className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-card flex-shrink-0">
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
                      {movie.director && (
                        <div className="flex items-start gap-3">
                          <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Director</p>
                            <p>{movie.director}</p>
                          </div>
                        </div>
                      )}
                      
                      {movie.studio && (
                        <div className="flex items-start gap-3">
                          <Film className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Studio</p>
                            <p>{movie.studio}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {movie.language && (
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Language</p>
                            <p>{movie.language}</p>
                          </div>
                        </div>
                      )}
                      
                      {movie.country && (
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Country</p>
                            <p>{movie.country}</p>
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
                
                {movie?.title && (
                  <h2 className="text-white text-lg font-medium hidden md:block">
                    {movie.title} - Official Trailer
                  </h2>
                )}
                
                <div className="w-[100px]"></div> {/* Spacer for alignment */}
              </div>
              
              <div className="flex-1 w-full flex items-center justify-center px-4">
                <div className="w-full h-full max-w-[90vw] max-h-[80vh]">
                  {movie?.trailerType === "URL" && youtubeId ? (
                    <iframe
                      ref={iframeRef}
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                      title={`${movie.title} Trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                      style={{ minHeight: "70vh" }}
                    ></iframe>
                  ) : movie?.trailerType === "UPLOADED" && (movie.trailerUrl || movie.trailerFile) ? (
                    <div className="relative w-full h-full" style={{ minHeight: "70vh" }}>
                      <video
                        ref={videoRef}
                        src={movie.trailerUrl || movie.trailerFile}
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

export default MoviesDetailsPage;
