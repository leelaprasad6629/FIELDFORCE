import { Star } from "lucide-react";

export default function StarRating({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={filled ? "text-amber" : "text-white/15"}
            fill={filled ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
}
