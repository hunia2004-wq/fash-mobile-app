import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MarketplaceScreen from './MarketplaceScreen';
import ProductDetailScreen from './ProductDetailScreen';
import AddListingScreen from './AddListingScreen';

const Stack = createNativeStackNavigator();

export default function MarketplaceNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketplaceHome" component={MarketplaceScreen} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AddListing"
        component={AddListingScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

