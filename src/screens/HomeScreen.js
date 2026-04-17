import React from "react";
import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { Searchbar } from "react-native-paper";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>


      <Text style={styles.logo}>FASH</Text>

      <Searchbar placeholder="Search" style={styles.search} />

      <Image
        source={require("../../assets/images/hero.jpg")}
        style={styles.image}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  logo: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  search: {
    marginVertical: 10,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 20,
  },
});
