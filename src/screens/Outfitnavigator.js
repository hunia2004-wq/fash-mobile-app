import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OutfitPickerScreen from './OutfitPickerScreen';
import OutfitDetailScreen from './OutfitDetailScreen';
import OutfitBuilderScreen from './OutfitBuilderScreen';
 
const Stack = createNativeStackNavigator();
 
export default function OutfitNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OutfitPicker" component={OutfitPickerScreen} />
      <Stack.Screen
        name="OutfitDetail"
        component={OutfitDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="OutfitBuilder"
        component={OutfitBuilderScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
