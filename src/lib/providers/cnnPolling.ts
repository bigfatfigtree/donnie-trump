/**
 * CNN Poll of Polls adapter.
 *
 * CNN does not expose a stable public polling API.
 * This module is deliberately conservative:
 * - Prefer manual override stored in Supabase
 * - Optional lightweight parse of public CNN pages if structure remains stable
 * - On failure: return status "unavailable" so the UI shows
 *   "CNN DATA TEMPORARILY UNAVAILABLE"
 *
 * Never silently substitute another pollster.
 */

import type { PollingMetric } from "@/types";

export async function fetchCnnPollOfPolls(): Promise<PollingMetric> {
  // 1. Prefer manual override from Supabase (implemented in the function layer)
  // 2. Attempt conservative public-source retrieval (placeholder)
  // 3. Fall back to unavailable

  // Placeholder: in production the Netlify function will:
  // - check manual_overrides table first
  // - optionally attempt a permitted public page parse
  // - write historical values when a new number is confirmed

  return {
    id: "unavailable",
    pollster: "CNN Poll of Polls",
    approval: null,
    disapproval: null,
    net: null,
    period_label: null,
    source_url: "https://www.cnn.com/politics/polls",
    source_date: null,
    fetched_at: new Date().toISOString(),
    is_manual: false,
    status: "unavailable",
  };
}
