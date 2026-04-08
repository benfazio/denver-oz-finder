"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import PropertySearch from "./components/PropertySearch";
import TaxCalculator from "./components/TaxCalculator";
import PropertyReport from "./components/PropertyReport";
import TractList from "./components/TractList";
import { DENVER_OZ_TRACTS, type OZTract } from "./data/denver-oz-tracts";

const OZMap = dynamic(() => import("./components/OZMap"), { ssr: false });

type Tab = "search" | "calculator" | "zones" | "report";

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
    // Get centroid of the tract geometry for map centering
    const geom = tract.geometry;
    let coords: number[][] = [];
    if (geom.type === "Polygon") {
      coords = (geom.coordinates as number[][][])[0];
    } else if (geom.type === "MultiPolygon") {
      coords = (geom.coordinates as number[][][][])[0][0];
    }
    if (coords.length > 0) {
      const avgLng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
      const avgLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
      setSearchMarker({ lat: avgLat, lng: avgLng, label: tract.name });
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "search", label: "Search" },
    { id: "calculator", label: "Tax Calculator" },
    { id: "zones", label: "OZ Directory" },
    { id: "report", label: "Report" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Denver OZ Finder</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Federal Opportunity Zone Property Identification &middot; {DENVER_OZ_TRACTS.length} designated zones
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Denver Metro Area</p>
            <p className="text-xs text-gray-400">Denver, Adams, Arapahoe, Jefferson Counties</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 p-3">
          <OZMap
            onTractSelect={handleTractSelect}
            selectedTract={selectedTract}
            searchMarker={searchMarker}
          />
        </div>

        {/* Right Panel */}
        <div className="w-[480px] border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "search" && <PropertySearch onResult={handleSearchResult} />}
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
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm mb-3">
                  Search for a property in an Opportunity Zone to generate a report.
                </p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search Properties
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-[11px] text-gray-400">
          <span>Denver OZ Finder &middot; Official data from US Treasury CDFI Fund</span>
          <span>Map: OpenStreetMap &middot; Boundaries: 2010 Census TIGER/Line</span>
        </div>
      </footer>
    </div>
  );
}
