"use client";

import type { ReactNode } from "react";

/**
 * Full-height shell matching the global page background (same as home).
 */
export function PlannerAtmosphere({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--background)]">
      {children}
    </div>
  );
}
