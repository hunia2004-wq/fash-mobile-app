import { useState } from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Image, Dimensions,} from 'react-native';
import { FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../profile'; 
import { useNavigation } from "@react-navigation/native";


import WardrobeScreen from '../digital-wardrobe/wardrobe';
import UploadScreen from '../uploading/upload';
import SavedScreen from '../favorites/wishlist';
 
const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
 
function HomeContent() {
  const navigation = useNavigation();

  const boutiqueItems = [
    { id: '1', label: 'Limited Editions', bid: true, image: require('../../source/assets/images/bidnow.png') },
    { id: '2', label: 'Newborn Accessories', bid: false, image: require('../../source/assets/images/newborn.png') },
    { id: '3', label: 'Exclusive Fragrances', bid: false, image: require('../../source/assets/images/perfume.png') },
  ];

  const sustainabilityItems = [
    { 
      id: '1', 
      image: require('../../source/assets/images/packing.png'),
      screen: 'PackingBuilderscreen'
    },
    { 
      id: '2', 
      image: require('../../source/assets/images/donations.png'),
      screen: 'DonationScreen'
    },
  ];

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../source/assets/images/Blacklogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={16} color="#C17C74" style={{ marginRight: 8 }} />
          <TextInput placeholder="Search" style={styles.searchInput} placeholderTextColor="gray" />
          <FontAwesome name="microphone" size={16} color="#C17C74" />
        </View>

        {/* Filter */}
        <TouchableOpacity style={styles.filterBtn}>
          <Feather name="sliders" size={20} color="#C17C74" />
        </TouchableOpacity>

        {/* CART ICON ADDED */}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => navigation.navigate('MainCart')}
        >
          <Ionicons name="cart-outline" size={20} color="#C17C74" />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Image
          source={require('../../source/assets/images/headercropped.png')}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>

      {/* Digital Closet */}
      <Text style={styles.sectionTitle}>Your Digital Closet</Text>
      <View style={styles.closetRow}>
        <TouchableOpacity
          style={[styles.closetCard, styles.closetCardActive]}
          onPress={() => navigation.navigate('FashCollectionScreen')}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.closetCardTitle}>FASH Collection</Text>
            <Text style={styles.closetCardSub}>Shop exclusive{'\n'}drops</Text>
          </View>
          <View style={styles.collectionIconBox}>
            <Ionicons name="bag-handle-outline" size={28} color="black" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closetCard}
          onPress={() => navigation.navigate("AIStylingScreen")}
        >
          <View>
            <Text style={styles.closetCardTitle}>AI Styling</Text>
            <Text style={styles.closetCardSub}>Smart Outfit Picks</Text>
          </View>
          <View style={styles.aiImageWrapper}>
            <Image
              source={require('../../source/assets/images/aistyling.png')}
              style={styles.aiStylingImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Marketplace */}
      <Text style={styles.sectionTitle}>FASH Marketplace</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
      {boutiqueItems.map((item) => (
  <TouchableOpacity
    key={item.id}
    style={styles.boutiqueCard}
    onPress={() => navigation.navigate("MarketplaceHome")}
  >
    <Image source={item.image} style={styles.boutiqueImage} resizeMode="cover" />
    <View style={styles.boutiqueLabelBtn}>
      <Text style={styles.boutiqueLabel}>{item.label}</Text>
    </View>
  </TouchableOpacity>
))}
      </ScrollView>

      {/* Live Bidding */}
      <View style={styles.biddingSection}>
        <View style={styles.biddingHeader}>
          <Text style={styles.liveDot}></Text>
          <Text style={styles.biddingTitle}>LIVE BIDDING</Text>
        </View>
        <Text style={styles.biddingSubtitle}>Bid on exclusive pieces before they're gone</Text>

        <View style={styles.auctionRow}>
          <TouchableOpacity style={styles.auctionCard} onPress={() => navigation.navigate('AuctionRoomScreen')}>
            <Image source={require('../../source/assets/images/shoes.png')} style={styles.auctionImage} resizeMode="contain" />
            <Text style={styles.itemName}>YSL Tribute Heels</Text>
            <Text style={styles.bidPrice}>Current bid: $400</Text>
            <Text style={styles.bidTime}>1h left</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.auctionCard}>
            <Image source={require('../../source/assets/images/bag.png')} style={styles.auctionImage} resizeMode="contain" />
            <Text style={styles.itemName}>Miu Miu Bag</Text>
            <Text style={styles.bidPrice}>Current bid: $345</Text>
            <Text style={styles.bidTime}>2h left</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.bidButton}
          onPress={() => navigation.navigate("AuctionListScreen")}
        >
          <Text style={styles.bidButtonText}>Join the Auction</Text>
        </TouchableOpacity>
      </View>

      {/* FASH Share */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>FASH Share</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
        {sustainabilityItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.sustainCard}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Image source={item.image} style={styles.sustainImage} resizeMode="cover" />
            <Text style={styles.sustainLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}
 
export default function HomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#C17C74',
        tabBarInactiveTintColor: '#999',
      }}
    >
      {/* Tab 1 — Home */}
      <Tab.Screen
        name="HomeTab"
        component={HomeContent}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
 
      {/* Tab 2 — Wardrobe */}
      <Tab.Screen
        name="WardrobeTab"
        component={WardrobeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="shirt-outline" size={24} color={color} />
          ),
        }}
      />
 
      {/* Tab 3 — Upload */}
      <Tab.Screen
        name="UploadTab"
        component={UploadScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="upload" size={24} color={color} />
          ),
        }}
      />
 
      {/* Tab 4 — Saved / Wishlist */}
      <Tab.Screen
        name="SavedTab"
        component={SavedScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={24} color={color} />
          ),
        }}
      />
 
      {/* Tab 5 — Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
 
const boxSize = width * 0.45;

const styles = StyleSheet.create({

  screen:{
    flex:1,
    backgroundColor:'#F5F5F5'
  },

  placeholder:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },

  header:{
    paddingTop:60,
    paddingBottom:10,
    alignItems:'center'
  },

  logo:{
    width:120,
    height:50,
  },

  searchRow:{
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal:20,
    marginBottom:16,
    gap:10
  },

  searchBar:{
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#f0f0f0',
    borderRadius:12,
    paddingHorizontal:14,
    paddingVertical:10
  },

  searchInput:{
    flex:1,
    fontSize:15,
    color:'#333'
  },

  filterBtn:{
    backgroundColor:'#f0f0f0',
    padding:10,
    borderRadius:12
  },

  banner:{
    marginHorizontal:20,
    marginBottom:24,
    borderRadius:16,
    overflow:'hidden',
    height:180
  },
  
  bannerImage:{
    width:'100%',
    height:'100%',
  },

  sectionTitle:{
    fontSize:18,
    fontWeight:'600',
    color:'#C17C74',
    marginBottom:14,
    paddingHorizontal:20
  },

  closetRow:{
    flexDirection:'row',
    paddingHorizontal:20,
    justifyContent:'space-between',
    marginBottom:24
  },

  closetCard:{
    width: width * 0.43,
    backgroundColor:'white',
    borderRadius:16,
    padding:16,
    minHeight:90,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    shadowColor:'#000',
    shadowOpacity:0.05,
    shadowRadius:6,
    elevation:3,
    borderColor: '#F2E6E3',
    borderWidth: 4,
    overflow: 'hidden', // prevents image from bleeding outside card
  },

  closetCardTitle:{
    fontSize:15,
    fontWeight:'600',
    color:'#111',
    marginBottom:4
  },

  closetCardSub:{
    fontSize:12,
    color:'gray',
    lineHeight:18
  },

  // FIX: constrained wrapper so AI Styling image stays inside the card
  aiImageWrapper: {
    width: width * 0.13,
    height: width * 0.13,
    flexShrink: 0,
    overflow: 'hidden',
  },

  aiStylingImage: {
    width: '100%',
    height: '100%',
  },

  collectionIconBox: {
    flexShrink: 0,
  },

  // FIX: boutique card now has a white bg and label rendered below the image
  boutiqueCard: {
    width: width * 0.35,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: 'white',
  },
  
  boutiqueImage: {
    width: '100%',
    height: 155.5,
  },
  
  boutiqueLabelBtn: {
    backgroundColor: '#F6E9E6',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',      // centers horizontally
    justifyContent: 'center',  // centers vertically
    minHeight: 40,
  },
  
  boutiqueLabel: {
    color: 'black',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'center',
  },
  
  // remove boutiqueLabelBtn and boutiqueLabel entirely

  sustainCard:{
    width:140,
    height:120,
    borderRadius:18,
    marginRight:12,
    overflow:'hidden',
    justifyContent:'center',
    alignItems:'center'
  },

  sustainImage:{
    position:'absolute',
    width:'100%',
    height:'100%'
  },

  sustainLabel:{
    color:'white',
    fontWeight:'bold',
    fontSize:16,
    textAlign:'center'
  },

  tabBar:{
    height:70,
    paddingBottom:10,
    paddingTop:10,
    backgroundColor:'white',
    borderTopWidth:0,
    elevation:10,
    shadowColor:'#000',
    shadowOffset:{ width:0,height:-2 },
    shadowOpacity:0.08,
    shadowRadius:8
  },

  biddingSection: {
    backgroundColor: "#F6E9E6",
    padding: 18,
    borderRadius: 16,
    marginVertical: 20,
    marginTop: 50,
  },
  
  biddingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5
  },
  
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    marginRight: 6
  },
  
  biddingTitle: {
    fontSize: 18,
    fontWeight: "bold"
  },
  
  biddingSubtitle: {
    color: "#666",
    marginBottom: 15
  },
  
  auctionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  
  auctionCard: {
    width: boxSize,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    overflow: "hidden",      
    marginBottom: 20,
  },
  
  auctionImage: {
    width: "100%",            
    height: boxSize * 0.65,   
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  
  itemName: {
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  
  bidPrice: {
    fontWeight: "bold",
    color: "#C17C74",
    textAlign: "center",
  },
  
  bidTime: {
    fontSize: 12,
    color: "#888",
    marginBottom: 20,
    textAlign: "center",
  },
  
  bidButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },

  bidButtonText: {
    textAlign: "center",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#C17C74",
  },

});