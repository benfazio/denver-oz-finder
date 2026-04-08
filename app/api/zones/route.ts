import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { DENVER_OZ_TRACTS } from "../../data/denver-oz-tracts";

// GET /api/zones - Get all OZ tracts from DB (or seed from static data)
export async function GET() {
  let zones = await prisma.opportunityZone.findMany({
    orderBy: { county: "asc" },
  });

  // Auto-seed if empty
  if (zones.length === 0) {
    for (const tract of DENVER_OZ_TRACTS) {
      await prisma.opportunityZone.create({
        data: {
          tractId: tract.tractId,
          name: tract.name,
          county: tract.county,
          designation: tract.designation,
          boundaryGeoJson: JSON.stringify(tract.geometry),
        },
      });
    }
    zones = await prisma.opportunityZone.findMany({
      orderBy: { county: "asc" },
    });
  }

  // Get property counts per zone
  const zoneCounts = await prisma.property.groupBy({
    by: ["censusTract"],
    where: { inOpportunityZone: true },
    _count: { id: true },
  });

  const countMap = Object.fromEntries(
    zoneCounts.map((z: { censusTract: string | null; _count: { id: number } }) => [z.censusTract, z._count.id])
  );

  const enriched = zones.map((z: { tractId: string; [key: string]: unknown }) => ({
    ...z,
    propertyCount: countMap[z.tractId] || 0,
  }));

  return NextResponse.json(enriched);
}
