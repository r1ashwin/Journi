import { Check, CircleDot, Circle, Moon, Pencil } from "lucide-react";
import { formatCurrency, formatMinutes } from "@/lib/planner";
import { cn } from "@/lib/utils";
import type {
  ActivityOption,
  FlightOption,
  StayOption,
  TransferOption,
} from "@/lib/types";

type TripCanvasProps = {
  total: number;
  perPerson: number;
  totalMinutes: number;
  outbound?: FlightOption;
  stay?: StayOption;
  transfer?: TransferOption;
  activities: ActivityOption[];
  returnFlight?: FlightOption;
  currentStep: "outbound" | "stay" | "activities" | "return";
  onEdit: (step: "outbound" | "stay" | "activities" | "return") => void;
  /** Before the 4 steps: show budget / length / group and a placeholder timeline */
  previewMode?: boolean;
  previewBasics?: {
    budget: number;
    days: number;
    travelers: number;
    routeLabel: string;
  };
  /** Hotel nights (trip days − 1); shows sleep pacing in the timeline. */
  tripNights?: number;
  sleepHoursPerNight?: number;
};

type StepStatus = "complete" | "current" | "upcoming";

export function TripCanvas({
  total,
  perPerson,
  totalMinutes,
  outbound,
  stay,
  transfer,
  activities,
  returnFlight,
  currentStep,
  onEdit,
  previewMode = false,
  previewBasics,
  tripNights,
  sleepHoursPerNight = 8,
}: TripCanvasProps) {
  const stepOrder: Array<"outbound" | "stay" | "activities" | "return"> = [
    "outbound",
    "stay",
    "activities",
    "return",
  ];
  const currentIdx = stepOrder.indexOf(currentStep);

  function getStatus(step: typeof stepOrder[number]): StepStatus {
    if (previewMode) return "upcoming";
    const idx = stepOrder.indexOf(step);
    if (idx < currentIdx) return "complete";
    if (idx === currentIdx) return "current";
    return "upcoming";
  }

  const showEdit = !previewMode;

  const nights =
    tripNights ??
    (previewMode && previewBasics
      ? Math.max(previewBasics.days - 1, 1)
      : undefined);

  return (
    <aside className="rounded-2xl border border-[var(--border)] bg-white p-5 lg:sticky lg:top-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        Your trip
      </p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">Taking shape</h2>
      {previewMode && previewBasics && (
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          {previewBasics.routeLabel} — flights, stay, and activities appear here
          after you start.
        </p>
      )}

      <div
        className={cn(
          "mt-4 grid gap-2",
          previewMode && previewBasics
            ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-2 lg:grid-cols-4",
        )}
      >
        {previewMode && previewBasics ? (
          <>
            <Metric label="Budget" value={formatCurrency(previewBasics.budget)} />
            <Metric label="Length" value={`${previewBasics.days} days`} />
            <Metric label="Travelers" value={String(previewBasics.travelers)} />
            {nights != null && nights > 0 ? (
              <Metric
                label="Hotel rest"
                value={`~${nights * sleepHoursPerNight}h`}
              />
            ) : (
              <Metric label="Hotel rest" value="—" />
            )}
          </>
        ) : (
          <>
            <Metric label="Total" value={formatCurrency(total)} />
            <Metric label="Per person" value={formatCurrency(perPerson)} />
            <Metric label="Active time" value={formatMinutes(totalMinutes)} />
            {nights != null && nights > 0 ? (
              <Metric
                label="Hotel rest"
                value={`~${nights * sleepHoursPerNight}h`}
              />
            ) : (
              <Metric label="Hotel rest" value="—" />
            )}
          </>
        )}
      </div>

      <div className="mt-6">
        <TimelineItem
          status={getStatus("outbound")}
          title="Outbound"
          subtitle={
            outbound
              ? `${outbound.label} · ${outbound.departTime} → ${outbound.arriveTime}`
              : "Pick your outbound flight"
          }
          meta={outbound ? formatCurrency(outbound.price) : undefined}
          onEdit={showEdit ? () => onEdit("outbound") : undefined}
          isLast={false}
        />
        <TimelineItem
          status={getStatus("stay")}
          title="Stay"
          subtitle={
            stay
              ? `${stay.name} · ${stay.area}`
              : "Choose where to stay"
          }
          meta={stay ? `${formatCurrency(stay.nightlyPrice)}/night` : undefined}
          onEdit={showEdit ? () => onEdit("stay") : undefined}
          isLast={false}
        />
        {!previewMode && nights != null && nights > 0 && (
          <RestAtHotelRow nights={nights} sleepHours={sleepHoursPerNight} />
        )}
        {!previewMode && transfer && (
          <TimelineItem
            status={stay ? "complete" : "upcoming"}
            title="Transfer"
            subtitle={`${transfer.label} · ${transfer.duration}`}
            meta={formatCurrency(transfer.cost)}
            isLast={false}
          />
        )}
        <TimelineItem
          status={getStatus("activities")}
          title="Activities"
          subtitle={
            activities.length > 0
              ? activities.map((a) => a.name).join(", ")
              : "Add activity picks"
          }
          meta={activities.length > 0 ? `${activities.length} selected` : undefined}
          onEdit={showEdit ? () => onEdit("activities") : undefined}
          isLast={false}
        />
        <TimelineItem
          status={getStatus("return")}
          title="Return"
          subtitle={
            returnFlight
              ? `${returnFlight.label} · ${returnFlight.departTime} → ${returnFlight.arriveTime}`
              : "Choose your return flight"
          }
          meta={returnFlight ? formatCurrency(returnFlight.price) : undefined}
          onEdit={showEdit ? () => onEdit("return") : undefined}
          isLast={true}
        />
      </div>
    </aside>
  );
}

function RestAtHotelRow({
  nights,
  sleepHours,
}: {
  nights: number;
  sleepHours: number;
}) {
  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-50 text-indigo-700">
          <Moon className="size-3" strokeWidth={2.5} />
        </div>
        <div className="mt-1 w-px flex-1 bg-[var(--border)]" />
      </div>
      <div className="flex-1 pb-5">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Nights & sleep
        </p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted)]">
          {nights} night{nights === 1 ? "" : "s"} at your hotel (~{sleepHours}h
          rest each night) — counted in how your days feel, not as a paid
          activity.
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface)]/60 px-3 py-2.5">
      <p className="text-[11px] text-[var(--muted)]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function TimelineItem({
  status,
  title,
  subtitle,
  meta,
  onEdit,
  isLast,
}: {
  status: StepStatus;
  title: string;
  subtitle: string;
  meta?: string;
  onEdit?: () => void;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
            status === "complete" && "bg-[var(--accent)]",
            status === "current" && "border-2 border-[var(--accent)] bg-white",
            status === "upcoming" && "border-2 border-[var(--border)] bg-white",
          )}
        >
          {status === "complete" && <Check className="size-3 text-white" strokeWidth={3} />}
          {status === "current" && <CircleDot className="size-3 text-[var(--accent)]" />}
          {status === "upcoming" && <Circle className="size-2.5 text-[var(--border)]" />}
        </div>
        {!isLast && (
          <div
            className={cn(
              "mt-1 w-px flex-1",
              status === "complete" ? "bg-[var(--accent)]/30" : "bg-[var(--border)]",
            )}
          />
        )}
      </div>

      <div className={cn("flex-1 pb-5", isLast && "pb-0")}>
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-sm font-semibold",
              status === "upcoming" && "text-[var(--muted)]",
            )}
          >
            {title}
          </p>
          {onEdit && status !== "upcoming" && (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              <Pencil className="size-3" />
              Edit
            </button>
          )}
        </div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted)]">{subtitle}</p>
        {meta && (
          <p className="mt-0.5 text-[13px] font-medium text-[var(--foreground)]">{meta}</p>
        )}
      </div>
    </div>
  );
}
