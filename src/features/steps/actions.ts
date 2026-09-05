"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveRequestedDate } from "@/lib/date/dates";
import { dashboardUrl } from "@/lib/navigation/dashboardUrl";

// Registra (o actualiza) los pasos del día que se esté viendo, no siempre
// hoy — mismo criterio que logWeight/logFood. A diferencia de
// weight_logs, steps_logs sí tiene UNIQUE(user_id, date) en la base de
// datos, así que aquí un upsert normal ya resuelve "crear si no existe,
// actualizar si existe" — no hace falta el check-then-update de
// logWeight (ese existe precisamente porque weight_logs no tiene esa
// restricción). El valor es el TOTAL acumulado de pasos de ese día, no
// un incremento.
export async function logSteps(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const value = Number(formData.get("value"));
  const date = resolveRequestedDate(formData.get("date") as string | null);

  if (Number.isFinite(value) && value >= 0) {
    const { error } = await supabase
      .from("steps_logs")
      .upsert({ user_id: user.id, date, value }, { onConflict: "user_id,date" });

    if (error) {
      redirect(dashboardUrl(date, "No se pudo registrar los pasos. Inténtalo de nuevo."));
    }
  }

  redirect(dashboardUrl(date));
}
