"use client";

import { useState } from "react";
import { calculateOZBenefits, COLORADO_TAX_INFO, type TaxBenefit } from "../data/tax-calculations";

export default function TaxCalculator() {
  const [capitalGain, setCapitalGain] = useState<number>(100000);
  const [propertyValue, setPropertyValue] = useState<number>(500000);
  const [holdingPeriod, setHoldingPeriod] = useState<number>(10);
  const [appreciation, setAppreciation] = useState<number>(4);
  const [taxBracket, setTaxBracket] = useState<string>("15");
  const [result, setResult] = useState<TaxBenefit | null>(null);

  const calculate = () => {
    setResult(calculateOZBenefits({
      capitalGain,
      investmentDate: new Date(),
      holdingPeriod,
      propertyValue,
      estimatedAppreciation: appreciation / 100,
      capitalGainsTaxRate: parseFloat(taxBracket) / 100,
      stateRate: COLORADO_TAX_INFO.stateCapitalGainsRate,
    }));
  };

  const fmt = (n: number) => "$" + Math.round(n).toLocaleString();
  const pct = (n: number) => (n * 100).toFixed(1) + "%";

  return (
    <div>
      <h2 className="text-lg font-bold text-navy mb-1">Tax Benefit Analysis</h2>
      <p className="text-xs text-mr-gray-400 mb-4">
        Model capital gains tax savings under IRC &sect;1400Z-2 Opportunity Zone provisions.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[11px] font-semibold text-mr-gray-600 uppercase tracking-wider mb-1">Capital Gain</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-mr-gray-400 text-sm">$</span>
            <input type="number" value={capitalGain} onChange={(e) => setCapitalGain(Number(e.target.value))}
              className="w-full pl-7 pr-3 py-2 border border-mr-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-mr-gray-600 uppercase tracking-wider mb-1">Property Value</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-mr-gray-400 text-sm">$</span>
            <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))}
              className="w-full pl-7 pr-3 py-2 border border-mr-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-mr-gray-600 uppercase tracking-wider mb-1">Hold Period: {holdingPeriod}yr</label>
          <input type="range" min={1} max={30} value={holdingPeriod} onChange={(e) => setHoldingPeriod(Number(e.target.value))}
            className="w-full h-1.5 bg-mr-gray-200 rounded appearance-none cursor-pointer accent-navy mt-2" />
          <div className="flex justify-between text-[10px] text-mr-gray-400 mt-1"><span>1</span><span>10</span><span>20</span><span>30</span></div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-mr-gray-600 uppercase tracking-wider mb-1">Appreciation: {appreciation}%</label>
          <input type="range" min={1} max={10} step={0.5} value={appreciation} onChange={(e) => setAppreciation(Number(e.target.value))}
            className="w-full h-1.5 bg-mr-gray-200 rounded appearance-none cursor-pointer accent-navy mt-2" />
          <div className="flex justify-between text-[10px] text-mr-gray-400 mt-1"><span>1%</span><span>5%</span><span>10%</span></div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-mr-gray-600 uppercase tracking-wider mb-1">Federal Rate</label>
          <select value={taxBracket} onChange={(e) => setTaxBracket(e.target.value)}
            className="w-full px-3 py-2 border border-mr-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy">
            <option value="0">0% (Low income)</option>
            <option value="15">15% (Most taxpayers)</option>
            <option value="20">20% (High income)</option>
            <option value="23.8">23.8% (20% + NIIT)</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={calculate}
            className="w-full px-4 py-2 bg-mr-accent text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-red-600 transition-colors">
            Calculate
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-3 mt-5">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-navy rounded p-3 text-center">
              <p className="text-[10px] text-mr-gray-200 uppercase tracking-wider">Total Savings</p>
              <p className="text-xl font-bold text-white">{fmt(result.totalBenefit)}</p>
            </div>
            <div className="bg-navy-light rounded p-3 text-center">
              <p className="text-[10px] text-mr-gray-200 uppercase tracking-wider">Future Value</p>
              <p className="text-xl font-bold text-white">{fmt(result.futurePropertyValue)}</p>
            </div>
            <div className="bg-mr-gray-100 rounded p-3 text-center border border-mr-gray-200">
              <p className="text-[10px] text-mr-gray-400 uppercase tracking-wider">Net After Tax</p>
              <p className="text-xl font-bold text-navy">{fmt(result.netGainAfterTax)}</p>
            </div>
            <div className="bg-mr-gray-100 rounded p-3 text-center border border-mr-gray-200">
              <p className="text-[10px] text-mr-gray-400 uppercase tracking-wider">Effective Rate</p>
              <p className="text-xl font-bold text-navy">{pct(result.effectiveTaxRate)}</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2">
            <div className="p-3 bg-mr-gray-100 rounded border border-mr-gray-200">
              <h3 className="font-bold text-navy text-sm mb-1">1. Tax Deferral</h3>
              <p className="text-xs text-mr-gray-600">{result.deferral.description}</p>
            </div>
            <div className="p-3 bg-mr-gray-100 rounded border border-mr-gray-200">
              <h3 className="font-bold text-navy text-sm mb-1">2. Basis Step-Up</h3>
              <p className="text-xs text-mr-gray-600">{result.reduction.description}</p>
            </div>
            <div className="p-3 bg-mr-gray-100 rounded border border-mr-gray-200">
              <h3 className="font-bold text-navy text-sm mb-1">3. Permanent Exclusion</h3>
              <p className="text-xs text-mr-gray-600">{result.exclusion.description}</p>
            </div>
          </div>

          <div className="p-3 bg-navy rounded">
            <h3 className="font-bold text-white text-xs mb-1 uppercase tracking-wider">Colorado Tax Notes</h3>
            <p className="text-[11px] text-mr-gray-200">
              State rate: {(COLORADO_TAX_INFO.stateCapitalGainsRate * 100).toFixed(1)}% flat.
              Colorado conforms to federal OZ treatment.
              Combined rate: {((parseFloat(taxBracket) + COLORADO_TAX_INFO.stateCapitalGainsRate * 100)).toFixed(1)}%.
            </p>
          </div>

          <p className="text-[10px] text-mr-gray-400 italic">
            Estimates only. Not tax advice. Consult a qualified tax professional. OZ rules subject to legislative change.
          </p>
        </div>
      )}
    </div>
  );
}
