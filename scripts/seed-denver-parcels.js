#!/usr/bin/env node
/**
 * Seed Denver property data from official City of Denver parcel CSV
 * Source: data.denvergov.org (Denver Open Data - ArcGIS Hub)
 *
 * Converts Colorado State Plane coordinates (NAD83, EPSG:2232, US feet)
 * to WGS84 lat/lng, then checks OZ status for each parcel.
 *
 * Usage: node scripts/seed-denver-parcels.js
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const { PrismaClient } = require("@prisma/client");
const proj4 = require("proj4");

const prisma = new PrismaClient();

// Colorado State Plane Central (EPSG:2232) - US Survey Feet
proj4.defs("EPSG:2232",
  "+proj=lcc +lat_1=39.75 +lat_2=38.45 +lat_0=37.83333333333334 +lon_0=-105.5 +x_0=914401.8288036576 +y_0=304800.6096012192 +datum=NAD83 +units=us-ft +no_defs"
);

const STATE_PLANE = "EPSG:2232";
const WGS84 = "EPSG:4326";

function convertToLatLng(xFeet, yFeet) {
  try {
    const [lng, lat] = proj4(STATE_PLANE, WGS84, [xFeet, yFeet]);
    // Sanity check: Denver area should be roughly lat 39.5-40.0, lng -105.2 to -104.6
    if (lat < 39.0 || lat > 40.5 || lng < -106.0 || lng > -104.0) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

function classifyPropertyType(propClass, dClassCn, zoneId) {
  const desc = (dClassCn || "").toLowerCase();
  const zone = (zoneId || "").toUpperCase();

  if (desc.includes("sfr") || desc.includes("single family") || desc.includes("residential")) return "Residential";
  if (desc.includes("rowhouse") || desc.includes("duplex") || desc.includes("triplex") || desc.includes("apartment") || desc.includes("condo")) return "Residential";
  if (desc.includes("commercial") || desc.includes("retail") || desc.includes("office")) return "Commercial";
  if (desc.includes("industrial") || desc.includes("warehouse")) return "Industrial";
  if (desc.includes("mixed") || zone.startsWith("C-MU") || zone.startsWith("R-MU")) return "Mixed-Use";
  if (desc.includes("vacant") || desc.includes("land")) return "Land";

  // Fallback to zone prefix
  if (zone.startsWith("R-") || zone.startsWith("S-")) return "Residential";
  if (zone.startsWith("C-") || zone.startsWith("B-")) return "Commercial";
  if (zone.startsWith("I-")) return "Industrial";

  return "Other";
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function parseNum(val) {
  if (!val || val === "" || val === "0") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function parseInt2(val) {
  if (!val || val === "") return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

async function main() {
  const csvPath = path.join(__dirname, "..", "data", "denver_parcels.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("ERROR: denver_parcels.csv not found at", csvPath);
    console.error("Run the download script first or place the CSV in data/");
    process.exit(1);
  }

  console.log("Starting Denver parcel import...");
  console.log("CSV:", csvPath);

  // Count existing
  const existing = await prisma.property.count({ where: { dataSource: "denver-assessor" } });
  console.log("Existing Denver assessor records:", existing);

  let processed = 0;
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const BATCH_SIZE = 500;
  let batch = [];

  const parser = fs.createReadStream(csvPath).pipe(
    parse({ columns: true, skip_empty_lines: true, relax_column_count: true })
  );

  for await (const row of parser) {
    processed++;

    // Need valid coordinates
    const x = parseNum(row.SITUS_X_COORD);
    const y = parseNum(row.SITUS_Y_COORD);
    if (!x || !y) { skipped++; continue; }

    const coords = convertToLatLng(x, y);
    if (!coords) { skipped++; continue; }

    // Need an address
    const address = row.SITUS_ADDRESS_LINE1;
    if (!address || address.trim() === "") { skipped++; continue; }

    const schedNum = row.SCHEDNUM || null;
    const yearBuilt = parseInt2(row.RES_ORIG_YEAR_BUILT) || parseInt2(row.COM_ORIG_YEAR_BUILT);

    const record = {
      schedNum,
      parcelNum: row.PARCELNUM || null,
      mapNum: row.MAPNUM || null,
      address: address.trim(),
      city: "Denver",
      state: "CO",
      zipCode: row.SITUS_ZIP || null,
      latitude: Math.round(coords.lat * 1000000) / 1000000,
      longitude: Math.round(coords.lng * 1000000) / 1000000,
      county: "Denver",

      // Zoning
      zoneId: row.ZONE_ID || row.ZONE_10 || null,
      propertyClass: row.PROP_CLASS || null,
      propertyType: classifyPropertyType(row.PROP_CLASS, row.D_CLASS_CN, row.ZONE_ID || row.ZONE_10),
      propertyDesc: row.D_CLASS_CN || null,

      // Building
      yearBuilt,
      sqft: parseInt2(row.RES_ABOVE_GRADE_AREA),
      comGrossArea: parseInt2(row.COM_GROSS_AREA),
      comNetArea: parseInt2(row.COM_NET_AREA),
      comStructType: row.COM_STRUCTURE_TYPE || null,
      totalUnits: parseInt2(row.TOT_UNITS),
      lotSize: parseNum(row.LAND_AREA),

      // Valuation
      appraisedLand: parseNum(row.APPRAISED_LAND_VALUE),
      appraisedImprove: parseNum(row.APPRAISED_IMP_VALUE),
      appraisedTotal: parseNum(row.APPRAISED_TOTAL_VALUE),
      assessedLand: parseNum(row.ASSESSED_LAND_VALUE_LOCAL),
      assessedBldg: parseNum(row.ASSESSED_BLDG_VALUE_LOCAL),
      assessedTotal: parseNum(row.ASSESSED_TOTAL_VALUE_LOCAL),
      assessedValue: parseNum(row.ASSESSED_TOTAL_VALUE_LOCAL),
      marketValue: parseNum(row.APPRAISED_TOTAL_VALUE),
      exemptAmt: parseNum(row.EXEMPT_AMT_LOCAL),
      taxableAmt: parseNum(row.TAXABLE_AMT_LOCAL),

      // Sale
      lastSalePrice: parseNum(row.SALE_PRICE),
      lastSaleDate: parseDate(row.SALE_DATE),
      lastSaleYear: parseInt2(row.SALE_YEAR),
      saleInstrument: row.ASAL_INSTR || null,

      // Owner
      ownerName: row.OWNER_NAME || null,
      ownerAddress: row.OWNER_ADDRESS_LINE1 || null,
      ownerCity: row.OWNER_CITY || null,
      ownerState: row.OWNER_STATE || null,
      ownerZip: row.OWNER_ZIP || null,

      // OZ (will be set below)
      inOpportunityZone: false,
      dataSource: "denver-assessor",
    };

    batch.push(record);

    if (batch.length >= BATCH_SIZE) {
      try {
        await insertBatch(batch);
        imported += batch.length;
      } catch (e) {
        errors += batch.length;
        console.error("Batch error at row", processed, ":", e.message?.slice(0, 100));
      }
      batch = [];

      if (processed % 10000 === 0) {
        console.log(`Progress: ${processed.toLocaleString()} processed, ${imported.toLocaleString()} imported, ${skipped.toLocaleString()} skipped`);
      }
    }
  }

  // Final batch
  if (batch.length > 0) {
    try {
      await insertBatch(batch);
      imported += batch.length;
    } catch (e) {
      errors += batch.length;
      console.error("Final batch error:", e.message?.slice(0, 100));
    }
  }

  console.log("\n--- Import Complete ---");
  console.log(`Total processed: ${processed.toLocaleString()}`);
  console.log(`Imported: ${imported.toLocaleString()}`);
  console.log(`Skipped: ${skipped.toLocaleString()}`);
  console.log(`Errors: ${errors.toLocaleString()}`);

  // Now tag OZ properties
  console.log("\nTagging Opportunity Zone properties...");
  await tagOZProperties();

  await prisma.$disconnect();
}

async function insertBatch(records) {
  // Use createMany for speed, skip duplicates by schedNum
  await prisma.property.createMany({
    data: records,
    skipDuplicates: true,
  });
}

async function tagOZProperties() {
  // Load OZ boundary data
  const ozPath = path.join(__dirname, "..", "app", "data", "official-oz-boundaries.json");
  const ozData = JSON.parse(fs.readFileSync(ozPath, "utf-8"));

  const TRACT_NAMES = {
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
  };

  // Get bounding boxes for each Denver OZ tract for fast pre-filtering
  const denverTracts = ozData.features.filter(
    (f) => f.properties.COUNTYNAME === "Denver"
  );

  let totalTagged = 0;

  for (const feature of denverTracts) {
    const tractId = feature.properties.CENSUSTRAC;
    const tractName = TRACT_NAMES[tractId] || `Denver - ${tractId}`;
    const coords = feature.geometry.coordinates[0]; // outer ring

    // Get bounding box
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    // Find properties in bounding box
    const candidates = await prisma.property.findMany({
      where: {
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLng, lte: maxLng },
        county: "Denver",
      },
      select: { id: true, latitude: true, longitude: true },
    });

    // Point-in-polygon check
    const inZone = candidates.filter((p) =>
      pointInPolygon(p.longitude, p.latitude, coords)
    );

    if (inZone.length > 0) {
      await prisma.property.updateMany({
        where: { id: { in: inZone.map((p) => p.id) } },
        data: {
          inOpportunityZone: true,
          censusTract: tractId,
          ozName: tractName,
          ozDesignation: "Qualified Opportunity Zone",
        },
      });
      totalTagged += inZone.length;
      console.log(`  ${tractName}: ${inZone.length} properties tagged (of ${candidates.length} candidates)`);
    }
  }

  console.log(`Total OZ-tagged properties: ${totalTagged.toLocaleString()}`);
}

function pointInPolygon(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
