"use client";

import { useRef } from "react";
import { type OZTract } from "../data/denver-oz-tracts";
import {
  calculateOZBenefits,
  COLORADO_TAX_INFO,
} from "../data/tax-calculations";

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
          <title>OZ Property Report - ${tract.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
            h1 { font-size: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
            h2 { font-size: 18px; color: #3b82f6; margin-top: 24px; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            td, th { padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; font-size: 14px; }
            th { background: #f9fafb; font-weight: 600; }
            .highlight { background: #eff6ff; }
            .disclaimer { font-size: 11px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          ${reportRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Property Report</h2>
        <button
          onClick={printReport}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
        >
          Print / Save PDF
        </button>
      </div>

      <div ref={reportRef}>
        <h1>Opportunity Zone Property Report</h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <h2>Property Details</h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: "35%" }}>Address</th>
              <td>{address}</td>
            </tr>
            <tr>
              <th>Coordinates</th>
              <td>{lat.toFixed(6)}, {lng.toFixed(6)}</td>
            </tr>
            <tr className="highlight">
              <th>Opportunity Zone Status</th>
              <td><strong>IN OPPORTUNITY ZONE</strong></td>
            </tr>
          </tbody>
        </table>

        <h2>Opportunity Zone Details</h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: "35%" }}>Zone Name</th>
              <td>{tract.name}</td>
            </tr>
            <tr>
              <th>Census Tract ID</th>
              <td>{tract.tractId}</td>
            </tr>
            <tr>
              <th>County</th>
              <td>{tract.county} County, Colorado</td>
            </tr>
            <tr>
              <th>Designation Type</th>
              <td>{tract.designation}</td>
            </tr>
            {tract.medianIncome && (
              <tr>
                <th>Area Median Income</th>
                <td>${tract.medianIncome.toLocaleString()}</td>
              </tr>
            )}
            {tract.povertyRate && (
              <tr>
                <th>Area Poverty Rate</th>
                <td>{tract.povertyRate}%</td>
              </tr>
            )}
          </tbody>
        </table>

        <h2>Estimated Tax Benefits (Sample: $100K Capital Gain, $500K Property, 10yr Hold)</h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: "35%" }}>Tax Deferral</th>
              <td>{fmt(benefits.deferral.deferredTax)} deferred until {benefits.deferral.deferralEndDate}</td>
            </tr>
            <tr>
              <th>Basis Step-Up</th>
              <td>{fmt(benefits.reduction.basisStepUp)} ({benefits.reduction.taxSavings > 0 ? `saves ${fmt(benefits.reduction.taxSavings)}` : "N/A for current timeline"})</td>
            </tr>
            <tr className="highlight">
              <th>10-Year Exclusion</th>
              <td>{fmt(benefits.exclusion.excludedGain)} in appreciation excluded from tax (saves {fmt(benefits.exclusion.taxSavings)})</td>
            </tr>
            <tr>
              <th>Future Property Value</th>
              <td>{fmt(benefits.futurePropertyValue)}</td>
            </tr>
            <tr className="highlight">
              <th>Total Tax Savings</th>
              <td><strong>{fmt(benefits.totalBenefit)}</strong></td>
            </tr>
            <tr>
              <th>Effective Tax Rate</th>
              <td>{(benefits.effectiveTaxRate * 100).toFixed(1)}% (vs. {((0.15 + COLORADO_TAX_INFO.stateCapitalGainsRate) * 100).toFixed(1)}% without OZ)</td>
            </tr>
          </tbody>
        </table>

        <h2>Key OZ Investment Requirements</h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: "35%" }}>Investment Vehicle</th>
              <td>Must invest through a Qualified Opportunity Fund (QOF)</td>
            </tr>
            <tr>
              <th>90% Asset Test</th>
              <td>QOF must hold at least 90% of assets in QOZ property</td>
            </tr>
            <tr>
              <th>Substantial Improvement</th>
              <td>For existing buildings, must double the basis within 30 months</td>
            </tr>
            <tr>
              <th>Investment Timeline</th>
              <td>Capital gains must be invested within 180 days of realization</td>
            </tr>
            <tr>
              <th>Deferral Deadline</th>
              <td>Deferred gains recognized by December 31, 2026</td>
            </tr>
            <tr>
              <th>Exclusion Eligibility</th>
              <td>Hold QOF investment for 10+ years for tax-free appreciation</td>
            </tr>
          </tbody>
        </table>

        <p className="disclaimer">
          DISCLAIMER: This report is generated for informational purposes only and does not constitute legal, tax, or investment advice.
          Opportunity Zone designations and tax benefits are subject to change by federal and state legislation.
          Consult a qualified tax professional, attorney, and/or financial advisor before making any investment decisions.
          Census tract boundaries shown are approximate. Verify with the IRS and CDFI Fund for official designations.
        </p>
      </div>
    </div>
  );
}
