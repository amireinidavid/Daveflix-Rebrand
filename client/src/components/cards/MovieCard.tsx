"use client";

import { useState } from "react";
import Image from "next/image";
import { BiPlay } from "react-icons/bi";
import { FaHeart } from "react-icons/fa";
import Link from "next/link";

interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    posterImage: string;
  };
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="border border-border p-1 hover:scale-95 transition-all duration-300 
        relative rounded-md overflow-hidden w-[256px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/movie/${movie.id}`} className="block w-full">
        <div className="relative w-full h-64">
          <Image
            src={movie.posterImage}
            alt={movie.title}
            fill
            className="object-cover"
            quality={85}
          />

          {/* Play Button on Hover */}
          <div
            className={`absolute inset-0 flex items-center justify-center
              bg-black/50 transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
          >
            <BiPlay className="text-white text-6xl" />
          </div>
        </div>
      </Link>

      {/* Title and Like Button */}
      <div
        className="absolute flex items-center justify-between bottom-0 right-0 left-0 
        bg-black/60 text-white px-4 py-3"
      >
        <h3 className="font-semibold truncate">{movie.title}</h3>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`h-9 w-9 flex items-center justify-center rounded-md transition-colors
            ${
              isLiked
                ? "bg-transparent border-2 border-red-500 text-red-500"
                : "bg-red-500 hover:bg-transparent border-2 border-red-500"
            }`}
        >
          <FaHeart className="text-lg" />
        </button>
      </div>
    </div>
  );
}
