/**
 * Simple heuristics for parsing event details from user messages. This
 * implementation is intentionally lightweight and serves as a starting
 * point. In a production system you may want to leverage NLP
 * libraries or fine‑tuned models to improve extraction accuracy.
 */

export interface EventProfile {
  type?: string;
  budget?: { amount: number; currency: string };
  location?: string;
  date?: string;
  styles?: string[];
}

/**
 * Extract an event type from natural language. Looks for common event
 * keywords (wedding, birthday, conference, party, etc.).
 */
export function extractEventType(text: string): string | undefined {
  const keywords = [
    "wedding",
    "birthday",
    "conference",
    "party",
    "corporate",
    "retreat",
    "baby shower",
    "graduation",
  ];
  const lowered = text.toLowerCase();
  for (const word of keywords) {
    if (lowered.includes(word)) return word;
  }
  return undefined;
}

/**
 * Extract a budget from text. Returns the first number preceded by a
 * currency symbol. Assumes USD if no currency is specified.
 */
export function extractBudget(text: string): { amount: number; currency: string } | undefined {
  const moneyRegex = /(\$|€|£)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
  const match = text.match(moneyRegex);
  if (match) {
    const [, currencySymbol, amountStr] = match;
    const cleaned = amountStr.replace(/,/g, "");
    const amount = parseFloat(cleaned);
    const currency = currencySymbol || "$";
    return { amount, currency };
  }
  return undefined;
}

/**
 * Attempt to extract a location string. This simply looks for patterns
 * like "in X" or "at X" and returns the following words. Real
 * extraction would integrate with a geocoding API.
 */
export function extractLocation(text: string): string | undefined {
  const locRegex = /(?:in|at)\s+([A-Za-z\s,]+)/i;
  const match = text.match(locRegex);
  if (match) {
    return match[1].trim();
  }
  return undefined;
}

/**
 * Extract a date string. Matches ISO date formats and common month
 * names with day numbers. This returns the first match found.
 */
export function extractDate(text: string): string | undefined {
  // ISO date
  const isoMatch = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (isoMatch) return isoMatch[0];
  // Month name and day
  const monthRegex = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?/i;
  const match = text.match(monthRegex);
  if (match) return `${match[1]} ${match[2]}`;
  return undefined;
}

/**
 * Extract style keywords. Looks for adjectives like rustic, modern,
 * formal, casual, vintage, etc.
 */
export function extractStyles(text: string): string[] | undefined {
  const adjectives = [
    "rustic",
    "modern",
    "formal",
    "casual",
    "vintage",
    "bohemian",
    "elegant",
  ];
  const lowered = text.toLowerCase();
  const found = adjectives.filter((adj) => lowered.includes(adj));
  return found.length ? found : undefined;
}

/**
 * Parse an entire conversation to build an event profile. It inspects
 * all messages, prioritising the latest mentions of each attribute.
 */
export function parseEvent(messages: Array<{ role: string; content: string }>): EventProfile {
  const profile: EventProfile = {};
  for (const msg of messages) {
    const { content } = msg;
    // Later messages override earlier values
    const type = extractEventType(content);
    if (type) profile.type = type;
    const budget = extractBudget(content);
    if (budget) profile.budget = budget;
    const location = extractLocation(content);
    if (location) profile.location = location;
    const date = extractDate(content);
    if (date) profile.date = date;
    const styles = extractStyles(content);
    if (styles) profile.styles = styles;
  }
  return profile;
}
