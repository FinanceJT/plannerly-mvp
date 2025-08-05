import { Client as GoogleMapsClient, PlaceSearchResult, PlaceDetailsResponseData } from '@googlemaps/google-maps-services-js';

// Initialize Google Maps client
const placesClient = new GoogleMapsClient({});

// Base URL for Google Place photos
const GOOGLE_PHOTO_BASE_URL = 'https://maps.googleapis.com/maps/api/place/photo';

// Mapping from event categories to Google Places search keywords/types
const categoryMappings: Record<string, string[]> = {
  wedding_venue: ['wedding venue', 'event venue'],
  photographer: ['photographer', 'photography'],
  catering: ['catering', 'restaurant'],
  florist: ['florist', 'flower shop'],
  dj: ['dj', 'entertainment']
};

/**
 * Map an event category to a primary Google Places type. Uses the first mapping entry as the type.
 */
function mapToGoogleType(category: string): string | undefined {
  const mapping = categoryMappings[category];
  return mapping ? mapping[0] : undefined;
}

/**
 * Search for nearby vendors matching the provided category and location. Returns up to 10 results.
 */
export async function searchVendors(
  category: string,
  location: { lat: number; lng: number },
  radius = 50000
): Promise<PlaceSearchResult[]> {
  const type = mapToGoogleType(category);
  const response = await placesClient.placesNearby({
    params: {
      location,
      radius,
      keyword: category,
      type,
      key: process.env.GOOGLE_MAPS_API_KEY as string
    }
  });
  return response.data.results.slice(0, 10);
}

/**
 * Fetch detailed information about a specific place using its Place ID.
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResponseData> {
  const response = await placesClient.placeDetails({
    params: {
      place_id: placeId,
      key: process.env.GOOGLE_MAPS_API_KEY as string,
      fields: [
        'place_id',
        'name',
        'formatted_address',
        'formatted_phone_number',
        'price_level',
        'rating',
        'user_ratings_total',
        'photos',
        'reviews',
        'website',
        'url',
        'types'
      ]
    }
  });
  return response.data.result;
}

/**
 * Build a URL to fetch a photo from Google Places given a photo reference.
 */
export function buildPhotoUrl(photoReference: string, maxWidth = 400): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  return `${GOOGLE_PHOTO_BASE_URL}?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`;
}

/**
 * Aggregate reviews into plain text snippets. Limits the number of reviews returned.
 */
export function aggregateReviews(reviews?: { text: string }[], limit = 3): string[] {
  if (!reviews || reviews.length === 0) return [];
  return reviews.slice(0, limit).map((r) => r.text);
}

/**
 * Build an array of keywords used to search for vendors. Combines mapped keywords and style keywords.
 */
export function buildSearchKeywords(category: string, styleKeywords: string[] = []): string[] {
  const baseKeywords = categoryMappings[category] || [category];
  const combined = [...baseKeywords, ...styleKeywords];
  return Array.from(new Set(combined));
}

/**
 * Simple result ranking algorithm. Sorts by rating and number of reviews using a weighted score.
 */
export function rankResults(results: PlaceSearchResult[]): PlaceSearchResult[] {
  return [...results].sort((a, b) => {
    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;
    const countA = a.user_ratings_total ?? 0;
    const countB = b.user_ratings_total ?? 0;
    const scoreA = ratingA * Math.log(1 + countA);
    const scoreB = ratingB * Math.log(1 + countB);
    return scoreB - scoreA;
  });
}
