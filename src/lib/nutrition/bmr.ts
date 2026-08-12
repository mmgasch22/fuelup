import type { Sex } from "./types";

// Mifflin-St Jeor. Para "other" se usa el punto medio de las constantes
// masculina (+5) y femenina (-161): (5 + -161) / 2 = -78. Es una
// aproximación documentada, no una fórmula clínica validada para esa
// categoría.
const SEX_CONSTANT: Record<Sex, number> = {
  male: 5,
  female: -161,
  other: -78,
};

export function calculateBmr(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + SEX_CONSTANT[sex];
}
