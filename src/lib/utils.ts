import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── cn ───────────────────────────────────────────────────────────────────────
/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 * Standard shadcn/ui utility — used throughout the component library.
 *
 * @example
 *   cn('px-4 py-2', condition && 'bg-red-500', 'px-6')
 *   // → 'py-2 bg-red-500 px-6'  (px-4 overridden by px-6)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── isIframe ─────────────────────────────────────────────────────────────────
/**
 * True when the app is running inside an <iframe>.
 *
 * NOTE: The original used `window.self !== window.top` at module load time,
 * which throws in SSR / Node environments. Wrapped in a try/catch for safety.
 *
 * In KitchenSync this is primarily used to conditionally hide the sidebar
 * or adjust layout when embedded in a third-party page.
 */
export const isIframe: boolean = (() => {
  try {
    return window.self !== window.top;
  } catch {
    // If access to window.top is blocked by cross-origin policy,
    // we're definitely inside an iframe.
    return true;
  }
})();
