import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
          <div className="space-y-5">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
              Get live destinations, hotels, and flights, all in one place.
            </h1>
            <p className="max-w-xl text-xl font-medium leading-snug text-[var(--foreground)] md:text-2xl">
              Turn trip research into a calm flow. Step-by-step choices in one
              view, totals that keep up, room for outings, and a plan you can
              share.
            </p>
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] md:px-7 md:py-4 md:text-lg"
            >
              Start planning
              <ArrowRight className="size-5" />
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
                href={`/planner?dest=${dest.slug}`}
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
