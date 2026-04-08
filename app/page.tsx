"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import PropertySearch from "./components/PropertySearch";
import TaxCalculator from "./components/TaxCalculator";
import PropertyReport from "./components/PropertyReport";
import TractList from "./components/TractList";
import PropertyList from "./components/PropertyList";
import { DENVER_OZ_TRACTS, type OZTract } from "./data/denver-oz-tracts";

const OZMap = dynamic(() => import("./components/OZMap"), { ssr: false });

type Tab = "search" | "properties" | "calculator" | "zones" | "report";

interface SearchResult {
  address: string;
  lat: number;
  lng: number;
  inOZ: boolean;
  tract: OZTract | null;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [selectedTract, setSelectedTract] = useState<OZTract | null>(null);
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [lastSearchResult, setLastSearchResult] = useState<SearchResult | null>(null);

  const handleSearchResult = (result: SearchResult) => {
    setSearchMarker({ lat: result.lat, lng: result.lng, label: result.address });
    setSelectedTract(result.tract);
    setLastSearchResult(result);
    if (result.tract) setActiveTab("report");
  };

  const handleTractSelect = (tract: OZTract) => {
    setSelectedTract(tract);
    const geom = tract.geometry;
    let coords: number[][] = [];
    if (geom.type === "Polygon") coords = (geom.coordinates as number[][][])[0];
    else if (geom.type === "MultiPolygon") coords = (geom.coordinates as number[][][][])[0][0];
    if (coords.length > 0) {
      const avgLng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
      const avgLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
      setSearchMarker({ lat: avgLat, lng: avgLng, label: tract.name });
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "search", label: "Address Lookup" },
    { id: "properties", label: "Properties" },
    { id: "calculator", label: "Tax Analysis" },
    { id: "zones", label: "Zone Directory" },
    { id: "report", label: "Report" },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-navy text-white px-6 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-mr-accent rounded flex items-center justify-center text-white font-bold text-sm">OZ</div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-tight">Denver OZ Finder</h1>
                <p className="text-[10px] text-mr-gray-400 uppercase tracking-widest">Opportunity Zone Intelligence</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-mr-gray-200">{DENVER_OZ_TRACTS.length} Designated Zones</p>
              <p className="text-[10px] text-mr-gray-400">Denver &middot; Adams &middot; Arapahoe &middot; Jefferson</p>
            </div>
            <div className="h-6 w-px bg-navy-light hidden sm:block" />
            <p className="text-[10px] text-mr-gray-400 hidden sm:block">IRC &sect;1400Z-2</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <OZMap
            onTractSelect={handleTractSelect}
            selectedTract={selectedTract}
            searchMarker={searchMarker}
          />
        </div>

        {/* Right Panel */}
        <div className="w-[520px] border-l border-mr-gray-200 bg-white flex flex-col overflow-hidden shadow-lg">
          {/* Tabs */}
          <div className="flex border-b border-mr-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-3 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? "text-navy border-b-2 border-mr-accent bg-white"
                    : "text-mr-gray-400 hover:text-navy hover:bg-mr-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "search" && <PropertySearch onResult={handleSearchResult} />}
            {activeTab === "properties" && <PropertyList onSelectTract={handleTractSelect} />}
            {activeTab === "calculator" && <TaxCalculator />}
            {activeTab === "zones" && <TractList onSelect={handleTractSelect} selectedTract={selectedTract} />}
            {activeTab === "report" && lastSearchResult?.tract ? (
              <PropertyReport
                address={lastSearchResult.address}
                lat={lastSearchResult.lat}
                lng={lastSearchResult.lng}
                tract={lastSearchResult.tract}
              />
            ) : activeTab === "report" ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 bg-mr-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-mr-gray-400 text-lg">?</span>
                </div>
                <p className="text-mr-gray-600 text-sm mb-1 font-medium">No Report Generated</p>
                <p className="text-mr-gray-400 text-xs mb-4">Search for a property within an Opportunity Zone</p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="px-5 py-2 bg-navy text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-navy-light transition-colors"
                >
                  Search Properties
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-mr-gray-400 px-6 py-2">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between text-[10px] uppercase tracking-wider">
          <span>Denver OZ Finder &middot; Federal Opportunity Zone Analysis Platform</span>
          <span>Data: US Treasury CDFI Fund &middot; Census Bureau TIGER/Line</span>
        </div>
      </footer>
    </div>
  );
}
