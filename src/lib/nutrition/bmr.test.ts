import { describe, expect, it } from "vitest";
import { calculateBmr } from "./bmr";

describe("calculateBmr", () => {
  const weightKg = 70;
  const heightCm = 170;
  const age = 30;

  it("male: 10×peso + 6.25×altura − 5×edad + 5", () => {
    expect(calculateBmr("male", weightKg, heightCm, age)).toBe(
      10 * weightKg + 6.25 * heightCm - 5 * age + 5,
    );
  });

  it("female: 10×peso + 6.25×altura − 5×edad − 161", () => {
    expect(calculateBmr("female", weightKg, heightCm, age)).toBe(
      10 * weightKg + 6.25 * heightCm - 5 * age - 161,
    );
  });

  it("other: 10×peso + 6.25×altura − 5×edad − 78 (punto medio de male/female)", () => {
    expect(calculateBmr("other", weightKg, heightCm, age)).toBe(
      10 * weightKg + 6.25 * heightCm - 5 * age - 78,
    );
  });

  it("other es exactamente el punto medio entre male y female para los mismos datos", () => {
    const male = calculateBmr("male", weightKg, heightCm, age);
    const female = calculateBmr("female", weightKg, heightCm, age);
    const other = calculateBmr("other", weightKg, heightCm, age);
    expect(other).toBe((male + female) / 2);
  });
});
