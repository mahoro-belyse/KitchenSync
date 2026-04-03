// ─── Types ────────────────────────────────────────────────────────────────────
export type PlanParam = "free" | "pro" | "family";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Read a single URL search param safely.
 * Returns null if running in a non-browser environment (SSR-safe).
 *
 * @example
 *   const plan = getUrlParam('plan'); // → 'pro' | null
 */
export const getUrlParam = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
};

/**
 * Read the `?plan=` param set by the pricing page CTAs.
 * Falls back to 'free' if param is absent or unrecognised.
 *
 * @example
 *   // URL: /signup?plan=pro
 *   const plan = getSelectedPlan(); // → 'pro'
 */
export const getSelectedPlan = (): PlanParam => {
  const raw = getUrlParam("plan");
  const valid: PlanParam[] = ["free", "pro", "family"];
  return valid.includes(raw as PlanParam) ? (raw as PlanParam) : "free";
};

/**
 * Remove a param from the current URL without triggering a page reload.
 * Useful for cleaning up one-time params (e.g. OAuth callback tokens).
 *
 * @example
 *   removeUrlParam('plan'); // /signup?plan=pro → /signup
 */
export const removeUrlParam = (key: string): void => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  params.delete(key);
  const newUrl = `${window.location.pathname}${
    params.toString() ? `?${params.toString()}` : ""
  }${window.location.hash}`;
  window.history.replaceState({}, document.title, newUrl);
};
