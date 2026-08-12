"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateAge } from "@/lib/nutrition/age";
import { calculateBmr } from "@/lib/nutrition/bmr";
import { calculateTdee } from "@/lib/nutrition/tdee";
import { calculateNutritionTargets } from "@/lib/nutrition/targets";
import type { ActivityLevel, Goal, Sex } from "@/lib/nutrition/types";

export type OnboardingActionState = { error: string } | undefined;

export async function completeOnboarding(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const birthDate = formData.get("birth_date") as string;
  const sex = formData.get("sex") as Sex;
  const heightCm = Number(formData.get("height_cm"));
  const activityLevel = formData.get("activity_level") as ActivityLevel;
  const goal = formData.get("goal") as Goal;
  const dailyStepsGoal = Number(formData.get("daily_steps_goal"));
  const dailyWaterGoalMl = Number(formData.get("daily_water_goal_ml"));
  const weightKg = Number(formData.get("weight_kg"));

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    name,
    birth_date: birthDate,
    sex,
    height_cm: heightCm,
    activity_level: activityLevel,
    goal,
    daily_steps_goal: dailyStepsGoal,
    daily_water_goal_ml: dailyWaterGoalMl,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  const today = new Date().toISOString().slice(0, 10);

  const { error: weightError } = await supabase.from("weight_logs").insert({
    user_id: user.id,
    date: today,
    weight_kg: weightKg,
  });

  if (weightError) {
    return { error: weightError.message };
  }

  const age = calculateAge(birthDate);
  const bmr = calculateBmr(sex, weightKg, heightCm, age);
  const tdee = calculateTdee(bmr, activityLevel);
  const targets = calculateNutritionTargets({ tdee, weightKg, goal });

  if (!targets.feasible) {
    return {
      error:
        targets.warning ??
        "No se ha podido calcular un objetivo nutricional viable con estos datos.",
    };
  }

  const { error: targetError } = await supabase
    .from("calorie_targets")
    .upsert(
      {
        user_id: user.id,
        effective_date: today,
        kcal_target: targets.kcalTarget,
        protein_g: targets.proteinG,
        carbs_g: targets.carbsG,
        fat_g: targets.fatG,
      },
      { onConflict: "user_id,effective_date" },
    );

  if (targetError) {
    return { error: targetError.message };
  }

  redirect("/dashboard");
}
