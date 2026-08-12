interface ProgressBarProps {
  /** 0–100. Valores fuera de rango se recortan. */
  value: number;
  color?: string;
}

export function ProgressBar({ value, color = "var(--primary)" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="h-1 overflow-hidden rounded-full bg-border">
      <div
        className="h-full rounded-full"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}
