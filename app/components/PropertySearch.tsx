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
      // Use Nominatim (free OpenStreetMap geocoding)
      const query = address.includes("Denver") || address.includes("CO")
        ? address
        : `${address}, Denver, CO`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
        {
          headers: {
            "User-Agent": "DenverOZFinder/1.0",
          },
        }
      );

      const data = await response.json();

      if (!data || data.length === 0) {
        setError("Address not found. Try a more specific address in the Denver area.");
        return;
      }

      const { lat, lon, display_name } = data[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      const tract = isPointInOZ(latitude, longitude);

      const result: SearchResult = {
        address: display_name,
        lat: latitude,
        lng: longitude,
        inOZ: tract !== null,
        tract,
      };

      setLastResult(result);
      onResult(result);
    } catch {
      setError("Failed to geocode address. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Property Search</h2>
      <p className="text-sm text-gray-500 mb-4">
        Enter a property address in the Denver metro area to check if it falls within a Federal Opportunity Zone.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchAddress()}
          placeholder="e.g. 3800 N Steele St, Denver, CO"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={searchAddress}
          disabled={loading || !address.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {lastResult && (
        <div className={`p-4 rounded-md border ${lastResult.inOZ ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-2xl`}>{lastResult.inOZ ? "\u2705" : "\u274C"}</span>
            <span className={`font-semibold ${lastResult.inOZ ? "text-green-800" : "text-yellow-800"}`}>
              {lastResult.inOZ ? "IN OPPORTUNITY ZONE" : "NOT IN OPPORTUNITY ZONE"}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{lastResult.address}</p>
          <p className="text-xs text-gray-400">
            Coordinates: {lastResult.lat.toFixed(6)}, {lastResult.lng.toFixed(6)}
          </p>
          {lastResult.tract && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-sm text-green-800"><strong>Zone:</strong> {lastResult.tract.name}</p>
              <p className="text-sm text-green-800"><strong>Tract ID:</strong> {lastResult.tract.tractId}</p>
              <p className="text-sm text-green-800"><strong>County:</strong> {lastResult.tract.county}</p>
              <p className="text-sm text-green-800"><strong>Designation:</strong> {lastResult.tract.designation}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Quick Search</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Sun Valley, Denver, CO",
            "RiNo District, Denver, CO",
            "Globeville, Denver, CO",
            "Five Points, Denver, CO",
            "Westwood, Denver, CO",
            "Montbello, Denver, CO",
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setAddress(preset);
              }}
              className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {preset.replace(", Denver, CO", "")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
