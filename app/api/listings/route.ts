import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { isPointInOZ } from "../../data/denver-oz-tracts";

// Denver OZ zip codes for targeted listing searches
const DENVER_OZ_ZIPS = [
  "80204", // Sun Valley, La Alma/Lincoln Park
  "80211", // Globeville, Sunnyside
  "80216", // Elyria-Swansea, RiNo
  "80205", // Five Points, Cole, Whittier
  "80219", // Westwood, Mar Lee
  "80239", // Montbello
  "80249", // Green Valley Ranch
  "80209", // Baker
  "80218", // North Capitol Hill
  "80022", // Commerce City
  "80221", // Federal Heights
  "80010", // Aurora Central
  "80011", // Aurora / Colfax
];

// GET /api/listings - Fetch current for-sale listings in OZ areas
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get("zip");
  const refresh = searchParams.get("refresh") === "true";

  // If not refreshing, return cached DB listings
  if (!refresh) {
    const where: Record<string, unknown> = {
      listingStatus: "for_sale",
      inOpportunityZone: true,
    };
    if (zip) where.zipCode = zip;

    const listings = await prisma.property.findMany({
      where,
      orderBy: { listDate: "desc" },
      take: 100,
    });

    return NextResponse.json({
      listings,
      total: listings.length,
      cached: true,
      ozZipCodes: DENVER_OZ_ZIPS,
    });
  }

  // Refresh: pull live data from Realty in US API (RapidAPI) or similar
  // For now, scrape from the free Nominatim + OpenStreetMap data
  const targetZip = zip || DENVER_OZ_ZIPS[0];

  const syncRecord = await prisma.listingSync.create({
    data: {
      source: "nominatim",
      zipCode: targetZip,
      status: "running",
    },
  });

  try {
    // Search for real estate related POIs in the zip code area
    const searchRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=real+estate+${targetZip}+Denver+CO&limit=20&addressdetails=1`,
      { headers: { "User-Agent": "DenverOZFinder/1.0" } }
    );
    const results = await searchRes.json();

    let imported = 0;
    for (const result of results) {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const tract = isPointInOZ(lat, lng);

      if (tract) {
        await prisma.property.upsert({
          where: { id: `nom-${result.place_id}` },
          update: {
            listingStatus: "for_sale",
            updatedAt: new Date(),
          },
          create: {
            id: `nom-${result.place_id}`,
            address: result.display_name,
            latitude: lat,
            longitude: lng,
            zipCode: targetZip,
            inOpportunityZone: true,
            censusTract: tract.tractId,
            ozName: tract.name,
            ozDesignation: tract.designation,
            county: tract.county,
            listingStatus: "for_sale",
            listDate: new Date(),
            listingSource: "nominatim",
            dataSource: "nominatim",
          },
        });
        imported++;
      }
    }

    await prisma.listingSync.update({
      where: { id: syncRecord.id },
      data: {
        status: "completed",
        totalFound: results.length,
        totalImported: imported,
        completedAt: new Date(),
      },
    });

    const listings = await prisma.property.findMany({
      where: {
        listingStatus: "for_sale",
        inOpportunityZone: true,
        ...(zip ? { zipCode: zip } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      listings,
      total: listings.length,
      cached: false,
      syncId: syncRecord.id,
      imported,
    });
  } catch (error) {
    await prisma.listingSync.update({
      where: { id: syncRecord.id },
      data: {
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      },
    });

    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

// POST /api/listings - Manually add a listing
export async function POST(request: NextRequest) {
  const body = await request.json();
  const tract = isPointInOZ(body.latitude, body.longitude);

  const property = await prisma.property.create({
    data: {
      ...body,
      inOpportunityZone: tract !== null,
      censusTract: tract?.tractId || null,
      ozName: tract?.name || null,
      ozDesignation: tract?.designation || null,
      county: tract?.county || null,
      listingStatus: "for_sale",
      dataSource: "manual",
    },
  });

  return NextResponse.json(property, { status: 201 });
}
