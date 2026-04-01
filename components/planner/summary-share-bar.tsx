"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

/**
 * Full-page summary: show the current URL so people can copy the real share link.
 */
export function SummaryShareBar() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(typeof window !== "undefined" ? window.location.href : "");
  }, []);

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link2 className="size-4 shrink-0 text-[var(--accent)]" aria-hidden />
        <h2 className="text-sm font-semibold tracking-tight">
          Share this itinerary
        </h2>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-[var(--muted)] sm:text-sm">
        Anyone with this link can view this trip summary. It does not let them
        change your bookings.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          readOnly
          value={url}
          aria-label="Share link"
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 font-mono text-[11px] text-[var(--foreground)] sm:text-xs"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] sm:px-5"
        >
          {copied ? (
            <>
              <Check className="size-4" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-4" aria-hidden />
              Copy link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
