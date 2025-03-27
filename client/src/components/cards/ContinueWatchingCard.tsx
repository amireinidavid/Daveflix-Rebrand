"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BiPlay, BiPlus, BiShare, BiDownload } from "react-icons/bi";
import { Button } from "@/components/ui/button";

interface ContinueWatchingCardProps {
  movie: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    rating: number;
    year: string;
    duration: string;
    progress: number;
    genre: string[];
  };
}

export default function ContinueWatchingCard({
  movie,
}: ContinueWatchingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative aspect-[16/9] w-full rounded-lg overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base Card */}
      <Image
        src={movie.thumbnailUrl}
        alt={movie.title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-110"
      />

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50">
        <div
          className="h-full bg-primary"
          style={{ width: `${movie.progress}%` }}
        />
      </div>

      {/* Hover Content */}
      <motion.div
        initial={false}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 20,
        }}
        className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent 
          flex flex-col justify-end p-4"
      >
        <h3 className="text-lg font-bold mb-2">{movie.title}</h3>

        <div className="flex items-center gap-4 mb-3">
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 rounded-full"
          >
            <BiPlay className="mr-1" /> Resume
          </Button>
          <span className="text-sm text-gray-300">{movie.duration}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="rounded-full">
            <BiPlus />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full">
            <BiShare />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full">
            <BiDownload />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
