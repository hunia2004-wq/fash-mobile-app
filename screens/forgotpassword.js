import { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, ScrollView, Platform,} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = () => {
    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    navigation.navigate("Verification");
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started with FASH!</Text>

        {/* Form Card */}
        <View style={styles.card}>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome
                name={showPassword ? "eye" : "eye-slash"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <FontAwesome
                name={showConfirmPassword ? "eye" : "eye-slash"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <Text style={styles.or}>Or continue with</Text>

        {/* Social Buttons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.social, { backgroundColor: "#DB4437" }]} onPress={() => alert("Google signup")}>
            <FontAwesome name="google" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.social, { backgroundColor: "#000" }]} onPress={() => alert("Apple signup")}>
            <FontAwesome name="apple" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.social, { backgroundColor: "#1877F2" }]} onPress={() => alert("Facebook signup")}>
            <FontAwesome name="facebook" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <Text style={styles.loginText}>
          Already a member?{" "}
          <Text style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
            Log In
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
  },
  card: {
    backgroundColor: "#CFCFCF",
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
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
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
  or: {
    textAlign: "center",
    marginTop: 25,
    marginBottom: 15,
    color: "gray",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  social: {
    width: 45,
    height: 45,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    textAlign: "center",
    marginTop: 20,
    color: "#333",
  },
  loginLink: {
    color: "#C17C74",
    fontWeight: "600",
  },
});