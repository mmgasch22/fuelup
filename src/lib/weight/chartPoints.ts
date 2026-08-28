export interface WeightLogEntry {
  date: string; // YYYY-MM-DD
  weightKg: number;
}

export interface WeightChartPoint {
  date: string;
  weightKg: number;
  x: number; // 0–100
  y: number; // 0–100, más peso = y menor (arriba del SVG)
}

export interface WeightChartData {
  points: WeightChartPoint[];
  minWeight: number | null;
  maxWeight: number | null;
  // Cadena "M x y L x y ..." lista para <path d>. Vacía si hay menos de 2
  // puntos — con un solo dato no hay tendencia que dibujar, solo un punto.
  pathD: string;
}

// `entries` puede traer varias filas del mismo día (weight_logs no tiene
// restricción de una fila por día) — se queda con la ÚLTIMA entrada de
// cada fecha en el array de entrada, así que el llamador debe pasarlas ya
// ordenadas por antigüedad (fecha asc, created_at asc), igual que el
// resto del proyecto deriva "el peso más reciente" en otros sitios.
export function buildWeightChartData(entries: WeightLogEntry[]): WeightChartData {
  const byDate = new Map<string, number>();
  for (const entry of entries) {
    byDate.set(entry.date, entry.weightKg);
  }

  const sorted = Array.from(byDate.entries())
    .map(([date, weightKg]) => ({ date, weightKg }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  if (sorted.length === 0) {
    return { points: [], minWeight: null, maxWeight: null, pathD: "" };
  }

  const weights = sorted.map((e) => e.weightKg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  // Si todos los pesos son iguales, el rango es 0 — se dibuja una línea
  // plana centrada en vez de dividir entre 0.
  const range = maxWeight - minWeight;

  const points: WeightChartPoint[] = sorted.map((entry, index) => {
    const x = sorted.length === 1 ? 50 : (index / (sorted.length - 1)) * 100;
    const y = range === 0 ? 50 : 100 - ((entry.weightKg - minWeight) / range) * 100;
    return { ...entry, x, y };
  });

  const pathD =
    points.length >= 2
      ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
      : "";

  return { points, minWeight, maxWeight, pathD };
}
