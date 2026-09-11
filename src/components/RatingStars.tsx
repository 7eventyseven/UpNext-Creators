"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

/** Read-only when `onChange` is omitted, otherwise a 1–5 star picker. */
export function RatingStars({
  value,
  onChange,
  size = 20,
  disabled = false,
}: RatingStarsProps) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-olive-300"
            }
          />
        ))}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          className="rounded p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Star
            size={size}
            className={
              star <= shown ? "fill-amber-400 text-amber-400" : "text-olive-300"
            }
          />
        </button>
      ))}
    </span>
  );
}
