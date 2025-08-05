import { PlaceDetailsResponseData } from '@googlemaps/google-maps-services-js';

// Category-specific multipliers to adjust base estimates
const categoryMultipliers: Record<string, number> = {
  wedding_venue: 1.0,
  photographer: 0.1,
  catering: 0.5,
  florist: 0.2,
  dj: 0.3
};

// Event type adjustments to scale prices based on occasion
const eventTypeAdjustments: Record<string, number> = {
  wedding: 1.2,
  birthday: 0.8,
  corporate: 1.0,
  other: 1.0
};

/**
 * Estimate a price for a vendor based on Google price_level, category multipliers,
 * event type adjustments, and guest count scaling. Returns an approximate dollar amount.
 */
export function estimatePrice(
  place: PlaceDetailsResponseData,
  category: string,
  eventType: string,
  guestCount: number
): number {
  const priceLevel = place.price_level ?? 2;
  // Translate price_level (0-4) to a rough base in dollars
  const baseEstimate = (priceLevel + 1) * 50;
  const categoryMult = categoryMultipliers[category] ?? 1.0;
  const eventMult = eventTypeAdjustments[eventType] ?? 1.0;
  // Scale cost by guest count; assume price grows linearly after first 50 guests
  const guestFactor = guestCount > 50 ? 1 + (guestCount - 50) / 100 : 1;
  const estimated = baseEstimate * categoryMult * eventMult * guestFactor;
  return Math.round(estimated);
}

/**
 * Extract numeric price mentions from review texts. This implementation uses a simple
 * regular expression to find dollar amounts. In production, you could replace
 * this with a call to a language model (e.g. GPT-4) to parse more nuanced expressions.
 */
export function extractPricesFromReviews(reviews: string[]): number[] {
  const priceRegex = /\$(\d+[\d,]*)/g;
  const prices: number[] = [];
  for (const review of reviews) {
    let match;
    while ((match = priceRegex.exec(review)) !== null) {
      const value = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(value)) prices.push(value);
    }
  }
  return prices;
}

/**
 * Calculate a consolidated price estimate and confidence from a collection of numbers.
 * The confidence is inversely proportional to the variance of the estimates.
 */
export function scorePriceEstimate(estimates: number[]): { estimate: number; confidence: number } {
  if (!estimates || estimates.length === 0) {
    return { estimate: 0, confidence: 0 };
  }
  const sum = estimates.reduce((a, b) => a + b, 0);
  const avg = sum / estimates.length;
  // Compute variance
  const variance = estimates.reduce((acc, val) => acc + (val - avg) ** 2, 0) / estimates.length;
  const stdev = Math.sqrt(variance);
  const confidence = 1 / (1 + stdev / (avg || 1));
  return { estimate: Math.round(avg), confidence: Number(confidence.toFixed(2)) };
}
