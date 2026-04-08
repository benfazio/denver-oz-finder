// Denver, Colorado Federal Opportunity Zone Census Tracts
// Source: US Treasury CDFI Fund / IRS designated Qualified Opportunity Zones
// These are the census tract numbers designated as Opportunity Zones in the Denver metro area

export interface OZTract {
  tractId: string;
  name: string;
  county: string;
  coordinates: [number, number][]; // [lat, lng] polygon points
  designation: string;
  medianIncome: number | null;
  povertyRate: number | null;
}

// Denver Opportunity Zone census tracts with approximate boundary polygons
export const DENVER_OZ_TRACTS: OZTract[] = [
  {
    tractId: "08031000702",
    name: "Sun Valley / Decatur-Federal",
    county: "Denver",
    coordinates: [
      [39.7350, -105.0160],
      [39.7350, -105.0030],
      [39.7260, -105.0030],
      [39.7260, -105.0160],
    ],
    designation: "Low-Income Community",
    medianIncome: 22500,
    povertyRate: 42.1,
  },
  {
    tractId: "08031000801",
    name: "La Alma / Lincoln Park",
    county: "Denver",
    coordinates: [
      [39.7260, -105.0100],
      [39.7260, -104.9960],
      [39.7180, -104.9960],
      [39.7180, -105.0100],
    ],
    designation: "Low-Income Community",
    medianIncome: 28900,
    povertyRate: 35.2,
  },
  {
    tractId: "08031000900",
    name: "Baker / Broadway",
    county: "Denver",
    coordinates: [
      [39.7180, -105.0050],
      [39.7180, -104.9870],
      [39.7100, -104.9870],
      [39.7100, -105.0050],
    ],
    designation: "Low-Income Community",
    medianIncome: 35400,
    povertyRate: 22.8,
  },
  {
    tractId: "08031001100",
    name: "Globeville",
    county: "Denver",
    coordinates: [
      [39.7830, -105.0050],
      [39.7830, -104.9830],
      [39.7720, -104.9830],
      [39.7720, -105.0050],
    ],
    designation: "Low-Income Community",
    medianIncome: 26800,
    povertyRate: 38.5,
  },
  {
    tractId: "08031001200",
    name: "Elyria-Swansea",
    county: "Denver",
    coordinates: [
      [39.7830, -104.9830],
      [39.7830, -104.9620],
      [39.7720, -104.9620],
      [39.7720, -104.9830],
    ],
    designation: "Low-Income Community",
    medianIncome: 31200,
    povertyRate: 33.1,
  },
  {
    tractId: "08031002400",
    name: "Five Points / Whittier",
    county: "Denver",
    coordinates: [
      [39.7600, -104.9780],
      [39.7600, -104.9640],
      [39.7510, -104.9640],
      [39.7510, -104.9780],
    ],
    designation: "Low-Income Community",
    medianIncome: 33700,
    povertyRate: 28.4,
  },
  {
    tractId: "08031002702",
    name: "Cole / Clayton",
    county: "Denver",
    coordinates: [
      [39.7720, -104.9720],
      [39.7720, -104.9550],
      [39.7620, -104.9550],
      [39.7620, -104.9720],
    ],
    designation: "Low-Income Community",
    medianIncome: 29100,
    povertyRate: 31.9,
  },
  {
    tractId: "08031003600",
    name: "Westwood",
    county: "Denver",
    coordinates: [
      [39.7050, -105.0350],
      [39.7050, -105.0150],
      [39.6930, -105.0150],
      [39.6930, -105.0350],
    ],
    designation: "Low-Income Community",
    medianIncome: 27600,
    povertyRate: 36.8,
  },
  {
    tractId: "08031004001",
    name: "Mar Lee / Harvey Park",
    county: "Denver",
    coordinates: [
      [39.6930, -105.0350],
      [39.6930, -105.0150],
      [39.6820, -105.0150],
      [39.6820, -105.0350],
    ],
    designation: "Low-Income Community",
    medianIncome: 38200,
    povertyRate: 19.5,
  },
  {
    tractId: "08031004408",
    name: "Montbello",
    county: "Denver",
    coordinates: [
      [39.7830, -104.8680],
      [39.7830, -104.8400],
      [39.7680, -104.8400],
      [39.7680, -104.8680],
    ],
    designation: "Low-Income Community",
    medianIncome: 34500,
    povertyRate: 24.7,
  },
  {
    tractId: "08031004502",
    name: "Green Valley Ranch",
    county: "Denver",
    coordinates: [
      [39.7950, -104.8500],
      [39.7950, -104.8200],
      [39.7830, -104.8200],
      [39.7830, -104.8500],
    ],
    designation: "Low-Income Community",
    medianIncome: 42100,
    povertyRate: 16.3,
  },
  {
    tractId: "08031004100",
    name: "Ruby Hill / Overland",
    county: "Denver",
    coordinates: [
      [39.6930, -105.0050],
      [39.6930, -104.9870],
      [39.6820, -104.9870],
      [39.6820, -105.0050],
    ],
    designation: "Low-Income Community",
    medianIncome: 36800,
    povertyRate: 21.2,
  },
  {
    tractId: "08031008302",
    name: "River North (RiNo) Art District",
    county: "Denver",
    coordinates: [
      [39.7720, -104.9830],
      [39.7720, -104.9700],
      [39.7620, -104.9700],
      [39.7620, -104.9830],
    ],
    designation: "Contiguous Tract",
    medianIncome: 51200,
    povertyRate: 12.8,
  },
  {
    tractId: "08031001701",
    name: "North Capitol Hill",
    county: "Denver",
    coordinates: [
      [39.7450, -104.9800],
      [39.7450, -104.9650],
      [39.7370, -104.9650],
      [39.7370, -104.9800],
    ],
    designation: "Low-Income Community",
    medianIncome: 30500,
    povertyRate: 29.8,
  },
  // Adams County OZ tracts near Denver
  {
    tractId: "08001009302",
    name: "Federal Heights / Westminster",
    county: "Adams",
    coordinates: [
      [39.8400, -105.0200],
      [39.8400, -104.9900],
      [39.8250, -104.9900],
      [39.8250, -105.0200],
    ],
    designation: "Low-Income Community",
    medianIncome: 35600,
    povertyRate: 22.4,
  },
  {
    tractId: "08001009402",
    name: "Commerce City West",
    county: "Adams",
    coordinates: [
      [39.8150, -104.9500],
      [39.8150, -104.9200],
      [39.8000, -104.9200],
      [39.8000, -104.9500],
    ],
    designation: "Low-Income Community",
    medianIncome: 33100,
    povertyRate: 27.6,
  },
  // Arapahoe County OZ tracts
  {
    tractId: "08005005502",
    name: "Aurora Central",
    county: "Arapahoe",
    coordinates: [
      [39.7200, -104.8400],
      [39.7200, -104.8100],
      [39.7050, -104.8100],
      [39.7050, -104.8400],
    ],
    designation: "Low-Income Community",
    medianIncome: 31400,
    povertyRate: 30.2,
  },
  {
    tractId: "08005005600",
    name: "Aurora / Colfax Corridor",
    county: "Arapahoe",
    coordinates: [
      [39.7400, -104.8400],
      [39.7400, -104.8100],
      [39.7250, -104.8100],
      [39.7250, -104.8400],
    ],
    designation: "Low-Income Community",
    medianIncome: 29800,
    povertyRate: 32.1,
  },
];

// Check if a point [lat, lng] falls within any OZ tract polygon
export function isPointInOZ(lat: number, lng: number): OZTract | null {
  for (const tract of DENVER_OZ_TRACTS) {
    if (isPointInPolygon(lat, lng, tract.coordinates)) {
      return tract;
    }
  }
  return null;
}

// Ray-casting algorithm for point-in-polygon
function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lng) !== (yj > lng))
      && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
