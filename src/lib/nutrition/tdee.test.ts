import { describe, expect, it } from "vitest";
import { calculateTdee } from "./tdee";
import { ACTIVITY_MULTIPLIERS } from "./constants";
import type { ActivityLevel } from "./types";

describe("calculateTdee", () => {
  const bmr = 1500;

  const levels: ActivityLevel[] = [
    "sedentary",
    "light",
    "moderate",
    "very_active",
    "extra_active",
  ];

  it.each(levels)("%s aplica su multiplicador exacto", (level) => {
    expect(calculateTdee(bmr, level)).toBe(bmr * ACTIVITY_MULTIPLIERS[level]);
  });

  it("los multiplicadores son crecientes según el nivel de actividad", () => {
    const results = levels.map((level) => calculateTdee(bmr, level));
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBeGreaterThan(results[i - 1]);
    }
  });
});
