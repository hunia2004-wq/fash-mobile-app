export const COLORS = {
  bg: '#f8f9fb',
  white: '#ffffff',
  text: '#1a1a1a',
  muted: '#777',
  border: '#e5e7eb',
  card: '#f1f3f6',

  accent: '#6c5ce7',
  accentLight: '#ece9ff',

  live: '#ff3b30',
  liveLight: '#ffe9e8',

  success: '#2ecc71',
};

export const MOCK_AUCTIONS = [
  {
    id: '1',
    title: 'Nike Air Jordan 1 Retro High',
    brand: 'Nike',
    category: 'Shoes',
    condition: 'Like New',
    size: '42',
    description: 'Worn once, perfect condition.',
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519',
    currentBid: 120,
    currentBidderName: 'Ahmed',
    bidCount: 5,
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '2',
    title: 'Louis Vuitton Shoulder Bag',
    brand: 'Louis Vuitton',
    category: 'Bags',
    condition: 'Good',
    description: 'Authentic LV bag with minor wear.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
    currentBid: 350,
    currentBidderName: 'Sara',
    bidCount: 8,
    endsAt: new Date(Date.now() + 1000 * 60 * 25).toISOString(),
  },
  {
    id: '3',
    title: 'Ray-Ban Aviator Sunglasses',
    brand: 'Ray-Ban',
    category: 'Accessories',
    condition: 'Like New',
    description: 'Classic aviators, barely used.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083',
    currentBid: 60,
    currentBidderName: 'Omar',
    bidCount: 3,
    endsAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
  },
];

export const MOCK_BIDS = {
  '1': [
    {
      id: 'b1',
      userName: 'Ahmed',
      amount: 120,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'b2',
      userName: 'Mona',
      amount: 110,
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
  ],
  '2': [
    {
      id: 'b3',
      userName: 'Sara',
      amount: 350,
      createdAt: new Date().toISOString(),
    },
  ],
  '3': [],
};
