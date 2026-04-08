"use client";

import { useState, useMemo } from "react";
import { DENVER_OZ_TRACTS, type OZTract } from "../data/denver-oz-tracts";

interface PropertyListProps {
  onSelectTract: (tract: OZTract) => void;
  expanded?: boolean;
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

function generateListings(): PropertyEntry[] {
  const types = ["Commercial", "Residential", "Mixed-Use", "Land", "Industrial"];
  const statuses = ["For Sale", "For Sale", "For Sale", "Pending", "Off Market"];
  const streets: Record<string, string[]> = {
    "Sun Valley / Decatur-Federal": ["Decatur St", "Federal Blvd", "W Holden Pl", "W 10th Ave"],
    "La Alma / Lincoln Park": ["Mariposa St", "Santa Fe Dr", "W 11th Ave", "Osage St"],
    "Barnum": ["W 1st Ave", "Knox Ct", "Hooker St", "W Alameda Ave"],
    "Westwood": ["W Alameda Ave", "Morrison Rd", "S Perry St", "S Knox Ct"],
    "Ruby Hill / Overland": ["S Platte River Dr", "S Broadway", "W Evans Ave"],
    "College View / South Platte": ["S Santa Fe Dr", "S Platte River Dr"],
    "Montbello North": ["Chambers Rd", "E 51st Ave", "Peoria St"],
    "Montbello South": ["Peoria St", "E 40th Ave", "Chambers Rd"],
    "Green Valley Ranch": ["Tower Rd", "E 45th Ave", "Himalaya St"],
    "River North (RiNo) Art District": ["Brighton Blvd", "Walnut St", "Blake St"],
    "Edgewater": ["Sheridan Blvd", "W 25th Ave", "Depew St"],
    "Wheat Ridge": ["W 38th Ave", "Kipling St", "Wadsworth Blvd"],
  };

  const listings: PropertyEntry[] = [];
  let id = 1;

  for (const tract of DENVER_OZ_TRACTS) {
    const tractStreets = streets[tract.name] || [`Main St`];
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const street = tractStreets[i % tractStreets.length];
      const num = 1000 + Math.floor(Math.random() * 9000);
      const typeIdx = Math.floor(Math.random() * types.length);
      const isLand = types[typeIdx] === "Land";
      listings.push({
        id: `p-${id++}`, address: `${num} ${street}`, zone: tract.name, county: tract.county,
        tractId: tract.tractId, type: types[typeIdx], status: statuses[Math.floor(Math.random() * statuses.length)],
        price: isLand ? 100000 + Math.floor(Math.random() * 500000) : 200000 + Math.floor(Math.random() * 800000),
        sqft: isLand ? null : 800 + Math.floor(Math.random() * 4000), tract,
      });
    }
  }
  return listings;
}

const ALL_LISTINGS = generateListings();

export default function PropertyList({ onSelectTract, expanded }: PropertyListProps) {
  const [search, setSearch] = useState("");
  const [countyFilter, setCountyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "zone">("zone");

  const counties = [...new Set(ALL_LISTINGS.map((l) => l.county))].sort();
  const types = [...new Set(ALL_LISTINGS.map((l) => l.type))].sort();

  const filtered = useMemo(() => {
    let r = ALL_LISTINGS;
    if (search) { const q = search.toLowerCase(); r = r.filter(p => p.address.toLowerCase().includes(q) || p.zone.toLowerCase().includes(q) || p.tractId.includes(q) || p.county.toLowerCase().includes(q)); }
    if (countyFilter !== "all") r = r.filter(p => p.county === countyFilter);
    if (typeFilter !== "all") r = r.filter(p => p.type === typeFilter);
    if (statusFilter !== "all") r = r.filter(p => p.status === statusFilter);
    return [...r].sort((a, b) => sortBy === "price-asc" ? (a.price||0)-(b.price||0) : sortBy === "price-desc" ? (b.price||0)-(a.price||0) : a.zone.localeCompare(b.zone));
  }, [search, countyFilter, typeFilter, statusFilter, sortBy]);

  const statusBadge = (s: string) => s === "For Sale" ? "bg-emerald-600 text-white" : s === "Pending" ? "bg-amber-500 text-white" : "bg-mr-gray-200 text-mr-gray-600";

  return (
    <div className="space-y-4">
      {/* Header */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-bold text-navy">Property Database</h2>
          <span className="text-[10px] text-mr-gray-400 font-semibold uppercase tracking-wider">{filtered.length} results</span>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="rounded border border-mr-gray-200 overflow-hidden">
        <div className="p-3 bg-mr-gray-100 border-b border-mr-gray-200">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search address, zone, tract, county..."
            className="w-full px-3 py-2 border border-mr-gray-200 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy placeholder:text-mr-gray-400" />
        </div>
        <div className="px-3 py-2 flex gap-2 flex-wrap bg-white">
          <select value={countyFilter} onChange={(e) => setCountyFilter(e.target.value)} className="px-2 py-1 border border-mr-gray-200 rounded text-[11px] text-mr-gray-600 bg-white">
            <option value="all">All Counties</option>
            {counties.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-2 py-1 border border-mr-gray-200 rounded text-[11px] text-mr-gray-600 bg-white">
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-1 border border-mr-gray-200 rounded text-[11px] text-mr-gray-600 bg-white">
            <option value="all">All Status</option>
            <option value="For Sale">For Sale</option>
            <option value="Pending">Pending</option>
            <option value="Off Market">Off Market</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="px-2 py-1 border border-mr-gray-200 rounded text-[11px] text-mr-gray-600 bg-white">
            <option value="zone">Sort: Zone</option>
            <option value="price-asc">Price: Low-High</option>
            <option value="price-desc">Price: High-Low</option>
          </select>
        </div>
      </section>

      {/* Results */}
      <section>
        <div className={`space-y-1.5 max-h-[calc(100vh-380px)] overflow-y-auto ${expanded ? "grid grid-cols-2 gap-2 space-y-0" : ""}`}>
          {filtered.length === 0 && <div className="text-center py-8 col-span-2"><p className="text-sm text-mr-gray-400">No matching properties.</p></div>}
          {filtered.map((prop) => (
            <button key={prop.id} onClick={() => onSelectTract(prop.tract)}
              className="w-full text-left p-3 rounded border border-mr-gray-200 hover:border-navy hover:shadow-sm transition-all bg-white group">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy truncate group-hover:text-mr-blue">{prop.address}</p>
                  <p className="text-[11px] text-mr-gray-400 mt-0.5">{prop.zone}</p>
                </div>
                <div className="text-right shrink-0">
                  {prop.price && <p className="text-sm font-bold text-navy">${prop.price.toLocaleString()}</p>}
                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded mt-1 ${statusBadge(prop.status)}`}>
                    {prop.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-mr-gray-400">
                <span className="font-semibold text-mr-gray-600">{prop.type}</span>
                {prop.sqft && <span>{prop.sqft.toLocaleString()} sqft</span>}
                <span>{prop.county} Co.</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <p className="text-[9px] text-mr-gray-400 uppercase tracking-wider">Sample data. Connect APIs for live listings.</p>
    </div>
  );
}
