import { describe, expect, it } from "vitest";
import { calculateNutritionTargets } from "./targets";
import { MIN_CARBS_G, MIN_FAT_G_PER_KG } from "./constants";
import type { Goal } from "./types";

describe("calculateNutritionTargets — modo automático (sin overrides)", () => {
  const weightKg = 70;
  const tdee = 2500;

  it("lose: −20% kcal, proteína 2.0 g/kg, grasa 0.8 g/kg", () => {
    const result = calculateNutritionTargets({ tdee, weightKg, goal: "lose" });
    expect(result).toEqual({
      feasible: true,
      kcalTarget: 2000, // 2500 × 0.8
      proteinG: 140, // 2.0 × 70
      fatG: 56, // 0.8 × 70
      carbsG: 234, // (2000 − 560 − 504) / 4
      warning: undefined,
    });
  });

  it("maintain: 0% kcal, proteína 1.8 g/kg, grasa 0.8 g/kg", () => {
    const result = calculateNutritionTargets({ tdee, weightKg, goal: "maintain" });
    expect(result).toEqual({
      feasible: true,
      kcalTarget: 2500,
      proteinG: 126, // 1.8 × 70
      fatG: 56,
      carbsG: 373, // (2500 − 504 − 504) / 4
      warning: undefined,
    });
  });

  it("gain: +15% kcal, proteína 1.8 g/kg, grasa 0.8 g/kg", () => {
    const result = calculateNutritionTargets({ tdee, weightKg, goal: "gain" });
    expect(result).toEqual({
      feasible: true,
      kcalTarget: 2875, // 2500 × 1.15
      proteinG: 126,
      fatG: 56,
      carbsG: 467, // (2875 − 504 − 504) / 4, redondeado
      warning: undefined,
    });
  });

  const goals: Goal[] = ["lose", "maintain", "gain"];

  it.each(goals)("%s: nunca es feasible=false en un caso normal", (goal) => {
    const result = calculateNutritionTargets({ tdee, weightKg, goal });
    expect(result.feasible).toBe(true);
    expect(result.carbsG).toBeGreaterThanOrEqual(MIN_CARBS_G);
  });
});

describe("calculateNutritionTargets — cascada de seguridad (overrides agresivos)", () => {
  it("reduce la grasa hacia su suelo antes de tocar el carbohidrato mínimo, sin tocar la proteína", () => {
    // tdee elegido para que kcalTarget = 715 con el ajuste de "lose" (-20%)
    const result = calculateNutritionTargets({
      tdee: 893.75,
      weightKg: 30,
      goal: "lose",
      overrides: { proteinGPerKg: 3, fatGPerKg: 2 },
    });

    // Proteína: nunca se reduce por debajo de lo pedido (3 g/kg × 30kg = 90g)
    expect(result.proteinG).toBe(90);

    // Grasa: reducida respecto al objetivo (2 g/kg × 30kg = 60g), pero sin
    // bajar de su suelo mínimo (0.5 g/kg × 30kg = 15g)
    const targetFatG = 2 * 30;
    const minFatG = MIN_FAT_G_PER_KG * 30;
    expect(result.fatG).toBeLessThan(targetFatG);
    expect(result.fatG).toBeGreaterThanOrEqual(minFatG);

    // Carbohidratos: nunca por debajo del suelo mínimo
    expect(result.carbsG).toBeGreaterThanOrEqual(MIN_CARBS_G);

    expect(result.feasible).toBe(true);
    expect(result.warning).toBeDefined();
  });

  it("caso límite: la grasa queda pinchada exactamente en su suelo mínimo y aun así es viable por poco", () => {
    const result = calculateNutritionTargets({
      tdee: 867.5, // kcalTarget = 694 con -20%
      weightKg: 30,
      goal: "lose",
      overrides: { proteinGPerKg: 3, fatGPerKg: 2 },
    });

    expect(result.proteinG).toBe(90);
    expect(result.fatG).toBe(MIN_FAT_G_PER_KG * 30); // 15g, en el suelo exacto
    expect(result.carbsG).toBe(MIN_CARBS_G); // 50g, en el suelo exacto
    expect(result.feasible).toBe(true);
  });

  it("caso inviable: ni siquiera con la grasa en su suelo mínimo caben los 50g de carbohidratos — no se inventa un plan, se marca feasible=false", () => {
    const result = calculateNutritionTargets({
      tdee: 781.25, // kcalTarget = 625 con -20%
      weightKg: 30,
      goal: "lose",
      overrides: { proteinGPerKg: 5, fatGPerKg: 2 },
    });

    // La proteína sigue sin tocarse ni siquiera cuando el plan es inviable
    expect(result.proteinG).toBe(150); // 5 g/kg × 30kg

    // La grasa queda en su suelo mínimo, nunca más abajo
    expect(result.fatG).toBe(MIN_FAT_G_PER_KG * 30);

    // Los carbohidratos nunca se devuelven negativos, aunque la cuenta salga negativa
    expect(result.carbsG).toBeGreaterThanOrEqual(0);
    expect(result.carbsG).toBeLessThan(MIN_CARBS_G);

    expect(result.feasible).toBe(false);
    expect(result.warning).toBeDefined();
  });

  it("nunca devuelve carbsG negativo, sea cual sea la combinación de overrides", () => {
    const result = calculateNutritionTargets({
      tdee: 500,
      weightKg: 90,
      goal: "lose",
      overrides: { proteinGPerKg: 4, fatGPerKg: 3 },
    });

    expect(result.carbsG).toBeGreaterThanOrEqual(0);
    expect(result.feasible).toBe(false);
  });
});
