import { describe, expect, it } from "vitest";
import { sumKcalByDate, type DateFoodLogEntry } from "./dailyKcalSeries";

function entry(
  date: string,
  grams: number,
  kcal100g: number,
  overrides: Partial<DateFoodLogEntry["food"]> = {},
): DateFoodLogEntry {
  return {
    date,
    grams,
    food: {
      kcal_100g: kcal100g,
      protein_100g: 0,
      carbs_100g: 0,
      fat_100g: 0,
      ...overrides,
    },
  };
}

describe("sumKcalByDate", () => {
  it("agrupa varias entradas del mismo día y suma sus kcal", () => {
    const entries = [
      entry("2026-09-01", 100, 100), // 100 kcal
      entry("2026-09-01", 50, 200), // 100 kcal
    ];

    expect(sumKcalByDate(entries)).toEqual([{ date: "2026-09-01", kcal: 200 }]);
  });

  it("separa correctamente varios días distintos", () => {
    const entries = [
      entry("2026-09-01", 100, 100),
      entry("2026-09-02", 100, 150),
      entry("2026-09-03", 100, 200),
    ];

    expect(sumKcalByDate(entries)).toEqual([
      { date: "2026-09-01", kcal: 100 },
      { date: "2026-09-02", kcal: 150 },
      { date: "2026-09-03", kcal: 200 },
    ]);
  });

  it("sin entradas, no inventa ningún día (un día sin comer no es asunto de esta función)", () => {
    expect(sumKcalByDate([])).toEqual([]);
  });

  it("reutiliza calculateDailyTotals: un macro nulo no rompe la suma de kcal", () => {
    const entries = [entry("2026-09-01", 100, 120, { protein_100g: null, fat_100g: null })];

    expect(sumKcalByDate(entries)).toEqual([{ date: "2026-09-01", kcal: 120 }]);
  });

  it("no pierde registros por fecha y ordena por fecha aunque la entrada venga desordenada", () => {
    const entries = [
      entry("2026-09-03", 100, 100),
      entry("2026-09-01", 100, 100),
      entry("2026-09-01", 100, 100), // segunda entrada del mismo día 1
      entry("2026-09-02", 100, 100),
    ];

    expect(sumKcalByDate(entries)).toEqual([
      { date: "2026-09-01", kcal: 200 },
      { date: "2026-09-02", kcal: 100 },
      { date: "2026-09-03", kcal: 100 },
    ]);
  });
});
