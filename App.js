import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/login';
import SignupScreen from './screens/signup';
import ForgotPasswordScreen from './screens/forgotpassword';
import VerificationScreen from './screens/verification';
import WelcomeScreen from './screens/welcome';


import * as SecureStore from "expo-secure-store";

const Stack = createNativeStackNavigator();
const AuthContext = React.createContext();

export default function App() {

  const[state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type){
        case "restore_token":
          return {
            ...prevState,
            usertoken: action.token, 
            isloading: false,
          };
    
        case "sign_in":
          return {
            ...prevState,
            isSignout: false,
            usertoken: action.token,
          };

        case "sign_out":
          return {
            ...prevState,
            isSignout: true,
            usertoken: null,
          };
      }
    },
    {
      isloading: true,
      isSignout: false,
      usertoken: null,
    },
);

React.useEffect(() => {
    const bootstrapAsync = async () => {
      let usertoken;
      try {
        usertoken = await SecureStore.getItemAsync("usertoken");
      } catch (e) {}
      dispatch({ type: "RESTORE_TOKEN", token: usertoken });
    };
    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async () => {
        dispatch({ type: "SIGN_IN", token: "dummy-auth-token" });
      },
      signOut: async () => {
        dispatch({ type: "SIGN_OUT" });
      },
      signUp: async () => {
        dispatch({ type: "SIGN_IN", token: "dummy-auth-token" });
      },
    }),
    [],
  );

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {state.usertoken == null ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen}/>
              <Stack.Screen name="Login" component={() => (
                  <LoginScreen signIn={authContext.signIn}/>
                )}

                options={{
                  animationTypeForReplace: state.isSignout ? "pop" : "push",
                }}
              />

              <Stack.Screen name="Signup" component={() => (
                  <SignupScreen signUp={authContext.signUp}/>
                )}
              />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
              <Stack.Screen name="Verification" component={() => (
                  <VerificationScreen signIn={authContext.signIn}/>
                )}
              />
            </>
          ) : (
            <Stack.Screen name="Home" component={() => (
                <HomeScreen signOut={authContext.signOut}/>
              )}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}