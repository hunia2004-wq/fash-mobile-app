import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Block, Button } from 'galio-framework';

export default function ActivityScreen() {
  const [tab, setTab] = useState<'upcoming' | 'previous'>('upcoming');

  const upcoming = [
    { id: '1', date: 'Tue 24 Mar', status: 'Processing', price: 'EGP 235' },
  ];

  const previous = [
    { id: '2', date: 'Sat 11 Apr', status: 'Delivered', price: 'EGP 463.76' },
  ];

  const data = tab === 'upcoming' ? upcoming : previous;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity History</Text>

      <Block row style={styles.tabs}>
        <Button
          style={tab === 'upcoming' ? styles.activeTab : styles.inactiveTab}
          onPress={() => setTab('upcoming')}
        >
          Upcoming
        </Button>

        <Button
          style={tab === 'previous' ? styles.activeTab : styles.inactiveTab}
          onPress={() => setTab('previous')}
        >
          Previous
        </Button>
      </Block>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text>{item.date}</Text>
              <Text>{item.price}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', alignSelf: 'center', marginBottom: 20 },

  tabs: {
    marginBottom: 20,
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 5,
  },

  activeTab: { flex: 1, backgroundColor: '#C2185B' },
  inactiveTab: { flex: 1, backgroundColor: 'transparent' },

  card: { marginBottom: 15, borderRadius: 10 },

  status: { marginTop: 10, color: '#C2185B', fontWeight: 'bold' },
});
