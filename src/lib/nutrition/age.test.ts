import { describe, expect, it } from "vitest";
import { calculateAge } from "./age";

describe("calculateAge", () => {
  const asOf = new Date("2026-08-11");

  it("cumpleaños ya pasado este año", () => {
    expect(calculateAge("1995-06-15", asOf)).toBe(31);
  });

  it("cumpleaños todavía no llega este año", () => {
    expect(calculateAge("1995-09-15", asOf)).toBe(30);
  });

  it("cumpleaños es hoy", () => {
    expect(calculateAge("1995-08-11", asOf)).toBe(31);
  });

  it("cumpleaños fue ayer", () => {
    expect(calculateAge("2000-08-10", asOf)).toBe(26);
  });

  it("cumpleaños es mañana", () => {
    expect(calculateAge("2000-08-12", asOf)).toBe(25);
  });
});
