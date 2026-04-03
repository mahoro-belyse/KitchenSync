import { useState, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768; // px — matches Tailwind's `md:` breakpoint

export function useIsMobile(): boolean {
  // Start as undefined while we wait for the effect to run (SSR-safe).
  // The !! cast means we return false (not undefined) until the effect fires.
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = (): void => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Set initial value immediately
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Listen for viewport changes — { passive: true } for better scroll perf
    mql.addEventListener("change", onChange, {
      passive: true,
    } as AddEventListenerOptions);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
