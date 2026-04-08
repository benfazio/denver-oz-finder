"use client";

import { useState } from "react";
import {
  calculateOZBenefits,
  COLORADO_TAX_INFO,
  type TaxBenefit,
} from "../data/tax-calculations";

export default function TaxCalculator() {
  const [capitalGain, setCapitalGain] = useState<number>(100000);
  const [propertyValue, setPropertyValue] = useState<number>(500000);
  const [holdingPeriod, setHoldingPeriod] = useState<number>(10);
  const [appreciation, setAppreciation] = useState<number>(4);
  const [taxBracket, setTaxBracket] = useState<string>("15");
  const [result, setResult] = useState<TaxBenefit | null>(null);

  const calculate = () => {
    const benefits = calculateOZBenefits({
      capitalGain,
      investmentDate: new Date(),
      holdingPeriod,
      propertyValue,
      estimatedAppreciation: appreciation / 100,
      capitalGainsTaxRate: parseFloat(taxBracket) / 100,
      stateRate: COLORADO_TAX_INFO.stateCapitalGainsRate,
    });
    setResult(benefits);
  };

  const fmt = (n: number) => "$" + Math.round(n).toLocaleString();
  const pct = (n: number) => (n * 100).toFixed(1) + "%";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">OZ Tax Benefit Calculator</h2>
      <p className="text-sm text-gray-500 mb-4">
        Estimate tax savings from investing capital gains into a Qualified Opportunity Zone.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capital Gain to Invest</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">$</span>
            <input
              type="number"
              value={capitalGain}
              onChange={(e) => setCapitalGain(Number(e.target.value))}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Value</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">$</span>
            <input
              type="number"
              value={propertyValue}
              onChange={(e) => setPropertyValue(Number(e.target.value))}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Holding Period: {holdingPeriod} years
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={holdingPeriod}
            onChange={(e) => setHoldingPeriod(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1yr</span>
            <span>5yr</span>
            <span>10yr</span>
            <span>20yr</span>
            <span>30yr</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appreciation Rate: {appreciation}%/yr
          </label>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={appreciation}
            onChange={(e) => setAppreciation(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1%</span>
            <span>5%</span>
            <span>10%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Federal Capital Gains Rate</label>
          <select
            value={taxBracket}
            onChange={(e) => setTaxBracket(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">0% (Low income)</option>
            <option value="15">15% (Most taxpayers)</option>
            <option value="20">20% (High income)</option>
            <option value="23.8">23.8% (20% + 3.8% NIIT)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={calculate}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate Benefits
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4 mt-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-600 font-medium">Total Tax Savings</p>
              <p className="text-xl font-bold text-blue-900">{fmt(result.totalBenefit)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-green-600 font-medium">Future Value</p>
              <p className="text-xl font-bold text-green-900">{fmt(result.futurePropertyValue)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-xs text-purple-600 font-medium">Net Gain After Tax</p>
              <p className="text-xl font-bold text-purple-900">{fmt(result.netGainAfterTax)}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-600 font-medium">Effective Tax Rate</p>
              <p className="text-xl font-bold text-amber-900">{pct(result.effectiveTaxRate)}</p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-1">1. Tax Deferral</h3>
              <p className="text-sm text-blue-800">{result.deferral.description}</p>
              <p className="text-xs text-blue-600 mt-1">Deferred amount: {fmt(result.deferral.deferredTax)}</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-semibold text-green-900 mb-1">2. Basis Step-Up (Reduction)</h3>
              <p className="text-sm text-green-800">{result.reduction.description}</p>
              {result.reduction.taxSavings > 0 && (
                <p className="text-xs text-green-600 mt-1">Savings: {fmt(result.reduction.taxSavings)}</p>
              )}
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="font-semibold text-purple-900 mb-1">3. Permanent Exclusion (10+ Years)</h3>
              <p className="text-sm text-purple-800">{result.exclusion.description}</p>
              {result.exclusion.qualifies && (
                <p className="text-xs text-purple-600 mt-1">
                  Excluded gain: {fmt(result.exclusion.excludedGain)} | Savings: {fmt(result.exclusion.taxSavings)}
                </p>
              )}
            </div>
          </div>

          {/* Colorado-specific info */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Colorado Tax Notes</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Colorado state capital gains rate: {(COLORADO_TAX_INFO.stateCapitalGainsRate * 100).toFixed(1)}% (flat)</li>
              <li>Colorado conforms to federal OZ tax treatment</li>
              <li>Combined rate used in calculation: {((parseFloat(taxBracket) + COLORADO_TAX_INFO.stateCapitalGainsRate * 100)).toFixed(1)}%</li>
            </ul>
          </div>

          <p className="text-xs text-gray-400 italic">
            This calculator provides estimates only and does not constitute tax advice. Consult a qualified tax professional for your specific situation. OZ rules are subject to change by legislation.
          </p>
        </div>
      )}
    </div>
  );
}
