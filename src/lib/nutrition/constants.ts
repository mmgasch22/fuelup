import type { ActivityLevel, Goal } from "./types";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

// Ajuste sobre el TDEE, en %. Negativo = déficit, positivo = superávit.
export const CALORIE_ADJUSTMENT_PCT: Record<Goal, number> = {
  lose: -0.2,
  maintain: 0,
  gain: 0.15,
};

export const PROTEIN_G_PER_KG: Record<Goal, number> = {
  lose: 2.0,
  maintain: 1.8,
  gain: 1.8,
};

export const FAT_G_PER_KG: Record<Goal, number> = {
  lose: 0.8,
  maintain: 0.8,
  gain: 0.8,
};

// Suelos de seguridad: nunca se baja de aquí, aunque el objetivo calórico
// no deje margen para las macros por defecto.
export const MIN_CARBS_G = 50;
export const MIN_FAT_G_PER_KG = 0.5;

export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_FAT = 9;
export const KCAL_PER_G_CARBS = 4;
