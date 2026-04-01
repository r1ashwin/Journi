import Image from "next/image";
import { Check, Star } from "lucide-react";
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
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-2xl border text-left transition-all duration-200",
        image ? "overflow-hidden" : "p-5",
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)]/50 ring-1 ring-[var(--accent)]/20"
          : "border-[var(--border)] bg-white hover:border-[var(--accent)]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]",
      )}
    >
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
        <div className={cn("min-w-0 flex-1", image ? "py-3 pr-4" : "")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
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
              <h3 className="mt-2 text-[15px] font-semibold leading-tight">{title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
            </div>
            {typeof price === "number" && (
              <div className="shrink-0 text-right">
                <p className="text-lg font-semibold tabular-nums">{formatCurrency(price)}</p>
              </div>
            )}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{reason}</p>
        </div>
      </div>
    </button>
  );
}
