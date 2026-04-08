import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { isPointInOZ } from "../../data/denver-oz-tracts";

// POST /api/search - Search an address and log it
export async function POST(request: NextRequest) {
  const { address } = await request.json();

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  // Geocode via Nominatim
  const query = address.includes("Denver") || address.includes("CO")
    ? address
    : `${address}, Denver, CO`;

  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
    { headers: { "User-Agent": "DenverOZFinder/1.0" } }
  );
  const geoData = await geoRes.json();

  if (!geoData || geoData.length === 0) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  const { lat, lon, display_name } = geoData[0];
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  const tract = isPointInOZ(latitude, longitude);

  // Check if property exists in DB
  let property = await prisma.property.findFirst({
    where: {
      latitude: { gte: latitude - 0.0001, lte: latitude + 0.0001 },
      longitude: { gte: longitude - 0.0001, lte: longitude + 0.0001 },
    },
  });

  // Create property record if not found
  if (!property) {
    property = await prisma.property.create({
      data: {
        address: display_name,
        latitude,
        longitude,
        inOpportunityZone: tract !== null,
        censusTract: tract?.tractId || null,
        ozName: tract?.name || null,
        ozDesignation: tract?.designation || null,
        county: tract?.county || null,
        dataSource: "geocode",
      },
    });
  }

  // Log the search
  await prisma.searchResult.create({
    data: {
      searchQuery: address,
      latitude,
      longitude,
      inOZ: tract !== null,
      censusTract: tract?.tractId || null,
      ozName: tract?.name || null,
      propertyId: property.id,
    },
  });

  return NextResponse.json({
    address: display_name,
    lat: latitude,
    lng: longitude,
    inOZ: tract !== null,
    tract,
    property,
  });
}

// GET /api/search - Get recent searches
export async function GET() {
  const searches = await prisma.searchResult.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { property: true },
  });

  return NextResponse.json(searches);
}
