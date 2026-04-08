"use client";

import { useState, useMemo } from "react";
import { DENVER_OZ_TRACTS, type OZTract } from "../data/denver-oz-tracts";

interface PropertyListProps {
  onSelectTract: (tract: OZTract) => void;
}

interface PropertyEntry {
  id: string;
  address: string;
  zone: string;
  county: string;
  tractId: string;
  type: string;
  status: string;
  price: number | null;
  sqft: number | null;
  tract: OZTract;
}

// Generate sample property listings from OZ tracts for demonstration
function generateListings(): PropertyEntry[] {
  const types = ["Commercial", "Residential", "Mixed-Use", "Land", "Industrial"];
  const statuses = ["For Sale", "For Sale", "For Sale", "Pending", "Off Market"];
  const streets: Record<string, string[]> = {
    "Sun Valley / Decatur-Federal": ["Decatur St", "Federal Blvd", "W Holden Pl", "W 10th Ave"],
    "La Alma / Lincoln Park": ["Mariposa St", "Santa Fe Dr", "W 11th Ave", "Osage St"],
    "Barnum": ["W 1st Ave", "Knox Ct", "Hooker St", "W Alameda Ave"],
    "Westwood": ["S Federal Blvd", "W Alameda Ave", "Morrison Rd", "S Perry St"],
    "Ruby Hill / Overland": ["S Platte River Dr", "S Broadway", "W Evans Ave", "S Cherokee St"],
    "College View / South Platte": ["S Santa Fe Dr", "S Platte River Dr", "W Dartmouth Ave"],
    "Montbello North": ["Chambers Rd", "E 51st Ave", "Peoria St", "E 47th Ave"],
    "Montbello South": ["Peoria St", "E 40th Ave", "Chambers Rd", "E 45th Ave"],
    "Green Valley Ranch": ["Tower Rd", "E 45th Ave", "Himalaya St", "E 48th Ave"],
    "River North (RiNo) Art District": ["Brighton Blvd", "Walnut St", "Blake St", "Larimer St"],
    "Edgewater": ["Sheridan Blvd", "W 25th Ave", "W 20th Ave", "Depew St"],
    "Wheat Ridge": ["W 38th Ave", "Kipling St", "Wadsworth Blvd", "W 44th Ave"],
    "Lakewood North": ["W Colfax Ave", "Wadsworth Blvd", "Garrison St"],
    "Lakewood South": ["W Alameda Ave", "S Wadsworth Blvd", "W Mississippi Ave"],
    "Sheridan / Fort Logan": ["S Federal Blvd", "W Hampden Ave", "S Lowell Blvd"],
  };

  const listings: PropertyEntry[] = [];
  let id = 1;

  for (const tract of DENVER_OZ_TRACTS) {
    const tractStreets = streets[tract.name] || [`${tract.name} Main St`];
    const count = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < count; i++) {
      const street = tractStreets[i % tractStreets.length];
      const num = Math.floor(Math.random() * 9000) + 1000;
      const typeIdx = Math.floor(Math.random() * types.length);
      const statusIdx = Math.floor(Math.random() * statuses.length);
      const isLand = types[typeIdx] === "Land";

      listings.push({
        id: `prop-${id++}`,
        address: `${num} ${street}`,
        zone: tract.name,
        county: tract.county,
        tractId: tract.tractId,
        type: types[typeIdx],
        status: statuses[statusIdx],
        price: isLand
          ? Math.floor(Math.random() * 500000) + 100000
          : Math.floor(Math.random() * 800000) + 200000,
        sqft: isLand ? null : Math.floor(Math.random() * 4000) + 800,
        tract,
      });
    }
  }

  return listings;
}

const ALL_LISTINGS = generateListings();

export default function PropertyList({ onSelectTract }: PropertyListProps) {
  const [search, setSearch] = useState("");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "zone">("zone");

  const counties = [...new Set(ALL_LISTINGS.map((l) => l.county))].sort();
  const types = [...new Set(ALL_LISTINGS.map((l) => l.type))].sort();

  const filtered = useMemo(() => {
    let results = ALL_LISTINGS;

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.address.toLowerCase().includes(q) ||
          p.zone.toLowerCase().includes(q) ||
          p.tractId.includes(q) ||
          p.county.toLowerCase().includes(q)
      );
    }
    if (countyFilter !== "all") results = results.filter((p) => p.county === countyFilter);
    if (typeFilter !== "all") results = results.filter((p) => p.type === typeFilter);
    if (statusFilter !== "all") results = results.filter((p) => p.status === statusFilter);

    results = [...results].sort((a, b) => {
      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      return a.zone.localeCompare(b.zone);
    });

    return results;
  }, [search, countyFilter, typeFilter, statusFilter, sortBy]);

  const statusColor = (status: string) => {
    if (status === "For Sale") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "Pending") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-mr-gray-100 text-mr-gray-600 border-mr-gray-200";
  };

  const typeColor = (type: string) => {
    if (type === "Commercial") return "text-mr-blue";
    if (type === "Residential") return "text-navy";
    if (type === "Mixed-Use") return "text-purple-700";
    if (type === "Industrial") return "text-mr-gray-600";
    return "text-amber-700";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-navy">Property Database</h2>
          <p className="text-xs text-mr-gray-400 mt-0.5">{filtered.length} of {ALL_LISTINGS.length} properties</p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search address, zone, tract ID, or county..."
        className="w-full px-3 py-2.5 border border-mr-gray-200 rounded text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent placeholder:text-mr-gray-400"
      />

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          value={countyFilter}
          onChange={(e) => setCountyFilter(e.target.value)}
          className="px-2 py-1.5 border border-mr-gray-200 rounded text-xs text-mr-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-navy"
        >
          <option value="all">All Counties</option>
          {counties.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2 py-1.5 border border-mr-gray-200 rounded text-xs text-mr-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-navy"
        >
          <option value="all">All Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 py-1.5 border border-mr-gray-200 rounded text-xs text-mr-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-navy"
        >
          <option value="all">All Statuses</option>
          <option value="For Sale">For Sale</option>
          <option value="Pending">Pending</option>
          <option value="Off Market">Off Market</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-2 py-1.5 border border-mr-gray-200 rounded text-xs text-mr-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-navy"
        >
          <option value="zone">Sort: Zone</option>
          <option value="price-asc">Sort: Price Low</option>
          <option value="price-desc">Sort: Price High</option>
        </select>
      </div>

      {/* Property List */}
      <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-mr-gray-400">No properties match your search.</p>
          </div>
        )}
        {filtered.map((prop) => (
          <button
            key={prop.id}
            onClick={() => onSelectTract(prop.tract)}
            className="w-full text-left p-3 rounded border border-mr-gray-200 hover:border-navy hover:shadow-sm transition-all bg-white group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy group-hover:text-mr-blue truncate">
                  {prop.address}
                </p>
                <p className="text-xs text-mr-gray-400 mt-0.5">{prop.zone} &middot; {prop.county} County</p>
              </div>
              <div className="text-right shrink-0">
                {prop.price && (
                  <p className="text-sm font-bold text-navy">${prop.price.toLocaleString()}</p>
                )}
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border mt-1 ${statusColor(prop.status)}`}>
                  {prop.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[11px]">
              <span className={`font-semibold ${typeColor(prop.type)}`}>{prop.type}</span>
              {prop.sqft && <span className="text-mr-gray-400">{prop.sqft.toLocaleString()} sqft</span>}
              <span className="text-mr-gray-400">Tract {prop.tractId.slice(-6)}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-mr-gray-200">
        <p className="text-[10px] text-mr-gray-400 uppercase tracking-wider">
          Sample data for demonstration. Connect live listing APIs for real-time property data.
        </p>
      </div>
    </div>
  );
}
