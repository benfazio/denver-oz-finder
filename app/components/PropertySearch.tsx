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

// Verified addresses that fall inside actual OZ census tracts
const QUICK_LOOKUPS = [
  { label: "Sun Valley", address: "1000 Decatur St, Denver, CO 80204" },
  { label: "La Alma", address: "900 Santa Fe Dr, Denver, CO 80204" },
  { label: "Barnum", address: "300 Knox Ct, Denver, CO 80219" },
  { label: "Westwood", address: "3600 W Alameda Ave, Denver, CO 80219" },
  { label: "RiNo", address: "3500 Brighton Blvd, Denver, CO 80216" },
  { label: "Montbello", address: "4700 Peoria St, Denver, CO 80239" },
  { label: "Edgewater", address: "2500 Sheridan Blvd, Edgewater, CO 80214" },
  { label: "Wheat Ridge", address: "4400 Kipling St, Wheat Ridge, CO 80033" },
];

export default function PropertySearch({ onResult }: PropertySearchProps) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<SearchResult | null>(null);

  const searchAddress = async (searchAddr?: string) => {
    const addr = searchAddr || address;
    if (!addr.trim()) return;
    setAddress(addr);
    setLoading(true);
    setError("");

    try {
      const query = addr.includes("CO") ? addr : `${addr}, Denver, CO`;
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
      setError("Geocoding failed. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Section: Search */}
      <section>
        <h2 className="text-base font-bold text-navy mb-0.5">Address Lookup</h2>
        <p className="text-[11px] text-mr-gray-400 mb-3">Verify Opportunity Zone eligibility for any Denver metro address.</p>

        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchAddress()}
            placeholder="Enter property address..."
            className="flex-1 px-3 py-2.5 border border-mr-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent placeholder:text-mr-gray-400"
          />
          <button
            onClick={() => searchAddress()}
            disabled={loading || !address.trim()}
            className="px-5 py-2.5 bg-navy text-white text-[10px] font-bold uppercase tracking-[0.15em] rounded hover:bg-navy-light disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </section>

      {/* Section: Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}

      {/* Section: Result */}
      {lastResult && (
        <section className={`rounded border overflow-hidden ${lastResult.inOZ ? "border-emerald-300" : "border-mr-gray-200"}`}>
          {/* Status Bar */}
          <div className={`px-4 py-2.5 flex items-center gap-2 ${lastResult.inOZ ? "bg-emerald-600 text-white" : "bg-mr-gray-100 text-mr-gray-600"}`}>
            <span className={`w-2 h-2 rounded-full ${lastResult.inOZ ? "bg-white" : "bg-mr-gray-400"}`} />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em]">
              {lastResult.inOZ ? "Qualified Opportunity Zone" : "Not in Opportunity Zone"}
            </span>
          </div>

          {/* Details */}
          <div className="p-4 bg-white space-y-3">
            <div>
              <p className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-wider mb-1">Address</p>
              <p className="text-sm text-navy">{lastResult.address}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-wider mb-1">Latitude</p>
                <p className="text-sm text-navy font-mono">{lastResult.lat.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-wider mb-1">Longitude</p>
                <p className="text-sm text-navy font-mono">{lastResult.lng.toFixed(6)}</p>
              </div>
            </div>

            {lastResult.tract && (
              <>
                <div className="h-px bg-mr-gray-200" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-wider mb-1">Zone Name</p>
                    <p className="text-sm text-navy font-semibold">{lastResult.tract.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-wider mb-1">Census Tract</p>
                    <p className="text-sm text-navy font-mono">{lastResult.tract.tractId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-wider mb-1">County</p>
                    <p className="text-sm text-navy">{lastResult.tract.county}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-wider mb-1">Designation</p>
                    <p className="text-sm text-navy">QOZ</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Section: Quick Lookup */}
      <section className="rounded border border-mr-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-mr-gray-100 border-b border-mr-gray-200">
          <h3 className="text-[10px] font-bold text-mr-gray-400 uppercase tracking-[0.15em]">Quick Lookup &mdash; Verified OZ Addresses</h3>
        </div>
        <div className="p-3 flex flex-wrap gap-1.5">
          {QUICK_LOOKUPS.map((item) => (
            <button
              key={item.label}
              onClick={() => searchAddress(item.address)}
              className="px-3 py-1.5 text-[11px] font-semibold bg-white border border-mr-gray-200 rounded hover:bg-navy hover:text-white hover:border-navy transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
