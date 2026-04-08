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
  const [panelExpanded, setPanelExpanded] = useState(false);

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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "search", label: "Lookup", icon: "\u2315" },
    { id: "properties", label: "Properties", icon: "\u25A3" },
    { id: "calculator", label: "Tax", icon: "\u25CB" },
    { id: "zones", label: "Zones", icon: "\u25C9" },
    { id: "report", label: "Report", icon: "\u25A0" },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-navy text-white px-6 py-2.5 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-mr-accent rounded flex items-center justify-center text-white font-bold text-[10px]">OZ</div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">Denver OZ Finder</h1>
              <p className="text-[9px] text-mr-gray-400 uppercase tracking-[0.2em] mt-0.5">Opportunity Zone Intelligence Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-[10px] text-mr-gray-400">
            <span className="hidden md:inline">{DENVER_OZ_TRACTS.length} Designated Zones</span>
            <span className="hidden md:inline h-3 w-px bg-navy-light" />
            <span className="hidden md:inline">IRC &sect;1400Z-2</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative transition-all duration-300">
          <OZMap
            onTractSelect={handleTractSelect}
            selectedTract={selectedTract}
            searchMarker={searchMarker}
          />
        </div>

        {/* Expand/Collapse Handle */}
        <button
          onClick={() => setPanelExpanded(!panelExpanded)}
          className="absolute z-20 top-1/2 -translate-y-1/2 w-5 h-14 bg-navy text-white flex items-center justify-center rounded-l hover:bg-navy-light transition-colors shadow-lg"
          style={{ right: panelExpanded ? "50%" : "520px" }}
          title={panelExpanded ? "Collapse panel" : "Expand panel"}
        >
          <span className="text-xs">{panelExpanded ? "\u25B6" : "\u25C0"}</span>
        </button>

        {/* Right Panel */}
        <div
          className={`border-l border-mr-gray-200 bg-white flex flex-col overflow-hidden shadow-xl transition-all duration-300 ${
            panelExpanded ? "w-1/2" : "w-[520px]"
          }`}
        >
          {/* Tabs */}
          <div className="flex border-b border-mr-gray-200 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-center transition-all ${
                  activeTab === tab.id
                    ? "text-navy border-b-2 border-mr-accent bg-white"
                    : "text-mr-gray-400 hover:text-navy hover:bg-mr-gray-100/50"
                }`}
              >
                <span className="block text-[10px] font-bold uppercase tracking-[0.15em]">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5">
              {activeTab === "search" && <PropertySearch onResult={handleSearchResult} />}
              {activeTab === "properties" && <PropertyList onSelectTract={handleTractSelect} expanded={panelExpanded} />}
              {activeTab === "calculator" && <TaxCalculator />}
              {activeTab === "zones" && <TractList onSelect={handleTractSelect} selectedTract={selectedTract} expanded={panelExpanded} />}
              {activeTab === "report" && lastSearchResult?.tract ? (
                <PropertyReport address={lastSearchResult.address} lat={lastSearchResult.lat} lng={lastSearchResult.lng} tract={lastSearchResult.tract} expanded={panelExpanded} />
              ) : activeTab === "report" ? (
                <div className="text-center py-16">
                  <div className="w-14 h-14 bg-mr-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-mr-gray-200">
                    <span className="text-mr-gray-400 text-xl">{"\u25A0"}</span>
                  </div>
                  <p className="text-navy font-semibold text-sm mb-1">No Report Generated</p>
                  <p className="text-mr-gray-400 text-xs mb-5">Search for a property within an Opportunity Zone to generate an investment report.</p>
                  <button onClick={() => setActiveTab("search")}
                    className="px-6 py-2.5 bg-navy text-white text-[10px] font-bold uppercase tracking-[0.15em] rounded hover:bg-navy-light transition-colors">
                    Search Properties
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-mr-gray-400 px-6 py-1.5 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between text-[9px] uppercase tracking-[0.15em]">
          <span>Denver OZ Finder &middot; Opportunity Zone Analysis</span>
          <span>US Treasury CDFI Fund &middot; Census Bureau TIGER/Line</span>
        </div>
      </footer>
    </div>
  );
}
