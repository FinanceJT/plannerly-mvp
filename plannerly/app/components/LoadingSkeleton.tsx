"use client";

import React from "react";

/**
 * A simple skeleton loader component that can be reused across different
 * parts of the application. It accepts width and height to size the
 * placeholder appropriately. Additional Tailwind classes can be passed via
 * the `className` prop to further customize the appearance.
 */
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ width = "100%", height = 16, className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    />
  );
}

/**
 * A skeleton loader specifically for vendor cards. Displays a placeholder
 * image area, text lines, and rating bar to mimic the layout of a
 * `VendorCard`. Used while vendor data is loading.
 */
export function VendorCardSkeleton() {
  return (
    <div className="border rounded p-4 w-full max-w-md mx-auto space-y-3">
      <Skeleton width="100%" height={160} className="rounded" />
      <Skeleton width="70%" height={20} />
      <Skeleton width="50%" height={16} />
      <Skeleton width="60%" height={16} />
      <div className="flex space-x-2">
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
      </div>
    </div>
  );
}

/**
 * A skeleton loader for chat messages. Shows a bubble-like shape that
 * represents a message while content is streaming from the API.
 */
export function ChatMessageSkeleton({ alignRight = false }: { alignRight?: boolean }) {
  return (
    <div className={`flex ${alignRight ? "justify-end" : "justify-start"} mb-2`}>
      <div className="animate-pulse bg-gray-200 rounded-lg px-4 py-2 max-w-xs">
        <Skeleton width={120} height={16} />
      </div>
    </div>
  );
}