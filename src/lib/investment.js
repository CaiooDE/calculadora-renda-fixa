const MONTHS_IN_YEAR = 12;
const DAYS_IN_MONTH = 30;

export const DEFAULT_INPUTS = {
  initialAmount: 10000,
  contribution: 1000,
  contributionFrequency: "monthly",
  monthlyRatePercent: 0.85,
  duration: 10,
  durationUnit: "years",
  hasIncrease: true,
  increaseType: "percent",
  increaseValue: 5,
  increaseEvery: 1,
  increaseFrequency: "years",
  includeTax: true,
  annualInflationPercent: 4.5,
};

export function toNumber(value, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const normalized = String(value ?? "")
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getDurationMonths(duration, unit) {
  const parsed = Math.max(1, Math.round(toNumber(duration, 1)));
  return unit === "years" ? parsed * MONTHS_IN_YEAR : parsed;
}

export function getTaxRate(ageInMonths) {
  const days = ageInMonths * DAYS_IN_MONTH;
  if (days <= 180) return 0.225;
  if (days <= 360) return 0.2;
  if (days <= 720) return 0.175;
  return 0.15;
}

function applyIncrease(value, type, increaseValue) {
  if (type === "fixed") return value + increaseValue;
  return value * (1 + increaseValue / 100);
}

function compactChartData(data, maxPoints = 160) {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil((data.length - 1) / (maxPoints - 1));
  const compacted = data.filter((_, index) => index === 0 || index % step === 0);
  const last = data[data.length - 1];
  if (compacted.at(-1)?.month !== last.month) compacted.push(last);
  return compacted;
}

export function buildProjection(rawInputs = DEFAULT_INPUTS) {
  const inputs = { ...DEFAULT_INPUTS, ...rawInputs };
  const initialAmount = Math.max(0, toNumber(inputs.initialAmount));
  const baseContribution = Math.max(0, toNumber(inputs.contribution));
  const monthlyRate = Math.max(0, toNumber(inputs.monthlyRatePercent)) / 100;
  const durationMonths = getDurationMonths(inputs.duration, inputs.durationUnit);
  const contributionEveryMonths = inputs.contributionFrequency === "yearly" ? 12 : 1;
  const increaseEveryMonths =
    Math.max(1, Math.round(toNumber(inputs.increaseEvery, 1))) *
    (inputs.increaseFrequency === "years" ? 12 : 1);
  const increaseValue = Math.max(0, toNumber(inputs.increaseValue));
  const annualInflation = Math.max(0, toNumber(inputs.annualInflationPercent)) / 100;

  let balance = initialAmount;
  let invested = initialAmount;
  let currentContribution = baseContribution;
  const lots = initialAmount > 0 ? [{ principal: initialAmount, value: initialAmount, depositedAt: 0 }] : [];
  const timeline = [
    {
      month: 0,
      balance,
      invested,
      interest: 0,
      label: "Hoje",
    },
  ];

  for (let month = 1; month <= durationMonths; month += 1) {
    balance *= 1 + monthlyRate;
    lots.forEach((lot) => {
      lot.value *= 1 + monthlyRate;
    });

    const increaseIsDue =
      inputs.hasIncrease && month > 1 && (month - 1) % increaseEveryMonths === 0;
    if (increaseIsDue) {
      currentContribution = applyIncrease(
        currentContribution,
        inputs.increaseType,
        increaseValue,
      );
    }

    if (month % contributionEveryMonths === 0 && currentContribution > 0) {
      balance += currentContribution;
      invested += currentContribution;
      lots.push({
        principal: currentContribution,
        value: currentContribution,
        depositedAt: month,
      });
    }

    timeline.push({
      month,
      balance,
      invested,
      interest: Math.max(0, balance - invested),
      label:
        month % 12 === 0
          ? `${month / 12} ${month === 12 ? "ano" : "anos"}`
          : `${month} ${month === 1 ? "mês" : "meses"}`,
    });
  }

  const totalInterest = Math.max(0, balance - invested);
  const estimatedTax = inputs.includeTax
    ? lots.reduce((tax, lot) => {
        const gain = Math.max(0, lot.value - lot.principal);
        const ageInMonths = durationMonths - lot.depositedAt;
        return tax + gain * getTaxRate(ageInMonths);
      }, 0)
    : 0;
  const netBalance = Math.max(0, balance - estimatedTax);
  const inflationFactor = (1 + annualInflation) ** (durationMonths / 12);
  const realBalance = balance / inflationFactor;
  const monthlyIncome = balance * monthlyRate;

  return {
    balance,
    invested,
    totalInterest,
    monthlyIncome,
    annualIncome: monthlyIncome * 12,
    estimatedTax,
    netBalance,
    realBalance,
    finalContribution: currentContribution,
    durationMonths,
    contributionEveryMonths,
    chartData: compactChartData(timeline),
    timeline,
    returnMultiple: invested > 0 ? balance / invested : 0,
  };
}
