// Official Federal Opportunity Zone Census Tracts - Denver Metro Area
// Source: US Treasury CDFI Fund via ArcGIS (services2.arcgis.com)
// Boundaries: 2010 Census TIGER/Line polygons (official OZ designation vintage)
// 33 total designated tracts across Denver, Adams, Arapahoe, and Jefferson counties

import officialBoundaries from "./official-oz-boundaries.json";

export interface OZTract {
  tractId: string;
  name: string;
  county: string;
  designation: string;
  geometry: GeoJSON.Geometry;
}

// Human-readable names for each tract
const TRACT_NAMES: Record<string, string> = {
  // Denver County (10 tracts)
  "08031000702": "Sun Valley / Decatur-Federal",
  "08031000800": "La Alma / Lincoln Park",
  "08031003500": "Barnum",
  "08031003602": "Westwood",
  "08031004101": "Ruby Hill / Overland",
  "08031004102": "College View / South Platte",
  "08031004403": "Montbello North",
  "08031004404": "Montbello South",
  "08031004505": "Green Valley Ranch",
  "08031008312": "River North (RiNo) Art District",
  // Adams County (9 tracts)
  "08001008100": "Commerce City - Monaco",
  "08001008353": "Commerce City - Derby",
  "08001008606": "Federal Heights",
  "08001008901": "Thornton South",
  "08001009202": "Brighton / Lochbuie",
  "08001009321": "Bennett",
  "08001009604": "Strasburg",
  "08001009606": "Watkins",
  "08001015000": "Commerce City - DIA Area",
  // Jefferson County (5 tracts)
  "08059009831": "Edgewater",
  "08059010100": "Wheat Ridge",
  "08059010402": "Lakewood North",
  "08059010902": "Lakewood South",
  "08059011550": "Sheridan / Fort Logan",
  // Arapahoe County (9 tracts)
  "08005005551": "Aurora - East Colfax",
  "08005005552": "Aurora - Fletcher",
  "08005005700": "Aurora - Hoffman Heights",
  "08005005951": "Aurora - Fitzsimons",
  "08005006000": "Aurora Central",
  "08005006200": "Aurora - Chambers Heights",
  "08005007301": "Centennial / Greenwood Village",
  "08005007302": "Arapahoe Road Corridor",
  "08005081100": "Aurora - Southlands",
};

// Build tract list from official GeoJSON
export const DENVER_OZ_TRACTS: OZTract[] = (
  officialBoundaries as GeoJSON.FeatureCollection
).features.map((feature) => {
  const tractId = feature.properties?.CENSUSTRAC as string;
  const county = feature.properties?.COUNTYNAME as string;
  return {
    tractId,
    name: TRACT_NAMES[tractId] || `${county} - ${tractId}`,
    county,
    designation: "Qualified Opportunity Zone",
    geometry: feature.geometry,
  };
});

// Check if a point [lat, lng] falls within any OZ tract
export function isPointInOZ(lat: number, lng: number): OZTract | null {
  for (const tract of DENVER_OZ_TRACTS) {
    if (isPointInGeometry(lat, lng, tract.geometry)) {
      return tract;
    }
  }
  return null;
}

function isPointInGeometry(lat: number, lng: number, geometry: GeoJSON.Geometry): boolean {
  if (geometry.type === "Polygon") {
    return isPointInPolygonRings(lat, lng, geometry.coordinates as number[][][]);
  }
  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as number[][][][]).some((poly) =>
      isPointInPolygonRings(lat, lng, poly)
    );
  }
  return false;
}

function isPointInPolygonRings(lat: number, lng: number, rings: number[][][]): boolean {
  // Check outer ring (first ring), point must be inside
  if (!raycast(lng, lat, rings[0])) return false;
  // Check holes (subsequent rings), point must NOT be inside any hole
  for (let i = 1; i < rings.length; i++) {
    if (raycast(lng, lat, rings[i])) return false;
  }
  return true;
}

// Ray-casting algorithm - GeoJSON coordinates are [lng, lat]
function raycast(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
