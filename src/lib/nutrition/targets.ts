import {
  CALORIE_ADJUSTMENT_PCT,
  PROTEIN_G_PER_KG,
  FAT_G_PER_KG,
  MIN_CARBS_G,
  MIN_FAT_G_PER_KG,
  KCAL_PER_G_PROTEIN,
  KCAL_PER_G_FAT,
  KCAL_PER_G_CARBS,
} from "./constants";
import type { Goal, NutritionOverrides, NutritionTargets } from "./types";

interface CalculateNutritionTargetsInput {
  tdee: number;
  weightKg: number;
  goal: Goal;
  overrides?: NutritionOverrides;
}

export function calculateNutritionTargets({
  tdee,
  weightKg,
  goal,
  overrides,
}: CalculateNutritionTargetsInput): NutritionTargets {
  const adjustmentPct = overrides?.calorieAdjustmentPct ?? CALORIE_ADJUSTMENT_PCT[goal];
  const kcalTarget = Math.round(tdee * (1 + adjustmentPct));

  const proteinG = (overrides?.proteinGPerKg ?? PROTEIN_G_PER_KG[goal]) * weightKg;
  const proteinKcal = proteinG * KCAL_PER_G_PROTEIN;

  const targetFatG = (overrides?.fatGPerKg ?? FAT_G_PER_KG[goal]) * weightKg;
  const minFatG = MIN_FAT_G_PER_KG * weightKg;

  let fatG = targetFatG;
  let carbsG = (kcalTarget - proteinKcal - fatG * KCAL_PER_G_FAT) / KCAL_PER_G_CARBS;
  let warning: string | undefined;

  if (carbsG < MIN_CARBS_G) {
    // La proteína no se toca. Se reduce la grasa (nunca por debajo de su
    // suelo mínimo) antes de sacrificar el suelo de carbohidratos.
    const kcalAvailableForFatAndCarbs = kcalTarget - proteinKcal;
    const fatGForMinCarbs =
      (kcalAvailableForFatAndCarbs - MIN_CARBS_G * KCAL_PER_G_CARBS) / KCAL_PER_G_FAT;

    fatG = Math.max(minFatG, Math.min(targetFatG, fatGForMinCarbs));
    carbsG = (kcalTarget - proteinKcal - fatG * KCAL_PER_G_FAT) / KCAL_PER_G_CARBS;

    if (fatG < targetFatG) {
      warning =
        "Grasa reducida hacia su mínimo para poder mantener el suelo de carbohidratos.";
    }
  }

  const feasible = carbsG >= MIN_CARBS_G - 0.5;

  if (!feasible) {
    warning =
      "Las kcal objetivo no permiten mantener proteína, grasa mínima y el suelo de carbohidratos a la vez. Este objetivo no es viable tal como está planteado.";
  }

  return {
    feasible,
    kcalTarget,
    proteinG: Math.round(proteinG),
    fatG: Math.round(fatG),
    carbsG: Math.round(Math.max(0, carbsG)),
    warning,
  };
}
