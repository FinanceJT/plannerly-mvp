# Testing Guide for Plannerly

This document outlines how to exercise and validate the core features of the Plannerly application. Use these steps as a checklist when performing manual QA or demonstrating the product to stakeholders.

## 1. Set up the project

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/FinanceJT/plannerly-mvp.git
   cd plannerly-mvp/plannerly
   npm install
   ```
2. Create a `.env.local` file following the structure in `.env.local.sample`. Set the following keys:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Supabase connectivity.
   - `OPENAI_API_KEY` for GPT‑4 interactions.
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for Google Places queries.
   - `SENDGRID_API_KEY` for vendor outreach.
   - (Optional) `SENTRY_DSN` if error tracking is configured.
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 2. Conversation flow

1. Navigate to `/chat` and start a new conversation. Confirm that messages persist across reloads and that the assistant asks follow‑up questions based on your answers.
2. Provide event details (type, date, budget, location). Observe how the conversation state machine progresses and that the input is parsed correctly (check the console for `parseEvent` logs if needed).
3. Verify that long API responses stream smoothly and the typing indicator displays while awaiting the assistant’s reply.

## 3. Vendor search and selection

1. After specifying an event, allow the assistant to suggest vendors. Ensure that vendor cards display names, photos, ratings, price ranges, distances, and review snippets.
2. Try different categories (venue, catering, photography, florist, DJ). Confirm that results come from Google Places and that our in‑memory cache returns the same results on subsequent searches without hitting the API again.
3. Select a vendor and observe how the budget tracker updates. Deselect or reject vendors to verify that allocation reverts accordingly.
4. Switch to compare mode to view vendors side‑by‑side and test the selection/rejection functionality.

## 4. Budget management

1. Open the dashboard and ensure that the budget tracker sidebar reflects allocations, remaining budget, and category breakdowns.
2. Select vendors in different categories and verify overage warnings when the total exceeds the budget.
3. Review the smart recommendations for where to splurge or save. Adjust selections to see these recommendations change.

## 5. Vendor outreach

1. Trigger the outreach feature (this may be a button or command). Provide dummy vendor data with valid email addresses to avoid spamming real businesses.
2. Check that email templates personalize the message based on the event details and vendor style.
3. Verify that the system marks vendors as contacted and tracks open/response statuses (requires SendGrid webhooks to be configured).

## 6. Error and edge cases

1. Search for vendors in a very remote location or with an unsupported category to verify the “no vendors found” message.
2. Temporarily remove your Google Maps API key and observe that the application handles the error gracefully without crashing.
3. Test with extremely high or low budgets to ensure UI components do not break and warnings appear appropriately.
4. Simulate rate limits or network failures (e.g. by disconnecting the internet) to see if retry mechanisms and error boundaries display user‑friendly messages.

## 7. Performance checks

1. Inspect network requests with the browser dev tools. Confirm that vendor searches are cached (subsequent identical requests should not hit the network).
2. Ensure images are lazy‑loaded and that JavaScript bundles are not excessively large. Use Lighthouse to get a performance overview.
3. If deployed on Vercel, verify that edge caching is enabled for static pages like the dashboard.

## 8. Launch readiness

1. Use the provided `test-events.json` file to seed five diverse events in your database or to guide manual tests.
2. Record a demo video highlighting the journey from event creation through vendor discovery, budget management, and outreach.
3. Open the feedback form and confirm submissions are stored or emailed correctly.
4. Review documentation for completeness and clarity.

Following this guide will help ensure that the Plannerly application functions as expected across typical and edge‑case scenarios and is ready for production deployment.
