import React, { useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { AuthContext } from "../App";

export default function ProfileScreen() {
  const { logOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      
      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/avatar.jpg')} 
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>Aynour ahmed</Text>
          <Text style={styles.email}>Aynour@email.com</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Style Preferences</Text>
        <Text>Casual • Streetwear • Minimal</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Outfits</Text>
        <Text>Your favorite looks will appear here</Text>
      </View>

     
      <TouchableOpacity style={styles.logout} onPress={logOut}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  email: {
    color: "gray",
    marginTop: 4,
  },
  editButton: {
    backgroundColor: "#C17C74",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  logout: {
    marginTop: 40,
    alignItems: "center",
  },
  logoutText: {
    color: "#C17C74",
    fontWeight: "bold",
    fontSize: 16,
  },
});
