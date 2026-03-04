import { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, ScrollView, Platform,} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

export default function VerificationScreen({ navigation }) {
  const [code, setCode] = useState("");

  const handleVerify = () => {
    if (!code) {
      alert("Please enter the verification code");
      return;
    }
    if (code.length < 4) {
      alert("Please enter a valid code");
      return;
    }
    alert("Verified successfully!");
    navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar style="dark" />

        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={18} color="#C17C74" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Logo */}
        <Image
          source={require("../source/assets/images/Blacklogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          Enter the code sent to your email.
        </Text>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity style={styles.button} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>

        {/* Resend Code */}
        <Text style={styles.resendText}>
          Didn't receive a code?{" "}
          <Text style={styles.resendLink} onPress={() => alert("Code resent!")}>
            Resend
          </Text>
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  backText: {
    color: "#C17C74",
    fontSize: 16,
  },
  logo: {
    width: 150,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "gray",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#F2E6E3",
    borderRadius: 12,
    padding: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 6,
  },
  button: {
    backgroundColor: "#C17C74",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  resendText: {
    textAlign: "center",
    marginTop: 25,
    color: "#333",
  },
  resendLink: {
    color: "#C17C74",
    fontWeight: "600",
  },
});