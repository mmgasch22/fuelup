// Construye la URL de vuelta al dashboard, preservando el día que se
// estaba viendo y, opcionalmente, un mensaje de error a mostrar. Evita
// repetir la misma concatenación de query params en cada Server Action
// que redirige de vuelta al dashboard.
export function dashboardUrl(date: string, error?: string): string {
  const params = new URLSearchParams({ date });
  if (error) params.set("error", error);
  return `/dashboard?${params.toString()}`;
}
