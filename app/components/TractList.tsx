"use client";

import { DENVER_OZ_TRACTS, type OZTract } from "../data/denver-oz-tracts";

interface TractListProps {
  onSelect: (tract: OZTract) => void;
  selectedTract?: OZTract | null;
}

export default function TractList({ onSelect, selectedTract }: TractListProps) {
  const byCounty = DENVER_OZ_TRACTS.reduce((acc, tract) => {
    if (!acc[tract.county]) acc[tract.county] = [];
    acc[tract.county].push(tract);
    return acc;
  }, {} as Record<string, OZTract[]>);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Denver Metro Opportunity Zones</h2>
      <p className="text-sm text-gray-500 mb-4">
        {DENVER_OZ_TRACTS.length} designated zones across {Object.keys(byCounty).length} counties
      </p>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {Object.entries(byCounty).map(([county, tracts]) => (
          <div key={county}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {county} County ({tracts.length})
            </h3>
            <div className="space-y-1">
              {tracts.map((tract) => (
                <button
                  key={tract.tractId}
                  onClick={() => onSelect(tract)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedTract?.tractId === tract.tractId
                      ? "bg-blue-50 border border-blue-200 text-blue-900"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{tract.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tract.designation === "Contiguous Tract"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {tract.designation === "Contiguous Tract" ? "Contiguous" : "LIC"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Tract {tract.tractId}
                    {tract.medianIncome && ` | Income: $${tract.medianIncome.toLocaleString()}`}
                    {tract.povertyRate && ` | Poverty: ${tract.povertyRate}%`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
