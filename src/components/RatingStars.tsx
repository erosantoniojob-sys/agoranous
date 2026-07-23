import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0 to 5
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  interactive = false,
  onRatingChange,
  size = 'md',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const currentDisplay = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = currentDisplay >= starIndex;
        const isHalf = currentDisplay >= starIndex - 0.5 && currentDisplay < starIndex;

        return (
          <button
            key={starIndex}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(starIndex)}
            onMouseEnter={() => interactive && setHoverRating(starIndex)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
            aria-label={`Avaliar ${starIndex} estrelas`}
          >
            <Star
              className={`${starSizes[size]} transition-colors ${
                isFilled || isHalf
                  ? 'fill-accent-gold text-accent-gold'
                  : 'text-text-secondary/40 fill-none'
              }`}
            />
          </button>
        );
      })}
      {rating > 0 && (
        <span className={`ml-1 font-serif font-semibold text-accent-gold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
