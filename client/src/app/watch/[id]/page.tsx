"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  ChevronLeft,
  Loader2,
  X,
  Info,
  Subtitles,
  Rewind,
  FastForward
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import useMovieStore from "@/store/useMovieStore";
import { cn } from "@/lib/utils";

const WatchPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { fetchContentById, currentContent: movie, loading, error } = useMovieStore();
  const { isAuthenticated } = useAuthStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressDraggingRef = useRef(false);
  
  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    if (id) {
      fetchContentById(id as string);
    }
    
    // Auto-hide controls after 3 seconds of inactivity
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      
      controlsTimerRef.current = setTimeout(() => {
        if (isPlaying && !progressDraggingRef.current) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Auto-hide info after 5 seconds
    const infoTimer = setTimeout(() => {
      setShowInfo(false);
    }, 5000);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      clearTimeout(infoTimer);
    };
  }, [id, fetchContentById, isPlaying]);

  useEffect(() => {
    // Set the best available quality as default
    if (movie) {
      if (movie.video4K) setSelectedQuality('4K');
      else if (movie.videoHD) setSelectedQuality('HD');
      else if (movie.videoSD) setSelectedQuality('SD');
      else setSelectedQuality(null);
    }
  }, [movie]);

  useEffect(() => {
    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
          e.preventDefault();
          skipForward();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipBackward();
          break;
        case 'arrowup':
          e.preventDefault();
          if (volume < 1) handleVolumeChange([Math.min(volume + 0.1, 1)]);
          break;
        case 'arrowdown':
          e.preventDefault();
          if (volume > 0) handleVolumeChange([Math.max(volume - 0.1, 0)]);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [volume, isPlaying]);

  useEffect(() => {
    // Update fullscreen state when exiting fullscreen via Escape key
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    // Set up video event listeners
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);
    const handleVideoEnded = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };
    const handleTimeUpdate = () => {
      if (!progressDraggingRef.current) {
        setCurrentTime(videoElement.currentTime);
        setProgress((videoElement.currentTime / videoElement.duration) * 100);
      }
    };
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    
    videoElement.addEventListener('play', handleVideoPlay);
    videoElement.addEventListener('pause', handleVideoPause);
    videoElement.addEventListener('ended', handleVideoEnded);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('playing', handlePlaying);
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('play', handleVideoPlay);
        videoElement.removeEventListener('pause', handleVideoPause);
        videoElement.removeEventListener('ended', handleVideoEnded);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('waiting', handleWaiting);
        videoElement.removeEventListener('playing', handlePlaying);
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error("Error playing video:", error);
        });
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, []);

  const handleProgressChange = useCallback((value: number[]) => {
    const newProgress = value[0];
    setProgress(newProgress);
    
    if (videoRef.current) {
      const newTime = (newProgress / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const handleProgressDragStart = () => {
    progressDraggingRef.current = true;
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleProgressDragEnd = () => {
    progressDraggingRef.current = false;
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
  };

  const skipForward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration);
      
      // Show a skip forward animation
      const skipElement = document.createElement('div');
      skipElement.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-4 text-white';
      skipElement.innerHTML = '+10s';
      playerRef.current?.appendChild(skipElement);
      
      setTimeout(() => {
        skipElement.remove();
      }, 800);
    }
  }, []);

  const skipBackward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
      
      // Show a skip backward animation
      const skipElement = document.createElement('div');
      skipElement.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-4 text-white';
      skipElement.innerHTML = '-10s';
      playerRef.current?.appendChild(skipElement);
      
      setTimeout(() => {
        skipElement.remove();
      }, 800);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (playerRef.current?.requestFullscreen) {
        playerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  const handleQualityChange = (quality: string) => {
    // Remember current playback position
    const currentPos = videoRef.current?.currentTime || 0;
    const wasPlaying = isPlaying;
    
    setSelectedQuality(quality);
    
    // After quality change, restore position and play state
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentPos;
        if (wasPlaying) {
          videoRef.current.play().catch(error => {
            console.error("Error playing video after quality change:", error);
          });
        }
      }
    }, 500);
  };

  const getVideoSource = () => {
    if (!movie) return '';
    
    switch (selectedQuality) {
      case '4K':
        return movie.video4K || '';
      case 'HD':
        return movie.videoHD || '';
      case 'SD':
        return movie.videoSD || movie.videoUrl || '';
      default:
        return movie.videoUrl || '';
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleBackToDetails = () => {
    router.push(`/movies/${id}`);
  };

  // YouTube ID for embedded player
  const youtubeId = movie?.videoUrl ? getYoutubeVideoId(movie.videoUrl) : null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Error Loading Video</h2>
        <p className="text-gray-300 mb-6 text-center">{error || "Movie not found"}</p>
        <div className="flex gap-4">
          <Button onClick={() => fetchContentById(id as string)}>Try Again</Button>
          <Button variant="outline" onClick={() => router.push('/movies')}>
            Back to Movies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      <div 
        ref={playerRef}
        className="relative w-full h-full"
        onClick={togglePlay}
      >
        {/* Video Player */}
        {movie.videoSourceType === "URL" && youtubeId ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={`${movie.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        ) : (
          <video
            ref={videoRef}
            src={getVideoSource()}
            className="w-full h-full object-contain bg-black"
            autoPlay
            playsInline
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          />
        )}
        
        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <Loader2 className="h-16 w-16 animate-spin text-white/70" />
          </div>
        )}
        
        {/* Movie Info Overlay */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
            >
              <h1 className="text-2xl font-bold text-white mb-2">{movie.title}</h1>
              <div className="flex items-center gap-3 text-white/80 text-sm">
                {movie.releaseYear && <span>{movie.releaseYear}</span>}
                {movie.maturityRating && (
                  <span className="border border-white/30 px-1 rounded text-xs">
                    {movie.maturityRating}
                  </span>
                )}
                {movie.duration && <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>}
                {selectedQuality && <span>{selectedQuality}</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Video Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col justify-between pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Controls */}
              <div className="p-6 bg-gradient-to-b from-black/70 to-transparent pointer-events-auto">
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 flex items-center gap-2"
                    onClick={handleBackToDetails}
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Back to details
                  </Button>
                </div>
              </div>
              
              {/* Bottom Controls */}
              <div className="p-6 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto">
                <div className="flex flex-col space-y-4">
                  {/* Progress Bar */}
                  <div className="w-full px-1 group">
                    <Slider
                      value={[progress]}
                      min={0}
                      max={100}
                      step={0.1}
                      onValueChange={handleProgressChange}
                      onValueCommitStart={handleProgressDragStart}
                      onValueCommitEnd={handleProgressDragEnd}
                      className="cursor-pointer"
                    />
                    
                    {/* Preview Thumbnails would go here in a commercial player */}
                  </div>
                  
                  {/* Control Buttons */}
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
                        onClick={skipBackward}
                      >
                        <Rewind className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={skipForward}
                      >
                        <FastForward className="h-5 w-5" />
                      </Button>
                      
                      <div className="flex items-center space-x-2 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/10"
                          onClick={toggleMute}
                          onMouseEnter={() => setShowVolumeSlider(true)}
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="h-5 w-5" />
                          ) : (
                            <Volume2 className="h-5 w-5" />
                          )}
                        </Button>
                        
                        <div 
                          className={cn(
                            "w-24 hidden sm:block transition-opacity duration-200",
                            showVolumeSlider ? "opacity-100" : "opacity-0"
                          )}
                          onMouseEnter={() => setShowVolumeSlider(true)}
                          onMouseLeave={() => setShowVolumeSlider(false)}
                        >
                          <Slider
                            value={[volume]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={handleVolumeChange}
                          />
                        </div>
                      </div>
                      
                      <div className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={() => setShowInfo(!showInfo)}
                      >
                        <Info className="h-5 w-5" />
                      </Button>
                      
                      {/* Quality Selector */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10"
                          >
                            <Settings className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Quality</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {movie.video4K && (
                            <DropdownMenuItem 
                              onClick={() => handleQualityChange('4K')}
                              className={selectedQuality === '4K' ? "bg-primary/20" : ""}
                            >
                              4K Ultra HD
                            </DropdownMenuItem>
                          )}
                          {movie.videoHD && (
                            <DropdownMenuItem 
                              onClick={() => handleQualityChange('HD')}
                              className={selectedQuality === 'HD' ? "bg-primary/20" : ""}
                            >
                              HD (1080p)
                            </DropdownMenuItem>
                          )}
                          {movie.videoSD && (
                            <DropdownMenuItem 
                              onClick={() => handleQualityChange('SD')}
                              className={selectedQuality === 'SD' ? "bg-primary/20" : ""}
                            >
                              SD (480p)
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={toggleFullscreen}
                      >
                        {isFullscreen ? (
                          <Minimize className="h-5 w-5" />
                        ) : (
                          <Maximize className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Play/Pause Overlay Animation */}
        <AnimatePresence>
          {isPlaying !== null && (
            <motion.div
              initial={{ opacity: 0.7, scale: 1.5 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/30 rounded-full p-6">
                {isPlaying ? (
                  <Play className="h-12 w-12 text-white" />
                ) : (
                  <Pause className="h-12 w-12 text-white" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WatchPage;
