import { describe, it, expect } from "vitest";
import { computeArrival, bestMatch } from "@/lib/attendance";

const at = (h: number, m: number) => new Date(2026, 9, 16, h, m);

describe("arrival status", () => {
  it("is present when arriving before start", () => {
    expect(computeArrival(at(7, 20), "07:30", 10)).toEqual({ status: "present", lateMinutes: 0 });
  });
  it("is present within the grace period", () => {
    expect(computeArrival(at(7, 40), "07:30", 10).status).toBe("present");
  });
  it("is late after grace, minutes counted from start", () => {
    expect(computeArrival(at(7, 45), "07:30", 10)).toEqual({ status: "late", lateMinutes: 15 });
  });
});

describe("face matching", () => {
  it("ignores unknown faces beyond the threshold", () => {
    expect(bestMatch([1, 1], [{ id: "a", descriptor: [0, 0] }], 0.5)).toBeNull();
  });
  it("matches a registered face", () => {
    expect(bestMatch([0.1, 0], [{ id: "a", descriptor: [0, 0] }], 0.5)?.id).toBe("a");
  });
});
