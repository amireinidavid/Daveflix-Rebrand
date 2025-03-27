"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl =
    product.productImages?.[0]?.mediumUrl || "/placeholder-image.jpg";
  const discountedPrice = product.flashSale?.isActive
    ? product.flashSale.discountPrice
    : product.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group relative w-full max-w-xs mx-auto"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            priority
          />

          {/* Sale Badge */}
          {product.flashSale?.isActive && (
            <div className="absolute left-2 top-2 bg-sale text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              -{product.flashSale.discount}% OFF
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button className="w-full bg-white text-black rounded-lg py-2 text-sm font-medium hover:bg-primary hover:text-white transition-colors">
              Add to Cart
            </button>
            <button className="w-full bg-white/20 backdrop-blur-sm text-white rounded-lg py-2 text-sm font-medium hover:bg-white/30 transition-colors">
              Quick View
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">
              {product.brand}
            </p>
            {product.rating && (
              <div className="text-xs font-medium text-accent flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                {product.rating}
              </div>
            )}
          </div>

          <h3 className="font-medium text-sm line-clamp-1 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">
              {formatPrice(discountedPrice)}
            </span>
            {product.flashSale?.isActive && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <style jsx global>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          padding: 1rem;
        }

        @media (min-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1.5rem;
            padding: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 2rem;
            padding: 2rem;
          }
        }
      `}</style>
    </motion.div>
  );
}
