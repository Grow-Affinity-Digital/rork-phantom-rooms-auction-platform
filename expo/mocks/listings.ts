export interface Listing {
  id: string;
  type: 'ROOM' | 'ROUTE' | 'LICENSE';
  title: string;
  slug: string;
  summary: string;
  locationCity: string;
  locationState: string;
  locationRedacted: boolean;
  currentBid: number;
  reservePrice: number;
  reserveMet: boolean;
  depositRequired: boolean;
  depositAmount: number;
  marketingKit: boolean;
  startAt: Date;
  endAt: Date;
  bidCount: number;
  comments?: any[];
}

export const mockListings: Listing[] = [
  {
    id: '1',
    type: 'ROOM',
    title: 'Golden Nugget Game Room',
    slug: 'golden-nugget-atlanta',
    summary: 'Premier 5,000 sq ft gaming facility with 45 skill machines, established clientele, and prime Atlanta location. Consistent $25K monthly revenue.',
    locationCity: 'Atlanta',
    locationState: 'GA',
    locationRedacted: true,
    currentBid: 125000,
    reservePrice: 100000,
    reserveMet: true,
    depositRequired: true,
    depositAmount: 500,
    marketingKit: true,
    startAt: new Date('2025-01-01'),
    endAt: new Date('2025-01-15T18:00:00'),
    bidCount: 23,
  },
  {
    id: '2',
    type: 'ROUTE',
    title: 'Lucky 7 Wyoming Route',
    slug: 'lucky-7-wyoming',
    summary: '12-location route across Cheyenne and Laramie. Includes all equipment, van, and established relationships. $180K annual net.',
    locationCity: 'Cheyenne',
    locationState: 'WY',
    locationRedacted: false,
    currentBid: 85000,
    reservePrice: 90000,
    reserveMet: false,
    depositRequired: false,
    depositAmount: 0,
    marketingKit: false,
    startAt: new Date('2025-01-05'),
    endAt: new Date('2025-01-20T20:00:00'),
    bidCount: 15,
  },
  {
    id: '3',
    type: 'LICENSE',
    title: 'Nebraska Master Gaming License',
    slug: 'nebraska-master-license',
    summary: 'Transferable master license for skill gaming operations. Covers 5 counties. All paperwork current through 2026.',
    locationCity: 'Omaha',
    locationState: 'NE',
    locationRedacted: false,
    currentBid: 45000,
    reservePrice: 40000,
    reserveMet: true,
    depositRequired: true,
    depositAmount: 1000,
    marketingKit: false,
    startAt: new Date('2025-01-10'),
    endAt: new Date('2025-01-25T22:00:00'),
    bidCount: 8,
  },
  {
    id: '4',
    type: 'ROOM',
    title: 'Diamond Palace Entertainment',
    slug: 'diamond-palace-savannah',
    summary: 'Turnkey 3,500 sq ft venue with restaurant, bar, and 30 gaming stations. Prime tourist district location.',
    locationCity: 'Savannah',
    locationState: 'GA',
    locationRedacted: true,
    currentBid: 225000,
    reservePrice: 200000,
    reserveMet: true,
    depositRequired: true,
    depositAmount: 750,
    marketingKit: true,
    startAt: new Date('2025-01-03'),
    endAt: new Date('2025-01-18T19:00:00'),
    bidCount: 31,
  },
  {
    id: '5',
    type: 'ROUTE',
    title: 'High Plains Gaming Circuit',
    slug: 'high-plains-circuit',
    summary: '8-stop route through rural Nebraska. Established for 10+ years. Includes all equipment and exclusive venue contracts.',
    locationCity: 'Grand Island',
    locationState: 'NE',
    locationRedacted: true,
    currentBid: 65000,
    reservePrice: 70000,
    reserveMet: false,
    depositRequired: false,
    depositAmount: 0,
    marketingKit: false,
    startAt: new Date('2025-01-07'),
    endAt: new Date('2025-01-22T21:00:00'),
    bidCount: 12,
  },
  {
    id: '6',
    type: 'ROOM',
    title: 'Silver Strike Arcade & Lounge',
    slug: 'silver-strike-casper',
    summary: 'Family-friendly 4,000 sq ft space with arcade, skill games, and snack bar. Located in busy shopping center.',
    locationCity: 'Casper',
    locationState: 'WY',
    locationRedacted: false,
    currentBid: 95000,
    reservePrice: 85000,
    reserveMet: true,
    depositRequired: true,
    depositAmount: 500,
    marketingKit: false,
    startAt: new Date('2025-01-08'),
    endAt: new Date('2025-01-23T18:30:00'),
    bidCount: 19,
  },
];