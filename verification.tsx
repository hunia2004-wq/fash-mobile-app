import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Verification() {
  const [code, setCode] = useState("");

  const handleVerify = () => {
    if (!code) {
      Alert.alert("Error", "Please enter the verification code.");
      return;
    }

    Alert.alert("Success 🎉", "Your account is verified!");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Text style={styles.heading}>Email Verification</Text>
      <Text style={styles.subText}>
        Enter the 6-digit code sent to your email
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter code"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      <Link href="/" asChild>
        <TouchableOpacity>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 18,
    letterSpacing: 5,
  },
  button: {
    backgroundColor: "#C17C74",   
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    color: "#C17C74",
    textAlign: "center",
    marginTop: 20,
  },
});