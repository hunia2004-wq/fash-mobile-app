import React, { useRef, useEffect } from 'react';
import { View, Text, ActivityIndicator, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from './context/AuthContext';
import { Provider as PaperProvider } from 'react-native-paper';
import { GalioProvider } from 'galio-framework';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { ClerkProvider, ClerkLoaded } from '@clerk/expo';


import { CartProvider } from './context/CartContext';

export const ANTHROPIC_API_KEY = Constants.expoConfig?.extra?.anthropicApiKey || '';

import './source/i18n';

import LoginScreen from './screens/login';
import SignupScreen from './screens/signup';
import ForgotPasswordScreen from './screens/forgotpassword';
import VerificationScreen from './screens/verification';
import WelcomeScreen from './screens/welcome';

import HomeScreen from './screens/home-screen/home';
import EditProfileScreen from './screens/editpersonal';

import SettingsScreen from './screens/settings-screen/settings';
import AddressScreen from './screens/settings-screen/address';
import CardsScreen from './screens/settings-screen/cards';
import EmailScreen from './screens/settings-screen/email';
import LanguagesScreen from './screens/settings-screen/languages';
import NotificationsScreen from './screens/settings-screen/notifications';
import PrivacyScreen from './screens/settings-screen/privacy';
import ChangePasswordScreen from './screens/settings-screen/password';
import VerifyEmailScreen from './screens/settings-screen/verifyemail';
import OrdersScreen from './screens/orders-screen/orders';
import OrderDetailScreen from './screens/orders-screen/orderdetails';

import SecurityScreen from './screens/security-screens/securitymain';
import TwoFactorAuthScreen from './screens/security-screens/twofa';
import LoginDevicesScreen from './screens/security-screens/devices';

import SupportScreen from './screens/support-screens/supportmain';
import ContactSupportScreen from './screens/support-screens/contact';
import FAQScreen from './screens/support-screens/faq';

import AIStyling from './screens/home-screen/AIStylingScreen';
import ConfirmBid from './screens/home-screen/ConfirmBid';
import PaymentScreen from './screens/home-screen/PaymentScreen';
import MarketplaceHome from './screens/home-screen/MarketplaceHome';
import ProductDetails from './screens/home-screen/ProductDetails';
import AddListingScreen from './screens/home-screen/addlisting';
import SellerProfileScreen from './screens/home-screen/SellerProfile';

import PackingBuilderscreen from './screens/home-screen/PackingBuilderscreen';
import PackingPickerScreen from './screens/home-screen/Packingpickerscreen';
import PackingDetailScreen from './screens/home-screen/Packingdetailscreen';

import DonationScreen from './screens/home-screen/DonationScreen';
import FashCollectionScreen from './screens/home-screen/fashcollection';

import AuctionListScreen from './screens/home-screen/AuctionListScreen';
import AuctionRoomScreen from './screens/home-screen/AuctionRoomScreen';
import CreateAuction from './screens/home-screen/CreateAuction';

import MainCart from './screens/home-screen/MainCart';
import ARscreen from './screens/ARscreen';
import Fashproductsdetails from './screens/home-screen/fashproductsdetails';
import SellerPickupScreen from './screens/orders-screen/sellerpickup';
import Premium from './screens/premium';
import Offer from './screens/home-screen/offer';

import CourierLoginScreen from './screens/courierlogin';
import CourierPickupScreen from './screens/courierpickup';
import CourierStatusScreen from './screens/courierstatus';
import AdminReviewScreen from './screens/adminreview';

import { logout, warmupServer, submitPushToken } from './services/authService';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function SplashScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#C17C74" />
      <Text>Loading...</Text>
    </View>
  );
}

const tokenCache = {
  async getToken(key) { return SecureStore.getItemAsync(key); },
  async saveToken(key, value) { return SecureStore.setItemAsync(key, value); },
  async clearToken(key) { return SecureStore.deleteItemAsync(key); },
};

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return { ...prevState, userToken: action.token, userId: action.userId, isLoading: false };
        case 'LOG_IN':
          return { ...prevState, isLogOut: false, userToken: action.token, userId: action.userId };
        case 'LOG_OUT':
          return { ...prevState, isLogOut: true, userToken: null, userId: null };
        default:
          return prevState;
      }
    },
    { isLoading: true, isLogOut: false, userToken: null, userId: null }
  );

  const navigationRef = useRef();
  const pendingUrl = useRef(null);

  // ── Push token registration ─────────────────────────────────────
  const tryRegisterPushToken = async (token) => {
    try {
      if (!Device.isDevice) return;
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId,
      });
      await submitPushToken(token, pushTokenData.data);
    } catch (e) {
      // best-effort — never block login
    }
  };

  // ── Deep link handler ───────────────────────────────────────────
  const handleDeepLink = (url) => {
    if (!url) return;

    // Not authenticated yet — store and handle after login
    if (!state.userToken) {
      pendingUrl.current = url;
      return;
    }

    const pickupMatch = url.match(/fash:\/\/pickup\/(.+)/);
    if (pickupMatch) {
      const orderId = pickupMatch[1];
      navigationRef.current?.navigate('SellerPickupScreen', {
        orderId,
        item: { name: 'Your item', price: 0, imageUrl: null },
        buyerUsername: 'buyer',
        readOnly: false,
      });
    }
  };

  // ── Auth context ────────────────────────────────────────────────
  const authContext = React.useMemo(() => ({
    logIn: async (token, userId) => {
      try {
        await SecureStore.setItemAsync('userToken', token);
        if (userId) await SecureStore.setItemAsync('userId', userId);
        tryRegisterPushToken(token);
      } catch (e) {
        console.warn('Failed to save token:', e);
      }
      dispatch({ type: 'LOG_IN', token, userId });
    },
    logOut: async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) await logout(token);
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userId');
      } catch (e) {
        console.warn('Logout error:', e);
      } finally {
        dispatch({ type: 'LOG_OUT' });
      }
    },
    getToken: async () => {
      try {
        return await SecureStore.getItemAsync('userToken');
      } catch {
        return null;
      }
    },
    userId: state.userId,
  }), [state.userId]);

  // ── Bootstrap on mount ──────────────────────────────────────────
  React.useEffect(() => {
    warmupServer();
    const bootstrapAsync = async () => {
      let userToken = null;
      let userId = null;
      try {
        userToken = await SecureStore.getItemAsync('userToken');
        userId = await SecureStore.getItemAsync('userId');
      } catch (e) {
        console.warn('Failed to restore token:', e);
      }
      dispatch({ type: 'RESTORE_TOKEN', token: userToken, userId });
      if (userToken) tryRegisterPushToken(userToken);
    };
    bootstrapAsync();
  }, []);

  // ── Notification tap handler ────────────────────────────────────
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (!data?.orderId) return;

      if (data.screen === 'PickupDetails') {
        navigationRef.current?.navigate('SellerPickupScreen', {
          orderId: data.orderId,
          item: { name: 'Your item', price: 0, imageUrl: null },
          buyerUsername: 'buyer',
          readOnly: false,
        });
      }

      if (data.screen === 'Orders') {
        navigationRef.current?.navigate('OrdersScreen');
      }
    });
    return () => sub.remove();
  }, []);

  // ── Deep link listener ──────────────────────────────────────────
  useEffect(() => {
    // App already open — listen for incoming links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // App cold started via deep link
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    return () => subscription.remove();
  }, [state.userToken]); // re-runs when auth state changes

  // ── Flush pending URL once authenticated ────────────────────────
  useEffect(() => {
    if (state.userToken && pendingUrl.current) {
      const url = pendingUrl.current;
      pendingUrl.current = null;
      setTimeout(() => handleDeepLink(url), 300);
    }
  }, [state.userToken]);

  // ── All hooks above this line ───────────────────────────────────
  if (state.isLoading) return <SplashScreen />;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <GalioProvider>
      <PaperProvider>
        <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
          tokenCache={tokenCache}>
          <ClerkLoaded>
            <AuthContext.Provider value={authContext}>
              <CartProvider>
                <NavigationContainer ref={navigationRef}>
                  <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {state.userToken == null ? (
                      <>
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />
                        <Stack.Screen
                          name="Login"
                          component={LoginScreen}
                          options={{ animationTypeForReplace: state.isLogOut ? 'pop' : 'push' }}
                        />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                        <Stack.Screen name="Verification" component={VerificationScreen} />

                        <Stack.Screen name="CourierLoginScreen" component={CourierLoginScreen}  options={{ headerShown: false }}/>
                        <Stack.Screen name="CourierPickupScreen" component={CourierPickupScreen}  options={{ headerShown: false }}/>
                        <Stack.Screen name="CourierStatusScreen" component={CourierStatusScreen}  options={{ headerShown: false }}/>
                      </>
                    ) : (
                      <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />

                        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
                        <Stack.Screen name="AddressScreen" component={AddressScreen} />
                        <Stack.Screen name="CardsScreen" component={CardsScreen} />
                        <Stack.Screen name="EmailScreen" component={EmailScreen} />
                        <Stack.Screen name="LanguagesScreen" component={LanguagesScreen} />
                        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
                        <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} />
                        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
                        <Stack.Screen name="VerifyEmailScreen" component={VerifyEmailScreen} />
                        <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
                        <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />

                        <Stack.Screen name="SecurityScreen" component={SecurityScreen} />
                        <Stack.Screen name="TwoFactorAuthScreen" component={TwoFactorAuthScreen} />
                        <Stack.Screen name="LoginDevicesScreen" component={LoginDevicesScreen} />

                        <Stack.Screen name="SupportScreen" component={SupportScreen} />
                        <Stack.Screen name="ContactSupportScreen" component={ContactSupportScreen} />
                        <Stack.Screen name="FAQScreen" component={FAQScreen} />

                        <Stack.Screen name="AIStylingScreen" component={AIStyling} />
                        <Stack.Screen name="ConfirmBid" component={ConfirmBid} />
                        <Stack.Screen name="Payment" component={PaymentScreen} />

                        <Stack.Screen name="MarketplaceHome" component={MarketplaceHome} />
                        <Stack.Screen name="ProductDetails" component={ProductDetails} />
                        <Stack.Screen name="AddListingScreen" component={AddListingScreen} />

                        <Stack.Screen name="PackingBuilderscreen" component={PackingBuilderscreen} options={{ animation: 'slide_from_bottom' }} />
                        <Stack.Screen name="PackingPicker" component={PackingPickerScreen} />
                        <Stack.Screen name="PackingDetail" component={PackingDetailScreen} options={{ animation: 'slide_from_right' }} />

                        <Stack.Screen name="DonationScreen" component={DonationScreen} />
                        <Stack.Screen name="FashCollectionScreen" component={FashCollectionScreen} />

                        <Stack.Screen name="AuctionListScreen" component={AuctionListScreen} />
                        <Stack.Screen name="AuctionRoomScreen" component={AuctionRoomScreen} initialParams={{ auctionId: null }} options={{ animation: 'slide_from_right' }} />
                        <Stack.Screen name="CreateAuction" component={CreateAuction} options={{ animation: 'slide_from_bottom' }} />

                        <Stack.Screen name="MainCart" component={MainCart} />
                        <Stack.Screen name="SellerProfileScreen" component={SellerProfileScreen} />
                        <Stack.Screen name="ARscreen" component={ARscreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Fashproductsdetails" component={Fashproductsdetails} />
                        <Stack.Screen name="SellerPickupScreen" component={SellerPickupScreen} />
                        <Stack.Screen name="Premium" component={Premium} />
                        <Stack.Screen name="Offer" component={Offer} />

                        <Stack.Screen name="AdminReviewScreen" component={AdminReviewScreen}  options={{ headerShown: false }}/>
                      </>
                    )}
                  </Stack.Navigator>
                </NavigationContainer>
              </CartProvider>
            </AuthContext.Provider>
          </ClerkLoaded>
        </ClerkProvider>
      </PaperProvider>
    </GalioProvider>
  );
}