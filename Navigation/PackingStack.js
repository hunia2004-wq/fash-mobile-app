
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PackingHome from "../screens/packing/PackingHome";
import OutfitBuilder from "../screens/packing/OutfitBuilder";

const Stack = createNativeStackNavigator();

export default function PackingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PackingHome" component={PackingHome} />
      <Stack.Screen name="OutfitBuilder" component={OutfitBuilder} />
    </Stack.Navigator>
  );
}
