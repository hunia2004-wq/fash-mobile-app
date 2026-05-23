import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* logo */}
      <Image
        source={require("../source/assets/images/Blacklogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* title */}
      <Text style={styles.title}>Welcome to FASH</Text>
      <Text style={styles.subtitle}>
        Your Style, Your Way
      </Text>

      {/* buttons */}
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

        {/* divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.courierLink}
          onPress={() => navigation.navigate("CourierLogin")}>
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
    paddingHorizontal: 25,
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "gray",
    marginBottom: 50,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  loginButton: {
    backgroundColor: "#C17C74",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C17C74",
  },
  signupText: {
    color: "#C17C74",
    fontWeight: "600",
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D0D0D0",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 13,
    color: "gray",
  },
  courierLink: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
  },
  courierLinkText: {
    fontSize: 13,
    color: "#C17C74",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
  footerLink: {
    color: "#C17C74",
    fontWeight: "600",
  },
});