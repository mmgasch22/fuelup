import { describe, expect, it } from "vitest";
import { addDays, isValidIsoDate, resolveRequestedDate, todayIso } from "./dates";

describe("isValidIsoDate", () => {
  it("acepta una fecha ISO real", () => {
    expect(isValidIsoDate("2026-08-20")).toBe(true);
  });

  it("rechaza un formato incorrecto", () => {
    expect(isValidIsoDate("20-08-2026")).toBe(false);
    expect(isValidIsoDate("2026-8-20")).toBe(false);
    expect(isValidIsoDate("not-a-date")).toBe(false);
  });

  it("rechaza una fecha de calendario que no existe", () => {
    expect(isValidIsoDate("2026-02-30")).toBe(false);
    expect(isValidIsoDate("2026-13-01")).toBe(false);
  });
});

describe("resolveRequestedDate", () => {
  const today = todayIso();

  it("devuelve hoy si no se pasa valor", () => {
    expect(resolveRequestedDate(undefined)).toBe(today);
    expect(resolveRequestedDate(null)).toBe(today);
    expect(resolveRequestedDate("")).toBe(today);
  });

  it("devuelve hoy si el valor no es una fecha ISO válida", () => {
    expect(resolveRequestedDate("no-es-fecha")).toBe(today);
  });

  it("devuelve hoy si la fecha pedida es futura, nunca la deja pasar", () => {
    expect(resolveRequestedDate(addDays(today, 5))).toBe(today);
  });

  it("devuelve la fecha pedida si es válida y no es futura", () => {
    const yesterday = addDays(today, -1);
    expect(resolveRequestedDate(yesterday)).toBe(yesterday);
    expect(resolveRequestedDate(today)).toBe(today);
  });
});

describe("addDays", () => {
  it("suma días dentro del mismo mes", () => {
    expect(addDays("2026-08-10", 5)).toBe("2026-08-15");
  });

  it("resta días dentro del mismo mes", () => {
    expect(addDays("2026-08-10", -1)).toBe("2026-08-09");
  });

  it("cruza el límite de mes", () => {
    expect(addDays("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDays("2026-09-01", -1)).toBe("2026-08-31");
  });

  it("cruza el límite de año", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });
});
