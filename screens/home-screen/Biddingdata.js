export const COLORS = {
  bg: '#F5F5F5',
  card: '#F2E6E3',
  accent: '#C17C74',
  text: '#2c2c2c',
  muted: '#888888',
  white: '#ffffff',
  border: 'rgba(193,124,116,0.18)',
  live: '#E05C5C',
};

const hoursFromNow = (h) =>
  new Date(Date.now() + h * 60 * 60 * 1000).toISOString();

export const MOCK_AUCTIONS = [
  {
    id: 'a1',
    title: 'YSL Tribute Heels',
    brand: 'Saint Laurent',
    category: 'Shoes',
    condition: 'Like New',
    currentBid: 400,
    endsAt: hoursFromNow(1),
    bidCount: 8,
  },
];

export const MOCK_BIDS = {
  a1: [],
};