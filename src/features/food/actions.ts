"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveRequestedDate } from "@/lib/date/dates";
import { dashboardUrl } from "@/lib/navigation/dashboardUrl";

export type FoodActionState = { error: string } | undefined;

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function logFood(
  _prevState: FoodActionState,
  formData: FormData,
): Promise<FoodActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const grams = parseNumber(formData.get("grams"));
  const mealSlotId = formData.get("meal_slot_id") as string;

  if (!grams || grams <= 0) {
    return { error: "Introduce una cantidad en gramos válida." };
  }
  if (!mealSlotId) {
    return { error: "Falta la comida a la que registrar este alimento." };
  }

  // Nunca se confía en el meal_slot_id tal cual: se comprueba que
  // pertenece al usuario autenticado antes de usarlo, igual que ya se hace
  // con food_id (mismo criterio que la revisión de seguridad de Sprint 2).
  const { data: mealSlot } = await supabase
    .from("meal_slots")
    .select("id")
    .eq("id", mealSlotId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mealSlot) {
    return { error: "Esa comida no existe o ya no está disponible." };
  }

  const source = formData.get("source") as string;
  const existingFoodId = (formData.get("food_id") as string) || null;
  const name = (formData.get("name") as string)?.trim();

  if (!name) {
    return { error: "El alimento necesita un nombre." };
  }

  let foodId: string;

  if (existingFoodId) {
    // Alimento ya existente en tu base (p.ej. uno manual tuyo elegido en
    // "Tus alimentos" en la búsqueda) — se reutiliza tal cual, sin
    // reinsertarlo ni duplicarlo.
    foodId = existingFoodId;
  } else if (source === "manual") {
    const kcal100g = parseNumber(formData.get("kcal_100g"));
    const protein100g = parseNumber(formData.get("protein_100g"));
    const carbs100g = parseNumber(formData.get("carbs_100g"));
    const fat100g = parseNumber(formData.get("fat_100g"));

    if (
      kcal100g === null ||
      protein100g === null ||
      carbs100g === null ||
      fat100g === null
    ) {
      return {
        error: "Rellena kcal, proteína, carbohidratos y grasa por 100g.",
      };
    }

    const { data: food, error: foodError } = await supabase
      .from("foods")
      .insert({
        name,
        kcal_100g: kcal100g,
        protein_100g: protein100g,
        carbs_100g: carbs100g,
        fat_100g: fat100g,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (foodError || !food) {
      return { error: foodError?.message ?? "No se pudo crear el alimento." };
    }
    foodId = food.id;
  } else {
    const barcode = (formData.get("barcode") as string) || null;
    const kcal100g = parseNumber(formData.get("kcal_100g"));

    if (kcal100g === null) {
      return { error: "Faltan datos nutricionales del alimento seleccionado." };
    }

    const foodRow = {
      barcode,
      name,
      kcal_100g: kcal100g,
      protein_100g: parseNumber(formData.get("protein_100g")),
      carbs_100g: parseNumber(formData.get("carbs_100g")),
      fat_100g: parseNumber(formData.get("fat_100g")),
      fiber_100g: parseNumber(formData.get("fiber_100g")),
      sugar_100g: parseNumber(formData.get("sugar_100g")),
      salt_100g: parseNumber(formData.get("salt_100g")),
    };

    const { data: food, error: foodError } = barcode
      ? await supabase
          .from("foods")
          .upsert(foodRow, { onConflict: "barcode" })
          .select("id")
          .single()
      : await supabase.from("foods").insert(foodRow).select("id").single();

    if (foodError || !food) {
      return { error: foodError?.message ?? "No se pudo guardar el alimento." };
    }
    foodId = food.id;
  }

  // Nunca se confía en la fecha del formulario tal cual: resolveRequestedDate
  // cae a hoy si falta, tiene formato inválido, o es una fecha futura.
  const date = resolveRequestedDate(formData.get("date") as string | null);

  const { error: logError } = await supabase.from("food_logs").insert({
    user_id: user.id,
    food_id: foodId,
    meal_slot_id: mealSlotId,
    grams,
    date,
  });

  if (logError) {
    return { error: logError.message };
  }

  // Vuelve al día que se estaba viendo, no siempre a "hoy" — si no, editar
  // un día pasado te devolvería a hoy y perderías dónde estabas.
  redirect(dashboardUrl(date));
}

// Sin useActionState (a diferencia de logFood): es un ajuste rápido inline
// en el dashboard, mismo patrón de <form action={...}> directo que
// signOut/deleteFoodLog. La validación de "gramos > 0" la hace el propio
// input (min/required) y el check constraint de Postgres como respaldo —
// el error que sí puede pasar (fallo real de Supabase) ya no se traga en
// silencio, se muestra como banner en el dashboard.
export async function updateFoodLogGrams(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = formData.get("id") as string;
  const grams = parseNumber(formData.get("grams"));
  const date = resolveRequestedDate(formData.get("date") as string | null);

  if (id && grams && grams > 0) {
    const { error } = await supabase.from("food_logs").update({ grams }).eq("id", id);
    if (error) {
      redirect(dashboardUrl(date, "No se pudo actualizar la cantidad. Inténtalo de nuevo."));
    }
  }

  redirect(dashboardUrl(date));
}

export async function deleteFoodLog(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = formData.get("id") as string;
  const date = resolveRequestedDate(formData.get("date") as string | null);

  if (id) {
    const { error } = await supabase.from("food_logs").delete().eq("id", id);
    if (error) {
      redirect(dashboardUrl(date, "No se pudo borrar el alimento. Inténtalo de nuevo."));
    }
  }

  redirect(dashboardUrl(date));
}

// Se llama directamente desde el arrastre en MealSlotsSection (no desde un
// <form>), igual que reorderMealSlots — por eso usa revalidatePath en vez
// de redirect: mover un alimento entre comidas debe sentirse instantáneo,
// no como una navegación.
export async function moveFoodLog(logId: string, mealSlotId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Mismo criterio que logFood: nunca se confía en el meal_slot_id tal
  // cual, se comprueba que pertenece al usuario antes de usarlo.
  const { data: mealSlot } = await supabase
    .from("meal_slots")
    .select("id")
    .eq("id", mealSlotId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mealSlot) {
    return;
  }

  await supabase
    .from("food_logs")
    .update({ meal_slot_id: mealSlotId })
    .eq("id", logId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
}
