"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiPlay, BiPlus, BiInfoCircle } from "react-icons/bi";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Mock data with high-quality images
const featuredContent = [
  {
    id: 1,
    title: "Inception",
    description:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    imageUrl: "/images/movies/inception.jpg",
    thumbnailUrl: "/images/movies/inception.jpg",
    genre: ["Action", "Sci-Fi", "Thriller"],
    rating: "PG-13",
    year: "2010",
    duration: "2h 28m",
  },
  {
    id: 2,
    title: "The Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    imageUrl: "/images/movies/dark-knight.jpg",
    thumbnailUrl: "/images/movies/dark-knight.jpg",
    genre: ["Action", "Crime", "Drama"],
    rating: "PG-13",
    year: "2008",
    duration: "2h 32m",
  },
  {
    id: 3,
    title: "Interstellar",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    imageUrl: "/images/movies/interstellar.jpg",
    thumbnailUrl: "/images/movies/interstellar.jpg",
    genre: ["Adventure", "Drama", "Sci-Fi"],
    rating: "PG-13",
    year: "2014",
    duration: "2h 49m",
  },
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
      setIsImageLoaded(false); // Reset image load state for next slide
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden -mt-16 md:-mt-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative h-full w-full"
        >
          {/* Background Image with Next.js Image optimization */}
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              {/* Thumbnail for blur-up loading */}
              <Image
                src={featuredContent[currentIndex].thumbnailUrl}
                alt="thumbnail"
                fill
                className="object-cover blur-xl scale-110"
                priority
              />
              {/* Main HD Image */}
              <Image
                src={featuredContent[currentIndex].imageUrl}
                alt={featuredContent[currentIndex].title}
                fill
                className={`object-cover scale-110 transition-opacity duration-300 ${
                  isImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoadingComplete={() => setIsImageLoaded(true)}
                priority
                quality={100}
              />
            </div>
            {/* Enhanced Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/70" />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute inset-0 bg-black/10" />{" "}
            {/* Subtle film grain effect */}
          </div>

          {/* Content with enhanced styling */}
          <div className="relative h-full container mx-auto px-4">
            <div className="flex flex-col justify-center h-full max-w-3xl pt-32 md:pt-40">
              {/* Rating Badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
              >
                <span className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium tracking-wider">
                  {featuredContent[currentIndex].rating}
                </span>
              </motion.div>

              {/* Title with text shadow */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6
                  tracking-tight text-shadow-lg"
              >
                {featuredContent[currentIndex].title}
              </motion.h1>

              {/* Metadata with enhanced spacing */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-6 text-base text-gray-300 mb-6"
              >
                <span>{featuredContent[currentIndex].year}</span>
                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                <span>{featuredContent[currentIndex].duration}</span>
              </motion.div>

              {/* Genre tags with glass effect */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                {featuredContent[currentIndex].genre.map((genre) => (
                  <span
                    key={genre}
                    className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full 
                      text-base border border-white/20 hover:bg-white/20 
                      transition-colors duration-300"
                  >
                    {genre}
                  </span>
                ))}
              </motion.div>

              {/* Description with better visibility */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300 text-xl mb-10 line-clamp-3 max-w-2xl
                  leading-relaxed text-shadow"
              >
                {featuredContent[currentIndex].description}
              </motion.p>

              {/* Enhanced buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6"
              >
                <Button
                  size="lg"
                  className="text-xl px-10 py-7 rounded-full bg-primary hover:bg-primary/90 
                    hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20"
                >
                  <BiPlay className="h-8 w-8 mr-2" />
                  Play Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl px-10 py-7 rounded-full border-2
                    hover:scale-105 transition-all duration-300 
                    hover:bg-white/10 backdrop-blur-sm"
                >
                  <BiPlus className="h-8 w-8 mr-2" />
                  My List
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Enhanced progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800/50 backdrop-blur-sm">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 8, ease: "linear" }}
              className="h-full bg-primary shadow-lg shadow-primary/50"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Add custom styles to the document */}
      <style jsx global>{`
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        .text-shadow-lg {
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </section>
  );
}
