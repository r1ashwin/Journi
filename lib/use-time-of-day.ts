"use client";

import { CloudSun, Moon, Sun, Sunset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";

export type TimeOfDayPhase = "morning" | "afternoon" | "evening" | "night";

export type TimeOfDayInfo = {
  phase: TimeOfDayPhase;
  label: string;
  /** Local time, locale-formatted */
  clock: string;
  Icon: LucideIcon;
};

function classifyHour(h: number): TimeOfDayPhase {
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

function labelFor(phase: TimeOfDayPhase): string {
  const labels: Record<TimeOfDayPhase, string> = {
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night",
  };
  return labels[phase];
}

function iconFor(phase: TimeOfDayPhase): LucideIcon {
  const icons: Record<TimeOfDayPhase, LucideIcon> = {
    morning: Sun,
    afternoon: CloudSun,
    evening: Sunset,
    night: Moon,
  };
  return icons[phase];
}

/** Updates every minute; for planner “where you are in the day” ambience. */
export function useTimeOfDay(): TimeOfDayInfo {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const phase = classifyHour(now.getHours());
    const clock = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return {
      phase,
      label: labelFor(phase),
      clock,
      Icon: iconFor(phase),
    };
  }, [now]);
}
