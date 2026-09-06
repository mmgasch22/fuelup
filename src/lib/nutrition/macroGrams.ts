import {
  KCAL_PER_G_PROTEIN,
  KCAL_PER_G_CARBS,
  KCAL_PER_G_FAT,
} from "./constants";

export interface MacroGrams {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

// Convierte un objetivo de kcal + un reparto en porcentajes (proteína /
// carbohidratos / grasa, pensados para sumar 100 entre los tres) a los
// gramos de cada macro — así el editor manual del objetivo trabaja en
// porcentajes (que por construcción no pueden "no cuadrar" con las
// kcal) y el resto de la app sigue recibiendo gramos, igual que ya
// guarda calorie_targets.
export function macroGramsFromPercentages(
  kcalTarget: number,
  proteinPct: number,
  carbsPct: number,
  fatPct: number,
): MacroGrams {
  return {
    proteinG: Math.round(((kcalTarget * proteinPct) / 100) / KCAL_PER_G_PROTEIN),
    carbsG: Math.round(((kcalTarget * carbsPct) / 100) / KCAL_PER_G_CARBS),
    fatG: Math.round(((kcalTarget * fatPct) / 100) / KCAL_PER_G_FAT),
  };
}
