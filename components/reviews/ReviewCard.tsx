"use client";

import { motion } from "framer-motion";
import type { Review } from "@/lib/reviews-data";
import StarRating from "@/components/reviews/StarRating";

export default function ReviewCard({
  review,
  delay = 0,
  compact = false,
}: {
  review: Review;
  delay?: number;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className="glass glass-hover flex flex-col p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-sm font-semibold text-cyan ring-1 ring-cyan/30">
          {review.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{review.author}</p>
          <p className="text-xs text-zinc-500">{review.relativeTime}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <StarRating rating={review.rating} />
        <span className="text-xs font-medium text-zinc-500">{review.source}</span>
      </div>

      <p
        className={`mt-3 text-pretty text-sm leading-relaxed text-zinc-300 ${
          compact ? "line-clamp-3" : ""
        }`}
      >
        {review.text}
      </p>
    </motion.div>
  );
}
