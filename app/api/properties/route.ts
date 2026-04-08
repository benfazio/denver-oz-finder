import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

// GET /api/properties - List properties with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const ozOnly = searchParams.get("oz") === "true";
  const status = searchParams.get("status"); // for_sale, sold, etc.
  const zip = searchParams.get("zip");
  const tract = searchParams.get("tract");
  const type = searchParams.get("type"); // residential, commercial, etc.
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const where: Record<string, unknown> = {};

  if (ozOnly) where.inOpportunityZone = true;
  if (status) where.listingStatus = status;
  if (zip) where.zipCode = zip;
  if (tract) where.censusTract = tract;
  if (type) where.propertyType = type;
  if (minPrice || maxPrice) {
    where.listPrice = {};
    if (minPrice) (where.listPrice as Record<string, number>).gte = parseFloat(minPrice);
    if (maxPrice) (where.listPrice as Record<string, number>).lte = parseFloat(maxPrice);
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({
    properties,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

// POST /api/properties - Create or update a property
export async function POST(request: NextRequest) {
  const body = await request.json();

  const property = await prisma.property.upsert({
    where: {
      id: body.id || "new-record",
    },
    update: { ...body, updatedAt: new Date() },
    create: body,
  });

  return NextResponse.json(property, { status: 201 });
}
