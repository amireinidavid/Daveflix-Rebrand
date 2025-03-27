"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Star, Clock, Calendar, Info, Plus, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import useMovieStore from "@/store/useMovieStore";

interface MovieListCardProps {
  movie: any;
}

export default function MovieListCard({ movie }: MovieListCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { toggleWatchlist } = useMovieStore();

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAuthenticated) {
      try {
        await toggleWatchlist(movie.id);
        setIsInWatchlist(!isInWatchlist);
      } catch (error) {
        console.error("Error toggling watchlist:", error);
      }
    }
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAuthenticated) {
      setIsLiked(!isLiked);
      // Add actual like functionality here
    }
  };

  // Format duration to hours and minutes
  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <motion.div
      className="relative w-full rounded-xl overflow-hidden bg-gradient-to-b from-card to-card/80 border border-border/50 shadow-lg transition-all duration-300"
      whileHover={{ y: -8, scale: 1.03 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/movies/${movie.id}`}>
        <div className="relative aspect-[2/3] w-full">
          {movie.posterImage ? (
            <Image
              src={movie.posterImage}
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          
          {/* Glass effect overlay on hover */}
          {isHovered && (
            <div className="absolute inset-0 backdrop-blur-sm bg-black/60 flex flex-col items-center justify-center p-4 space-y-3 transition-all duration-300 animate-fade">
              <Button variant="default" size="sm" className="rounded-full w-36 shadow-glow">
                <Play className="mr-2 h-4 w-4" /> Play Now
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
                  onClick={handleWatchlistToggle}
                >
                  {isInWatchlist ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
                  onClick={handleLikeToggle}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                
                <Link href={`/movies/${movie.id}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          {/* Rating badge with glass effect */}
          {movie.averageRating && (
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white rounded-md px-2 py-1 text-xs font-medium flex items-center shadow-glow-sm">
              <Star className="h-3 w-3 text-yellow-400 mr-1" />
              {movie.averageRating.toFixed(1)}
            </div>
          )}
          
          {/* Maturity rating with glass effect */}
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-white rounded-md px-2 py-1 text-xs font-medium shadow-glow-sm">
            {movie.maturityRating}
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{movie.title}</h3>
          
          <div className="flex flex-wrap gap-2">
            {movie.genres && movie.genres.slice(0, 2).map((genre: any) => (
              <Badge key={genre.id || genre.name} variant="secondary" className="text-xs bg-secondary/50 hover:bg-secondary/70">
                {genre.name}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground space-x-3">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{movie.releaseYear}</span>
            </div>
            
            {movie.duration && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
} 