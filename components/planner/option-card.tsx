import Image from "next/image";
import { Check, ExternalLink, Star } from "lucide-react";
import { formatCurrency } from "@/lib/planner";
import { cn } from "@/lib/utils";

type OptionCardProps = {
  title: string;
  subtitle: string;
  price?: number;
  tag: string;
  reason: string;
  selected?: boolean;
  onClick: () => void;
  image?: string;
  rating?: number;
  /** Opens in new tab; card selection stays on the main button area. */
  footerLink?: { href: string; label: string };
};

export function OptionCard({
  title,
  subtitle,
  price,
  tag,
  reason,
  selected,
  onClick,
  image,
  rating,
  footerLink,
}: OptionCardProps) {
  const shellClass = cn(
    "rounded-2xl border text-left transition-all duration-200",
    footerLink ? "overflow-hidden" : "",
    image && !footerLink ? "overflow-hidden" : "",
    !footerLink && !image ? "p-5" : "",
    selected
      ? "border-[var(--accent)] bg-[var(--accent-soft)]/50 ring-1 ring-[var(--accent)]/20"
      : "border-[var(--border)] bg-white hover:border-[var(--accent)]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]",
  );

  const body = (
    <div className={cn("flex gap-4", image ? "flex-row" : "flex-col")}>
        {image && (
          <div className="relative h-28 w-28 shrink-0 overflow-hidden sm:h-32 sm:w-32">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        )}
        <div
          className={cn(
            "min-w-0 flex-1",
            image ? "py-3 pr-4" : "",
            footerLink && image ? "pb-1" : "",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
                    selected
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface)] text-[var(--muted)]",
                  )}
                >
                  {tag}
                </span>
                {rating != null && rating > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    {rating.toFixed(1)}
                  </span>
                )}
                {selected && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                    <Check className="size-3.5" />
                    Selected
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight">
                {title}
              </h3>
              <p className="mt-1 text-[13px] leading-snug text-[var(--muted)]">
                {subtitle}
              </p>
            </div>
            {typeof price === "number" && (
              <div className="shrink-0 text-right">
                <p className="text-lg font-semibold tabular-nums">{formatCurrency(price)}</p>
              </div>
            )}
          </div>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--muted)]">
            {reason}
          </p>
        </div>
      </div>
  );

  if (footerLink) {
    return (
      <div className={shellClass}>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "group relative w-full text-left",
            image ? "pb-3 pl-0 pr-0 pt-0" : "p-5",
          )}
        >
          {body}
        </button>
        <a
          href={footerLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 border-t border-[var(--border)] bg-[var(--surface)]/40 px-4 py-2.5 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]/50"
          onClick={(e) => e.stopPropagation()}
        >
          {footerLink.label}
          <ExternalLink className="size-3 opacity-70" />
        </a>
      </div>
    );
  }

  return (
    <button type="button" onClick={onClick} className={shellClass}>
      {body}
    </button>
  );
}
