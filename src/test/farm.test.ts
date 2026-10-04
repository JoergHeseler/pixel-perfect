import { describe, it, expect } from "vitest";
import { roundCoord, stepArea, isValidPhone } from "@/lib/farm";

describe("farm rules", () => {
  it("rounds coordinates to 2 decimals", () => {
    expect(roundCoord(12.34567)).toBe(12.35);
    expect(roundCoord(75.8912)).toBe(75.89);
  });
  it("steps field size by 0.5 acre", () => {
    expect(stepArea(1, 1)).toBe(1.5);
    expect(stepArea(1.5, -1)).toBe(1);
    expect(stepArea(0.5, -1)).toBe(0.5);
  });
  it("needs exactly 10 digits", () => {
    expect(isValidPhone("9876543210")).toBe(true);
    expect(isValidPhone("987654321")).toBe(false);
  });
});
