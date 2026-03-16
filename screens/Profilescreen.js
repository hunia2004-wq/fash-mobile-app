import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from "react-native";
import { AuthContext } from "../App";
import { getProfile } from "../services/authService";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");

const MenuItem = ({ title }) => (
  <TouchableOpacity style={styles.menuItem}>
    <Text style={styles.menuText}>{title}</Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { logOut, getToken } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);

  const avatarSize = width * 0.25;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const profile = await getProfile(token);
        setUser(profile);
      } catch (e) {
        console.warn("Failed to fetch profile:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission is required to choose an image!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C17C74" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Failed to load profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* Profile Header */}
      <View style={styles.content}>

        <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
          <Image
            source={
              avatar
                ? { uri: avatar }
                : require("../source/assets/images/avatar.jpg")
            }
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2
            }}
          />

          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "#C17C74",
              width: avatarSize * 0.25,
              height: avatarSize * 0.25,
              borderRadius: (avatarSize * 0.25) / 2,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: avatarSize * 0.2
              }}
            >
              +
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

      </View>


      {/* Profile Information */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <MenuItem title="Full Name" />
        <MenuItem title="Username" />
        <MenuItem title="Bio" />
        <MenuItem title="Phone Number" />
      </View>


      {/* Account Info */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <MenuItem title="Date Joined" />
        <MenuItem title="Account Type" />
      </View>


      {/* Settings */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <MenuItem title="Change Password" />
        <MenuItem title="Privacy Settings" />
        <MenuItem title="Notification Settings" />
        <MenuItem title="Language Preferences" />
      </View>


      {/* Activity */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Activity</Text>

        <MenuItem title="Orders" />
        <MenuItem title="Favorites / Wishlist" />
        <MenuItem title="Saved Items" />
      </View>


      {/* Security */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Security</Text>

        <MenuItem title="Two-Factor Authentication" />
        <MenuItem title="Login Devices" />
        <MenuItem title="Connected Accounts" />
      </View>


      {/* Support */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Support</Text>

        <MenuItem title="Help Center" />
        <MenuItem title="Contact Support" />
        <MenuItem title="FAQ" />
      </View>


      {/* Logout */}
      <TouchableOpacity style={styles.logoutbutton} onPress={logOut}>
        <Text style={styles.logoutbuttonText}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5"
  },

  content: {
    alignItems: "center",
    marginTop: height * 0.05,
    marginBottom: 25
  },

  avatarWrapper: {
    marginBottom: 20
  },

  name: {
    fontSize: 24,
    fontWeight: "bold"
  },

  email: {
    color: "gray",
    marginTop: 8,
    marginBottom: 16
  },

  editButton: {
    backgroundColor: "#C17C74",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },

  editButtonText: {
    color: "white",
    fontWeight: "bold"
  },

  box: {
    backgroundColor: "#F2E6E3",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10
  },

  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5d6d2"
  },

  menuText: {
    fontSize: 15,
    color: "#333"
  },

  logoutbutton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#C17C74",
    marginTop: 10,
    marginBottom: 40
  },

  logoutbuttonText: {
    color: "#C17C74",
    fontWeight: "bold",
    fontSize: 16
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5"
  }

});
