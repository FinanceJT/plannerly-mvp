/**
 * Utilities for parsing vendor email responses.
 *
 * In a production application you would use a language model to extract
 * structured information (availability, pricing, notes) from free‑form
 * responses. Here we provide a stub implementation which returns the
 * original message as notes.
 */

export interface ParsedResponse {
  availability?: string;
  pricing?: string;
  notes?: string;
}

/**
 * Parses a vendor's response email and extracts structured data.
 *
 * For this MVP we simply return the full response text as notes. You could
 * integrate GPT‑4 here to identify availability and pricing details.
 */
export async function parseVendorResponse(
  responseText: string
): Promise<ParsedResponse> {
  // TODO: call OpenAI to extract structured information
  return {
    notes: responseText,
  };
}
