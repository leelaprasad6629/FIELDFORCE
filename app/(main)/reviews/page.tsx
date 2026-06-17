"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote } from "lucide-react";
import PageHero from "@/components/PageHero";
import ReviewCard from "@/components/reviews/ReviewCard";
import StarRating from "@/components/reviews/StarRating";
import { reviews, averageRating, totalReviews } from "@/lib/reviews-data";

export default function ReviewsPage() {
  const hasReviews = reviews.length > 0;

  return (
    <div>
      <PageHero
        title="What clients say about FieldForce 360"
        subtitle="Verified Google reviews from operations leaders who run their field teams on FieldForce 360."
      />

      {hasReviews ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="glass mb-8 flex flex-wrap items-center gap-x-8 gap-y-4 p-6"
          >
            <div>
              <p className="text-4xl font-bold text-white">
                {averageRating.toFixed(1)}
                <span className="text-lg text-zinc-500"> / 5</span>
              </p>
              <div className="mt-2">
                <StarRating rating={averageRating} size={18} />
              </div>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div>
              <p className="text-sm text-zinc-400">Based on</p>
              <p className="text-lg font-semibold text-white">
                {totalReviews} Google reviews
              </p>
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review, i) => (
              <ReviewCard key={review.id} review={review} delay={i * 0.08} />
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="glass flex flex-col items-center justify-center gap-4 p-12 text-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan/10 text-cyan ring-1 ring-cyan/30">
            <MessageSquareQuote className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">No reviews yet</h3>
            <p className="mt-1 max-w-sm text-sm text-zinc-400">
              Customer reviews will appear here as soon as they roll in from
              Google. Check back shortly.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
