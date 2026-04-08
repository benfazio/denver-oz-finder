"use client";

import { DENVER_OZ_TRACTS, type OZTract } from "../data/denver-oz-tracts";

interface TractListProps {
  onSelect: (tract: OZTract) => void;
  selectedTract?: OZTract | null;
}

const COUNTY_DOTS: Record<string, string> = {
  Denver: "bg-blue-400",
  Adams: "bg-violet-400",
  Arapahoe: "bg-emerald-400",
  Jefferson: "bg-amber-400",
};

export default function TractList({ onSelect, selectedTract }: TractListProps) {
  const byCounty = DENVER_OZ_TRACTS.reduce((acc, tract) => {
    if (!acc[tract.county]) acc[tract.county] = [];
    acc[tract.county].push(tract);
    return acc;
  }, {} as Record<string, OZTract[]>);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">OZ Directory</h2>
      <p className="text-sm text-gray-500 mb-4">
        {DENVER_OZ_TRACTS.length} officially designated zones across {Object.keys(byCounty).length} counties
      </p>

      <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1">
        {Object.entries(byCounty)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([county, tracts]) => (
            <div key={county}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${COUNTY_DOTS[county] || "bg-gray-400"}`} />
                {county} County ({tracts.length})
              </h3>
              <div className="space-y-1">
                {tracts.map((tract) => (
                  <button
                    key={tract.tractId}
                    onClick={() => onSelect(tract)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                      selectedTract?.tractId === tract.tractId
                        ? "bg-blue-50 border border-blue-200 text-blue-900 shadow-sm"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="font-medium">{tract.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Tract {tract.tractId}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Source: US Treasury CDFI Fund, IRS Designated Qualified Opportunity Zones.
          Boundaries from 2010 Census TIGER/Line.
        </p>
      </div>
    </div>
  );
}
