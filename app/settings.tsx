import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, List, Divider } from 'react-native-paper';
import { router } from 'expo-router';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <List.Section>

        <List.Item
          title="Edit Profile"
          left={() => <List.Icon icon="account" />}
          onPress={() => router.push('/profile')}
        />

        <List.Item
          title="Activity"
          description="Upcoming & Previous Orders"
          left={() => <List.Icon icon="history" />}
          onPress={() => router.push('/activity')}
        />

        <List.Item
          title="Notifications"
          left={() => <List.Icon icon="bell" />}
          onPress={() => router.push('/notifications')}
        />

        <List.Item
          title="Language"
          left={() => <List.Icon icon="translate" />}
          onPress={() => router.push('/language')}
        />

        <Divider />

        <List.Item
          title="Logout"
          titleStyle={{ color: 'red', textAlign: 'center' }}
          onPress={() => console.log('Logout')}
        />

      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
});
