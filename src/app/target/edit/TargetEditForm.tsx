"use client";

import { useActionState, useState } from "react";
import { updateTargetManually } from "@/features/targets/actions";
import { Button } from "@/components/ui/Button";
import { macroGramsFromPercentages } from "@/lib/nutrition/macroGrams";

const inputClass =
  "w-24 rounded-button border border-border bg-surface px-3 py-2 text-sm text-foreground";

interface TargetEditFormProps {
  defaults: {
    kcalTarget?: number;
    proteinPct?: number;
    carbsPct?: number;
    fatPct?: number;
  };
}

interface MacroRowProps {
  label: string;
  id: string;
  name: string;
  pct: string;
  onChange: (value: string) => void;
  grams: number;
}

function MacroRow({ label, id, name, pct, onChange, grams }: MacroRowProps) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <div className="flex items-center gap-1">
          <input
            id={id}
            name={name}
            type="number"
            step="1"
            min="0"
            max="100"
            required
            value={pct}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
          <span className="text-sm text-text-dim">%</span>
        </div>
      </div>
      <p className="pb-2 text-sm text-text-dim">≈ {grams} g</p>
    </div>
  );
}

export default function TargetEditForm({ defaults }: TargetEditFormProps) {
  const [state, action, pending] = useActionState(updateTargetManually, undefined);

  const [kcalTarget, setKcalTarget] = useState(defaults.kcalTarget?.toString() ?? "");
  const [proteinPct, setProteinPct] = useState(defaults.proteinPct?.toString() ?? "");
  const [carbsPct, setCarbsPct] = useState(defaults.carbsPct?.toString() ?? "");
  const [fatPct, setFatPct] = useState(defaults.fatPct?.toString() ?? "");

  const kcalTargetNum = Number(kcalTarget) || 0;
  const proteinPctNum = Number(proteinPct) || 0;
  const carbsPctNum = Number(carbsPct) || 0;
  const fatPctNum = Number(fatPct) || 0;
  const totalPct = proteinPctNum + carbsPctNum + fatPctNum;
  const isBalanced = totalPct === 100;

  const grams = macroGramsFromPercentages(
    kcalTargetNum,
    proteinPctNum,
    carbsPctNum,
    fatPctNum,
  );

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="kcal_target" className="text-sm font-medium">
          Kcal
        </label>
        <input
          id="kcal_target"
          name="kcal_target"
          type="number"
          step="1"
          min="0"
          required
          value={kcalTarget}
          onChange={(e) => setKcalTarget(e.target.value)}
          className={inputClass}
        />
      </div>

      <MacroRow
        label="Proteína"
        id="protein_pct"
        name="protein_pct"
        pct={proteinPct}
        onChange={setProteinPct}
        grams={grams.proteinG}
      />
      <MacroRow
        label="Carbohidratos"
        id="carbs_pct"
        name="carbs_pct"
        pct={carbsPct}
        onChange={setCarbsPct}
        grams={grams.carbsG}
      />
      <MacroRow
        label="Grasa"
        id="fat_pct"
        name="fat_pct"
        pct={fatPct}
        onChange={setFatPct}
        grams={grams.fatG}
      />

      <p className={`text-sm ${isBalanced ? "text-text-dim" : "text-red-600"}`}>
        Total: {totalPct}% {!isBalanced && "— debe sumar 100%"}
      </p>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending || !isBalanced}>
        {pending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
