"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useMovieStore from "@/store/useMovieStore";
import { toast } from "react-hot-toast";

// Genre filter options
const genres = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
  "War",
  "Western",
];

const AdminContentListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Get content and actions from the store
  const { 
    content, 
    loading, 
    error, 
    fetchAllContent,
    deleteContent
  } = useMovieStore();

  // Fetch content on component mount
  useEffect(() => {
    fetchAllContent();
  }, [fetchAllContent]);

  // Handle delete content
  const handleDeleteContent = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteContent(id);
        toast.success(`"${title}" has been deleted successfully`);
      } catch (error) {
        toast.error("Failed to delete content");
      }
    }
  };

  // Filter content based on search term and genre
  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesGenre = selectedGenre === "All" || 
      item.genres.some(g => g.name === selectedGenre);
    
    return matchesSearch && matchesGenre;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const paginatedContent = filteredContent.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format duration to hours and minutes
  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <Link
          href="/admin/content/add"
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <Plus size={18} />
          <span>Add New Content</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Filter size={18} />
              <span>Filters</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-10 animate-fade-down">
                <div className="p-3">
                  <h3 className="text-sm font-medium mb-2">Genre</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {genres.map((genre) => (
                      <label
                        key={genre}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="genre"
                          checked={selectedGenre === genre}
                          onChange={() => {
                            setSelectedGenre(genre);
                            setCurrentPage(1); // Reset to first page on filter change
                          }}
                          className="form-radio text-primary"
                        />
                        <span className="text-sm">{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-border">
          <Loader2 size={48} className="text-primary animate-spin mb-4" />
          <h3 className="text-lg font-medium">Loading content...</h3>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-border">
          <div className="text-destructive mb-4">⚠️</div>
          <h3 className="text-lg font-medium">Error loading content</h3>
          <p className="text-muted-foreground mt-1">{error}</p>
          <button 
            onClick={() => fetchAllContent()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Content Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedContent.map((item) => (
              <div
                key={item.id}
                className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                onMouseEnter={() => setHoveredMovie(item.id)}
                onMouseLeave={() => setHoveredMovie(null)}
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  {/* Poster Image */}
                  <img
                    src={item.posterImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay with actions */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 ${
                      hoveredMovie === item.id
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Star className="text-yellow-500 mr-1" size={16} />
                        <span className="text-white font-medium">
                          {item.averageRating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="text-blue-400 mr-1" size={16} />
                        <span className="text-white font-medium">
                          {item.viewCount ? (item.viewCount / 1000).toFixed(0) + 'K' : '0'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between gap-2 mt-2">
                      <Link
                        href={`/admin/content/edit/${item.id}`}
                        className="flex-1 flex items-center justify-center gap-1 bg-secondary/80 hover:bg-secondary text-foreground px-3 py-1.5 rounded-md text-sm transition-colors"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </Link>
                      <button 
                        onClick={() => handleDeleteContent(item.id, item.title)}
                        className="flex-1 flex items-center justify-center gap-1 bg-destructive/80 hover:bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-sm transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Featured badge */}
                  {item.featured && (
                    <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs font-medium px-2 py-1 rounded-md">
                      Featured
                    </div>
                  )}
                  
                  {/* Content type badge */}
                  <div className="absolute top-3 right-3 bg-secondary/90 text-foreground text-xs font-medium px-2 py-1 rounded-md">
                    {item.type.replace('_', ' ')}
                  </div>
                </div>

                {/* Content info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {item.releaseYear}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDuration(item.duration)}
                    </span>
                    <span>•</span>
                    <span>{item.genres.length > 0 ? item.genres[0].name : 'Uncategorized'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? "text-muted-foreground bg-secondary/50 cursor-not-allowed"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                <ChevronLeft size={18} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-md ${
                    currentPage === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? "text-muted-foreground bg-secondary/50 cursor-not-allowed"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !error && filteredContent.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-border">
          <Film size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No content found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminContentListPage;
