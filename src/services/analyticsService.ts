// Sends events to GA4 via the Measurement Protocol (server-side, no browser required).
// Docs: https://developers.google.com/analytics/devguides/collection/protocol/ga4
const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";

export type AnalyticsEvent = {
  name: string;
  params?: Record<string, string | number>;
};

export class AnalyticsService {
  constructor(
    private readonly measurementId = process.env.GA_MEASUREMENT_ID,
    private readonly apiSecret = process.env.GA_API_SECRET,
  ) {}

  async trackEvent(clientId: string, event: AnalyticsEvent): Promise<void> {
    if (!this.measurementId || !this.apiSecret) {
      // GA isn't configured (e.g. local dev without credentials) - skip silently.
      return;
    }

    const url = `${GA_ENDPOINT}?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`;

    try {
      await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          events: [event],
        }),
      });
    } catch (error) {
      // Analytics failures must never break the underlying business operation.
      console.error("Failed to send GA4 event:", error);
    }
  }
}

export const analyticsService = new AnalyticsService();
