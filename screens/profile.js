import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { AuthContext } from "../App";
import { getProfile } from "../services/authService";
import * as ImagePicker from "expo-image-picker";
import { Feather } from '@expo/vector-icons';

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

  const [personalOpen, setPersonalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

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
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission is required to choose an image!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
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
          Failed to load profile.
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>


      {/*profile header*/}
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
                borderRadius: avatarSize / 2,
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
              alignItems: "center",
            }}
          >           
           <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: avatarSize * 0.2,
              }}
            >
              +</Text>
          </View>
        </TouchableOpacity>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/*edit button*/}
        <TouchableOpacity style={styles.editButton}>
        <Feather name="edit-2" size={16} color="white" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>


      <View style={styles.box}>
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setPersonalOpen(!personalOpen)}
        >
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text>{personalOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {personalOpen && (
          <>
            <MenuItem title="Full Name:" />
            <MenuItem title="Username:" />
            <MenuItem title="Email:" />
            <MenuItem title="Phone Number:" />
            <MenuItem title="Bio:" />
          </>
        )}
      </View>


      <View style={styles.box}>
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setOrdersOpen(!ordersOpen)}
        >
          <Text style={styles.sectionTitle}>Order History</Text>
          <Text>{ordersOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {ordersOpen && (
          <>
            <MenuItem title="View Orders" />
            <MenuItem title="Track Orders" />
            <MenuItem title="Returns" />
          </>
        )}
      </View>

      <View style={styles.box}>
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setSettingsOpen(!settingsOpen)}
        >
          <Text style={styles.sectionTitle}>Settings</Text>
          <Text>{settingsOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {settingsOpen && (
          <>
            <MenuItem title="Change Password" />
            <MenuItem title="Privacy Settings" />
            <MenuItem title="Notification Settings" />
            <MenuItem title="Language Preferences" />
          </>
        )}
      </View>

<View style={styles.box}>
  <TouchableOpacity
    style={styles.dropdownHeader}
    onPress={() => setActivityOpen(!activityOpen)}
  >
    <Text style={styles.sectionTitle}>Activity</Text>
    <Text>{activityOpen ? "▲" : "▼"}</Text>
  </TouchableOpacity>
  {activityOpen && (
    <>
      <MenuItem title="Orders" />
      <MenuItem title="Favorites / Wishlist" />
      <MenuItem title="Saved Items" />
    </>
  )}
</View>

<View style={styles.box}>
  <TouchableOpacity
    style={styles.dropdownHeader}
    onPress={() => setSecurityOpen(!securityOpen)}
  >
    <Text style={styles.sectionTitle}>Security</Text>
    <Text>{securityOpen ? "▲" : "▼"}</Text>
  </TouchableOpacity>
  {securityOpen && (
    <>
      <MenuItem title="Two-Factor Authentication" />
      <MenuItem title="Login Devices" />
      <MenuItem title="Connected Accounts" />
    </>
  )}
</View>

<View style={styles.box}>
  <TouchableOpacity
    style={styles.dropdownHeader}
    onPress={() => setSupportOpen(!supportOpen)}
  >
    <Text style={styles.sectionTitle}>Support</Text>
    <Text>{supportOpen ? "▲" : "▼"}</Text>
  </TouchableOpacity>
  {supportOpen && (
    <>
      <MenuItem title="Help Center" />
      <MenuItem title="Contact Support" />
      <MenuItem title="FAQ" />
    </>
  )}
</View>


      <TouchableOpacity style={styles.logoutbutton} onPress={logOut}>
        <Text style={styles.logoutbuttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#F5F5F5",        
      },
      content: {
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-start",
        marginTop: height * 0.15, // push avatar & name lower
      },
      avatarWrapper: {
        marginBottom: 20,
      },
      userInfoContainer: {
        alignItems: "center",
        marginTop: 10,
      },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    color: "gray",
    marginTop: 8,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#C17C74",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 15
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  box: {
    backgroundColor: "#F2E6E3",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    marginTop: 5,
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
  },
  logoutbuttonText: {
    color: "#C17C74",
    fontWeight: "bold",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
