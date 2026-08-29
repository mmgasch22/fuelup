import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import ProfileEditForm from "./ProfileEditForm";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, birth_date, sex, height_cm, activity_level, goal, daily_steps_goal")
    .eq("id", user.id)
    .maybeSingle();

  // Sin perfil todavía no hay nada que editar — el punto de entrada es el
  // onboarding, no esta pantalla.
  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-md flex-col gap-5 md:max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground">
          Editar perfil
        </h1>
        <Card>
          <ProfileEditForm
            defaults={{
              name: profile.name ?? "",
              birthDate: profile.birth_date ?? "",
              sex: profile.sex ?? "",
              heightCm: profile.height_cm ?? 0,
              activityLevel: profile.activity_level ?? "",
              goal: profile.goal ?? "",
              dailyStepsGoal: profile.daily_steps_goal ?? 0,
            }}
          />
        </Card>
      </div>
    </main>
  );
}
