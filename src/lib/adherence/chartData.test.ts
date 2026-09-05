import { describe, expect, it } from "vitest";
import { buildAdherenceSeries } from "./chartData";

describe("buildAdherenceSeries", () => {
  it("devuelve una entrada por cada fecha del rango pedido, en orden", () => {
    const dates = ["2026-09-03", "2026-09-01", "2026-09-02"];
    const dailyKcal = [
      { date: "2026-09-01", kcal: 1800 },
      { date: "2026-09-02", kcal: 2000 },
      { date: "2026-09-03", kcal: 1900 },
    ];
    const targets = [{ effectiveDate: "2026-08-01", kcalTarget: 2000 }];

    const result = buildAdherenceSeries(dates, dailyKcal, targets);

    expect(result.map((d) => d.date)).toEqual([
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
    ]);
  });

  it("un día sin ningún alimento registrado es actualKcal = 0, no un hueco", () => {
    const result = buildAdherenceSeries(
      ["2026-09-01", "2026-09-02"],
      [{ date: "2026-09-01", kcal: 1800 }], // el día 2 no tiene ninguna entrada
      [{ effectiveDate: "2026-08-01", kcalTarget: 2000 }],
    );

    expect(result).toEqual([
      { date: "2026-09-01", actualKcal: 1800, targetKcal: 2000 },
      { date: "2026-09-02", actualKcal: 0, targetKcal: 2000 },
    ]);
  });

  it("usa el objetivo vigente en cada fecha, no siempre el último objetivo global", () => {
    // Tres periodos de objetivo distintos dentro del mismo rango.
    const targets = [
      { effectiveDate: "2026-08-01", kcalTarget: 1800 },
      { effectiveDate: "2026-09-10", kcalTarget: 2200 },
      { effectiveDate: "2026-09-05", kcalTarget: 2000 },
    ];
    const dates = ["2026-09-01", "2026-09-06", "2026-09-12"];

    const result = buildAdherenceSeries(dates, [], targets);

    expect(result).toEqual([
      { date: "2026-09-01", actualKcal: 0, targetKcal: 1800 }, // antes del primer cambio
      { date: "2026-09-06", actualKcal: 0, targetKcal: 2000 }, // tras el 2º cambio, antes del 3º
      { date: "2026-09-12", actualKcal: 0, targetKcal: 2200 }, // tras el 3er cambio
    ]);
  });

  it("una fecha anterior al primer objetivo que haya existido nunca da targetKcal null", () => {
    const result = buildAdherenceSeries(
      ["2026-07-01"],
      [],
      [{ effectiveDate: "2026-08-01", kcalTarget: 2000 }],
    );

    expect(result).toEqual([{ date: "2026-07-01", actualKcal: 0, targetKcal: null }]);
  });

  it("maneja el historial de objetivos desordenado de entrada sin afectar el resultado", () => {
    const targetsOrdered = [
      { effectiveDate: "2026-08-01", kcalTarget: 1800 },
      { effectiveDate: "2026-09-01", kcalTarget: 2000 },
    ];
    const targetsShuffled = [targetsOrdered[1], targetsOrdered[0]];

    const dates = ["2026-08-15", "2026-09-15"];

    expect(buildAdherenceSeries(dates, [], targetsOrdered)).toEqual(
      buildAdherenceSeries(dates, [], targetsShuffled),
    );
  });
});
