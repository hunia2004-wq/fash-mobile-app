
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MarketplaceHome from "../screens/marketplace/MarketplaceHome";
import ProductDetails from "../screens/marketplace/ProductDetails";

const Stack = createNativeStackNavigator();

export default function MarketplaceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketplaceHome" component={MarketplaceHome} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
    </Stack.Navigator>
  );
}
