"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveRequestedDate } from "@/lib/date/dates";
import { dashboardUrl } from "@/lib/navigation/dashboardUrl";

// Sin useActionState — mismo patrón directo que updateFoodLogGrams/
// deleteFoodLog/createMealSlot: un solo campo numérico ya validado por el
// propio input (min/required) y por el check constraint de Postgres
// (weight_kg > 0) como respaldo, no hace falta mensaje de error inline.
//
// Registra (o actualiza) el peso del día que se esté viendo, no siempre
// hoy — mismo criterio que logFood. Un solo registro por día: si ya
// existe uno para esa fecha, se actualiza en vez de insertar otro. No hay
// restricción UNIQUE(user_id, date) en la base de datos (a diferencia de
// steps_logs/water_logs) — se comprueba aquí, a nivel de aplicación, para
// no arriesgar una migración sobre datos de prueba que ya pudieran tener
// varias filas el mismo día.
export async function logWeight(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const weightKg = Number(formData.get("weight_kg"));
  const date = resolveRequestedDate(formData.get("date") as string | null);

  if (Number.isFinite(weightKg) && weightKg > 0) {
    const { data: existing } = await supabase
      .from("weight_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle();

    const { error } = existing
      ? await supabase
          .from("weight_logs")
          .update({ weight_kg: weightKg })
          .eq("id", existing.id)
      : await supabase.from("weight_logs").insert({
          user_id: user.id,
          date,
          weight_kg: weightKg,
        });

    if (error) {
      redirect(dashboardUrl(date, "No se pudo registrar el peso. Inténtalo de nuevo."));
    }
  }

  redirect(dashboardUrl(date));
}
