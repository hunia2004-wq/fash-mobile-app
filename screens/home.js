import { useState } from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Image, Dimensions,} from 'react-native';
import { FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from './profile'; 


import WardrobeScreen from './digital wardorbe/wardrobe';
import UploadScreen from './uploading/upload';
import SavedScreen from './favorites/saved';
 
const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
 
function HomeContent() {
 
  const boutiqueItems = [
    { id: '1', label: 'Limited Editions', bid: true, image: require('../source/assets/images/bidnow.png') },
    { id: '2', label: 'Newborn\nAccessories', bid: false, image: require('../source/assets/images/newborn.png') },
    { id: '3', label: 'Exclusive\nFragrances', bid: false, image: require('../source/assets/images/perfume.png') },
  ];
 
  const sustainabilityItems = [
    { id: '1', image: require('../source/assets/images/packing.png') },
    { id: '2', image: require('../source/assets/images/donations.png') },
    { id: '3', image: require('../source/assets/images/borrowcropped.png') },
  ];
 
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
 
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../source/assets/images/Blacklogo.png')}
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
        <TouchableOpacity style={styles.filterBtn}>
          <Feather name="sliders" size={20} color="gray" />
        </TouchableOpacity>
      </View>
 
      {/* Banner */}
      <View style={styles.banner}>
        <Image
          source={require('../source/assets/images/headercropped.png')}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>
 
      {/* Digital Closet */}
      <Text style={styles.sectionTitle}>Your Digital Closet</Text>
      <View style={styles.closetRow}>
        <TouchableOpacity style={styles.closetCard}>
          <View>
            <Text style={styles.closetCardTitle}>My Wardrobe</Text>
            <Text style={styles.closetCardSub}>Organize &{'\n'}Visualize</Text>
          </View>
          <Image
            source={require('../source/assets/images/wardrobecropped.png')}
            style={styles.closetCardImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.closetCard}>
          <View>
            <Text style={styles.closetCardTitle}>AI Styling</Text>
            <Text style={styles.closetCardSub}>Smart Outfit Picks</Text>
          </View>
          <Image
            source={require('../source/assets/images/aistyling.png')}
            style={styles.closetCardImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
 
      {/* Marketplace */}
      <Text style={styles.sectionTitle}>FASH Marketplace</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
        {boutiqueItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.boutiqueCard}>
            <Image source={item.image} style={styles.boutiqueImage} resizeMode="cover" />
            <Text style={styles.boutiqueLabel}>{item.label}</Text>
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
          <TouchableOpacity style={styles.auctionCard}>
            <Image source={require('../source/assets/images/shoes.png')} style={styles.auctionImage} resizeMode="contain" />
            <Text style={styles.itemName}>YSL Heels</Text>
            <Text style={styles.bidPrice}>Current bid: $400</Text>
            <Text style={styles.bidTime}>1h left</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.auctionCard}>
            <Image source={require('../source/assets/images/bag.png')} style={styles.auctionImage} resizeMode="contain" />
            <Text style={styles.itemName}>Miu Miu Bag</Text>
            <Text style={styles.bidPrice}>Current bid: $345</Text>
            <Text style={styles.bidTime}>2h left</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.bidButton}>
          <Text style={styles.bidButtonText}>Join the Auction</Text>
        </TouchableOpacity>
      </View>
 
      {/* FASH Share */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>FASH Share</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
        {sustainabilityItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.sustainCard}>
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
 
      {/* Tab 2 — Wardrobe (was placeholder) */}
      <Tab.Screen
        name="WardrobeTab"
        component={WardrobeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="shirt-outline" size={24} color={color} />
          ),
        }}
      />
 
      {/* Tab 3 — Upload (was SearchTab placeholder) */}
      <Tab.Screen
        name="UploadTab"
        component={UploadScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="upload" size={24} color={color} />
          ),
        }}
      />
 
      {/* Tab 4 — Saved / Wishlist (was WishList placeholder) */}
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

  bannerAR:{
    position:'absolute',
    top:20,
    right:20,
    fontSize:32,
    fontWeight:'bold',
    color:'white'
  },

  bannerFASH:{
    position:'absolute',
    top:55,
    right:20,
    fontSize:18,
    fontWeight:'600',
    color:'white'
  },

  bannerTrialBadge:{
    position:'absolute',
    bottom:16,
    left:16,
    backgroundColor:'#333',
    paddingHorizontal:12,
    paddingVertical:6,
    borderRadius:6
  },

  bannerTrialText:{
    color:'white',
    fontWeight:'bold',
    fontSize:12
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
    elevation:3
  },
  closetCardImage: {
    width: width * 0.18,
    height: width * 0.18,
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

  boutiqueRow:{
    flexDirection:'row',
    paddingHorizontal:20,
  },

  boutiqueCard:{
    width: width * 0.35,
    height:170,
    borderRadius:16,
    overflow:'hidden',
    justifyContent:'flex-end',
    marginRight:12
  },

  boutiqueImage:{
    position:'absolute',
    width:'100%',
    height:'100%'
  },

  heartIcon:{
    position:'absolute',
    top:8,
    right:8
  },

  boutiqueLabel:{
    color:'white',
    fontWeight:'600',
    fontSize:12,
    padding:8,
    textAlign: "center",
  },

  bidBadge:{
    position:'absolute',
    bottom:10,
    left:10,
    backgroundColor:'white',
    paddingHorizontal:10,
    paddingVertical:4,
    borderRadius:20
  },

  bidText:{
    fontSize:12,
    fontWeight:'600',
    color:'#333'
  },

  dots:{
    flexDirection:'row',
    justifyContent:'center',
    marginTop:10
  },

  dot:{
    width:6,
    height:6,
    borderRadius:3,
    backgroundColor:'#ccc',
    marginHorizontal:4
  },

  activeDot:{
    backgroundColor:'#C17C74'
  },

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