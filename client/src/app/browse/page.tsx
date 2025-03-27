"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/sections/Hero";
import MovieRow from "@/components/sections/MovieRow";
import useMovieStore from "@/store/useMovieStore";
import { Loader2 } from "lucide-react";

interface Genre {
  id: string;
  name: string;
  description?: string;
}

export default function BrowsePage() {
  const { 
    fetchFeaturedContent, 
    fetchTrendingContent, 
    fetchNewReleases, 
    fetchContentByGenre,
    fetchContinueWatching,
    fetchRecommendations,
    fetchGenres,
    featuredContent,
    trendingContent,
    newReleases,
    contentByGenre,
    continueWatching,
    recommendations,
    loading,
    error 
  } = useMovieStore();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [genreContent, setGenreContent] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      
      try {
        // First fetch all genres
        const fetchedGenres = await fetchGenres();
        
        if (fetchedGenres && fetchedGenres.length > 0) {
          setGenres(fetchedGenres);
          
          // Fetch all content types in parallel
          await Promise.all([
            fetchFeaturedContent(),
            fetchTrendingContent(),
            fetchNewReleases(),
            fetchContinueWatching(),
            fetchRecommendations()
          ]);
          
          // Fetch content for each genre separately
          const genreContentResults = await Promise.all(
            fetchedGenres.slice(0, 5).map(genre => 
              fetchContentByGenre(genre.id)
            )
          );
          
          // Create a map of genre content
          const genreMap: Record<string, any[]> = {};
          fetchedGenres.slice(0, 5).forEach((genre, index) => {
            genreMap[genre.id] = genreContentResults[index] || [];
          });
          
          setGenreContent(genreMap);
        }
      } catch (err) {
        console.error("Error loading content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [
    fetchFeaturedContent, 
    fetchTrendingContent, 
    fetchNewReleases, 
    fetchContentByGenre,
    fetchContinueWatching,
    fetchRecommendations,
    fetchGenres
  ]);

  // Use the first featured content item for the hero
  const heroContent = featuredContent && featuredContent.length > 0 
    ? featuredContent[0] 
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {heroContent && <Hero  />}

      <div className="space-y-8 pb-20">
        {continueWatching && continueWatching.length > 0 && (
          <MovieRow title="Continue Watching" movies={continueWatching.map(item => item.content || item.episode)} />
        )}
        
        {trendingContent && trendingContent.length > 0 && (
          <MovieRow title="Trending Now" movies={trendingContent} />
        )}
        
        {featuredContent && featuredContent.length > 0 && (
          <MovieRow title="Featured Content" movies={featuredContent} />
        )}
        
        {recommendations && recommendations.length > 0 && (
          <MovieRow title="Recommended For You" movies={recommendations} />
        )}
        
        {newReleases && newReleases.length > 0 && (
          <MovieRow title="New Releases" movies={newReleases} />
        )}
        
        {/* Genre-specific rows */}
        {genres.slice(0, 5).map(genre => (
          genreContent[genre.id] && genreContent[genre.id].length > 0 && (
            <MovieRow 
              key={genre.id} 
              title={genre.name} 
              movies={genreContent[genre.id]} 
            />
          )
        ))}
      </div>
    </div>
  );
}
