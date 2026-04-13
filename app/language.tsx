import { View, StyleSheet } from 'react-native';
import { Text, List } from 'react-native-paper';

export default function Language() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Language</Text>

      <List.Item title="English" />
      <List.Item title="Arabic" />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
});
