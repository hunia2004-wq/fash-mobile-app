import {View, Text, TouchableOpacity, StyleSheet, Image, StatusBar,} from "react-native";
  
  export default function WelcomeScreen({ navigation }) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
  
        {/* Logo */}
        <Image
          source={require("../source/assets/images/Blacklogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
  
        {/* Title */}
        <Text style={styles.title}>Welcome to FASH</Text>
        <Text style={styles.subtitle}>
          Your Personal Fashion Companion
        </Text>
  
        {/* Buttons */}
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