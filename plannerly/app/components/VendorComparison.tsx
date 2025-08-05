"use client";

import React from 'react';
import VendorCard from './VendorCard';

export interface VendorInfo {
  id: string;
  name: string;
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
  estimatedPrice?: string;
  distance?: string;
  topReviews?: string[];
  explanation?: string;
}

export interface VendorComparisonProps {
  vendors: VendorInfo[];
  onSelect?: (vendorId: string) => void;
  onReject?: (vendorId: string) => void;
}

const VendorComparison: React.FC<VendorComparisonProps> = ({ vendors, onSelect, onReject }) => {
  if (!vendors || vendors.length === 0) {
    return <p className="text-gray-500">No vendors found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {vendors.map((vendor) => (
        <VendorCard
          key={vendor.id}
          name={vendor.name}
          photoUrl={vendor.photoUrl}
          rating={vendor.rating}
          reviewCount={vendor.reviewCount}
          estimatedPrice={vendor.estimatedPrice}
          distance={vendor.distance}
          topReviews={vendor.topReviews}
          explanation={vendor.explanation}
          onSelect={() => onSelect && onSelect(vendor.id)}
          onReject={() => onReject && onReject(vendor.id)}
        />
      ))}
    </div>
  );
};

export default VendorComparison;
