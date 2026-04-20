import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BiddingHome from "../screens/bidding/BiddingHome";
import BidInput from "../screens/bidding/BidInput";
import ConfirmBid from "../screens/bidding/ConfirmBid";

const Stack = createNativeStackNavigator();

export default function BiddingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BiddingHome" component={BiddingHome} />
      <Stack.Screen name="BidInput" component={BidInput} />
      <Stack.Screen name="ConfirmBid" component={ConfirmBid} />
    </Stack.Navigator>
  );
}
