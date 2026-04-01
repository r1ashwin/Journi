"use client";

import Link from "next/link";
import { ArrowRight, Copy, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type TripReadyShareProps = {
  summaryHref: string;
  onCopyLink: () => void;
  copied: boolean;
  /** Persist draft before client navigation so Back from summary always restores. */
  onBeforeViewSummary?: () => void;
  /** Wider planner card vs narrow trip sidebar */
  density?: "comfortable" | "compact";
};

export function TripReadyShare({
  summaryHref,
  onCopyLink,
  copied,
  onBeforeViewSummary,
  density = "comfortable",
}: TripReadyShareProps) {
  const compact = density === "compact";

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/40",
        compact ? "p-4" : "p-4 sm:p-5",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-[var(--border)]">
          <Link2 className="size-4 text-[var(--accent)]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-semibold tracking-tight text-[var(--foreground)]",
              compact ? "text-sm" : "text-base",
            )}
          >
            Your trip is ready
          </h3>
          <p className="mt-0.5 text-xs leading-snug text-[var(--muted)] sm:text-sm">
            Copy a share link for friends, or open the full summary.
          </p>
        </div>
      </div>
      <div
        className={cn(
          "mt-3 flex flex-col gap-2",
          !compact && "sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center",
        )}
      >
        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--surface)]"
        >
          <Copy className="size-3.5 shrink-0" aria-hidden />
          {copied ? "Copied link" : "Copy share link"}
        </button>
        <Link
          href={summaryHref}
          onClick={() => onBeforeViewSummary?.()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          View summary
          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
