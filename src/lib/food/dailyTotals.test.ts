import { describe, expect, it } from "vitest";
import { calculateDailyTotals, type FoodLogEntry } from "./dailyTotals";

describe("calculateDailyTotals", () => {
  it("suma kcal y macros proporcionalmente a los gramos de una sola entrada", () => {
    const entries: FoodLogEntry[] = [
      {
        grams: 150,
        food: { kcal_100g: 200, protein_100g: 20, carbs_100g: 10, fat_100g: 5 },
      },
    ];

    expect(calculateDailyTotals(entries)).toEqual({
      kcal: 300,
      proteinG: 30,
      carbsG: 15,
      fatG: 8,
      proteinIncomplete: false,
      carbsIncomplete: false,
      fatIncomplete: false,
    });
  });

  it("acumula varias entradas, sin importar su meal_type (eso lo agrupa quien la llama)", () => {
    const entries: FoodLogEntry[] = [
      {
        grams: 100,
        food: { kcal_100g: 100, protein_100g: 10, carbs_100g: 10, fat_100g: 2 },
      },
      {
        grams: 200,
        food: { kcal_100g: 50, protein_100g: 5, carbs_100g: 5, fat_100g: 1 },
      },
    ];

    expect(calculateDailyTotals(entries)).toEqual({
      kcal: 200,
      proteinG: 20,
      carbsG: 20,
      fatG: 4,
      proteinIncomplete: false,
      carbsIncomplete: false,
      fatIncomplete: false,
    });
  });

  it("marca cada macro nulo como incompleto en vez de sumarlo como 0", () => {
    const entries: FoodLogEntry[] = [
      {
        grams: 100,
        food: { kcal_100g: 80, protein_100g: null, carbs_100g: null, fat_100g: null },
      },
    ];

    expect(calculateDailyTotals(entries)).toEqual({
      kcal: 80,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      proteinIncomplete: true,
      carbsIncomplete: true,
      fatIncomplete: true,
    });
  });

  it("con varias entradas, suma solo las que tienen el dato y marca incompleto si alguna no lo tiene", () => {
    const entries: FoodLogEntry[] = [
      {
        grams: 100,
        food: { kcal_100g: 100, protein_100g: 10, carbs_100g: 10, fat_100g: 5 },
      },
      {
        grams: 100,
        food: { kcal_100g: 50, protein_100g: null, carbs_100g: 5, fat_100g: 2 },
      },
    ];

    expect(calculateDailyTotals(entries)).toEqual({
      kcal: 150,
      proteinG: 10, // solo la primera entrada aporta proteína conocida
      carbsG: 15,
      fatG: 7,
      proteinIncomplete: true,
      carbsIncomplete: false,
      fatIncomplete: false,
    });
  });

  it("devuelve todo a 0 y nada incompleto sin entradas", () => {
    expect(calculateDailyTotals([])).toEqual({
      kcal: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      proteinIncomplete: false,
      carbsIncomplete: false,
      fatIncomplete: false,
    });
  });
});
