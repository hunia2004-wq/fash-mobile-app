import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import AIStylingScreen from "./screens/AIStylingScreen";

import BiddingStack from "./navigation/BiddingStack";
import CheckoutStack from "./navigation/CheckoutStack";
import PackingStack from "./navigation/PackingStack";
import MarketplaceStack from "./navigation/MarketplaceStack";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AIStyling" component={AIStylingScreen} />
        <Stack.Screen name="Bidding" component={BiddingStack} />
        <Stack.Screen name="Checkout" component={CheckoutStack} />
        <Stack.Screen name="Packing" component={PackingStack} />
        <Stack.Screen name="Marketplace" component={MarketplaceStack} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
