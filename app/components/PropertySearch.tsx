"use client";

import { useState } from "react";
import { isPointInOZ, type OZTract } from "../data/denver-oz-tracts";

interface SearchResult {
  address: string;
  lat: number;
  lng: number;
  inOZ: boolean;
  tract: OZTract | null;
}

interface PropertySearchProps {
  onResult: (result: SearchResult) => void;
}

export default function PropertySearch({ onResult }: PropertySearchProps) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<SearchResult | null>(null);

  const searchAddress = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError("");

    try {
      const query = address.includes("Denver") || address.includes("CO")
        ? address
        : `${address}, Denver, CO`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
        { headers: { "User-Agent": "DenverOZFinder/1.0" } }
      );
      const data = await response.json();

      if (!data || data.length === 0) {
        setError("Address not found. Try a more specific address in the Denver metro area.");
        return;
      }

      const { lat, lon, display_name } = data[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      const tract = isPointInOZ(latitude, longitude);

      const result: SearchResult = { address: display_name, lat: latitude, lng: longitude, inOZ: tract !== null, tract };
      setLastResult(result);
      onResult(result);
    } catch {
      setError("Failed to geocode address. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-navy mb-1">Address Lookup</h2>
      <p className="text-xs text-mr-gray-400 mb-4">
        Enter a property address to determine Opportunity Zone eligibility.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchAddress()}
          placeholder="e.g. 2000 W Holden Pl, Denver, CO"
          className="flex-1 px-3 py-2.5 border border-mr-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent placeholder:text-mr-gray-400"
        />
        <button
          onClick={searchAddress}
          disabled={loading || !address.trim()}
          className="px-5 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-4">{error}</div>
      )}

      {lastResult && (
        <div className={`p-4 rounded border mb-4 ${lastResult.inOZ ? "bg-emerald-50 border-emerald-200" : "bg-mr-gray-100 border-mr-gray-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2.5 h-2.5 rounded-full ${lastResult.inOZ ? "bg-emerald-500" : "bg-mr-gray-400"}`} />
            <span className={`font-bold text-xs uppercase tracking-wider ${lastResult.inOZ ? "text-emerald-800" : "text-mr-gray-600"}`}>
              {lastResult.inOZ ? "Qualified Opportunity Zone" : "Not in Opportunity Zone"}
            </span>
          </div>
          <p className="text-sm text-mr-gray-600 mb-1">{lastResult.address}</p>
          <p className="text-[11px] text-mr-gray-400">{lastResult.lat.toFixed(6)}, {lastResult.lng.toFixed(6)}</p>
          {lastResult.tract && (
            <div className="mt-3 pt-3 border-t border-emerald-200 space-y-1">
              <p className="text-sm text-navy"><b>Zone:</b> {lastResult.tract.name}</p>
              <p className="text-sm text-navy"><b>Tract:</b> {lastResult.tract.tractId}</p>
              <p className="text-sm text-navy"><b>County:</b> {lastResult.tract.county}</p>
            </div>
          )}
        </div>
      )}

      <div className="p-3 bg-mr-gray-100 rounded border border-mr-gray-200">
        <h3 className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-wider mb-2">Quick Lookup</h3>
        <div className="flex flex-wrap gap-1.5">
          {[
            "Sun Valley, Denver, CO",
            "RiNo District, Denver, CO",
            "Barnum, Denver, CO",
            "Westwood, Denver, CO",
            "Montbello, Denver, CO",
            "Edgewater, CO",
            "Aurora, CO",
            "Wheat Ridge, CO",
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => setAddress(preset)}
              className="px-2.5 py-1 text-[11px] bg-white border border-mr-gray-200 rounded hover:bg-navy hover:text-white hover:border-navy transition-colors font-medium"
            >
              {preset.replace(", Denver, CO", "").replace(", CO", "")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
