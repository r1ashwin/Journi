"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DestinationContent } from "@/lib/types";

export function DestinationCarousel({
  items,
}: {
  items: DestinationContent[];
}) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const go = useCallback(
    (dir: "left" | "right") => {
      setDirection(dir);
      setActive((prev) =>
        dir === "right"
          ? (prev + 1) % items.length
          : (prev - 1 + items.length) % items.length,
      );
    },
    [items.length],
  );

  useEffect(() => {
    const id = setInterval(() => go("right"), 5000);
    return () => clearInterval(id);
  }, [go]);

  const dest = items[active];

  return (
    <div className="relative flex h-[380px] flex-col md:h-[420px]">
      {/* Card */}
      <Link
        href={`/planner?dest=${dest.slug}`}
        key={dest.slug}
        className="group relative flex-1 overflow-hidden rounded-2xl border border-[var(--border)] shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_12px_50px_rgba(0,0,0,0.12)]"
      >
        <Image
          src={dest.image}
          alt={dest.name}
          fill
          className={`object-cover transition-all duration-500 group-hover:scale-[1.02] ${
            direction === "right" ? "animate-slide-in-right" : "animate-slide-in-left"
          }`}
          sizes="(max-width: 768px) 90vw, 440px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              {dest.bestFor.split(",")[0]}
            </p>
            <h3 className="mt-0.5 text-xl font-semibold text-white">
              {dest.name}
            </h3>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {active + 1} / {items.length}
          </span>
        </div>
      </Link>

      {/* Arrows */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => go("left")}
            aria-label="Previous destination"
            className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => go("right")}
            aria-label="Next destination"
            className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <span className="text-xs font-medium tabular-nums text-[var(--muted)]">
          {active + 1} / {items.length}
        </span>
      </div>
    </div>
  );
}
