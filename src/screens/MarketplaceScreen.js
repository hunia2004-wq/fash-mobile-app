import React, { useState, useMemo } from 'react';
import {
View, Text, ScrollView, StyleSheet, TouchableOpacity,
StatusBar, Image, TextInput, Dimensions,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, CATEGORIES, SAMPLE_ITEMS } from './marketplaceData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const TIPS = [
{ icon: 'storefront-outline', lib: 'ion', title: 'Browse listings', sub: 'Shop from FASH & C2C sellers' },
{ icon: 'heart-outline', lib: 'ion', title: 'Save favourites', sub: 'Wishlist items you love' },
{ icon: 'add-circle-outline', lib: 'ion', title: 'List your items', sub: 'Sell clothes from your wardrobe' },
];

const TipIcon = ({ icon, lib }) => {
if (lib === 'mci') return <MaterialCommunityIcons name={icon} size={20} color={COLORS.accent} />;
return <Ionicons name={icon} size={20} color={COLORS.accent} />;
};

const ConditionBadge = ({ condition }) => (
<View
style={[
styles.conditionBadge,
{ backgroundColor: condition === 'Like New' ? '#e8f5e9' : '#fff8e1' },
]}
>
<Text
style={[
styles.conditionText,
{ color: condition === 'Like New' ? '#388e3c' : '#f9a825' },
]}
>
{condition}
</Text>
</View>
);

export default function MarketplaceScreen({ navigation }) {
const [savedItems, setSavedItems] = useState({});
const [activeCategory, setActiveCategory] = useState('All');
const [searchQuery, setSearchQuery] = useState('');
const [showSearch, setShowSearch] = useState(false);

const toggleSave = (id, e) => {
e.stopPropagation();
setSavedItems((prev) => ({ ...prev, [id]: !prev[id] }));
};

const filteredItems = useMemo(() => {
return SAMPLE_ITEMS.filter((item) => {
const matchCat = activeCategory === 'All' || item.category === activeCategory;
const matchSearch =
!searchQuery ||
item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
item.brand.toLowerCase().includes(searchQuery.toLowerCase());
return matchCat && matchSearch;
});
}, [activeCategory, searchQuery]);

const hasItems = filteredItems.length > 0;

return (
<SafeAreaView style={styles.safe}>
<StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

{/* Logo */}
<View style={styles.logoHeader}>
<Image
source={require('./images/Blacklogo.png')}
style={styles.logo}
resizeMode="contain"
/>
</View>

{/* Header */}
<View style={styles.header}>
{showSearch ? (
<View style={styles.searchBar}>
<Ionicons
name="search-outline"
size={16}
color={COLORS.muted}
style={{ marginRight: 8 }}
/>
<TextInput
style={styles.searchInput}
placeholder="Search listings..."
placeholderTextColor={COLORS.muted}
value={searchQuery}
onChangeText={setSearchQuery}
autoFocus
/>
<TouchableOpacity
onPress={() => {
setShowSearch(false);
setSearchQuery('');
}}
>
<Ionicons name="close" size={18} color={COLORS.muted} />
</TouchableOpacity>
</View>
) : (
<>
<View>
<Text style={styles.headerTitle}>Marketplace</Text>
<Text style={styles.headerSub}>
{SAMPLE_ITEMS.length} listings near you
</Text>
</View>

<View style={styles.headerActions}>
<TouchableOpacity
style={styles.iconBtn}
onPress={() => setShowSearch(true)}
activeOpacity={0.8}
>
<Ionicons name="search-outline" size={20} color={COLORS.accent} />
</TouchableOpacity>

<TouchableOpacity
style={styles.addBtn}
activeOpacity={0.85}
onPress={() => navigation.navigate('AddListing')}
>
<Feather name="plus" size={20} color={COLORS.white} />
</TouchableOpacity>
</View>
</>
)}
</View>

{/* Category pills */}
<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
contentContainerStyle={styles.categoryRow}
>
{CATEGORIES.map((cat) => (
<TouchableOpacity
key={cat}
style={[
styles.categoryPill,
activeCategory === cat && styles.categoryPillActive,
]}
onPress={() => setActiveCategory(cat)}
activeOpacity={0.8}
>
<Text
style={[
styles.categoryText,
activeCategory === cat && styles.categoryTextActive,
]}
>
{cat}
</Text>
</TouchableOpacity>
))}
</ScrollView>

{/* Content */}
<ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={styles.scrollContent}
>
{!hasItems ? (
<>
<View style={styles.emptyHero}>
<View style={styles.iconRing}>
<Ionicons name="storefront-outline" size={48} color={COLORS.accent} />
</View>

<Text style={styles.emptyTitle}>No listings yet</Text>
<Text style={styles.emptySub}>
Discover pre-loved fashion or list your own items for sale
</Text>

<TouchableOpacity
style={styles.btnPrimary}
activeOpacity={0.85}
onPress={() => navigation.navigate('AddListing')}
>
<Feather
name="plus"
size={16}
color={COLORS.white}
style={{ marginRight: 7 }}
/>
<Text style={styles.btnPrimaryText}>Add a Listing</Text>
</TouchableOpacity>
</View>

<Text style={styles.sectionLabel}>What you can do</Text>

{TIPS.map((tip, i) => (
<View key={i} style={styles.tipCard}>
<View style={styles.tipIconWrap}>
<TipIcon icon={tip.icon} lib={tip.lib} />
</View>

<View style={styles.tipText}>
<Text style={styles.tipTitle}>{tip.title}</Text>
<Text style={styles.tipSub}>{tip.sub}</Text>
</View>

<Feather name="chevron-right" size={14} color={COLORS.muted} />
</View>
))}
</>
) : (
<>
<Text style={styles.sectionLabel}>
{activeCategory === 'All' ? 'Recent listings' : activeCategory} ·{' '}
{filteredItems.length} items
</Text>

<View style={styles.grid}>
{filteredItems.map((item) => (
<TouchableOpacity
key={item.id}
style={styles.itemCard}
activeOpacity={0.88}
onPress={() => navigation.navigate('ProductDetail', { item })}
>
<View style={styles.itemImageBox}>
{item.image ? (
<Image source={item.image} style={styles.itemImage} />
) : (
<MaterialCommunityIcons name="hanger" size={40} color={COLORS.accent} />
)}

<View style={styles.badgeWrap}>
<ConditionBadge condition={item.condition} />
</View>

<TouchableOpacity
style={styles.heartBtn}
onPress={(e) => toggleSave(item.id, e)}
>
<Ionicons
name={savedItems[item.id] ? 'heart' : 'heart-outline'}
size={18}
color={savedItems[item.id] ? '#E05C5C' : COLORS.muted}
/>
</TouchableOpacity>
</View>

<View style={styles.itemInfo}>
<Text style={styles.itemTitle}>{item.title}</Text>
<Text style={styles.itemBrand}>
{item.brand} · {item.size}
</Text>
<Text style={styles.itemDescription}>{item.description}</Text>

<View style={styles.itemLocationRow}>
<Ionicons name="location-outline" size={11} color={COLORS.muted} />
<Text style={styles.itemLocation}>{item.location}</Text>
</View>

<View style={styles.priceRow}>
<Text style={styles.itemPrice}>{item.price}</Text>
<Text style={styles.itemOriginalPrice}>
{item.originalPrice}
</Text>
</View>
</View>
</TouchableOpacity>
))}
</View>
</>
)}
</ScrollView>
</SafeAreaView>
);
}
