const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Rechaza tanto el formato incorrecto como fechas de calendario que no
// existen (p.ej. "2026-02-30") comprobando que el valor sobrevive un
// redondeo por Date.UTC sin cambiar.
export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toISOString().slice(0, 10) === value;
}

// Nunca deja pasar una fecha inválida ni futura — cae a hoy como
// fallback seguro. Usado en cualquier sitio que reciba una fecha desde
// la URL o un formulario (nunca se confía tal cual).
export function resolveRequestedDate(value: string | undefined | null): string {
  const today = todayIso();
  if (!value || !isValidIsoDate(value)) return today;
  return value > today ? today : value;
}

export function addDays(dateIso: string, delta: number): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}
