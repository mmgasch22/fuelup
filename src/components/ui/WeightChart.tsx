import type { WeightChartData } from "@/lib/weight/chartPoints";

function formatShortDate(dateIso: string): string {
  return new Date(`${dateIso}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

// Los datos (0–100) los calcula chartPoints.ts sin margen; el margen para
// que la línea no toque los bordes se añade aquí, en el viewBox, sin
// tocar la función pura ni sus tests. PAD_X/TOP/BOTTOM también se usan
// para convertir esas mismas coordenadas a porcentaje del contenedor, así
// los puntos (fuera del SVG, ver más abajo) caen exactamente donde
// termina la línea.
const PAD_X = 3;
const PAD_TOP = 8;
const PAD_BOTTOM = 8;
const TOTAL_W = 100 + PAD_X * 2;
const TOTAL_H = 100 + PAD_TOP + PAD_BOTTOM;

function toPercentX(x: number): number {
  return ((x + PAD_X) / TOTAL_W) * 100;
}

function toPercentY(y: number): number {
  return ((y + PAD_TOP) / TOTAL_H) * 100;
}

export function WeightChart({ data }: { data: WeightChartData }) {
  const hasRange =
    data.minWeight !== null && data.maxWeight !== null && data.minWeight !== data.maxWeight;
  const midWeight =
    data.minWeight !== null && data.maxWeight !== null
      ? Math.round(((data.minWeight + data.maxWeight) / 2) * 10) / 10
      : null;

  const lastIndex = data.points.length - 1;
  // Solo se muestra una fecha intermedia en el eje X si hay un tercer
  // punto genuinamente distinto de los extremos.
  const midPoint =
    data.points.length >= 3 ? data.points[Math.floor(lastIndex / 2)] : undefined;

  return (
    <div>
      <div className="flex gap-2">
        {/* Eje Y: valores de peso */}
        <div className="flex w-9 shrink-0 flex-col items-end justify-between py-0.5 font-mono text-[10px] leading-none text-text-dim">
          {hasRange ? (
            <>
              <span>{data.maxWeight}</span>
              <span>{midWeight}</span>
              <span>{data.minWeight}</span>
            </>
          ) : (
            <span>{data.maxWeight}</span>
          )}
        </div>

        {/* Área de la gráfica: la línea va en SVG (estirarla no distorsiona
            una línea), los puntos son <span> circulares posicionados por
            porcentaje — un <circle> de SVG con preserveAspectRatio="none"
            se deforma en óvalo si el contenedor no es cuadrado; un div con
            border-radius siempre es un círculo real, sin importar el
            estiramiento del contenedor. */}
        <div className="relative h-32 flex-1">
          <svg
            viewBox={`-${PAD_X} -${PAD_TOP} ${TOTAL_W} ${TOTAL_H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Evolución del peso en los últimos 30 días"
          >
            {data.pathD && (
              <path
                d={data.pathD}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
          {data.points.map((point) => (
            <span
              key={point.date}
              className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
              style={{ left: `${toPercentX(point.x)}%`, top: `${toPercentY(point.y)}%` }}
            />
          ))}
        </div>
      </div>

      {/* Eje X: solo algunas fechas (primera, una intermedia si la hay, y
          la última), no todas. */}
      <div className="mt-1 flex justify-between pl-11 font-mono text-[10px] text-text-dim">
        <span>{formatShortDate(data.points[0].date)}</span>
        {midPoint && <span>{formatShortDate(midPoint.date)}</span>}
        {lastIndex > 0 && <span>{formatShortDate(data.points[lastIndex].date)}</span>}
      </div>
    </div>
  );
}
