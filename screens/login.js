import { FontAwesome } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen({ navigation, signIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    await signIn();
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

        <Image
          source={require("../source/assets/images/Blacklogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.welcome}>Welcome to FASH!</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter your password"
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome
                name={showPassword ? "eye" : "eye-slash"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>

        <Text style={styles.register}>
          Not a member?{" "}
          <Text style={styles.registerNow} onPress={() => navigation.navigate("Signup")}>
            Sign Up
          </Text>
        </Text>

        <Text style={styles.or}>Or continue with</Text>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.social, { backgroundColor: "#DB4437" }]} onPress={() => alert("Google login")}>
            <FontAwesome name="google" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.social, { backgroundColor: "#000" }]} onPress={() => alert("Apple login")}>
            <FontAwesome name="apple" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.social, { backgroundColor: "#1877F2" }]} onPress={() => alert("Facebook login")}>
            <FontAwesome name="facebook" size={20} color="white" />
          </TouchableOpacity>
        </View>
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
  logo: {
    width: 150,
    height: 100,
    alignSelf: "center",
    marginBottom: 30,
  },
  welcome: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "gray",
  },
  card: {
    backgroundColor: "#F2E6E3",
    borderRadius: 12,
    padding: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
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
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  forgot: {
    marginTop: 15,
    textDecorationLine: "underline",
  },
  register: {
    marginTop: 10,
  },
  registerNow: {
    color: "#C17C74",
    fontWeight: "600",
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
});