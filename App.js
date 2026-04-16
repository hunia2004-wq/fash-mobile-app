import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from './context/AuthContext';
import { Provider as PaperProvider } from 'react-native-paper';

import LoginScreen from './screens/login';
import SignupScreen from './screens/signup';
import ForgotPasswordScreen from './screens/forgotpassword';
import VerificationScreen from './screens/verification';
import WelcomeScreen from './screens/welcome';

import HomeScreen from './screens/home';
import ProfileScreen from './screens/profile';

import EditProfileScreen from './screens/editpersonal';

import WardrobeScreen from './screens/digital wardorbe/wardrobe';
import UploadScreen from './screens/uploading/upload';
import SavedScreen from './screens/favorites/saved';

import SettingsScreen from './screens/settings screen/settings';
import AddressScreen from './screens/settings screen/address';
import CardsScreen from './screens/settings screen/cards';
import EmailScreen from './screens/settings screen/email';
import LanguagesScreen from './screens/settings screen/languages';
import NotificationsScreen from './screens/settings screen/notifications';
import PrivacyScreen from './screens/settings screen/privacy';
import ChangePasswordScreen from './screens/settings screen/password';
import VerifyEmailScreen from './screens/settings screen/verifyemail';


import OrdersScreen from './screens/orders screen/orders';
import OrderDetailScreen from './screens/orders screen/orderdteails';

import SecurityScreen from './screens/security screens/securitymain';
import TwoFactorAuthScreen from './screens/security screens/twofa';
import LoginDevicesScreen from './screens/security screens/devices';
import ConnectedAccountsScreen from './screens/security screens/accounts';

import SupportScreen from './screens/support screens/supportmain';
import ContactSupportScreen from './screens/support screens/contact';
import FAQScreen from './screens/support screens/faq';

import { logout } from './services/authService';

const Stack = createNativeStackNavigator();


function SplashScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#C17C74" />
      <Text>Loading...</Text>
    </View>
  );
}

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return { ...prevState, userToken: action.token, isLoading: false };
        case 'LOG_IN':
          return { ...prevState, isLogOut: false, userToken: action.token };
        case 'LOG_OUT':
          return { ...prevState, isLogOut: true, userToken: null };
        default:
          return prevState;
      }
    },
    { isLoading: true, isLogOut: false, userToken: null }
  );

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken = null;
      try {
        userToken = await SecureStore.getItemAsync('userToken');
      } catch (e) {
        console.warn("Failed to restore token:", e);
      }
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };
    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(() => ({
    logIn: async (token) => {
      try {
        await SecureStore.setItemAsync("userToken", token);
      }
      catch (e) {
        console.warn("Failed to save token:", e);
      }
       dispatch({ type: 'LOG_IN', token});
    },

    logOut: async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) await logout(token);
        await SecureStore.deleteItemAsync('userToken');
      } catch (e) {
        console.warn('Logout error:', e);
      } finally {
        dispatch({ type: 'LOG_OUT' });
      }
    },

    getToken: async() =>{
      try {
        return await SecureStore.getItemAsync("userToken");
      }
      catch {
        return null;
      }
    },
  }), []);

  if (state.isLoading) 
    return <SplashScreen />;
  
  return (
    <PaperProvider>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {state.userToken == null ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen}
                options={{
                  animationTypeForReplace: state.isLogOut ? 'pop' : 'push',
                }}
              />

              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="Verification" component={VerificationScreen} />

              </>
          ) : (
            <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />

            <Stack.Screen name="Wardrobe" component={WardrobeScreen} />
            <Stack.Screen name="Upload" component={UploadScreen} />
            <Stack.Screen name="Saved" component={SavedScreen} />


              <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />

              <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="AddressScreen" component={AddressScreen} options={{ headerShown: false }} />
              <Stack.Screen name="CardsScreen" component={CardsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="EmailScreen" component={EmailScreen} options={{ headerShown: false }} />
              <Stack.Screen name="LanguagesScreen" component={LanguagesScreen} options={{ headerShown: false }} />
              <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
              <Stack.Screen name="VerifyEmailScreen" component={VerifyEmailScreen} options={{ headerShown: false }} />

             
              <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
              <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />

              <Stack.Screen name="SecurityScreen" component={SecurityScreen} options={{ headerShown: false }} />
              <Stack.Screen name="TwoFactorAuthScreen" component={TwoFactorAuthScreen} options={{ headerShown: false }} />
              <Stack.Screen name="LoginDevicesScreen" component={LoginDevicesScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ConnectedAccountsScreen" component={ConnectedAccountsScreen} options={{ headerShown: false }} />

              <Stack.Screen name="SupportScreen" component={SupportScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ContactSupportScreen" component={ContactSupportScreen} options={{ headerShown: false }} />
              <Stack.Screen name="FAQScreen" component={FAQScreen} options={{ headerShown: false }} />

              </>
)}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  </PaperProvider>
  
  );
}