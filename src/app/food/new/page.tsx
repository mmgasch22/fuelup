import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import FoodSearchForm from "./FoodSearchForm";

export default async function NewFoodPage({
  searchParams,
}: {
  searchParams: Promise<{ meal?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  const { meal: mealSlotId } = await searchParams;

  if (!mealSlotId) {
    redirect("/dashboard");
  }

  // Nunca se confía en el id de la URL tal cual: se comprueba que esa
  // comida pertenece al usuario autenticado antes de mostrar nada.
  const { data: mealSlot } = await supabase
    .from("meal_slots")
    .select("id, name")
    .eq("id", mealSlotId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mealSlot) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-md flex-col gap-5 md:max-w-2xl">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-dim">
            Añadiendo a
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {mealSlot.name}
          </h1>
        </div>
        <Card>
          <FoodSearchForm mealSlotId={mealSlot.id} />
        </Card>
      </div>
    </main>
  );
}
