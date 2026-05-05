import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuctionListScreen from './AuctionListScreen';
import AuctionRoomScreen from './AuctionRoomScreen';
import CreateAuctionScreen from './CreateAuctionScreen';

const Stack = createNativeStackNavigator();

export default function BiddingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="AuctionList"
    >
      <Stack.Screen name="AuctionList" component={AuctionListScreen} />
      <Stack.Screen
        name="AuctionRoom"
        component={AuctionRoomScreen}
        initialParams={{ auctionId: null }}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CreateAuction"
        component={CreateAuctionScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
