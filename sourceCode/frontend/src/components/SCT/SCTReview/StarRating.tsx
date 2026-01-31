// components/StarRating.tsx
import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  className?: string;
  classNameTxt?: string;
}

export default function StarRating({ rating, maxStars = 5, className = "text-yellow-400 text-4xl",classNameTxt }: StarRatingProps) {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<FaStar key={i} className={className} />);
    } else if (i === Math.floor(rating) + 1 && rating % 1 >= 0.5) {
      stars.push(<FaStarHalfAlt key={i} className={className} />);
    } else {
      stars.push(<FaRegStar key={i} className={className} />);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className={`text-4xl text-gray-600 ${classNameTxt}`}>{rating.toFixed(1)}</span>
      {stars}
    </div>
  );
}
