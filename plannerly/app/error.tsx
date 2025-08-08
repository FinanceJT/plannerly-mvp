"use client";

import React, { useEffect } from "react";

/**
 * A global error boundary component for the Plannerly application. When an
 * uncaught error occurs during rendering or data fetching, this page will
 * display a friendly message and provide a way to retry the failed
 * operation. Next.js automatically wraps routes in this component when
 * placed at the app level.
 */
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error for debugging purposes. This could be sent to an
    // external monitoring service in a real-world app.
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="p-8 flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Something went wrong</h1>
        <p className="mb-6 text-center text-gray-700 max-w-md">
          We encountered an unexpected error. Please try again or go back to the
          home page. If the problem persists, contact support.
        </p>
        <button
          onClick={() => reset()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Try again
        </button>
      </body>
    </html>
  );
}