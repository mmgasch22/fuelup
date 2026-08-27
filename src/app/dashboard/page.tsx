import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { macroColors } from "@/components/ui/tokens";
import { calculateDailyTotals } from "@/lib/food/dailyTotals";
import MealSlotsSection, {
  type FoodLogRow,
  type MealSlotWithLogs,
} from "./MealSlotsSection";

function progressPct(consumed: number, target: number): number {
  return target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
}

interface FoodLogQueryRow {
  id: string;
  grams: number;
  meal_slot_id: string | null;
  foods: FoodLogRow["foods"] & {
    protein_100g: number | null;
    carbs_100g: number | null;
    fat_100g: number | null;
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayLabel = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const [{ data: latestTarget }, { data: latestWeight }, { data: mealSlots }, { data: todayLogsRaw }] =
    await Promise.all([
      supabase
        .from("calorie_targets")
        .select("kcal_target, protein_g, carbs_g, fat_g, effective_date")
        .eq("user_id", user.id)
        .order("effective_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("weight_logs")
        .select("weight_kg, date")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("meal_slots")
        .select("id, name")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("food_logs")
        .select(
          "id, grams, meal_slot_id, foods(name, kcal_100g, protein_100g, carbs_100g, fat_100g)",
        )
        .eq("user_id", user.id)
        .eq("date", today),
    ]);

  const todayLogs = (todayLogsRaw ?? []) as unknown as FoodLogQueryRow[];

  const totals = calculateDailyTotals(
    todayLogs.map((log) => ({ grams: log.grams, food: log.foods })),
  );

  const incompleteMacroNames = [
    totals.proteinIncomplete && "proteína",
    totals.carbsIncomplete && "carbohidratos",
    totals.fatIncomplete && "grasa",
  ].filter((name): name is string => Boolean(name));

  const mealSlotsWithLogs: MealSlotWithLogs[] = (mealSlots ?? []).map((slot) => ({
    id: slot.id,
    name: slot.name,
    logs: todayLogs
      .filter((log) => log.meal_slot_id === slot.id)
      .map((log) => ({ id: log.id, grams: log.grams, foods: log.foods })),
  }));

  const unassignedLogs: FoodLogRow[] = todayLogs
    .filter((log) => log.meal_slot_id === null)
    .map((log) => ({ id: log.id, grams: log.grams, foods: log.foods }));

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-md flex-col gap-5 md:max-w-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-dim">Hola,</p>
            <h1 className="text-2xl font-semibold text-foreground">
              {profile.name ?? user.email}
            </h1>
            <span className="mt-1 inline-block text-xs font-medium capitalize text-text-dim">
              {todayLabel}
            </span>
          </div>
          <form action={signOut}>
            <Button variant="secondary" className="text-sm">
              Cerrar sesión
            </Button>
          </form>
        </header>

        {latestTarget ? (
          <>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-text-dim">
                Objetivo calórico de hoy
              </p>
              <p
                className="mt-2 font-mono text-4xl font-semibold tabular-nums"
                style={{ color: macroColors.kcal }}
              >
                {totals.kcal}
                <span className="ml-1 text-base font-medium opacity-70">
                  / {latestTarget.kcal_target} kcal
                </span>
              </p>
              <div className="mt-2">
                <ProgressBar
                  value={progressPct(totals.kcal, latestTarget.kcal_target)}
                  color={macroColors.kcal}
                />
              </div>
              <p className="mt-2 text-xs text-text-dim">
                Objetivo desde el{" "}
                {new Date(latestTarget.effective_date).toLocaleDateString(
                  "es-ES",
                )}
              </p>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <StatTile
                label={totals.proteinIncomplete ? "Proteína*" : "Proteína"}
                value={totals.proteinG}
                unit={`/${latestTarget.protein_g}g`}
                color={macroColors.protein}
                progress={progressPct(totals.proteinG, latestTarget.protein_g)}
              />
              <StatTile
                label={totals.carbsIncomplete ? "Carbohidratos*" : "Carbohidratos"}
                value={totals.carbsG}
                unit={`/${latestTarget.carbs_g}g`}
                color={macroColors.carbs}
                progress={progressPct(totals.carbsG, latestTarget.carbs_g)}
              />
              <StatTile
                label={totals.fatIncomplete ? "Grasa*" : "Grasa"}
                value={totals.fatG}
                unit={`/${latestTarget.fat_g}g`}
                color={macroColors.fat}
                progress={progressPct(totals.fatG, latestTarget.fat_g)}
              />
            </div>
            {incompleteMacroNames.length > 0 && (
              <p className="text-xs text-text-dim">
                * Macros incompletos hoy: {incompleteMacroNames.join(", ")} — falta
                información nutricional en algún alimento registrado.
              </p>
            )}
          </>
        ) : (
          <Card>
            <p className="text-sm text-text-dim">
              Todavía no hay un objetivo calórico calculado.
            </p>
          </Card>
        )}

        <MealSlotsSection
          mealSlots={mealSlotsWithLogs}
          unassignedLogs={unassignedLogs}
        />

        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-text-dim">
            Peso actual
          </p>
          {latestWeight ? (
            <>
              <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-foreground">
                {latestWeight.weight_kg}
                <span className="ml-1 text-base font-medium opacity-70">
                  kg
                </span>
              </p>
              <p className="mt-1 text-xs text-text-dim">
                Registrado el{" "}
                {new Date(latestWeight.date).toLocaleDateString("es-ES")}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-text-dim">
              Todavía no hay ningún peso registrado.
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}
