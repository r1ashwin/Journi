import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { destinations } from "@/lib/travel-data";
import { DestinationCarousel } from "@/components/destination-carousel";

const destinationList = Object.values(destinations);

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-8 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Journi
          </Link>
          <Link
            href="/planner"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Start planning
          </Link>
        </header>

        <section className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-[var(--accent)]">
              <Sparkles className="size-3.5" />
              India trip planner
            </span>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              Plan your trip, one choice at a time.
            </h1>
            <p className="max-w-lg text-[15px] leading-7 text-[var(--muted)]">
              Journi turns messy trip research into a calm visual flow. Real
              flights, real stays, and real transfer estimates — through clean
              blocks while your full trip builds live on the side.
            </p>
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Start planning
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <DestinationCarousel items={destinationList} />
        </section>

        {/* Destination cards */}
        <section>
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {destinationList.length} destinations
            </p>
            <Link
              href="/planner"
              className="text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
            >
              Explore all &rarr;
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {destinationList.map((dest) => (
              <Link
                key={dest.slug}
                href="/planner"
                className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="font-semibold text-white drop-shadow-sm">
                      {dest.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-white/80">
                      {dest.bestFor.split(",")[0]}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
