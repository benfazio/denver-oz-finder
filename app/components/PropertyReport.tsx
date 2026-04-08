"use client";

import { useRef } from "react";
import { type OZTract } from "../data/denver-oz-tracts";
import { calculateOZBenefits, COLORADO_TAX_INFO } from "../data/tax-calculations";

interface PropertyReportProps {
  address: string;
  lat: number;
  lng: number;
  tract: OZTract;
}

export default function PropertyReport({ address, lat, lng, tract }: PropertyReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const benefits = calculateOZBenefits({
    capitalGain: 100000,
    investmentDate: new Date(),
    holdingPeriod: 10,
    propertyValue: 500000,
    estimatedAppreciation: 0.04,
    capitalGainsTaxRate: 0.15,
    stateRate: COLORADO_TAX_INFO.stateCapitalGainsRate,
  });

  const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

  const printReport = () => {
    if (!reportRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>OZ Report - ${tract.name}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1C1C20; }
            h1 { font-size: 20px; color: #1F223F; border-bottom: 3px solid #FF1053; padding-bottom: 8px; margin-bottom: 4px; }
            h2 { font-size: 15px; color: #1F223F; margin-top: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .subtitle { font-size: 11px; color: #969696; text-transform: uppercase; letter-spacing: 2px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            td, th { padding: 8px 12px; border: 1px solid #D9D9D9; text-align: left; font-size: 13px; }
            th { background: #ECEBE9; font-weight: 600; width: 35%; color: #1F223F; }
            .highlight { background: #f0f4ff; }
            .disclaimer { font-size: 10px; color: #969696; margin-top: 32px; border-top: 1px solid #D9D9D9; padding-top: 12px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>${reportRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-navy">Investment Report</h2>
        <button onClick={printReport}
          className="px-4 py-1.5 bg-mr-gray-100 text-navy text-xs font-semibold uppercase tracking-wider rounded border border-mr-gray-200 hover:bg-mr-gray-200 transition-colors">
          Print / PDF
        </button>
      </div>

      <div ref={reportRef}>
        <h1>Opportunity Zone Property Report</h1>
        <p className="subtitle">Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <h2>Property Identification</h2>
        <table>
          <tbody>
            <tr><th>Address</th><td>{address}</td></tr>
            <tr><th>Coordinates</th><td>{lat.toFixed(6)}, {lng.toFixed(6)}</td></tr>
            <tr className="highlight"><th>OZ Status</th><td><strong>QUALIFIED OPPORTUNITY ZONE</strong></td></tr>
          </tbody>
        </table>

        <h2>Zone Classification</h2>
        <table>
          <tbody>
            <tr><th>Zone Name</th><td>{tract.name}</td></tr>
            <tr><th>Census Tract</th><td>{tract.tractId}</td></tr>
            <tr><th>Jurisdiction</th><td>{tract.county} County, Colorado</td></tr>
            <tr><th>Designation</th><td>{tract.designation}</td></tr>
            <tr><th>Authority</th><td>US Treasury CDFI Fund (Official)</td></tr>
          </tbody>
        </table>

        <h2>Projected Tax Benefits</h2>
        <p style={{ fontSize: "11px", color: "#969696", margin: "4px 0 8px" }}>Sample: $100K Capital Gain, $500K Property, 10-Year Hold</p>
        <table>
          <tbody>
            <tr><th>Tax Deferral</th><td>{fmt(benefits.deferral.deferredTax)} deferred until {benefits.deferral.deferralEndDate}</td></tr>
            <tr><th>Basis Step-Up</th><td>{fmt(benefits.reduction.basisStepUp)} ({benefits.reduction.taxSavings > 0 ? `saves ${fmt(benefits.reduction.taxSavings)}` : "N/A current timeline"})</td></tr>
            <tr className="highlight"><th>10-Year Exclusion</th><td>{fmt(benefits.exclusion.excludedGain)} excluded (saves {fmt(benefits.exclusion.taxSavings)})</td></tr>
            <tr><th>Projected Value</th><td>{fmt(benefits.futurePropertyValue)}</td></tr>
            <tr className="highlight"><th>Total Tax Savings</th><td><strong>{fmt(benefits.totalBenefit)}</strong></td></tr>
            <tr><th>Effective Rate</th><td>{(benefits.effectiveTaxRate * 100).toFixed(1)}% vs. {((0.15 + COLORADO_TAX_INFO.stateCapitalGainsRate) * 100).toFixed(1)}% standard</td></tr>
          </tbody>
        </table>

        <h2>Compliance Requirements</h2>
        <table>
          <tbody>
            <tr><th>Investment Vehicle</th><td>Qualified Opportunity Fund (QOF) required</td></tr>
            <tr><th>90% Asset Test</th><td>QOF must hold 90%+ assets in QOZ property</td></tr>
            <tr><th>Substantial Improvement</th><td>Double basis within 30 months (existing structures)</td></tr>
            <tr><th>Investment Window</th><td>180 days from capital gain realization</td></tr>
            <tr><th>Deferral Deadline</th><td>December 31, 2026</td></tr>
            <tr><th>Exclusion Threshold</th><td>10+ year hold for tax-free appreciation</td></tr>
          </tbody>
        </table>

        <p className="disclaimer">
          DISCLAIMER: This report is for informational purposes only and does not constitute legal, tax, or investment advice.
          Opportunity Zone designations and tax benefits are subject to change. Consult qualified legal and tax professionals.
          Boundary data from US Treasury CDFI Fund. IRC &sect;1400Z-2.
        </p>
      </div>
    </div>
  );
}
