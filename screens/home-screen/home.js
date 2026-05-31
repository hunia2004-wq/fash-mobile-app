import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Image } from 'react-native';
import { FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../profile';
import { useNavigation } from "@react-navigation/native";
import WardrobeScreen from '../digital-wardrobe/wardrobe';
import UploadScreen from '../uploading/upload';
import SavedScreen from '../favorites/wishlist';
import { useTranslation } from 'react-i18next';
import { getAllAuctions } from '../../services/authService';
import { wp, hp, fp, SCREEN } from '../../utils/responsive';

const Tab = createBottomTabNavigator();

// Auction card size — accounts for biddingSection horizontal margins + internal padding
const boxSize = (SCREEN.width - wp(40) - wp(36)) / 2;

function HomeContent() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const boutiqueItems = [
    { id: '1', label: 'Limited Editions', bid: true, image: require('../../source/assets/images/bidnow.png') },
    { id: '2', label: 'Newborn Accessories', bid: false, image: require('../../source/assets/images/newborn.png') },
    { id: '3', label: 'Exclusive Fragrances', bid: false, image: require('../../source/assets/images/perfume.png') },
  ];

  const sustainabilityItems = [
    { id: '1', image: require('../../source/assets/images/packing.png'), screen: 'PackingBuilderscreen' },
    { id: '2', image: require('../../source/assets/images/donations.png'), screen: 'DonationScreen' },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [liveAuctions, setLiveAuctions] = useState([]);

  useEffect(() => {
    getAllAuctions()
      .then(data => {
        const all = (data.auctions ?? data ?? []);
        const live = all.filter(a =>
          a.title === 'YSL Tribute Heels' || a.title === 'miu min brown bag'
        );
        setLiveAuctions(live);
      })
      .catch(err => console.warn('Auction fetch failed:', err.message));
  }, []);

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
          <FontAwesome name="search" size={wp(16)} color="#C17C74" style={{ marginRight: wp(8) }} />
          <TextInput
            placeholder={t('search_placeholder')}
            style={styles.searchInput}
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                navigation.navigate('MarketplaceHome', { initialSearch: searchQuery.trim() });
                setSearchQuery('');
              }
            }}
          />
          <FontAwesome name="microphone" size={wp(16)} color="#C17C74" />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => navigation.navigate('MainCart')}>
          <Ionicons name="cart-outline" size={wp(20)} color="#C17C74" />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <TouchableOpacity style={styles.banner} onPress={() => navigation.navigate('ARscreen')} activeOpacity={0.92}>
        <Image source={require('../../source/assets/images/headercropped.png')} style={styles.bannerImage} resizeMode="cover" />
        <View style={styles.bannerOverlay} />
        <View style={styles.arLiveBadge}>
          <View style={styles.arLiveDot} />
          <Text style={styles.arLiveText}>AR</Text>
        </View>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{t('ar_title')}</Text>
          <Text style={styles.bannerSub}>{t('ar_sub')}</Text>
          <View style={styles.bannerBtn}>
            <Ionicons name="cube-outline" size={wp(14)} color="white" />
            <Text style={styles.bannerBtnText}>{t('ar_btn')}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Digital Closet */}
      <Text style={styles.sectionTitle}>{t('digital_closet')}</Text>
      <View style={styles.closetRow}>
        <TouchableOpacity
          style={[styles.closetCard, styles.closetCardActive]}
          onPress={() => navigation.navigate('FashCollectionScreen')}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.closetCardTitle}>{t('fash_collection')}</Text>
            <Text style={styles.closetCardSub}>{t('fash_collection_sub')}</Text>
          </View>
          <View style={styles.collectionIconBox}>
            <Ionicons name="bag-handle-outline" size={wp(28)} color="black" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closetCard} onPress={() => navigation.navigate("AIStylingScreen")}>
          <View style={{ flex: 1 }}>
            <Text style={styles.closetCardTitle}>{t('ai_styling')}</Text>
            <Text style={styles.closetCardSub}>{t('ai_styling_sub')}</Text>
          </View>
          <View style={styles.aiImageWrapper}>
            <Image source={require('../../source/assets/images/aistyling.png')} style={styles.aiStylingImage} resizeMode="contain" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Marketplace */}
      <Text style={styles.sectionTitle}>{t('marketplace')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: wp(20), paddingRight: wp(20) }}
      >
        {boutiqueItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.boutiqueCard} onPress={() => navigation.navigate("MarketplaceHome")}>
            <Image source={item.image} style={styles.boutiqueImage} resizeMode="cover" />
            <View style={styles.boutiqueLabelBtn}>
              <Text style={styles.boutiqueLabel}>{item.label}</Text>
              <Ionicons name="arrow-forward" size={wp(12)} color="#9B5E58" style={{ marginLeft: wp(4) }} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Live Bidding */}
      <View style={styles.biddingSection}>
        <View style={styles.biddingHeader}>
          <View style={styles.liveDot} />
          <Text style={styles.biddingTitle}>{t('live_bidding')}</Text>
        </View>
        <Text style={styles.biddingSubtitle}>{t('live_bidding_sub')}</Text>

        <View style={styles.auctionRow}>
          {liveAuctions.length === 0 ? (
            <Text style={{ color: '#888', fontSize: fp(13), paddingVertical: hp(10) }}>
              No live auctions right now
            </Text>
          ) : (
            liveAuctions.map(auction => {
              const diff = new Date(auction.endTime) - new Date();
              const h = Math.floor(diff / 3600000);
              const m = Math.floor((diff % 3600000) / 60000);
              const timeLabel = h > 0 ? `${h}h ${m}m left` : `${m}m left`;
              return (
                <TouchableOpacity
                  key={auction._id}
                  style={styles.auctionCard}
                  onPress={() => navigation.navigate('AuctionRoomScreen', { auctionId: auction._id })}
                  activeOpacity={0.88}
                >
                  {auction.images?.[0] ? (
                    <Image source={{ uri: auction.images[0] }} style={styles.auctionImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.auctionImage, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="shirt-outline" size={wp(32)} color="#C17C74" />
                    </View>
                  )}
                  <Text style={styles.itemName} numberOfLines={1}>{auction.title}</Text>
                  <Text style={styles.bidPrice}>EGP {auction.currentBid}</Text>
                  <Text style={styles.bidTime}>{timeLabel}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <TouchableOpacity style={styles.bidButton} onPress={() => navigation.navigate("AuctionListScreen")}>
          <Text style={styles.bidButtonText}>{t('join_auction')}</Text>
        </TouchableOpacity>
      </View>

      {/* FASH Share */}
      <Text style={[styles.sectionTitle, { marginTop: hp(24) }]}>{t('fash_share')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: wp(20), paddingRight: wp(20) }}
      >
        {sustainabilityItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.sustainCard} onPress={() => navigation.navigate(item.screen)}>
            <Image source={item.image} style={styles.sustainImage} resizeMode="cover" />
            <Text style={styles.sustainLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ height: hp(30) }} />
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
      <Tab.Screen name="HomeTab" component={HomeContent} options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={wp(24)} color={color} /> }} />
      <Tab.Screen name="WardrobeTab" component={WardrobeScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="shirt-outline" size={wp(24)} color={color} /> }} />
      <Tab.Screen name="UploadTab" component={UploadScreen} options={{ tabBarIcon: ({ color }) => <Feather name="upload" size={wp(24)} color={color} /> }} />
      <Tab.Screen name="SavedTab" component={SavedScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="heart-outline" size={wp(24)} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={wp(24)} color={color} /> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },

  header: { paddingTop: hp(60), paddingBottom: hp(10), alignItems: 'center' },
  logo: { width: wp(120), height: hp(50) },

  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(20), marginBottom: hp(16), gap: wp(10) },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: wp(12), paddingHorizontal: wp(14), paddingVertical: hp(10) },
  searchInput: { flex: 1, fontSize: fp(15), color: '#333' },
  filterBtn: { backgroundColor: '#f0f0f0', padding: wp(10), borderRadius: wp(12) },

  banner: { marginHorizontal: wp(20), marginBottom: hp(24), borderRadius: wp(20), overflow: 'hidden', height: hp(200) },
  bannerImage: { width: '100%', height: '100%', position: 'absolute' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  arLiveBadge: { position: 'absolute', top: hp(14), right: wp(14), flexDirection: 'row', alignItems: 'center', gap: wp(5), backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', paddingHorizontal: wp(10), paddingVertical: hp(5), borderRadius: wp(20) },
  arLiveDot: { width: wp(7), height: wp(7), borderRadius: wp(4), backgroundColor: '#FF4D4D' },
  arLiveText: { color: 'white', fontWeight: '700', fontSize: fp(12) },
  bannerContent: { position: 'absolute', bottom: hp(18), left: wp(18) },
  bannerTitle: { color: 'white', fontSize: fp(22), fontWeight: '700', marginBottom: hp(4) },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: fp(12), marginBottom: hp(12) },
  bannerBtn: { flexDirection: 'row', alignItems: 'center', gap: wp(6), backgroundColor: '#C17C74', paddingHorizontal: wp(16), paddingVertical: hp(8), borderRadius: wp(20), alignSelf: 'flex-start' },
  bannerBtnText: { color: 'white', fontWeight: '700', fontSize: fp(13) },

  sectionTitle: { fontSize: fp(18), fontWeight: '600', color: '#C17C74', marginBottom: hp(14), paddingHorizontal: wp(20) },

  closetRow: { flexDirection: 'row', paddingHorizontal: wp(20), justifyContent: 'space-between', marginBottom: hp(24) },
  closetCard: { width: (SCREEN.width - wp(20) * 2 - wp(12)) / 2, backgroundColor: 'white', borderRadius: wp(16), padding: wp(16), minHeight: hp(90), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 3, borderColor: '#F2E6E3', borderWidth: 4, overflow: 'hidden' },
  closetCardTitle: { fontSize: fp(15), fontWeight: '600', color: '#111', marginBottom: hp(4) },
  closetCardSub: { fontSize: fp(12), color: 'gray', lineHeight: hp(18) },
  aiImageWrapper: { width: wp(50), height: wp(50), flexShrink: 0, overflow: 'hidden' },
  aiStylingImage: { width: '100%', height: '100%' },
  collectionIconBox: { flexShrink: 0 },

  boutiqueCard: { width: wp(155), borderRadius: wp(16), overflow: 'hidden', marginRight: wp(12), backgroundColor: 'white' },
  boutiqueImage: { width: '100%', height: hp(155) },
  boutiqueLabelBtn: { backgroundColor: '#F6E9E6', paddingVertical: hp(10), paddingHorizontal: wp(12), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#E8D0CC' },
  boutiqueLabel: { color: 'black', fontWeight: '600', fontSize: fp(12), textAlign: 'center' },

  sustainCard: { width: wp(140), height: hp(120), borderRadius: wp(18), marginRight: wp(12), overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  sustainImage: { position: 'absolute', width: '100%', height: '100%' },
  sustainLabel: { color: 'white', fontWeight: 'bold', fontSize: fp(16), textAlign: 'center' },

  tabBar: { height: hp(70), paddingBottom: hp(10), paddingTop: hp(10), backgroundColor: 'white', borderTopWidth: 0, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8 },

  biddingSection: { backgroundColor: "#F6E9E6", padding: wp(18), borderRadius: wp(16), marginVertical: hp(20), marginTop: hp(50), marginHorizontal: wp(20) },
  biddingHeader: { flexDirection: "row", alignItems: "center", marginBottom: hp(5) },
  liveDot: { width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: "red", marginRight: wp(6) },
  biddingTitle: { fontSize: fp(18), fontWeight: "bold" },
  biddingSubtitle: { color: "#666", marginBottom: hp(15), fontSize: fp(13) },

  auctionRow: { flexDirection: "row", justifyContent: "space-between" },
  auctionCard: { width: boxSize, borderRadius: wp(12), backgroundColor: "#F5F5F5", overflow: "hidden", marginBottom: hp(20) },
  auctionImage: { width: "100%", height: boxSize * 0.65, borderTopLeftRadius: wp(12), borderTopRightRadius: wp(12) },
  itemName: { fontWeight: "600", marginTop: hp(6), textAlign: "center", fontSize: fp(13) },
  bidPrice: { fontWeight: "bold", color: "#C17C74", textAlign: "center", fontSize: fp(13) },
  bidTime: { fontSize: fp(12), color: "#888", marginBottom: hp(20), textAlign: "center" },

  bidButton: { borderRadius: wp(10), overflow: 'hidden' },
  bidButtonText: { textAlign: "center", padding: hp(15), borderRadius: wp(10), alignItems: "center", backgroundColor: "white", borderWidth: 1.5, borderColor: "#C17C74", fontSize: fp(14) },
});