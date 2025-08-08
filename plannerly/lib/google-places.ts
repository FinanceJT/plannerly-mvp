/**
 * Google Places wrapper with simple caching and improved error handling.
 *
 * This module encapsulates common operations for searching nearby vendors,
 * retrieving place details, constructing photo URLs, and aggregating reviews.
 * To reduce the number of external API calls and improve performance,
 * responses from the Google Places API are cached in memory for a short
 * duration (default 1 hour). Invalid inputs are gracefully handled by
 * returning empty results instead of throwing.
 */

import { Client, PlaceType, PlaceDetailsResponseData } from "@googlemaps/google-maps-services-js";

export interface Location {
  lat: number;
  lng: number;
}

/**
 * Minimal representation of a place returned by the Google Places API.
 * Some fields are optional and may be undefined depending on the place.
 */
export interface SearchResult {
  placeId: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  geometry?: any;
  photos?: { photo_reference: string }[];
  types?: string[];
  vicinity?: string;
  [key: string]: any;
}

// Instantiate the client once. It will be reused across requests.
const client = new Client({});

// Mapping between our internal categories and Google Places types/keywords.
const categoryMappings: Record<string, string[]> = {
  wedding_venue: ["wedding_venue", "event_venue"],
  photographer: ["photographer", "photography"],
  catering: ["catering", "restaurant"],
  florist: ["florist", "flower_shop"],
  dj: ["dj_service", "entertainment"],
};

// Simple in-memory cache keyed by category/location/radius. Cached items
// expire after this many milliseconds. Note that this cache lives only
// within a single serverless instance; it will not persist across deployments.
const cache = new Map<string, { data: SearchResult[]; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function buildCacheKey(category: string, location: Location, radius: number): string {
  return `${category}:${location.lat},${location.lng}:${radius}`;
}

function mapToGoogleType(category: string): PlaceType | undefined {
  const types = categoryMappings[category];
  return types && types.length > 0 ? (types[0] as PlaceType) : undefined;
}

/**
 * Search for vendors of a given category around a location. Results are
 * automatically cached for a configurable TTL to minimise redundant calls
 * against the Google Places API. Results are ranked by a simple heuristic
 * (rating × number of reviews) and trimmed to the top 10 entries.
 *
 * @param category One of the supported categories (e.g. "photographer").
 * @param location Geographic location with latitude and longitude.
 * @param radius Search radius in metres. Defaults to 50 km (50 000 m).
 * @returns A promise resolving to an array of search results, or an empty
 *          array if the category or location is invalid or an error occurs.
 */
export async function searchVendors(
  category: string,
  location: Location,
  radius: number = 50_000
): Promise<SearchResult[]> {
  // Validate the category. Unknown categories return no results.
  if (!categoryMappings[category]) {
    console.warn(`searchVendors: Unknown category "${category}"`);
    return [];
  }
  // Validate the location.
  if (
    typeof location.lat !== "number" ||
    typeof location.lng !== "number" ||
    isNaN(location.lat) ||
    isNaN(location.lng)
  ) {
    console.warn(
      `searchVendors: Invalid location provided: ${JSON.stringify(location)}`
    );
    return [];
  }
  // Check the cache first.
  const key = buildCacheKey(category, location, radius);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const type = mapToGoogleType(category);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key is not configured");
    }
    const resp = await client.placesNearby({
      params: {
        location,
        radius,
        keyword: category,
        type,
        key: apiKey,
      },
    });
    const results: SearchResult[] = resp.data.results ?? [];
    // Rank results by rating × review count. Items without ratings are sorted last.
    results.sort((a, b) => {
      const scoreA = (a.rating ?? 0) * (a.user_ratings_total ?? 0);
      const scoreB = (b.rating ?? 0) * (b.user_ratings_total ?? 0);
      return scoreB - scoreA;
    });
    const top = results.slice(0, 10);
    cache.set(key, { data: top, timestamp: Date.now() });
    return top;
  } catch (err) {
    console.error("searchVendors: Error fetching vendors", err);
    return [];
  }
}

/**
 * Retrieve detailed information for a place by its ID. Results are not
 * currently cached because details lookups are less frequent, but caching
 * could be added similarly to the vendor search if required.
 *
 * @param placeId The unique ID of the place.
 * @returns A promise resolving to the place details or undefined if not found.
 */
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetailsResponseData['result'] | undefined> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key is not configured");
    }
    const resp = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: [
          "place_id",
          "name",
          "rating",
          "formatted_address",
          "formatted_phone_number",
          "website",
          "types",
          "price_level",
          "photos",
          "url",
          "user_ratings_total",
          "review",
        ],
        key: apiKey,
      },
    });
    return resp.data.result;
  } catch (err) {
    console.error(`getPlaceDetails: Failed to fetch details for ${placeId}`, err);
    return undefined;
  }
}

/**
 * Build a photo URL using the photo reference returned by the Places API.
 * When displaying place photos you must supply your API key. If no photo
 * reference is provided the function returns undefined.
 *
 * @param photoReference The photo_reference string from the API.
 * @param maxWidth Optional maximum width of the photo.
 * @returns A full URL to fetch the photo or undefined if no reference.
 */
export function buildPhotoUrl(photoReference?: string, maxWidth: number = 400): string | undefined {
  if (!photoReference) return undefined;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("buildPhotoUrl: Google Maps API key is not configured");
    return undefined;
  }
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`;
}

/**
 * Aggregate review snippets into a single array of strings. This helper
 * truncates long reviews and gracefully handles undefined inputs.
 *
 * @param reviews An array of review objects returned by the API.
 * @param maxLength Maximum length of each aggregated review.
 * @param maxReviews Maximum number of reviews to return.
 * @returns An array of sanitized review strings.
 */
export function aggregateReviews(
  reviews: { text: string }[] | undefined,
  maxLength: number = 200,
  maxReviews: number = 3
): string[] {
  if (!reviews || reviews.length === 0) return [];
  return reviews.slice(0, maxReviews).map((r) => {
    const trimmed = (r.text || "").replace(/\s+/g, " ").trim();
    return trimmed.length > maxLength
      ? `${trimmed.slice(0, maxLength - 3)}...`
      : trimmed;
  });
}
