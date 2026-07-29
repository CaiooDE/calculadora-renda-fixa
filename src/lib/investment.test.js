import { describe, expect, it } from "vitest";
import { buildProjection, getTaxRate } from "./investment";

describe("buildProjection", () => {
  it("compounds the initial balance monthly without contributions", () => {
    const result = buildProjection({
      initialAmount: 1000,
      contribution: 0,
      monthlyRatePercent: 1,
      duration: 12,
      durationUnit: "months",
      hasIncrease: false,
      includeTax: false,
    });

    expect(result.balance).toBeCloseTo(1000 * 1.01 ** 12, 8);
    expect(result.invested).toBe(1000);
  });

  it("adds monthly contributions at the end of each month", () => {
    const result = buildProjection({
      initialAmount: 0,
      contribution: 100,
      contributionFrequency: "monthly",
      monthlyRatePercent: 0,
      duration: 12,
      durationUnit: "months",
      hasIncrease: false,
      includeTax: false,
    });

    expect(result.balance).toBe(1200);
    expect(result.invested).toBe(1200);
  });

  it("applies yearly increases after the first twelve contributions", () => {
    const result = buildProjection({
      initialAmount: 0,
      contribution: 100,
      contributionFrequency: "monthly",
      monthlyRatePercent: 0,
      duration: 24,
      durationUnit: "months",
      hasIncrease: true,
      increaseType: "percent",
      increaseValue: 10,
      increaseEvery: 1,
      increaseFrequency: "years",
      includeTax: false,
    });

    expect(result.invested).toBeCloseTo(12 * 100 + 12 * 110, 8);
    expect(result.finalContribution).toBeCloseTo(110, 8);
  });

  it("only deposits yearly contributions at months 12 and 24", () => {
    const result = buildProjection({
      initialAmount: 0,
      contribution: 1200,
      contributionFrequency: "yearly",
      monthlyRatePercent: 0,
      duration: 24,
      durationUnit: "months",
      hasIncrease: false,
      includeTax: false,
    });

    expect(result.invested).toBe(2400);
    expect(result.timeline[11].invested).toBe(0);
    expect(result.timeline[12].invested).toBe(1200);
    expect(result.timeline[24].invested).toBe(2400);
  });
});

describe("getTaxRate", () => {
  it("uses the Brazilian regressive fixed-income brackets", () => {
    expect(getTaxRate(6)).toBe(0.225);
    expect(getTaxRate(7)).toBe(0.2);
    expect(getTaxRate(13)).toBe(0.175);
    expect(getTaxRate(25)).toBe(0.15);
  });
});
