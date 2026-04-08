// Federal Opportunity Zone Tax Benefit Calculations
// Based on IRC Section 1400Z-2 (Tax Cuts and Jobs Act of 2017)

export interface OZInvestment {
  capitalGain: number;         // Original capital gain amount
  investmentDate: Date;        // Date of QOZ investment
  holdingPeriod: number;       // Years planned to hold
  propertyValue: number;       // Current/purchase property value
  estimatedAppreciation: number; // Annual appreciation rate (decimal)
  capitalGainsTaxRate: number; // Federal cap gains rate (decimal)
  stateRate: number;           // Colorado state rate (decimal)
}

export interface TaxBenefit {
  deferral: {
    deferredTax: number;
    deferralEndDate: string;
    description: string;
  };
  reduction: {
    basisStepUp: number;
    taxSavings: number;
    description: string;
  };
  exclusion: {
    qualifies: boolean;
    excludedGain: number;
    taxSavings: number;
    description: string;
  };
  totalBenefit: number;
  effectiveTaxRate: number;
  futurePropertyValue: number;
  netGainAfterTax: number;
}

export function calculateOZBenefits(investment: OZInvestment): TaxBenefit {
  const {
    capitalGain,
    holdingPeriod,
    propertyValue,
    estimatedAppreciation,
    capitalGainsTaxRate,
    stateRate,
  } = investment;

  const combinedRate = capitalGainsTaxRate + stateRate;

  // 1. DEFERRAL: Capital gains tax deferred until Dec 31, 2026 or sale
  const deferredTax = capitalGain * combinedRate;
  const deferralEndYear = 2026;
  const deferralEndDate = `December 31, ${deferralEndYear}`;

  // 2. REDUCTION: Basis step-up after holding periods
  // Note: The 10% (5-year) and 15% (7-year) step-ups expired Dec 31, 2026
  // For new investments, these may no longer apply but we calculate for reference
  let basisStepUpPercent = 0;
  if (holdingPeriod >= 7) {
    basisStepUpPercent = 0.15; // 15% basis increase after 7 years
  } else if (holdingPeriod >= 5) {
    basisStepUpPercent = 0.10; // 10% basis increase after 5 years
  }
  const basisStepUp = capitalGain * basisStepUpPercent;
  const reductionTaxSavings = basisStepUp * combinedRate;

  // 3. EXCLUSION: After 10+ years, appreciation on OZ investment is tax-free
  const futurePropertyValue = propertyValue * Math.pow(1 + estimatedAppreciation, holdingPeriod);
  const totalAppreciation = futurePropertyValue - propertyValue;
  const qualifiesForExclusion = holdingPeriod >= 10;
  const excludedGain = qualifiesForExclusion ? totalAppreciation : 0;
  const exclusionTaxSavings = excludedGain * combinedRate;

  // Total benefit calculation
  const totalBenefit = reductionTaxSavings + exclusionTaxSavings;

  // Effective tax rate on total gains
  const totalGains = capitalGain + totalAppreciation;
  const taxOwed = (capitalGain - basisStepUp) * combinedRate +
    (qualifiesForExclusion ? 0 : totalAppreciation * combinedRate);
  const effectiveTaxRate = totalGains > 0 ? taxOwed / totalGains : 0;

  // Net gain after all taxes
  const netGainAfterTax = totalGains - taxOwed;

  return {
    deferral: {
      deferredTax,
      deferralEndDate,
      description: `Capital gains tax of $${deferredTax.toLocaleString()} is deferred until ${deferralEndDate} or until you sell the QOZ investment, whichever comes first.`,
    },
    reduction: {
      basisStepUp,
      taxSavings: reductionTaxSavings,
      description: holdingPeriod >= 5
        ? `After ${holdingPeriod >= 7 ? "7" : "5"} years, your basis increases by ${basisStepUpPercent * 100}% ($${basisStepUp.toLocaleString()}), saving $${reductionTaxSavings.toLocaleString()} in taxes. Note: Step-up benefits may have expired for investments made after certain deadlines.`
        : "Hold for at least 5 years to qualify for a 10% basis step-up on your deferred gain.",
    },
    exclusion: {
      qualifies: qualifiesForExclusion,
      excludedGain,
      taxSavings: exclusionTaxSavings,
      description: qualifiesForExclusion
        ? `After 10+ years, $${excludedGain.toLocaleString()} in appreciation is permanently excluded from capital gains tax, saving $${exclusionTaxSavings.toLocaleString()}.`
        : `Hold for at least 10 years to exclude all future appreciation from capital gains tax. You need ${10 - holdingPeriod} more year(s).`,
    },
    totalBenefit,
    effectiveTaxRate,
    futurePropertyValue,
    netGainAfterTax,
  };
}

// Colorado-specific tax info
export const COLORADO_TAX_INFO = {
  stateCapitalGainsRate: 0.044, // 4.4% flat rate (2024)
  federalLongTermRates: [
    { bracket: "0%", income: "Single: $0-$47,025 | Married: $0-$94,050" },
    { bracket: "15%", income: "Single: $47,026-$518,900 | Married: $94,051-$583,750" },
    { bracket: "20%", income: "Single: $518,901+ | Married: $583,751+" },
  ],
  niit: 0.038, // 3.8% Net Investment Income Tax for high earners
  ozDeadlines: {
    lastDayFor15: "December 31, 2019",
    lastDayFor10: "December 31, 2021",
    deferralEnd: "December 31, 2026",
    note: "New investments can still qualify for the 10-year exclusion on appreciation.",
  },
};
