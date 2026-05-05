import React, { useContext, useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, Dimensions,} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { updateProfile, uploadAvatar } from '../services/authService';
import { useFocusEffect } from "@react-navigation/native";
import { getProfile } from "../services/authService";
import { useCallback } from "react";

const { width } = Dimensions.get('window');
const avatarSize = width * 0.25;

export default function EditProfileScreen({ navigation, route }) {
  const { getToken } = useContext(AuthContext);
  const { user } = route.params;

  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [phone, setPhone] = useState(user.phoneNumber || '');
  const [avatar, setAvatar] = useState(user.avatar || null);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const token = await getToken();
        const profile = await getProfile(token);
        const data = profile?.data || profile;
  
        setUserData(data);
  
        // update fields with fresh data
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setUsername(data.username || '');
        setBio(data.bio || '');
        setPhone(data.phoneNumber || '');
        setAvatar(data.avatar || null);
      };
  
      fetchData();
    }, [])
  );
  

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatar(uri);
      try {
        const token = await getToken();
        await uploadAvatar(token, uri);
      } catch (e) {
        Alert.alert('Error', 'Failed to upload photo. Please try again.');
        console.warn('Avatar upload error:', e);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
  
    try {
      const token = await getToken();
  
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        phoneNumber: phone.trim(), 
      };
  
      console.log(payload);
      await updateProfile(token, payload);

    Alert.alert("Saved", "Profile updated successfully", [
      {
        text: "OK",
        onPress: () => {
          if (route.params?.refresh) {
            route.params.refresh();
          }
          navigation.goBack();
        },
      },
    ]);
  } catch (e) {
    console.warn(e);
    Alert.alert("Error", e.message || "Failed to save");
  } finally {
    setSaving(false);
  }
};

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

    return (
      <View style={styles.container}>

        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtn}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator size="small" color="#C17C74" />
              : <Text style={styles.saveBtn}>Save</Text>
            }
          </TouchableOpacity>
        </View>
  
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
  
          {/* avatar */}
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            <Image
              source={
                avatar ? { uri: avatar } :
                require('../source/assets/images/avatar.jpg')
              }
              style={styles.avatar}
            />
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>+</Text>
            </View>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>

        {/* editable fields */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Edit Profile</Text>

          <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>First Name</Text>
          <TextInput
             style={styles.input}
             value={firstName}
             onChangeText={setFirstName}
             placeholder="First name"
             placeholderTextColor="#B09090"
          />
          </View>

          <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Last Name</Text>
          <TextInput
             style={styles.input}
             value={lastName}
             onChangeText={setLastName}
             placeholder="Last name"
             placeholderTextColor="#B09090"
          />
          </View>


          <View style={[styles.fieldGroup]}>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="@username"
              placeholderTextColor="#B09090"
            />
          </View>


          <View style={[styles.fieldGroup]}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+20 000 00 00 000"
              placeholderTextColor="#B09090"
              keyboardType="phone-pad"
            />
          </View>

          

          <View style={[styles.fieldGroup]}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={styles.input}
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              placeholderTextColor="#B09090"
            />
          </View>

        </View>

        {/* read-only account info */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Account Information</Text>

          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>Email</Text>
            <Text style={styles.readOnlyValue}>{user.email}</Text>
          </View>

          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>Date Joined</Text>
            <Text style={styles.readOnlyValue}>{joinedDate}</Text>
          </View>

          <View style={[styles.readOnlyRow, styles.lastField]}>
            <Text style={styles.readOnlyLabel}>Account Type</Text>
            <Text style={styles.readOnlyValue}>{user.role || 'Standard'}</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C1F1F',
  },
  cancelBtn: {
    fontSize: 15,
    color: '#C17C74',
  },
  saveBtn: {
    fontSize: 15,
    color: '#C17C74',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 28,
    right: width / 2 - avatarSize / 2 - 4,
    backgroundColor: '#C17C74',
    width: avatarSize * 0.28,
    height: avatarSize * 0.28,
    borderRadius: (avatarSize * 0.28) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: avatarSize * 0.18,
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 13,
    color: '#B07070',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#F2E6E3',
    borderRadius: 16,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'black',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140,100,100,0.2)',
    paddingBottom: 14,
  },
  lastField: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  fieldLabel: {
    fontSize: 11,
    color: 'black',
    marginBottom: 6,
    fontWeight: '500',
  },

  input: {
    fontSize: 15,
    color: '#2C1F1F',
    paddingVertical: 0,
  },

  bioInput: {
    height: 70,
  },

  readOnlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140,100,100,0.2)',
  },
  readOnlyLabel: {
    fontSize: 14,
    color: '#7A6060',
  },
  readOnlyValue: {
    fontSize: 14,
    color: '#2C1F1F',
    fontWeight: '500',
  },
});