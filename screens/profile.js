import React, { useContext, useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions, } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { getProfile } from "../services/authService";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const avatarSize = width * 0.22;

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>
      {value || "—"}
    </Text>
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
      setLoading(true);
      const token = await getToken();
      if (!token) {
        console.warn("No token found");
        setUser(null);
        return;
      }
      const profile = await getProfile(token);
      setUser(profile?.data || profile);
    } catch (e) {
      console.warn("FULL ERROR:", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

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

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* HERO */}
      <View style={styles.heroSection}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
          <Image
            source={
              avatar
                ? { uri: avatar }
                : user.avatar
                  ? { uri: user.avatar }
                  : require("../source/assets/images/avatar.jpg")
            }
            style={styles.avatar}
          />
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>+</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{fullName || "No Name"}</Text>
        <Text style={styles.email}>{user.email}</Text>

        {/* ── Points chip ── */}
        <View style={styles.pointsChipRow}>
          <View style={styles.pointsChip}>
            <Text style={styles.pointsChipNum}>{user.points ?? 0}</Text>
            <Text style={styles.pointsChipLabel}>reward points</Text>
          </View>
          <View style={styles.pointsChipDivider} />
          <View>
            <Text style={styles.pointsChipHint}>Donate clothes</Text>
            <Text style={[styles.pointsChipHint, { fontWeight: '600' }]}
            onPress={() => navigation.navigate('DonationScreen')}>to earn more ›</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProfileScreen", { user, refresh: fetchUser })}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* PROFILE INFO */}
      <View style={styles.card}>
        <Text style={styles.cardSectionLabel}>Profile Information</Text>

        <InfoRow label="First Name" value={user.firstName} />
        <InfoRow label="Last Name" value={user.lastName} />
        <InfoRow label="Username" value={user.username} />
        <InfoRow label="Bio" value={user.bio} />
        <InfoRow label="Phone" value={user.phoneNumber} />

        <View style={styles.cardDivider} />

        <Text style={styles.cardSectionLabel}>Account Information</Text>

        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Date Joined" value={joinedDate} />
        <InfoRow label="Account Type" value={user.role || "Standard"} />
      </View>

      {/* MENU */}
      <View style={styles.card}>
        <MenuRow title="Settings" onPress={() => navigation.navigate("SettingsScreen")} />
        <View style={styles.rowDivider} />

        <MenuRow title="Orders" onPress={() => navigation.navigate("OrdersScreen")} />
        <View style={styles.rowDivider} />

        <MenuRow title="Security" onPress={() => navigation.navigate("SecurityScreen")} />
        <View style={styles.rowDivider} />

        <MenuRow title="Support" onPress={() => navigation.navigate("SupportScreen")} />
        <View style={styles.rowDivider} />

        <MenuRow title="Premium Plan" onPress={() => navigation.navigate("Premium")} />
        
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#F5F5F5" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },

  heroSection: {
    alignItems: "center",
    paddingTop: height * 0.08,
    paddingBottom: 24,
  },

  avatarWrapper: { marginBottom: 14 },

  avatar: {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
  },

  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#C17C74",
    width: avatarSize * 0.28,
    height: avatarSize * 0.28,
    borderRadius: (avatarSize * 0.28) / 2,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: avatarSize * 0.18,
  },

  name: { fontSize: 22, fontWeight: "700", color: "#2C1F1F" },
  email: { fontSize: 13, color: "black", marginBottom: 16 },

  editButton: {
    backgroundColor: "#C17C74",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 10,
  },

  editButtonText: { color: "white", fontWeight: "bold" },

  card: {
    backgroundColor: "#F2E6E3",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  cardSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "black",
    marginBottom: 10,
    textTransform: "uppercase",
  },

  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(140,100,100,0.3)",
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  infoLabel: { fontSize: 13, color: "black" },
  infoValue: {
    fontSize: 13,
    color: "#2C1F1F",
    fontWeight: "500",
    textAlign: "right",
  },

  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
  },

  menuRowTitle: { fontSize: 15, fontWeight: "600" },
  menuRowSubtitle: { fontSize: 12, color: "#7A6060" },
  menuRowChevron: { fontSize: 20, color: "#B09090" },

  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(140,100,100,0.15)",
  },

  logoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#C17C74",
  },

  logoutButtonText: {
    color: "#C17C74",
    fontWeight: "bold",
    fontSize: 16,
  },

  pointsChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  pointsChip: {
    backgroundColor: '#FAECE7',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 0.5,
    borderColor: '#F0997B',
  },
  pointsChipNum: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4A1B0C',
    lineHeight: 20,
  },
  pointsChipLabel: {
    fontSize: 11,
    color: '#993C1D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointsChipDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: '#F0997B',
  },
  pointsChipHint: {
    fontSize: 11,
    color: '#993C1D',
    lineHeight: 18,
  },
});