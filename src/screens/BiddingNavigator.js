import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuctionListScreen from './AuctionListScreen';
import AuctionRoomScreen from './AuctionRoomScreen';

const Stack = createNativeStackNavigator();

export default function BiddingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuctionList" component={AuctionListScreen} />
      <Stack.Screen
        name="AuctionRoom"
        component={AuctionRoomScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

/*


─────────────────────────────────────────────────────────
CONNECT MONGODB LATER — hagteen thats needed ya aynour 
─────────────────────────────────────────────────────────

1. In AuctionListScreen.js, replace:
   const [auctions, setAuctions] = useState(MOCK_AUCTIONS);
   with:
   const [auctions, setAuctions] = useState([]);
   useEffect(() => {
     fetch('https://yourapi.com/auctions')
       .then(r => r.json())
       .then(data => setAuctions(data));
   }, []);

2. In AuctionRoomScreen.js, replace:
   const [auction, setAuction] = useState(MOCK_AUCTIONS.find(...));
   const [bids, setBids] = useState(MOCK_BIDS[auctionId] || []);
   with:
   useEffect(() => {
     fetch(`https://yourapi.com/auctions/${auctionId}`)
       .then(r => r.json()).then(setAuction);
     fetch(`https://yourapi.com/auctions/${auctionId}/bids`)
       .then(r => r.json()).then(setBids);
   }, []);

─────────────────────────────────────────────────────────
FILE STRUCTURE
─────────────────────────────────────────────────────────

bidding/
├── BiddingNavigator.js    ← plug into tab navigator
├── AuctionListScreen.js   ← grid of live auctions
├── AuctionRoomScreen.js   ← live bidding room
└── biddingData.js         ← mock data (swap for API later)
─────────────────────────────────────────────────────────
*/
