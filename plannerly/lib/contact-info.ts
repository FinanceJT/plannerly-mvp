/**
 * Contact information extraction and validation utilities.
 *
 * These functions help scrape email and phone contact details from vendor
 * websites, validate email addresses and provide fallbacks when data is
 * incomplete. In a production system you would fetch and parse the HTML
 * of a vendor's website. Here we provide simple regex‑based extraction and
 * stubs for manual entry and phone fallback.
 */

import type { Vendor } from './email-templates';

export interface ContactInfo {
  emails: string[];
  phones: string[];
}

/**
 * Attempts to extract contact information (emails and phone numbers) from a
 * vendor's website. In this stubbed implementation the HTML content is
 * expected to be provided by the caller or retrieved elsewhere.
 */
export async function extractContactInfo(html: string): Promise<ContactInfo> {
  const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  const phoneRegex = /(\+?\d{1,2}[\s-]?)?(\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/g;
  const emails = [...new Set((html.match(emailRegex) || []))];
  const phones = [...new Set((html.match(phoneRegex) || []))];
  return { emails, phones };
}

/** Validates a single email address. */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Provides a fallback contact object. If the vendor email is valid it will
 * be returned; otherwise the phone number from Google Places or another
 * source will be used instead.
 */
export function fallbackContactFromVendor(
  vendor: Vendor,
  placePhone?: string
): { email?: string; phone?: string } {
  if (vendor.email && validateEmail(vendor.email)) {
    return { email: vendor.email };
  }
  return { phone: placePhone };
}

/**
 * Manual entry for contact info. Returns the email only if valid.
 */
export function manualContactEntry(email: string, phone: string) {
  return {
    email: validateEmail(email) ? email : undefined,
    phone,
  };
}
