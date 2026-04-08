-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Denver',
    "state" TEXT NOT NULL DEFAULT 'CO',
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "inOpportunityZone" BOOLEAN NOT NULL DEFAULT false,
    "censusTract" TEXT,
    "ozName" TEXT,
    "ozDesignation" TEXT,
    "county" TEXT,
    "propertyType" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" DOUBLE PRECISION,
    "sqft" INTEGER,
    "lotSize" DOUBLE PRECISION,
    "yearBuilt" INTEGER,
    "stories" INTEGER,
    "assessedValue" DOUBLE PRECISION,
    "marketValue" DOUBLE PRECISION,
    "lastSalePrice" DOUBLE PRECISION,
    "lastSaleDate" TIMESTAMP(3),
    "taxAmount" DOUBLE PRECISION,
    "listingStatus" TEXT,
    "listPrice" DOUBLE PRECISION,
    "listDate" TIMESTAMP(3),
    "listingUrl" TEXT,
    "listingSource" TEXT,
    "daysOnMarket" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataSource" TEXT,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchResult" (
    "id" TEXT NOT NULL,
    "searchQuery" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "inOZ" BOOLEAN NOT NULL,
    "censusTract" TEXT,
    "ozName" TEXT,
    "propertyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedProperty" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "notes" TEXT,
    "investmentAmount" DOUBLE PRECISION,
    "capitalGain" DOUBLE PRECISION,
    "holdingPeriod" INTEGER,
    "projectedReturn" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingSync" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "zipCode" TEXT,
    "censusTract" TEXT,
    "totalFound" INTEGER NOT NULL DEFAULT 0,
    "totalImported" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ListingSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityZone" (
    "id" TEXT NOT NULL,
    "tractId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'CO',
    "designation" TEXT NOT NULL,
    "medianIncome" DOUBLE PRECISION,
    "povertyRate" DOUBLE PRECISION,
    "population" INTEGER,
    "boundaryGeoJson" TEXT,

    CONSTRAINT "OpportunityZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Property_latitude_longitude_idx" ON "Property"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Property_inOpportunityZone_idx" ON "Property"("inOpportunityZone");

-- CreateIndex
CREATE INDEX "Property_censusTract_idx" ON "Property"("censusTract");

-- CreateIndex
CREATE INDEX "Property_listingStatus_idx" ON "Property"("listingStatus");

-- CreateIndex
CREATE INDEX "Property_zipCode_idx" ON "Property"("zipCode");

-- CreateIndex
CREATE INDEX "SearchResult_createdAt_idx" ON "SearchResult"("createdAt");

-- CreateIndex
CREATE INDEX "SavedProperty_propertyId_idx" ON "SavedProperty"("propertyId");

-- CreateIndex
CREATE INDEX "ListingSync_status_idx" ON "ListingSync"("status");

-- CreateIndex
CREATE INDEX "ListingSync_startedAt_idx" ON "ListingSync"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityZone_tractId_key" ON "OpportunityZone"("tractId");

-- CreateIndex
CREATE INDEX "OpportunityZone_county_idx" ON "OpportunityZone"("county");

-- AddForeignKey
ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedProperty" ADD CONSTRAINT "SavedProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
