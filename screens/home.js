import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Dimensions
} from 'react-native';
import { FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

function HomeContent() {

  const boutiqueItems = [
    { id: '1', label: 'Limited Editions', bid: true, image: require('../source/assets/images/bidnow.jpg') },
    { id: '2', label: 'Newborn\nAccessories', bid: false, image: require('../source/assets/images/newborn.jpg') },
    { id: '3', label: 'Exclusive\nFragrances', bid: false, image: require('../source/assets/images/perfume.jpg') },
  ];

  const sustainabilityItems = [
    { id: '1', label: 'FASH\nPacking', image: require('../source/assets/images/packing.png') },
    { id: '2', label: 'FASH\nDonation', image: require('../source/assets/images/donations.png') },
    { id: '3', label: 'FASH\nRent &\nBorrow', image: require('../source/assets/images/borrow.png') },
  ];

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require('../source/assets/images/Blacklogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* SEARCH */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={16} color="gray" style={{ marginRight: 8 }} />
          <TextInput placeholder="Search" style={styles.searchInput} placeholderTextColor="gray" />
          <FontAwesome name="microphone" size={16} color="gray" />
        </View>

        <TouchableOpacity style={styles.filterBtn}>
          <Feather name="sliders" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* BANNER */}
      <View style={styles.banner}>
        <Image
          source={require("../source/assets/images/headercropped.png")}
          style={styles.bannerImage}
          resizeMode="cover"
        />

        <Text style={styles.bannerAR}>AR</Text>
        <Text style={styles.bannerFASH}>FASH</Text>

        <View style={styles.bannerTrialBadge}>
          <Text style={styles.bannerTrialText}>TRIAL</Text>
        </View>
      </View>

      {/* DIGITAL CLOSET */}
      <Text style={styles.sectionTitle}>Your Digital Closet</Text>

      <View style={styles.closetRow}>

        <TouchableOpacity style={styles.closetCard}>
          <View>
            <Text style={styles.closetCardTitle}>My Wardrobe</Text>
            <Text style={styles.closetCardSub}>Organize &{"\n"}Visualize</Text>
          </View>

          <Ionicons name="phone-portrait-outline" size={26} color="#222" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.closetCard}>
          <View>
            <Text style={styles.closetCardTitle}>AI Styling</Text>
            <Text style={styles.closetCardSub}>Smart Outfit Picks</Text>
          </View>

          <Feather name="scissors" size={26} color="#222" />
        </TouchableOpacity>

      </View>

      {/* FASH BOUTIQUE */}
      <Text style={styles.sectionTitle}>Fash Boutique</Text>

      <View style={styles.boutiqueRow}>
        {boutiqueItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.boutiqueCard}>

            <Image
              source={item.image}
              style={styles.boutiqueImage}
              resizeMode="cover"
            />

            <Ionicons
              name="heart-outline"
              size={18}
              color="white"
              style={styles.heartIcon}
            />

            {item.bid && (
              <View style={styles.bidBadge}>
                <Text style={styles.bidText}>Bid Now</Text>
              </View>
            )}

            <Text style={styles.boutiqueLabel}>{item.label}</Text>

          </TouchableOpacity>
        ))}
      </View>

      {/* DOTS */}
      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>

      {/* SUSTAINABILITY HUB */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Sustainability Hub</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingLeft: 20 }}
      >
        {sustainabilityItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.sustainCard}>

            <Image
              source={item.image}
              style={styles.sustainImage}
              resizeMode="cover"
            />

            <Text style={styles.sustainLabel}>{item.label}</Text>

          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ height: 30 }} />

    </ScrollView>
  );
}

function WardrobeScreen() {
  return <View style={styles.placeholder}><Text>Digital Wardrobe</Text></View>;
}

function SearchScreen() {
  return <View style={styles.placeholder}><Text>Search</Text></View>;
}

function WishlistScreen() {
  return <View style={styles.placeholder}><Text>Wishlist</Text></View>;
}

function ProfileScreen() {
  return <View style={styles.placeholder}><Text>Profile</Text></View>;
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

      <Tab.Screen
        name="Home"
        component={HomeContent}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Upload"
        component={WardrobeScreen}
        options={{
          tabBarButton: () => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="shirt-outline" size={24} color="#999" />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarButton: () => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="upload" size={24} color="#999" />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="WishList"
        component={WishlistScreen}
        options={{
          tabBarButton: () => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="heart-outline" size={24} color="#999" />
            </View>
          ),
        }}
      />

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

const styles = StyleSheet.create({

  screen:{
    flex:1,
    backgroundColor:'#FAFAFA'
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
    height:50
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
    color:'#111',
    marginBottom:14,
    paddingHorizontal:20
  },

  closetRow:{
    flexDirection:'row',
    paddingHorizontal:20,
    gap:14,
    marginBottom:24
  },

  closetCard:{
    flex:1,
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
    justifyContent:'space-between'
  },

  boutiqueCard:{
    width:width*0.28,
    height:170,
    borderRadius:16,
    overflow:'hidden',
    justifyContent:'flex-end'
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
    padding:8
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
  }

});