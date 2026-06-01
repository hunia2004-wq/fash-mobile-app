import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from "react-native";
import { wp, hp, fp } from '../utils/responsive';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Image
        source={require("../source/assets/images/Blacklogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome to FASH</Text>
      <Text style={styles.subtitle}>Own the Look</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.courierLink}
          onPress={() => navigation.navigate("CourierLoginScreen")}
        >
          <Text style={styles.courierLinkText}>Are you a courier? Log in here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(25),
  },
  logo: {
    width: wp(180),
    height: hp(120),
    marginBottom: hp(20),
  },
  title: {
    fontSize: fp(28),
    fontWeight: "bold",
    color: "#333",
    marginBottom: hp(10),
  },
  subtitle: {
    fontSize: fp(15),
    color: "gray",
    marginBottom: hp(50),
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: hp(15),
  },
  loginButton: {
    backgroundColor: "#C17C74",
    padding: hp(15),
    borderRadius: wp(10),
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: fp(16),
  },
  signupButton: {
    backgroundColor: "white",
    padding: hp(15),
    borderRadius: wp(10),
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C17C74",
  },
  signupText: {
    color: "#C17C74",
    fontWeight: "600",
    fontSize: fp(16),
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp(4),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D0D0D0",
  },
  dividerText: {
    marginHorizontal: wp(10),
    fontSize: fp(13),
    color: "gray",
  },
  courierLink: {
    flexDirection: "row",
    gap: wp(5),
    justifyContent: "center",
  },
  courierLinkText: {
    fontSize: fp(13),
    color: "#C17C74",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});