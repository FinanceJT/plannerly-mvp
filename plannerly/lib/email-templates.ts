/**
 * Email template utilities for vendor outreach.
 *
 * These functions generate dynamic email bodies tailored to the vendor type,
 * event details and stylistic preferences. You can further personalize
 * messages using a language model such as GPT‑4 by calling the
 * `personalizeEmail` function (stubbed here).
 */

export interface Vendor {
  name: string;
  email: string;
  category: string;
  /** Optional keywords describing the vendor's style or specialties */
  styleKeywords?: string[];
}

export interface EventDetails {
  type: string;
  date: string;
  location: string;
  budget: number;
  styleKeywords?: string[];
  guestCount?: number;
  additionalRequirements?: string;
}

/**
 * Generates a plain‑text email template for a vendor based on event details.
 *
 * This template includes a greeting, a description of the event, optional
 * style mentions and a call to action asking for availability and pricing.
 */
export function generateEmailTemplate(
  vendor: Vendor,
  event: EventDetails
): string {
  const greeting = `Hello ${vendor.name},`;
  const guestDescription = event.guestCount
    ? `for ${event.guestCount} guests`
    : '';
  const eventDescription = `We are planning a ${event.type} on ${event.date} in ${event.location} ${guestDescription}.`;
  const styleInfo = vendor.styleKeywords?.length
    ? `We love your ${vendor.styleKeywords.join(', ')} style and think it would suit our event perfectly.`
    : '';
  const customReq = event.additionalRequirements || '';
  const requirements = `We would like to know your availability, packages and pricing options.`;
  const cta = `If you are available, please reply with your offerings and any questions. We look forward to potentially working with you!`;

  return `
${greeting}

${eventDescription}
${styleInfo}

${requirements}
${customReq}

${cta}

Best regards,
[Your Name]
`;
}

/**
 * Stub for GPT‑powered personalization. In a real implementation this would
 * call OpenAI's API to adjust tone and content based on the vendor and event.
 */
export async function personalizeEmail(
  baseTemplate: string,
  vendor: Vendor,
  event: EventDetails
): Promise<string> {
  // Here you could call out to OpenAI to rewrite the baseTemplate
  // For this MVP we simply return the base template unchanged.
  return baseTemplate;
}
