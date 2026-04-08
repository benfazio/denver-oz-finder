"use client";

import { useRef } from "react";
import { type OZTract } from "../data/denver-oz-tracts";
import { calculateOZBenefits, COLORADO_TAX_INFO } from "../data/tax-calculations";

interface PropertyReportProps {
  address: string;
  lat: number;
  lng: number;
  tract: OZTract;
  expanded?: boolean;
}

export default function PropertyReport({ address, lat, lng, tract, expanded }: PropertyReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const benefits = calculateOZBenefits({
    capitalGain: 100000, investmentDate: new Date(), holdingPeriod: 10,
    propertyValue: 500000, estimatedAppreciation: 0.04,
    capitalGainsTaxRate: 0.15, stateRate: COLORADO_TAX_INFO.stateCapitalGainsRate,
  });

  const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

  const printReport = () => {
    if (!reportRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>OZ Report - ${tract.name}</title>
      <style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1C1C20}
      h1{font-size:20px;color:#1F223F;border-bottom:3px solid #FF1053;padding-bottom:8px}
      h2{font-size:14px;color:#1F223F;margin-top:20px;text-transform:uppercase;letter-spacing:1px}
      .sub{font-size:10px;color:#969696;text-transform:uppercase;letter-spacing:2px}
      table{width:100%;border-collapse:collapse;margin:8px 0}td,th{padding:7px 10px;border:1px solid #D9D9D9;text-align:left;font-size:12px}
      th{background:#ECEBE9;font-weight:600;width:35%;color:#1F223F}.hl{background:#f0f4ff}
      .disc{font-size:9px;color:#969696;margin-top:24px;border-top:1px solid #D9D9D9;padding-top:10px}
      @media print{body{margin:20px}}</style></head><body>${reportRef.current.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-navy">Investment Report</h2>
        <button onClick={printReport}
          className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] border border-mr-gray-200 rounded hover:bg-mr-gray-100 transition-colors text-navy">
          Print / PDF
        </button>
      </div>

      <div ref={reportRef}>
        <h1>Opportunity Zone Property Report</h1>
        <p className="sub">Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        {/* Grid layout when expanded */}
        <div className={expanded ? "grid grid-cols-2 gap-4" : "space-y-0"}>
          {/* Property ID */}
          <section className="rounded border border-mr-gray-200 overflow-hidden mt-4">
            <div className="px-4 py-2 bg-mr-gray-100 border-b border-mr-gray-200">
              <h3 className="text-[10px] font-bold text-mr-gray-600 uppercase tracking-[0.15em]">Property Identification</h3>
            </div>
            <div className="p-4 space-y-3 bg-white">
              <div>
                <p className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-wider mb-0.5">Address</p>
                <p className="text-sm text-navy">{address}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-wider mb-0.5">Latitude</p>
                  <p className="text-sm text-navy font-mono">{lat.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-wider mb-0.5">Longitude</p>
                  <p className="text-sm text-navy font-mono">{lng.toFixed(6)}</p>
                </div>
              </div>
              <div className="px-3 py-2 bg-emerald-600 text-white rounded">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em]">Qualified Opportunity Zone</p>
              </div>
            </div>
          </section>

          {/* Zone Classification */}
          <section className="rounded border border-mr-gray-200 overflow-hidden mt-4">
            <div className="px-4 py-2 bg-mr-gray-100 border-b border-mr-gray-200">
              <h3 className="text-[10px] font-bold text-mr-gray-600 uppercase tracking-[0.15em]">Zone Classification</h3>
            </div>
            <div className="divide-y divide-mr-gray-200 bg-white">
              {[
                ["Zone Name", tract.name],
                ["Census Tract", tract.tractId],
                ["Jurisdiction", `${tract.county} County, CO`],
                ["Designation", tract.designation],
                ["Authority", "US Treasury CDFI Fund"],
              ].map(([label, value]) => (
                <div key={label} className="px-4 py-2.5 flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-mr-gray-400">{label}</span>
                  <span className="text-sm text-navy font-medium">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Tax Benefits */}
        <section className="rounded border border-mr-gray-200 overflow-hidden mt-4">
          <div className="px-4 py-2 bg-navy text-white border-b border-navy-light">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em]">Projected Tax Benefits</h3>
            <p className="text-[9px] text-mr-gray-400 mt-0.5">Sample: $100K Capital Gain &middot; $500K Property &middot; 10-Year Hold</p>
          </div>
          <div className={`p-4 bg-white ${expanded ? "grid grid-cols-3 gap-3" : "grid grid-cols-2 gap-3"}`}>
            {[
              { label: "Tax Deferral", value: fmt(benefits.deferral.deferredTax), sub: `Until ${benefits.deferral.deferralEndDate}` },
              { label: "Basis Step-Up", value: fmt(benefits.reduction.basisStepUp), sub: benefits.reduction.taxSavings > 0 ? `Saves ${fmt(benefits.reduction.taxSavings)}` : "Timeline N/A" },
              { label: "10-Yr Exclusion", value: fmt(benefits.exclusion.excludedGain), sub: `Saves ${fmt(benefits.exclusion.taxSavings)}` },
              { label: "Projected Value", value: fmt(benefits.futurePropertyValue), sub: "After 10 years" },
              { label: "Total Savings", value: fmt(benefits.totalBenefit), sub: "Combined benefit" },
              { label: "Effective Rate", value: (benefits.effectiveTaxRate * 100).toFixed(1) + "%", sub: `vs. ${((0.15 + COLORADO_TAX_INFO.stateCapitalGainsRate) * 100).toFixed(1)}% standard` },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-mr-gray-100 rounded border border-mr-gray-200 text-center">
                <p className="text-[9px] font-bold text-mr-gray-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-lg font-bold text-navy mt-1">{item.value}</p>
                <p className="text-[10px] text-mr-gray-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance */}
        <section className="rounded border border-mr-gray-200 overflow-hidden mt-4">
          <div className="px-4 py-2 bg-mr-gray-100 border-b border-mr-gray-200">
            <h3 className="text-[10px] font-bold text-mr-gray-600 uppercase tracking-[0.15em]">Compliance Requirements</h3>
          </div>
          <div className="divide-y divide-mr-gray-200 bg-white">
            {[
              ["Investment Vehicle", "Qualified Opportunity Fund (QOF) required"],
              ["90% Asset Test", "QOF must hold 90%+ assets in QOZ property"],
              ["Substantial Improvement", "Double basis within 30 months"],
              ["Investment Window", "180 days from capital gain realization"],
              ["Deferral Deadline", "December 31, 2026"],
              ["Exclusion Threshold", "10+ year hold for tax-free appreciation"],
            ].map(([label, value]) => (
              <div key={label} className="px-4 py-2.5 flex justify-between items-start gap-4">
                <span className="text-[11px] font-semibold text-mr-gray-400 shrink-0">{label}</span>
                <span className="text-[11px] text-navy text-right">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="disc">
          DISCLAIMER: For informational purposes only. Not legal, tax, or investment advice.
          OZ designations subject to legislative change. Consult qualified professionals. IRC &sect;1400Z-2.
        </p>
      </div>
    </div>
  );
}
