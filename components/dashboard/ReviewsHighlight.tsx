"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ReviewCard from "@/components/reviews/ReviewCard";
import StarRating from "@/components/reviews/StarRating";
import { reviews, averageRating, totalReviews } from "@/lib/reviews-data";

export default function ReviewsHighlight() {
  const featured = reviews.slice(0, 3);

  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-4 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">Google Reviews</h3>
          <span className="flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/10">
            <span className="text-sm font-semibold text-white">
              {averageRating.toFixed(1)}
            </span>
            <StarRating rating={averageRating} size={14} />
            <span className="text-xs text-zinc-500">({totalReviews})</span>
          </span>
        </div>
        <Link
          href="/reviews"
          className="group flex items-center gap-1 text-sm font-medium text-cyan transition-colors hover:text-white"
        >
          See all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featured.map((review, i) => (
          <ReviewCard key={review.id} review={review} delay={i * 0.08} compact />
        ))}
      </div>
    </section>
  );
}
