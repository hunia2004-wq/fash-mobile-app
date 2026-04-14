import React, { useContext, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  ActivityIndicator, ScrollView, Dimensions,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { getProfile } from "../services/authService";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");
const avatarSize = width * 0.22;

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value || "—"}</Text>
  </View>
);

const MenuRow = ({ title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuRowLeft}>
      <Text style={styles.menuRowTitle}>{title}</Text>
      {subtitle ? <Text style={styles.menuRowSubtitle}>{subtitle}</Text> : null}
    </View>
    <Text style={styles.menuRowChevron}>›</Text>
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { logOut, getToken } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);

  const fetchUser = async () => {
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

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchUser);
    return unsubscribe;
  }, [navigation]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
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
        <Text style={{ color: "#7A6060" }}>Failed to load profile.</Text>
      </View>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <View style={styles.heroSection}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
          <Image
            source={
              avatar ? { uri: avatar } :
              user.avatar ? { uri: user.avatar } :
              require("../source/assets/images/avatar.jpg")
            }
            style={styles.avatar}
          />
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>+</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{fullName || 'No Name'}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProfileScreen", { user })}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Profile + Account Info */}
      <View style={styles.card}>
        <Text style={styles.cardSectionLabel}>Profile Information</Text>
        <InfoRow label="First Name" value={user.firstName} />
        <InfoRow label="Last Name" value={user.lastName} />
        <InfoRow label="Username" value={user.username} />
        <InfoRow label="Bio" value={user.bio} />
        <InfoRow label="Phone" value={user.phone} />

        <View style={styles.cardDivider} />

        <Text style={styles.cardSectionLabel}>Account Information</Text>
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Date Joined" value={joinedDate} />
        <InfoRow label="Account Type" value={user.role || "Standard"} />
      </View>

      {/* Menu */}
      <View style={styles.card}>
        <MenuRow
          title="Settings"
          subtitle="Email, Password, Notifications, Language, Privacy"
          onPress={() => navigation.navigate("SettingsScreen")}
        />
        <View style={styles.rowDivider} />
        <MenuRow
          title="Orders"
          subtitle="Orders, Order Details"
          onPress={() => navigation.navigate("OrdersScreen")}
        />
        <View style={styles.rowDivider} />
        <MenuRow
          title="Security"
          subtitle="2FA, Active devices, Connected accounts"
          onPress={() => navigation.navigate("SecurityScreen")}
        />
        <View style={styles.rowDivider} />
        <MenuRow
          title="Support"
          subtitle="Help & Guides, Contact support, FAQ"
          onPress={() => navigation.navigate("SupportScreen")}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#F5F5F5" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" },
  heroSection: { alignItems: "center", paddingTop: height * 0.08, paddingBottom: 24 },
  avatarWrapper: { marginBottom: 14 },
  avatar: { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
  avatarBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#C17C74", width: avatarSize * 0.28, height: avatarSize * 0.28, borderRadius: (avatarSize * 0.28) / 2, justifyContent: "center", alignItems: "center" },
  avatarBadgeText: { color: "white", fontWeight: "bold", fontSize: avatarSize * 0.18 },
  name: { fontSize: 22, fontWeight: "700", color: "#2C1F1F", marginBottom: 4 },
  email: { fontSize: 13, color: "black", marginBottom: 16 },
  editButton: { alignSelf: "center", backgroundColor: "#C17C74", paddingHorizontal: 40, paddingVertical: 10, borderRadius: 10, marginBottom: 15 },
  editButtonText: { color: "white", fontWeight: "bold" },
  card: { backgroundColor: "#F2E6E3", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14 },
  cardSectionLabel: { fontSize: 11, fontWeight: "700", color: "black", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10, marginTop: 4 },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(140,100,100,0.3)", marginVertical: 14 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(140,100,100,0.15)" },
  infoLabel: { fontSize: 13, color: "black", flex: 1 },
  infoValue: { fontSize: 13, color: "#2C1F1F", fontWeight: "500", flex: 2, textAlign: "right" },
  menuRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13 },
  menuRowLeft: { flex: 1 },
  menuRowTitle: { fontSize: 15, fontWeight: "600", color: "#2C1F1F" },
  menuRowSubtitle: { fontSize: 12, color: "#7A6060", marginTop: 2 },
  menuRowChevron: { fontSize: 20, color: "#B09090" },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(140,100,100,0.15)" },
  logoutButton: { padding: 15, borderRadius: 10, alignItems: "center", backgroundColor: "white", borderWidth: 1.5, borderColor: "#C17C74" },
  logoutButtonText: { color: "#C17C74", fontWeight: "bold", fontSize: 16 },
});