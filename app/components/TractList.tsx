"use client";

import { DENVER_OZ_TRACTS, type OZTract } from "../data/denver-oz-tracts";

interface TractListProps {
  onSelect: (tract: OZTract) => void;
  selectedTract?: OZTract | null;
}

const COUNTY_DOTS: Record<string, string> = {
  Denver: "bg-blue-500",
  Adams: "bg-violet-500",
  Arapahoe: "bg-emerald-500",
  Jefferson: "bg-amber-500",
};

export default function TractList({ onSelect, selectedTract }: TractListProps) {
  const byCounty = DENVER_OZ_TRACTS.reduce((acc, tract) => {
    if (!acc[tract.county]) acc[tract.county] = [];
    acc[tract.county].push(tract);
    return acc;
  }, {} as Record<string, OZTract[]>);

  return (
    <div>
      <h2 className="text-lg font-bold text-navy mb-1">Zone Directory</h2>
      <p className="text-xs text-mr-gray-400 mb-4">
        {DENVER_OZ_TRACTS.length} officially designated Qualified Opportunity Zones
      </p>

      <div className="space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
        {Object.entries(byCounty)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([county, tracts]) => (
            <div key={county}>
              <h3 className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${COUNTY_DOTS[county] || "bg-mr-gray-400"}`} />
                {county} County &middot; {tracts.length} zones
              </h3>
              <div className="space-y-1">
                {tracts.map((tract) => (
                  <button
                    key={tract.tractId}
                    onClick={() => onSelect(tract)}
                    className={`w-full text-left px-3 py-2.5 rounded text-sm transition-all border ${
                      selectedTract?.tractId === tract.tractId
                        ? "bg-navy text-white border-navy shadow-sm"
                        : "hover:bg-mr-gray-100 border-transparent hover:border-mr-gray-200"
                    }`}
                  >
                    <div className="font-semibold">{tract.name}</div>
                    <div className={`text-[11px] mt-0.5 ${selectedTract?.tractId === tract.tractId ? "text-mr-gray-200" : "text-mr-gray-400"}`}>
                      {tract.tractId}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>

      <div className="mt-4 pt-3 border-t border-mr-gray-200">
        <p className="text-[10px] text-mr-gray-400 uppercase tracking-wider">
          Source: US Treasury CDFI Fund &middot; 2010 Census TIGER/Line
        </p>
      </div>
    </div>
  );
}
