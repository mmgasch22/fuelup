import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { macroColors } from "@/components/ui/tokens";
import type { Goal } from "@/lib/nutrition/types";

const GOAL_LABELS: Record<Goal, string> = {
  lose: "Perder grasa",
  maintain: "Mantener",
  gain: "Ganar masa",
};

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
    .select("name, goal")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  const [{ data: latestTarget }, { data: latestWeight }] = await Promise.all([
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
  ]);

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-md flex-col gap-5 md:max-w-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-dim">Hola,</p>
            <h1 className="text-2xl font-semibold text-foreground">
              {profile.name ?? user.email}
            </h1>
            {profile.goal && (
              <span className="mt-1 inline-block text-xs font-medium uppercase tracking-wide text-text-dim">
                {GOAL_LABELS[profile.goal as Goal]}
              </span>
            )}
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
                {latestTarget.kcal_target}
                <span className="ml-1 text-base font-medium opacity-70">
                  kcal
                </span>
              </p>
              <p className="mt-1 text-xs text-text-dim">
                Desde el{" "}
                {new Date(latestTarget.effective_date).toLocaleDateString(
                  "es-ES",
                )}
              </p>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <StatTile
                label="Proteína"
                value={latestTarget.protein_g}
                unit="g"
                color={macroColors.protein}
              />
              <StatTile
                label="Carbohidratos"
                value={latestTarget.carbs_g}
                unit="g"
                color={macroColors.carbs}
              />
              <StatTile
                label="Grasa"
                value={latestTarget.fat_g}
                unit="g"
                color={macroColors.fat}
              />
            </div>
          </>
        ) : (
          <Card>
            <p className="text-sm text-text-dim">
              Todavía no hay un objetivo calórico calculado.
            </p>
          </Card>
        )}

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
