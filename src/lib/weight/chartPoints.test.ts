import { describe, expect, it } from "vitest";
import { buildWeightChartData } from "./chartPoints";

describe("buildWeightChartData", () => {
  it("con 0 registros, no hay puntos ni min/max ni línea", () => {
    expect(buildWeightChartData([])).toEqual({
      points: [],
      minWeight: null,
      maxWeight: null,
      pathD: "",
    });
  });

  it("con 1 registro, hay un punto centrado pero ninguna línea (no se inventa tendencia)", () => {
    const result = buildWeightChartData([{ date: "2026-08-10", weightKg: 70 }]);

    expect(result.points).toHaveLength(1);
    expect(result.points[0]).toMatchObject({ date: "2026-08-10", weightKg: 70, x: 50, y: 50 });
    expect(result.minWeight).toBe(70);
    expect(result.maxWeight).toBe(70);
    expect(result.pathD).toBe("");
  });

  it("con 2 registros, dibuja línea entre los dos extremos del eje x", () => {
    const result = buildWeightChartData([
      { date: "2026-08-01", weightKg: 72 },
      { date: "2026-08-15", weightKg: 70 },
    ]);

    expect(result.points).toHaveLength(2);
    expect(result.points[0]).toMatchObject({ x: 0, y: 0 }); // más peso → arriba
    expect(result.points[1]).toMatchObject({ x: 100, y: 100 }); // menos peso → abajo
    expect(result.pathD).toBe("M 0 0 L 100 100");
  });

  it("con varios registros, ordena por fecha y reparte x uniformemente", () => {
    const result = buildWeightChartData([
      { date: "2026-08-01", weightKg: 72 },
      { date: "2026-08-10", weightKg: 71 },
      { date: "2026-08-20", weightKg: 70 },
    ]);

    expect(result.points.map((p) => p.date)).toEqual([
      "2026-08-01",
      "2026-08-10",
      "2026-08-20",
    ]);
    expect(result.points.map((p) => p.x)).toEqual([0, 50, 100]);
  });

  it("ordena correctamente aunque la entrada venga desordenada por fecha", () => {
    const result = buildWeightChartData([
      { date: "2026-08-20", weightKg: 70 },
      { date: "2026-08-01", weightKg: 72 },
      { date: "2026-08-10", weightKg: 71 },
    ]);

    expect(result.points.map((p) => p.date)).toEqual([
      "2026-08-01",
      "2026-08-10",
      "2026-08-20",
    ]);
  });

  it("con fechas repetidas, se queda con la última entrada de esa fecha en el array de entrada", () => {
    const result = buildWeightChartData([
      { date: "2026-08-10", weightKg: 71 }, // registro de la mañana
      { date: "2026-08-10", weightKg: 70.5 }, // registro de la tarde, más reciente
    ]);

    expect(result.points).toHaveLength(1);
    expect(result.points[0].weightKg).toBe(70.5);
  });

  it("con todos los pesos iguales, evita dividir entre 0 y centra la línea", () => {
    const result = buildWeightChartData([
      { date: "2026-08-01", weightKg: 70 },
      { date: "2026-08-10", weightKg: 70 },
      { date: "2026-08-20", weightKg: 70 },
    ]);

    expect(result.points.every((p) => p.y === 50)).toBe(true);
    expect(result.minWeight).toBe(70);
    expect(result.maxWeight).toBe(70);
    expect(result.pathD).toBe("M 0 50 L 50 50 L 100 50");
  });
});
