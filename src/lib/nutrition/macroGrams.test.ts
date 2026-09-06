import { describe, expect, it } from "vitest";
import { macroGramsFromPercentages } from "./macroGrams";

describe("macroGramsFromPercentages", () => {
  it("reparte un objetivo de 2000 kcal en 30/40/30 en los gramos correctos", () => {
    // 30% de 2000 = 600 kcal de proteína / 4 = 150g exactos.
    // 40% de 2000 = 800 kcal de carbohidratos / 4 = 200g exactos.
    // 30% de 2000 = 600 kcal de grasa / 9 = 66.67 → redondea a 67g.
    expect(macroGramsFromPercentages(2000, 30, 40, 30)).toEqual({
      proteinG: 150,
      carbsG: 200,
      fatG: 67,
    });
  });

  it("un macro al 0% da 0 gramos, sin importar las kcal totales", () => {
    expect(macroGramsFromPercentages(2500, 0, 60, 40)).toEqual({
      proteinG: 0,
      carbsG: 375,
      fatG: 111,
    });
  });

  it("kcal objetivo en 0 da 0 gramos en los tres macros, sin dividir por cero", () => {
    expect(macroGramsFromPercentages(0, 30, 40, 30)).toEqual({
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
    });
  });
});
