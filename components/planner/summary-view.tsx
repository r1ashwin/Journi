import Image from "next/image";
import {
  ExternalLink,
  Plane,
  Hotel,
  Map,
  CarFront,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatMinutes, getDestinationContent } from "@/lib/planner";
import type { SummaryPlan } from "@/lib/types";

type SummaryViewProps = {
  plan: SummaryPlan;
};

export function SummaryView({ plan }: SummaryViewProps) {
  const {
    basics,
    outbound,
    stay,
    stayTotal,
    transfer,
    activities,
    returnFlight,
    total,
    perPerson,
    totalDurationMinutes,
  } = plan;

  const dest = getDestinationContent(basics.destination);
  const destName =
    basics.destination.charAt(0).toUpperCase() + basics.destination.slice(1);
  const budgetPct = basics.budget > 0 ? Math.round((total / basics.budget) * 100) : 0;
  const budgetStatus =
    budgetPct <= 80 ? "under" : budgetPct <= 100 ? "close" : "over";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative aspect-[21/9] w-full sm:aspect-[3/1]">
          <Image
            src={dest.image}
            alt={dest.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 700px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Your trip
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
              {basics.sourceCity} &rarr; {destName}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {basics.days} days &middot; {basics.travelers} traveler
              {basics.travelers > 1 ? "s" : ""} &middot;{" "}
              {basics.style.toLowerCase()} &middot; {basics.startDate}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Total cost" value={formatCurrency(total)} />
        <MetricCard label="Per person" value={formatCurrency(perPerson)} />
        <MetricCard
          label="Travel time"
          value={formatMinutes(totalDurationMinutes)}
        />
        <div
          className={`rounded-xl px-4 py-3 ${
            budgetStatus === "under"
              ? "bg-emerald-50"
              : budgetStatus === "close"
                ? "bg-amber-50"
                : "bg-red-50"
          }`}
        >
          <p className="text-[11px] text-[var(--muted)]">
            Budget ({formatCurrency(basics.budget)})
          </p>
          <p
            className={`mt-0.5 text-base font-semibold ${
              budgetStatus === "under"
                ? "text-emerald-700"
                : budgetStatus === "close"
                  ? "text-amber-700"
                  : "text-red-700"
            }`}
          >
            {budgetPct}% used
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="grid gap-3 sm:grid-cols-2">
        {outbound && (
          <BookingCard
            icon={<Plane className="size-4" />}
            label="Outbound flight"
            title={outbound.label}
            detail={`${outbound.departTime} → ${outbound.arriveTime}`}
            price={outbound.price}
            bookingId={outbound.bookingId}
          />
        )}
        {returnFlight && (
          <BookingCard
            icon={<Plane className="size-4 rotate-180" />}
            label="Return flight"
            title={returnFlight.label}
            detail={`${returnFlight.departTime} → ${returnFlight.arriveTime}`}
            price={returnFlight.price}
            bookingId={returnFlight.bookingId}
          />
        )}
        {stay && (
          <BookingCard
            icon={<Hotel className="size-4" />}
            label="Accommodation"
            title={`${stay.name}`}
            detail={`${stay.area} · ${formatCurrency(stay.nightlyPrice)}/night`}
            price={stayTotal}
            bookingUrl={stay.bookingUrl}
            image={stay.image}
          />
        )}
        {transfer && (
          <BookingCard
            icon={<CarFront className="size-4" />}
            label="Transfer"
            title={transfer.label}
            detail={transfer.duration}
            price={transfer.cost}
          />
        )}
      </div>

      {activities.length > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--accent)]" />
            <h2 className="text-sm font-semibold">Activities</h2>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {activities.map((activity) => (
              <BookingCard
                key={activity.id}
                icon={<Map className="size-4" />}
                label={activity.tag}
                title={activity.name}
                detail={activity.duration}
                price={activity.cost}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface)]/60 px-4 py-3">
      <p className="text-[11px] text-[var(--muted)]">{label}</p>
      <p className="mt-0.5 text-base font-semibold">{value}</p>
    </div>
  );
}

function BookingCard({
  icon,
  label,
  title,
  detail,
  price,
  bookingId,
  bookingUrl,
  image,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  detail: string;
  price: number;
  bookingId?: string;
  bookingUrl?: string;
  image?: string;
}) {
  const hasLink = bookingId || bookingUrl;
  const href = bookingUrl || (bookingId ? `https://ignav.com/book/${bookingId}` : undefined);

  return (
    <div className="flex overflow-hidden rounded-xl border border-[var(--border)]">
      {image && (
        <div className="relative hidden w-24 shrink-0 sm:block">
          <Image src={image} alt={title} fill className="object-cover" sizes="96px" />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <div className="flex items-center gap-1.5 text-[var(--accent)]">
            {icon}
            <p className="text-xs font-semibold">{label}</p>
          </div>
          <p className="mt-1 text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{detail}</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-semibold tabular-nums">
            {formatCurrency(price)}
          </p>
          {hasLink && href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Book
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
