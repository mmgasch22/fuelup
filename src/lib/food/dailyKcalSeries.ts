import { calculateDailyTotals, type FoodLogEntry } from "./dailyTotals";

export interface DateFoodLogEntry extends FoodLogEntry {
  date: string; // YYYY-MM-DD
}

export interface DailyKcal {
  date: string;
  kcal: number;
}

// Agrupa entradas de food_logs por fecha y suma las kcal reales de cada
// día, reutilizando calculateDailyTotals (no se duplica esa aritmética) —
// solo nos quedamos con `.kcal` de cada día, el resto de macros no hace
// falta para adherencia calórica.
//
// Un día sin ninguna entrada simplemente no aparece aquí (no hay nada que
// agrupar) — esta función no conoce el rango de fechas completo. Que un
// día ausente cuente como 0 kcal (un dato real, no un hueco) es
// responsabilidad de quien construya la serie sobre un rango de fechas
// (src/lib/adherence/chartData.ts), no de esta función.
export function sumKcalByDate(entries: DateFoodLogEntry[]): DailyKcal[] {
  const byDate = new Map<string, FoodLogEntry[]>();

  for (const entry of entries) {
    const existing = byDate.get(entry.date);
    if (existing) {
      existing.push(entry);
    } else {
      byDate.set(entry.date, [entry]);
    }
  }

  return Array.from(byDate.entries())
    .map(([date, dayEntries]) => ({
      date,
      kcal: calculateDailyTotals(dayEntries).kcal,
    }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
