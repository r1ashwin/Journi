import { afterEach, describe, expect, it } from "vitest";
import {
  PLANNER_DRAFT_STORAGE_KEY,
  clearPlannerDraft,
  readPlannerDraft,
  writePlannerDraft,
} from "@/lib/planner-session";

describe("planner-session", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("roundtrips a valid draft", () => {
    writePlannerDraft({
      token: "abc",
      started: true,
      setupPhase: "details",
      currentStep: "return",
    });
    expect(readPlannerDraft()).toEqual({
      v: 1,
      token: "abc",
      started: true,
      setupPhase: "details",
      currentStep: "return",
    });
  });

  it("returns null for invalid JSON", () => {
    sessionStorage.setItem(PLANNER_DRAFT_STORAGE_KEY, "not-json");
    expect(readPlannerDraft()).toBeNull();
  });

  it("returns null for wrong version", () => {
    sessionStorage.setItem(
      PLANNER_DRAFT_STORAGE_KEY,
      JSON.stringify({ v: 2, token: "x", started: true, setupPhase: "details", currentStep: "return" }),
    );
    expect(readPlannerDraft()).toBeNull();
  });

  it("clearPlannerDraft removes storage", () => {
    writePlannerDraft({
      token: "x",
      started: false,
      setupPhase: "destination",
      currentStep: "setup",
    });
    clearPlannerDraft();
    expect(sessionStorage.getItem(PLANNER_DRAFT_STORAGE_KEY)).toBeNull();
  });
});
