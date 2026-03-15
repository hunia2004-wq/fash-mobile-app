import React, { useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { AuthContext } from "../App";

export default function ProfileScreen() {
  const { logOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>

      <Image
        source={{ uri: "https://i.pravatar.cc/150" }}
        style={styles.avatar}
      />

      <Text style={styles.name}>Sophia Ahmed</Text>
      <Text style={styles.email}>sophia@email.com</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

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
  container:{
    flex:1,
    alignItems:"center",
    backgroundColor:"#F5F5F5",
    paddingTop:60
  },

  avatar:{
    width:120,
    height:120,
    borderRadius:60,
    marginBottom:10
  },

  name:{
    fontSize:22,
    fontWeight:"bold"
  },

  email:{
    color:"gray",
    marginBottom:20
  },

  button:{
    backgroundColor:"#C17C74",
    padding:10,
    borderRadius:10,
    marginBottom:20
  },

  buttonText:{
    color:"white"
  },

  section:{
    width:"80%",
    marginTop:15
  },

  sectionTitle:{
    fontSize:18,
    fontWeight:"bold",
    marginBottom:5
  },

  logout:{
    marginTop:40
  },

  logoutText:{
    color:"#C17C74",
    fontWeight:"bold"
  }
});
