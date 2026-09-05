import type { AdherenceDay } from "@/lib/adherence/chartData";

function formatShortDate(dateIso: string): string {
  return new Date(`${dateIso}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

// Mismo criterio de margen que WeightChart: el viewBox añade aire arriba/
// abajo/lados para que nada toque el borde. A diferencia de esa gráfica,
// aquí no hace falta sacar nada del SVG — un <rect> o una <line>
// horizontal no se deforman al estirarse de forma no uniforme como sí le
// pasa a un <circle>, así que las barras y las marcas de objetivo viven
// directamente dentro del propio SVG.
const PAD_X = 2;
const PAD_TOP = 8;
const PAD_BOTTOM = 4;
const TOTAL_W = 100 + PAD_X * 2;
const TOTAL_H = 100 + PAD_TOP + PAD_BOTTOM;

export function AdherenceChart({ days }: { days: AdherenceDay[] }) {
  if (days.length === 0) return null;

  // Máximo 1 para no dividir entre 0 si el rango entero está vacío (0 kcal
  // y sin ningún objetivo vigente todavía) — degrada a una gráfica plana,
  // no a un error.
  const maxValue = Math.max(
    1,
    ...days.map((day) => day.actualKcal),
    ...days.map((day) => day.targetKcal ?? 0),
  );

  const slotWidth = 100 / days.length;
  const barWidth = slotWidth * 0.6;

  const lastIndex = days.length - 1;
  // Igual que en WeightChart: solo se muestra una fecha intermedia en el
  // eje X si hay un tercer día genuinamente distinto de los extremos.
  const midDay = days.length >= 3 ? days[Math.floor(lastIndex / 2)] : undefined;

  return (
    <div>
      <div className="relative h-32">
        <svg
          viewBox={`-${PAD_X} -${PAD_TOP} ${TOTAL_W} ${TOTAL_H}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label="Adherencia calórica de los últimos 30 días"
        >
          {days.map((day, index) => {
            const barHeight = (day.actualKcal / maxValue) * 100;
            const barX = index * slotWidth + (slotWidth - barWidth) / 2;

            return (
              <rect
                key={day.date}
                x={barX}
                y={100 - barHeight}
                width={barWidth}
                height={barHeight}
                fill="var(--primary)"
              />
            );
          })}
          {days.map((day, index) => {
            if (day.targetKcal === null) return null;
            const targetY = 100 - (day.targetKcal / maxValue) * 100;
            const lineX = index * slotWidth;

            return (
              <line
                key={`target-${day.date}`}
                x1={lineX}
                y1={targetY}
                x2={lineX + slotWidth}
                y2={targetY}
                stroke="var(--text-dim)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
      </div>

      <div className="mt-1 flex justify-between font-mono text-[10px] text-text-dim">
        <span>{formatShortDate(days[0].date)}</span>
        {midDay && <span>{formatShortDate(midDay.date)}</span>}
        {lastIndex > 0 && <span>{formatShortDate(days[lastIndex].date)}</span>}
      </div>

      <p className="mt-1 text-[10px] text-text-dim">
        Barra: kcal reales · línea: objetivo vigente ese día
      </p>
    </div>
  );
}
