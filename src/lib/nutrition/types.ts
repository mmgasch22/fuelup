export type Sex = "male" | "female" | "other";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very_active"
  | "extra_active";

export type Goal = "lose" | "maintain" | "gain";

export interface NutritionOverrides {
  calorieAdjustmentPct?: number;
  proteinGPerKg?: number;
  fatGPerKg?: number;
}

export interface NutritionTargets {
  feasible: boolean;
  kcalTarget: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  warning?: string;
}
