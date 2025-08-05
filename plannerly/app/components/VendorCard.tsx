'use client';
import React from 'react';

interface VendorCardProps {
  name: string;
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
  estimatedPrice?: string;
  distance?: string;
  topReviews?: string[];
  onSelect?: () => void;
  onReject?: () => void;
  explanation?: string;
}

/**
 * A card component to display a vendor with photo, rating, price estimate, distance and reviews.
 */
const VendorCard: React.FC<VendorCardProps> = ({
  name,
  photoUrl,
  rating,
  reviewCount,
  estimatedPrice,
  distance,
  topReviews = [],
  onSelect,
  onReject,
  explanation
}) => {
  // Render star rating using Unicode stars
  const renderStars = (value?: number) => {
    if (value === undefined) return null;
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    return (
      <span>
        {Array.from({ length: full }).map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">\u2605</span>
        ))}
        {half && <span className="text-yellow-400">\u2606</span>}
      </span>
    );
  };

  return (
    <div className="border rounded-lg shadow p-4 flex flex-col w-full max-w-md bg-white">
      {photoUrl && (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-40 object-cover rounded-md mb-3"
        />
      )}
      <h3 className="text-lg font-semibold mb-1">{name}</h3>
      <div className="flex items-center text-sm mb-2">
        {renderStars(rating)}
        {rating !== undefined && (
          <span className="ml-2 text-gray-600">{rating.toFixed(1)}</span>
        )}
        {reviewCount !== undefined && (
          <span className="ml-1 text-gray-500">({reviewCount})</span>
        )}
      </div>
      {estimatedPrice && (
        <div className="text-sm text-gray-700 mb-1">Price: {estimatedPrice}</div>
      )}
      {distance && (
        <div className="text-sm text-gray-700 mb-1">Distance: {distance}</div>
      )}
      {topReviews.length > 0 && (
        <div className="text-sm text-gray-700 mb-2">
          <div className="font-medium">Top Reviews:</div>
          <ul className="list-disc list-inside">
            {topReviews.slice(0, 2).map((review, idx) => (
              <li key={idx} className="text-gray-600 truncate">
                {review}
              </li>
            ))}
          </ul>
        </div>
      )}
      {explanation && (
        <div className="text-sm italic text-gray-500 mb-2">{explanation}</div>
      )}
      <div className="flex space-x-2 mt-auto">
        {onSelect && (
          <button
            onClick={onSelect}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
          >
            Select
          </button>
        )}
        {onReject && (
          <button
            onClick={onReject}
            className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
          >
            Reject
          </button>
        )}
      </div>
    </div>
  );
};

export default VendorCard;
