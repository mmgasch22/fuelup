export interface FoodLogEntry {
  grams: number;
  food: {
    kcal_100g: number;
    protein_100g: number | null;
    carbs_100g: number | null;
    fat_100g: number | null;
  };
}

export interface DailyTotals {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  // true si al menos una entrada del día no tenía ese macro (null en
  // origen) — la suma de ese macro es parcial, nunca se trata el hueco
  // como si fuera un 0 real.
  proteinIncomplete: boolean;
  carbsIncomplete: boolean;
  fatIncomplete: boolean;
}

// Recibe las entradas ya filtradas por el llamador (p.ej. por fecha) — esta
// función no conoce ni asume "hoy", así que sirve igual para un día o para
// sumar un rango completo más adelante (Sprint 5).
export function calculateDailyTotals(entries: FoodLogEntry[]): DailyTotals {
  let kcal = 0;
  let proteinG = 0;
  let carbsG = 0;
  let fatG = 0;
  let proteinIncomplete = false;
  let carbsIncomplete = false;
  let fatIncomplete = false;

  for (const entry of entries) {
    const factor = entry.grams / 100;
    kcal += entry.food.kcal_100g * factor;

    if (entry.food.protein_100g === null) {
      proteinIncomplete = true;
    } else {
      proteinG += entry.food.protein_100g * factor;
    }

    if (entry.food.carbs_100g === null) {
      carbsIncomplete = true;
    } else {
      carbsG += entry.food.carbs_100g * factor;
    }

    if (entry.food.fat_100g === null) {
      fatIncomplete = true;
    } else {
      fatG += entry.food.fat_100g * factor;
    }
  }

  return {
    kcal: Math.round(kcal),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
    proteinIncomplete,
    carbsIncomplete,
    fatIncomplete,
  };
}
