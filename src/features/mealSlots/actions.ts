"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// A diferencia de logFood/updateFoodLogGrams/deleteFoodLog (que redirigen a
// /dashboard), estas se llaman desde un componente interactivo
// (MealSlotsSection) donde redirigir en cada tecla o cada arrastre se
// sentiría roto — revalidatePath refresca los datos del Server Component
// padre sin navegar.

export async function createMealSlot(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return;
  }

  const { data: existing } = await supabase
    .from("meal_slots")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = existing ? existing.sort_order + 1 : 0;

  await supabase.from("meal_slots").insert({
    user_id: user.id,
    name,
    sort_order: nextOrder,
  });

  revalidatePath("/dashboard");
}

export async function renameMealSlot(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();

  if (id && name) {
    await supabase
      .from("meal_slots")
      .update({ name })
      .eq("id", id)
      .eq("user_id", user.id);
  }

  revalidatePath("/dashboard");
}

export async function deleteMealSlot(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = formData.get("id") as string;
  if (id) {
    // El food_logs.meal_slot_id de las entradas ya registradas en esta
    // comida pasa a NULL (ON DELETE SET NULL) — nunca se pierde historial.
    await supabase.from("meal_slots").delete().eq("id", id).eq("user_id", user.id);
  }

  revalidatePath("/dashboard");
}

export async function reorderMealSlots(orderedIds: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Se actualiza una a una filtrando siempre por user_id — nunca se confía
  // en que los ids recibidos pertenezcan todos al usuario que los envía.
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("meal_slots")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("user_id", user.id),
    ),
  );

  revalidatePath("/dashboard");
}
