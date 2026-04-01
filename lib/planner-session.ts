export const PLANNER_DRAFT_STORAGE_KEY = "journi:plannerDraft_v1";

export type PlannerDraftNav = {
  started: boolean;
  setupPhase: "destination" | "details";
  currentStep: "setup" | "outbound" | "stay" | "activities" | "return";
};

export type PlannerDraftV1 = PlannerDraftNav & {
  v: 1;
  token: string;
};

function isNavStep(
  x: unknown,
): x is PlannerDraftNav["currentStep"] {
  return (
    x === "setup" ||
    x === "outbound" ||
    x === "stay" ||
    x === "activities" ||
    x === "return"
  );
}

export function readPlannerDraft(): PlannerDraftV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PLANNER_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const rec = o as Record<string, unknown>;
    if (rec.v !== 1 || typeof rec.token !== "string" || !rec.token) return null;
    if (typeof rec.started !== "boolean") return null;
    if (rec.setupPhase !== "destination" && rec.setupPhase !== "details")
      return null;
    if (!isNavStep(rec.currentStep)) return null;
    return {
      v: 1,
      token: rec.token,
      started: rec.started,
      setupPhase: rec.setupPhase,
      currentStep: rec.currentStep,
    };
  } catch {
    return null;
  }
}

export function writePlannerDraft(
  draft: PlannerDraftNav & { token: string },
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PlannerDraftV1 = { v: 1, ...draft };
    window.sessionStorage.setItem(
      PLANNER_DRAFT_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // quota / private mode
  }
}

export function clearPlannerDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PLANNER_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
