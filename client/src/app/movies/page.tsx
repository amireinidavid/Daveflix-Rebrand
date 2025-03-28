"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Filter, ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import useMovieStore from "@/store/useMovieStore";
import MovieListCard from "@/components/cards/MovieListCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const MoviesListPage = () => {
  const { 
    fetchAllContent, 
    fetchGenres,
    content,
    genres,
    loading,
    error 
  } = useMovieStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()]);
  const [sortBy, setSortBy] = useState("releaseYear");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 10; // 3 rows of 5 movies

  // Fetch content on component mount
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        // Import auth store to check authentication
        const { useAuthStore } = await import('@/store/useAuthStore');
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        
        // If not authenticated, check auth status
        if (!isAuthenticated) {
          const checkAuth = useAuthStore.getState().checkAuth;
          await checkAuth();
        }
        
        // Now fetch content and genres
        await Promise.all([
          fetchAllContent(),
          fetchGenres()
        ]);
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [fetchAllContent, fetchGenres]);

  // Filter movies only (not TV shows)
  const movies = content.filter(item => item.type === "MOVIE");

  // Apply filters
  const filteredMovies = movies.filter(movie => {
    // Search filter
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Genre filter
    const matchesGenre = selectedGenre === "all" || 
      movie.genres.some((g: any) => g.id === selectedGenre);
    
    // Year filter
    const matchesYear = movie.releaseYear >= yearRange[0] && movie.releaseYear <= yearRange[1];
    
    return matchesSearch && matchesGenre && matchesYear;
  });

  // Sort movies
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === "title") {
      return sortOrder === "asc" 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortBy === "releaseYear") {
      return sortOrder === "asc" 
        ? a.releaseYear - b.releaseYear
        : b.releaseYear - a.releaseYear;
    } else if (sortBy === "rating") {
      const ratingA = a.averageRating || 0;
      const ratingB = b.averageRating || 0;
      return sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA;
    }
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
  const paginatedMovies = sortedMovies.slice(
    (currentPage - 1) * moviesPerPage,
    currentPage * moviesPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-up">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Movies</h1>
          <p className="text-muted-foreground">
            Discover {filteredMovies.length} movies in our collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="releaseYear">Release Year</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal size={16} />
                Filters
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-down">
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.id}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Release Year: {yearRange[0]} - {yearRange[1]}
                </label>
                <Slider
                  defaultValue={yearRange}
                  min={1900}
                  max={new Date().getFullYear()}
                  step={1}
                  onValueChange={(value) => setYearRange(value as number[])}
                  className="my-4"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-border">
            <div className="text-destructive mb-4">⚠️</div>
            <h3 className="text-lg font-medium">Error loading movies</h3>
            <p className="text-muted-foreground mt-1">{error}</p>
            <Button 
              onClick={() => fetchAllContent()}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Movies Grid */}
        {!error && (
          <>
            {sortedMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-border">
                <h3 className="text-lg font-medium">No movies found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                  {paginatedMovies.map((movie) => (
                    <MovieListCard key={movie.id} movie={movie} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current
                          return page === 1 || 
                                 page === totalPages || 
                                 (page >= currentPage - 1 && page <= currentPage + 1);
                        })
                        .map((page, index, array) => (
                          <>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="flex items-center justify-center w-10 h-10 text-muted-foreground">
                                ...
                              </span>
                            )}
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              onClick={() => handlePageChange(page)}
                              className="w-10 h-10"
                            >
                              {page}
                            </Button>
                          </>
                        ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MoviesListPage;
