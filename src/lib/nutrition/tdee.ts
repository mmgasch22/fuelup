import { ACTIVITY_MULTIPLIERS } from "./constants";
import type { ActivityLevel } from "./types";

export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}
