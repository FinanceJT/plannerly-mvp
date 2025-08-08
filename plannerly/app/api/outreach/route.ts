import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { generateEmailTemplate, Vendor, EventDetails } from '../../../lib/email-templates';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

/**
 * Sends outreach emails to a list of vendors for a given event.
 * Each email includes a unique tracking pixel to record opens.
 */
async function sendVendorEmails(vendors: Vendor[], event: EventDetails) {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || '';
  const emails = vendors.map((vendor) => {
    const base = generateEmailTemplate(vendor, event);
    const trackingId = Math.random().toString(36).substring(2);
    const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/outreach/track?id=${trackingId}" alt="" style="display:none" />`;
    return {
      to: vendor.email,
      from: fromEmail,
      subject: `Event Inquiry: ${event.date}`,
      html: `${base.replace(/\n/g, '<br/>')}<br/>${trackingPixel}`,
    };
  });
  await sgMail.send(emails);
  return emails.length;
}

export async function POST(request: NextRequest) {
  try {
    const { vendors, event } = await request.json();
    if (!Array.isArray(vendors) || !event) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const count = await sendVendorEmails(vendors as Vendor[], event as EventDetails);
    return NextResponse.json({ status: 'sent', count });
  } catch (err) {
    console.error('Outreach error:', err);
    return NextResponse.json({ error: 'Failed to send outreach emails' }, { status: 500 });
  }
}

/**
 * Webhook handler placeholder. SendGrid can be configured to POST events
 * here for open/click tracking and bounce handling. This endpoint can
 * update vendor statuses in the database based on SendGrid events.
 */
export async function PUT(request: NextRequest) {
  // TODO: handle webhook events from SendGrid for open/click tracking
  return NextResponse.json({ received: true });
}
