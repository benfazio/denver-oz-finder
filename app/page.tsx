"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import PropertySearch from "./components/PropertySearch";
import TaxCalculator from "./components/TaxCalculator";
import PropertyReport from "./components/PropertyReport";
import TractList from "./components/TractList";
import { type OZTract } from "./data/denver-oz-tracts";

// Leaflet must be loaded client-side only (no SSR)
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
    if (result.tract) {
      // Auto-switch to report tab if property is in OZ
      setActiveTab("report");
    }
  };

  const handleTractSelect = (tract: OZTract) => {
    setSelectedTract(tract);
    // Center map on selected tract
    const centerLat = tract.coordinates.reduce((sum, c) => sum + c[0], 0) / tract.coordinates.length;
    const centerLng = tract.coordinates.reduce((sum, c) => sum + c[1], 0) / tract.coordinates.length;
    setSearchMarker({ lat: centerLat, lng: centerLng, label: tract.name });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "search", label: "Property Search" },
    { id: "calculator", label: "Tax Calculator" },
    { id: "zones", label: "OZ Directory" },
    { id: "report", label: "Report" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Denver OZ Finder</h1>
          <p className="text-sm text-gray-500 mt-1">
            Identify properties in Federal Opportunity Zones across the Denver, Colorado metro area
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Map */}
        <div className="flex-1 p-4">
          <OZMap
            onTractSelect={handleTractSelect}
            selectedTract={selectedTract}
            searchMarker={searchMarker}
          />
        </div>

        {/* Right Panel - Tools */}
        <div className="w-[520px] border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "search" && (
              <PropertySearch onResult={handleSearchResult} />
            )}
            {activeTab === "calculator" && (
              <TaxCalculator />
            )}
            {activeTab === "zones" && (
              <TractList
                onSelect={handleTractSelect}
                selectedTract={selectedTract}
              />
            )}
            {activeTab === "report" && lastSearchResult?.tract ? (
              <PropertyReport
                address={lastSearchResult.address}
                lat={lastSearchResult.lat}
                lng={lastSearchResult.lng}
                tract={lastSearchResult.tract}
              />
            ) : activeTab === "report" ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500 text-sm">
                  Search for a property in an Opportunity Zone to generate a report.
                </p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Search Properties
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>Denver OZ Finder - Federal Opportunity Zone Property Identification Tool</span>
          <span>Data sources: US Treasury CDFI Fund, Census Bureau, OpenStreetMap</span>
        </div>
      </footer>
    </div>
  );
}
