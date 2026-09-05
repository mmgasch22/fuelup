import type { DailyKcal } from "../food/dailyKcalSeries";

export interface TargetHistoryEntry {
  effectiveDate: string; // YYYY-MM-DD
  kcalTarget: number;
}

export interface AdherenceDay {
  date: string;
  actualKcal: number;
  targetKcal: number | null;
}

// Objetivo vigente en una fecha concreta: el de `effectiveDate` más
// reciente que sea <= esa fecha — nunca el último objetivo global.
// `sortedTargets` debe venir ya ordenado ascendente por effectiveDate.
function resolveTargetKcal(
  sortedTargets: TargetHistoryEntry[],
  date: string,
): number | null {
  let applicable: TargetHistoryEntry | null = null;

  for (const target of sortedTargets) {
    if (target.effectiveDate > date) break;
    applicable = target;
  }

  return applicable ? applicable.kcalTarget : null;
}

// Combina la serie diaria de kcal reales (de sumKcalByDate) con el
// historial completo de calorie_targets para devolver, por cada fecha
// del rango pedido, { date, actualKcal, targetKcal }. Un día sin ninguna
// entrada en `dailyKcal` es un día real sin comer nada: actualKcal = 0,
// nunca un hueco. `targetHistory` puede llegar desordenado.
export function buildAdherenceSeries(
  dates: string[],
  dailyKcal: DailyKcal[],
  targetHistory: TargetHistoryEntry[],
): AdherenceDay[] {
  const kcalByDate = new Map(dailyKcal.map((d) => [d.date, d.kcal]));

  const sortedTargets = [...targetHistory].sort((a, b) =>
    a.effectiveDate < b.effectiveDate ? -1 : a.effectiveDate > b.effectiveDate ? 1 : 0,
  );

  return [...dates]
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((date) => ({
      date,
      actualKcal: kcalByDate.get(date) ?? 0,
      targetKcal: resolveTargetKcal(sortedTargets, date),
    }));
}
