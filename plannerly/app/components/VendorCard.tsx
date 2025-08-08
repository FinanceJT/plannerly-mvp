"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Props for the VendorCard component. Many fields are optional to allow
 * flexibility when rendering partial vendor data.
 */
export interface VendorCardProps {
  id: string;
  name: string;
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
  estimatedPrice?: string;
  distance?: string;
  topReviews?: string[];
  explanation?: string;
  onSelect?: (id: string) => void;
  onReject?: (id: string) => void;
}

/**
 * Utility to trigger a small vibration on supported devices. When called
 * before an action (e.g., selecting a vendor), it improves feedback on
 * mobile devices. If vibration is not supported, it silently fails.
 */
function triggerVibration(duration = 50) {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

/**
 * Renders a vendor card with optional photo, rating, and pricing details.
 * Animations are handled by Framer Motion to smoothly fade cards into
 * view. Selecting or rejecting a vendor will trigger haptic feedback on
 * mobile and call the provided callbacks.
 */
export default function VendorCard({
  id,
  name,
  photoUrl,
  rating,
  reviewCount,
  estimatedPrice,
  distance,
  topReviews,
  explanation,
  onSelect,
  onReject
}: VendorCardProps) {
  // Helper to render star icons based on rating value. Uses filled stars
  // for whole numbers and empty stars for the remainder up to five.
  function renderStars(value: number = 0) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(value) ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return stars;
  }

  const handleSelect = () => {
    triggerVibration(70);
    onSelect?.(id);
  };
  const handleReject = () => {
    triggerVibration(70);
    onReject?.(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border rounded shadow-sm p-4 bg-white flex flex-col space-y-3 w-full"
    >
      {/* Image placeholder or photo */}
      <div className="w-full h-40 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`${name} photo`}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-gray-400">No Image</span>
        )}
      </div>
      {/* Name and rating */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold truncate" title={name}>{name}</h3>
        {rating !== undefined && (
          <div className="flex items-center">
            {renderStars(rating)}
            {reviewCount !== undefined && (
              <span className="ml-1 text-sm text-gray-500">({reviewCount})</span>
            )}
          </div>
        )}
      </div>
      {/* Price and distance */}
      <div className="flex justify-between text-sm text-gray-600">
        {estimatedPrice && <span>Price: {estimatedPrice}</span>}
        {distance && <span>{distance} away</span>}
      </div>
      {/* Explanation or notes */}
      {explanation && (
        <p className="text-gray-700 text-sm line-clamp-3" title={explanation}>{explanation}</p>
      )}
      {/* Top reviews list */}
      {topReviews && topReviews.length > 0 && (
        <div className="space-y-1">
          {topReviews.slice(0, 2).map((review, idx) => (
            <p key={idx} className="text-xs text-gray-500 italic line-clamp-2">
              "{review}"
            </p>
          ))}
        </div>
      )}
      {/* Action buttons */}
      <div className="flex space-x-2 pt-2">
        {onSelect && (
          <button
            onClick={handleSelect}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Select
          </button>
        )}
        {onReject && (
          <button
            onClick={handleReject}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        )}
      </div>
    </motion.div>
  );
}