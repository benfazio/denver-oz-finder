"use client";

import { DENVER_OZ_TRACTS, type OZTract } from "../data/denver-oz-tracts";

interface TractListProps {
  onSelect: (tract: OZTract) => void;
  selectedTract?: OZTract | null;
  expanded?: boolean;
}

const COUNTY_COLORS: Record<string, string> = {
  Denver: "bg-blue-600",
  Adams: "bg-violet-600",
  Arapahoe: "bg-emerald-600",
  Jefferson: "bg-amber-500",
};

export default function TractList({ onSelect, selectedTract, expanded }: TractListProps) {
  const byCounty = DENVER_OZ_TRACTS.reduce((acc, tract) => {
    if (!acc[tract.county]) acc[tract.county] = [];
    acc[tract.county].push(tract);
    return acc;
  }, {} as Record<string, OZTract[]>);

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-base font-bold text-navy mb-0.5">Zone Directory</h2>
        <p className="text-[11px] text-mr-gray-400">{DENVER_OZ_TRACTS.length} officially designated Qualified Opportunity Zones</p>
      </section>

      <div className={`space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto ${expanded ? "grid grid-cols-2 gap-4 space-y-0" : ""}`}>
        {Object.entries(byCounty)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([county, tracts]) => (
            <section key={county} className="rounded border border-mr-gray-200 overflow-hidden">
              <div className="px-4 py-2 bg-mr-gray-100 border-b border-mr-gray-200 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${COUNTY_COLORS[county] || "bg-mr-gray-400"}`} />
                <h3 className="text-[10px] font-bold text-mr-gray-600 uppercase tracking-[0.15em]">
                  {county} County &middot; {tracts.length} zones
                </h3>
              </div>
              <div className="divide-y divide-mr-gray-200">
                {tracts.map((tract) => (
                  <button
                    key={tract.tractId}
                    onClick={() => onSelect(tract)}
                    className={`w-full text-left px-4 py-2.5 transition-all ${
                      selectedTract?.tractId === tract.tractId
                        ? "bg-navy text-white"
                        : "hover:bg-mr-gray-100/50"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${selectedTract?.tractId === tract.tractId ? "text-white" : "text-navy"}`}>
                      {tract.name}
                    </p>
                    <p className={`text-[10px] font-mono mt-0.5 ${selectedTract?.tractId === tract.tractId ? "text-mr-gray-200" : "text-mr-gray-400"}`}>
                      {tract.tractId}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          ))}
      </div>

      <p className="text-[9px] text-mr-gray-400 uppercase tracking-wider">
        Source: US Treasury CDFI Fund &middot; 2010 Census TIGER/Line
      </p>
    </div>
  );
}
