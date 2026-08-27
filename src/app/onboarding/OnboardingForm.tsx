"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/features/onboarding/actions";
import { Select } from "@/components/ui/Select";

export default function OnboardingForm() {
  const [state, action, pending] = useActionState(completeOnboarding, undefined);

  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="birth_date">Fecha de nacimiento</label>
        <input
          id="birth_date"
          name="birth_date"
          type="date"
          required
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="sex">Sexo</label>
        <Select id="sex" name="sex" required>
          <option value="">Selecciona...</option>
          <option value="male">Hombre</option>
          <option value="female">Mujer</option>
          <option value="other">Otro</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="height_cm">Altura (cm)</label>
        <input
          id="height_cm"
          name="height_cm"
          type="number"
          step="0.1"
          min="1"
          required
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="weight_kg">Peso actual (kg)</label>
        <input
          id="weight_kg"
          name="weight_kg"
          type="number"
          step="0.1"
          min="1"
          required
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="activity_level">Nivel de actividad</label>
        <Select id="activity_level" name="activity_level" required>
          <option value="">Selecciona...</option>
          <option value="sedentary">Sedentario</option>
          <option value="light">Ligero</option>
          <option value="moderate">Moderado</option>
          <option value="very_active">Muy activo</option>
          <option value="extra_active">Extra activo</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="goal">Objetivo</label>
        <Select id="goal" name="goal" required>
          <option value="">Selecciona...</option>
          <option value="lose">Perder grasa</option>
          <option value="maintain">Mantener</option>
          <option value="gain">Ganar masa</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="daily_steps_goal">Objetivo diario de pasos</label>
        <input
          id="daily_steps_goal"
          name="daily_steps_goal"
          type="number"
          step="1"
          min="1"
          required
          className="rounded border px-3 py-2"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Completar perfil"}
      </button>
    </form>
  );
}
