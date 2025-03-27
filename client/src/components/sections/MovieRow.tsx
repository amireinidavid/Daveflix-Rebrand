"use client";

import { useRef } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import MovieCard from "@/components/cards/MovieCard";

interface MovieRowProps {
  title: string;
  movies: any[];
}

export default function MovieRow({ title, movies }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;

      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // Skip rendering if no movies
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 py-6">
      <h2 className="text-2xl font-bold px-6">{title}</h2>

      <div className="group relative">
        {/* Scroll Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full w-16
            opacity-0 group-hover:opacity-100 transition-all duration-300
            hover:bg-transparent"
          onClick={() => scroll("left")}
        >
          <BiChevronLeft className="h-8 w-8" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full w-16
            opacity-0 group-hover:opacity-100 transition-all duration-300
            hover:bg-transparent"
          onClick={() => scroll("right")}
        >
          <BiChevronRight className="h-8 w-8" />
        </Button>

        {/* Movies Container */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-none">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
