import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, Dimensions, ActivityIndicator, Alert,
  Modal, Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { saveNewItem, removeSaved, getCollectionItemById } from '../../services/authService';

const { width } = Dimensions.get('window');

// ── Fallback pricing until backend loads ───────────────────────────
const RENTAL_DURATIONS_DEFAULT = [
  { days: 1,  label: '1 Day',    discount: 0  },
  { days: 3,  label: '3 Days',   discount: 5  },
  { days: 7,  label: '1 Week',   discount: 15 },
  { days: 14, label: '2 Weeks',  discount: 20 },
  { days: 30, label: '1 Month',  discount: 25 },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Date helpers ───────────────────────────────────────────────────
const getDaysInMonth   = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
const formatDate = (d) =>
  d?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) ?? '';
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// ── Cell size for the mini calendar ───────────────────────────────
const CELL = (width - 80) / 7;

// ── MiniCalendar ───────────────────────────────────────────────────
const MiniCalendar = ({ selectedStart, selectedEnd, onSelectDate, minDate, bookedPeriods = [] }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth   = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Helper — is this calendar date inside any booked period?
  const isDateBooked = (date) =>
    bookedPeriods.some(p => date >= p.start && date <= p.end);

  // Build cells array: null = empty leading cell, number = day of month
  const cells = [];
  for (let i = 0; i < firstDayIndex; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={cal.wrap}>
      {/* Month navigation */}
      <View style={cal.nav}>
        <TouchableOpacity onPress={prevMonth} style={cal.arrow}>
          <Ionicons name="chevron-back" size={18} color="#C17C74" />
        </TouchableOpacity>
        <Text style={cal.monthTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={cal.arrow}>
          <Ionicons name="chevron-forward" size={18} color="#C17C74" />
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={cal.weekRow}>
        {DAYS_OF_WEEK.map(d => (
          <Text key={d} style={cal.weekDay}>{d}</Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={cal.grid}>
        {cells.map((day, idx) => {
          // Empty leading cell
          if (!day) return <View key={`empty-${idx}`} style={cal.cell} />;

          const date = new Date(viewYear, viewMonth, day);
          date.setHours(0, 0, 0, 0);

          const isPast    = minDate ? date < minDate : false;
          const booked    = isDateBooked(date);
          const isDisabled = isPast || booked;

          const isStart   = selectedStart && date.toDateString() === selectedStart.toDateString();
          const isEnd     = selectedEnd   && date.toDateString() === selectedEnd.toDateString();
          const isInRange = selectedStart && selectedEnd
            && date > selectedStart && date < selectedEnd;
          const isToday   = date.toDateString() === today.toDateString();

          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                cal.cell,
                isStart    && cal.cellStart,
                isEnd      && cal.cellEnd,
                isInRange  && cal.cellRange,
                isDisabled && cal.cellDisabled,
                booked     && cal.cellBooked,
              ]}
              onPress={() => !isDisabled && onSelectDate(date)}
              disabled={isDisabled}
              activeOpacity={0.75}
            >
              <Text style={[
                cal.dayText,
                (isStart || isEnd) && cal.daySelected,
                isInRange  && cal.dayRange,
                isDisabled && cal.dayDisabled,
                booked     && cal.dayBooked,
                isToday && !isStart && !isEnd && !booked && cal.dayToday,
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ── Main screen ────────────────────────────────────────────────────
export default function FashProductDetailScreen({ navigation, route }) {
  const { item: initialItem, isSaved: initialSaved } = route.params ?? {};
  const { getToken }  = useAuth();
  const { addToCart } = useCart();

  const [item,         setItem]         = useState(initialItem ?? {});
  const [rentalPricing, setRentalPricing] = useState(RENTAL_DURATIONS_DEFAULT);
  const [fetchingItem, setFetchingItem] = useState(false);
  const [bookedPeriods, setBookedPeriods] = useState([]);

  const [saved,        setSaved]        = useState(initialSaved ?? false);
  const [activeImg,    setActiveImg]    = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor,setSelectedColor]= useState(null);
  const [rentalModal,  setRentalModal]  = useState(false);
  const [selectedDur,  setSelectedDur]  = useState(RENTAL_DURATIONS_DEFAULT[1]);
  const [startDate,    setStartDate]    = useState(null);
  const [endDate,      setEndDate]      = useState(null);
  const [pickingStart, setPickingStart] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // ── Fetch full item + booked periods from backend ──────────────
  useEffect(() => {
    if (!initialItem?._id) return;

    const fetchDetail = async () => {
      try {
        setFetchingItem(true);
        const data     = await getCollectionItemById(initialItem._id);
        const itemData = data.item ?? data;
        setItem(itemData);

        // Backend rental pricing
        if (itemData.rentalPricing?.length) {
          const mapped = itemData.rentalPricing.map(p => ({
            days:     p.days,
            label:    p.label,
            discount: p.discountPercent,
          }));
          setRentalPricing(mapped);
          setSelectedDur(mapped[1] ?? mapped[0]);
        }

        // Booked periods — convert ISO strings to Date objects
        if (itemData.bookedPeriods?.length) {
          setBookedPeriods(
            itemData.bookedPeriods.map(p => ({
              start: new Date(p.startDate),
              end:   new Date(p.endDate),
            }))
          );
        }
      } catch (err) {
        // Silent fallback to route.params data — no UX disruption
        console.warn('Could not fetch item detail, using passed data:', err.message);
      } finally {
        setFetchingItem(false);
      }
    };

    fetchDetail();
  }, [initialItem?._id]);

  // ── Derived values ─────────────────────────────────────────────
  const images     = item.images?.length ? item.images : item.image ? [item.image] : [];
  const sizes      = item.sizes  ?? item.availableSizes  ?? [];
  const colors     = item.colors ?? item.availableColors ?? [];
  const dailyPrice = item.rentalPrice ?? item.price ?? 0;

  const totalDays  = startDate && endDate
    ? Math.max(1, Math.round((endDate - startDate) / 86400000))
    : selectedDur.days;
  const subtotal    = dailyPrice * totalDays;
  const discountAmt = Math.round(subtotal * selectedDur.discount / 100);
  const totalPrice  = subtotal - discountAmt;

  // ── Save / unsave ──────────────────────────────────────────────
  const handleToggleSave = async () => {
    const prev = saved;
    setSaved(!prev);
    try {
      const token = await getToken();
      if (prev) await removeSaved(token, item._id);
      else      await saveNewItem(token, item._id, 'collection');
    } catch {
      setSaved(prev); // revert on error
    }
  };

  // ── Calendar date selection with overlap guard ─────────────────
  const overlapsBookedPeriod = (start, end) =>
    bookedPeriods.some(p => start <= p.end && end >= p.start);

  const handleDateSelect = (date) => {
    if (pickingStart) {
      setStartDate(date);
      const autoEnd = addDays(date, selectedDur.days);
      // If auto-end overlaps a booking, leave end unset so user picks manually
      setEndDate(overlapsBookedPeriod(date, autoEnd) ? null : autoEnd);
      setPickingStart(false);
    } else {
      if (startDate && date <= startDate) {
        // Tapped before start — restart selection
        setStartDate(date);
        setEndDate(null);
      } else {
        if (overlapsBookedPeriod(startDate, date)) {
          Alert.alert(
            'Dates unavailable',
            'Your selected range overlaps a booked period. Please choose different dates.'
          );
          return;
        }
        setEndDate(date);
        setPickingStart(true);
      }
    }
  };

  const handleDurationSelect = (dur) => {
    setSelectedDur(dur);
    if (startDate) setEndDate(addDays(startDate, dur.days));
  };

  // ── Confirm rental → add to cart ──────────────────────────────
  const handleConfirmRental = async () => {
    if (sizes.length > 0 && !selectedSize) {
      Alert.alert('Select a size', 'Please pick a size before renting.');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Select dates', 'Please choose your rental start and end dates.');
      return;
    }

    const confirmedDays     = Math.max(1, Math.round((endDate - startDate) / 86400000));
    const confirmedSubtotal = dailyPrice * confirmedDays;
    const confirmedDiscount = Math.round(confirmedSubtotal * selectedDur.discount / 100);
    const confirmedTotal    = confirmedSubtotal - confirmedDiscount;

    try {
      setAddingToCart(true);

      const rentalItem = {
        ...item,
        _id:             `${item._id}_rental_${Date.now()}`,
        itemId:          item._id,
        isRental:        true,
        rentalStartDate: startDate.toISOString(),
        rentalEndDate:   endDate.toISOString(),
        rentalDays:      confirmedDays,
        rentalSize:      selectedSize,
        rentalColor:     selectedColor,
        rentalLabel:     `${formatDate(startDate)} → ${formatDate(endDate)} · ${confirmedDays}d`,
        price:           confirmedTotal,
      };

      addToCart(rentalItem, 'collection');
      setRentalModal(false);

      Alert.alert(
        'Added to Cart! 🎉',
        `"${item.title}" rental\n${formatDate(startDate)} → ${formatDate(endDate)}\n${confirmedDays} day${confirmedDays !== 1 ? 's' : ''} · EGP ${confirmedTotal}`,
        [
          { text: 'Keep Browsing', style: 'cancel' },
          { text: 'Go to Cart', onPress: () => navigation.navigate('MainCart') },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Top nav */}
      <View style={s.topNav}>
        <TouchableOpacity style={s.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={s.navTitle} numberOfLines={1}>{item.title}</Text>
        {fetchingItem && (
          <ActivityIndicator size="small" color="#C17C74" style={s.fetchIndicator} />
        )}
        <TouchableOpacity style={s.navBtn} onPress={handleToggleSave} activeOpacity={0.8}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={20}
            color={saved ? '#E05C5C' : '#C17C74'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Image gallery */}
        <View style={s.galleryWrap}>
          {images.length > 0 ? (
            <>
              <ScrollView
                horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={e =>
                  setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))
                }
              >
                {images.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={s.mainImage} resizeMode="cover" />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={s.dots}>
                  {images.map((_, i) => (
                    <View key={i} style={[s.dot, i === activeImg && s.dotActive]} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={s.imagePlaceholder}>
              <MaterialCommunityIcons name="hanger" size={72} color="#C17C74" />
            </View>
          )}
          <View style={s.fashBadgeImg}>
            <Text style={s.fashBadgeImgText}>FASH</Text>
          </View>
        </View>

        {/* Info block */}
        <View style={s.section}>
          <Text style={s.brandLabel}>{item.brand}</Text>
          <Text style={s.itemTitle}>{item.title}</Text>
          <View style={s.priceRow}>
            <Text style={s.price}>EGP {dailyPrice}</Text>
            <Text style={s.perDay}>/ day</Text>
          </View>
          {item.description ? <Text style={s.description}>{item.description}</Text> : null}
          <View style={s.tagsRow}>
            {item.category && (
              <View style={s.tag}>
                <Text style={s.tagText}>{item.category}</Text>
              </View>
            )}
            {item.isNew && (
              <View style={[s.tag, { backgroundColor: '#e8f5e9' }]}>
                <Text style={[s.tagText, { color: '#388e3c' }]}>New Arrival</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.divider} />

        {/* Size picker */}
        {sizes.length > 0 && (
          <View style={s.section}>
            <Text style={s.pickerTitle}>Select Size</Text>
            <View style={s.optionsRow}>
              {sizes.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[s.optionChip, selectedSize === size && s.optionChipActive]}
                  onPress={() => setSelectedSize(size)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.optionChipText, selectedSize === size && s.optionChipTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Color picker */}
        {colors.length > 0 && (
          <View style={s.section}>
            <Text style={s.pickerTitle}>Select Color</Text>
            <View style={s.optionsRow}>
              {colors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[s.optionChip, selectedColor === color && s.optionChipActive]}
                  onPress={() => setSelectedColor(color)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.optionChipText, selectedColor === color && s.optionChipTextActive]}>
                    {color}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={s.divider} />

        {/* Trust badges */}
        <View style={s.section}>
          <View style={s.rentalInfoCard}>
            {[
              { icon: 'calendar-outline',     title: 'Flexible Rental Period',    sub: 'Choose 1 day to 1 month' },
              { icon: 'shield-checkmark-outline', title: 'Insured & Dry-Cleaned', sub: 'Every item cleaned & insured before delivery' },
              { icon: 'arrow-undo-outline',   title: 'Easy Return',               sub: 'Drop off or schedule a pickup' },
            ].map(row => (
              <View key={row.title} style={s.rentalInfoRow}>
                <Ionicons name={row.icon} size={18} color="#C17C74" />
                <View style={s.rentalInfoText}>
                  <Text style={s.rentalInfoTitle}>{row.title}</Text>
                  <Text style={s.rentalInfoSub}>{row.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing table */}
        <View style={s.section}>
          <View style={s.pickerTitleRow}>
            <Text style={s.pickerTitle}>Rental Pricing</Text>
            {fetchingItem && (
              <ActivityIndicator size="small" color="#C17C74" style={{ marginLeft: 8 }} />
            )}
          </View>
          <View style={s.pricingTable}>
            {rentalPricing.map((dur, idx) => (
              <View
                key={dur.days}
                style={[s.pricingRow, idx === rentalPricing.length - 1 && { borderBottomWidth: 0 }]}
              >
                <Text style={s.pricingDur}>{dur.label}</Text>
                <Text style={s.pricingCalc}>EGP {dailyPrice} × {dur.days}</Text>
                {dur.discount > 0
                  ? <View style={s.discountPill}><Text style={s.discountPillText}>-{dur.discount}%</Text></View>
                  : <View style={{ width: 42 }} />
                }
                <Text style={s.pricingTotal}>
                  EGP {Math.round(dailyPrice * dur.days * (1 - dur.discount / 100))}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.ctaBar}>
        <View>
          <Text style={s.ctaFrom}>Starting from</Text>
          <Text style={s.ctaPrice}>EGP {dailyPrice} / day</Text>
        </View>
        <TouchableOpacity style={s.rentBtn} onPress={() => setRentalModal(true)} activeOpacity={0.88}>
          <Ionicons name="calendar-outline" size={16} color="white" style={{ marginRight: 6 }} />
          <Text style={s.rentBtnText}>Rent This Item</Text>
        </TouchableOpacity>
      </View>

      {/* ── Rental Modal ───────────────────────────────────────── */}
      <Modal
        visible={rentalModal}
        animationType="slide"
        transparent
        onRequestClose={() => setRentalModal(false)}
      >
        <View style={m.overlay}>
          <SafeAreaView style={m.sheet} edges={['bottom']}>
            <View style={m.handle} />

            <View style={m.header}>
              <Text style={m.headerTitle}>Choose Rental Dates</Text>
              <TouchableOpacity onPress={() => setRentalModal(false)} style={m.closeBtn}>
                <Ionicons name="close" size={20} color="#2c2c2c" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

              {/* Duration presets */}
              <Text style={m.label}>Quick Duration</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={m.durRow}>
                {rentalPricing.map(dur => (
                  <TouchableOpacity
                    key={dur.days}
                    style={[m.durChip, selectedDur.days === dur.days && m.durChipActive]}
                    onPress={() => handleDurationSelect(dur)}
                    activeOpacity={0.8}
                  >
                    <Text style={[m.durLabel, selectedDur.days === dur.days && m.durLabelActive]}>
                      {dur.label}
                    </Text>
                    {dur.discount > 0 && (
                      <Text style={[
                        m.durDiscount,
                        selectedDur.days === dur.days && { color: 'rgba(255,255,255,0.85)' },
                      ]}>
                        -{dur.discount}%
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Legend for booked dates */}
              {bookedPeriods.length > 0 && (
                <View style={m.legend}>
                  <View style={m.legendDot} />
                  <Text style={m.legendText}>Strikethrough dates are already booked</Text>
                </View>
              )}

              {/* Calendar */}
              <Text style={m.label}>
                {pickingStart ? '📅 Tap start date' : '📅 Tap end date'}
              </Text>
              <MiniCalendar
                selectedStart={startDate}
                selectedEnd={endDate}
                onSelectDate={handleDateSelect}
                minDate={today}
                bookedPeriods={bookedPeriods}
              />

              {/* Date summary */}
              <View style={m.dateSummary}>
                <View style={m.dateBox}>
                  <Text style={m.dateBoxLabel}>From</Text>
                  <Text style={[m.dateBoxValue, !startDate && { color: '#ccc' }]}>
                    {startDate ? formatDate(startDate) : 'Pick start'}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#C17C74" />
                <View style={m.dateBox}>
                  <Text style={m.dateBoxLabel}>To</Text>
                  <Text style={[m.dateBoxValue, !endDate && { color: '#ccc' }]}>
                    {endDate ? formatDate(endDate) : 'Pick end'}
                  </Text>
                </View>
              </View>

              {/* Price breakdown */}
              {startDate && endDate && (
                <View style={m.priceCard}>
                  <View style={m.priceRow}>
                    <Text style={m.priceLabel}>EGP {dailyPrice} × {totalDays} days</Text>
                    <Text style={m.priceValue}>EGP {subtotal}</Text>
                  </View>
                  {discountAmt > 0 && (
                    <View style={m.priceRow}>
                      <Text style={[m.priceLabel, { color: '#388e3c' }]}>
                        Duration discount ({selectedDur.discount}%)
                      </Text>
                      <Text style={[m.priceValue, { color: '#388e3c' }]}>- EGP {discountAmt}</Text>
                    </View>
                  )}
                  <View style={[m.priceRow, m.priceRowTotal]}>
                    <Text style={m.totalLabel}>Total</Text>
                    <Text style={m.totalValue}>EGP {totalPrice}</Text>
                  </View>
                </View>
              )}

              {/* Size reminder */}
              {sizes.length > 0 && !selectedSize && (
                <View style={m.reminder}>
                  <Ionicons name="information-circle-outline" size={16} color="#f9a825" />
                  <Text style={m.reminderText}>Go back and select a size before confirming</Text>
                </View>
              )}

              {/* Confirm CTA */}
              <TouchableOpacity
                style={[m.confirmBtn, (!startDate || !endDate || addingToCart) && { opacity: 0.5 }]}
                onPress={handleConfirmRental}
                disabled={!startDate || !endDate || addingToCart}
                activeOpacity={0.88}
              >
                {addingToCart
                  ? <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                  : <Ionicons name="cart-outline" size={18} color="white" style={{ marginRight: 8 }} />
                }
                <Text style={m.confirmBtnText}>
                  {addingToCart
                    ? 'Adding to cart...'
                    : `Add to Cart · EGP ${totalPrice || dailyPrice * selectedDur.days}`
                  }
                </Text>
              </TouchableOpacity>

            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Calendar styles ────────────────────────────────────────────────
const cal = StyleSheet.create({
  wrap:       { paddingHorizontal: 20, marginBottom: 8 },
  nav:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  arrow:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 15, fontWeight: '700', color: '#2c2c2c' },
  weekRow:    { flexDirection: 'row', marginBottom: 6 },
  weekDay:    { width: CELL, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#bbb' },
  grid:       { flexDirection: 'row', flexWrap: 'wrap' },
  cell:       { width: CELL, height: CELL, alignItems: 'center', justifyContent: 'center', borderRadius: CELL / 2 },
  cellStart:  { backgroundColor: '#C17C74' },
  cellEnd:    { backgroundColor: '#C17C74' },
  cellRange:  { backgroundColor: '#F2E6E3', borderRadius: 0 },
  cellDisabled: { opacity: 0.3 },
  cellBooked: { backgroundColor: '#fdecea', borderRadius: CELL / 2 },
  dayText:    { fontSize: 13, fontWeight: '500', color: '#2c2c2c' },
  daySelected:{ color: 'white', fontWeight: '700' },
  dayRange:   { color: '#C17C74' },
  dayDisabled:{ color: '#ccc' },
  dayBooked:  { color: '#E05C5C', textDecorationLine: 'line-through' },
  dayToday:   { color: '#C17C74', fontWeight: '700' },
});

// ── Modal styles ───────────────────────────────────────────────────
const m = StyleSheet.create({
  overlay:      { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:        { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '93%' },
  handle:       { width: 40, height: 4, backgroundColor: '#F2E6E3', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: '#2c2c2c' },
  closeBtn:     { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  label:        { fontSize: 12, fontWeight: '700', color: '#C17C74', textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 20, marginBottom: 10, marginTop: 14 },
  durRow:       { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  durChip:      { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: '#F2E6E3', borderWidth: 1.5, borderColor: 'rgba(193,124,116,0.2)', alignItems: 'center', minWidth: 80 },
  durChipActive:{ backgroundColor: '#C17C74', borderColor: '#C17C74' },
  durLabel:     { fontSize: 13, fontWeight: '700', color: '#C17C74' },
  durLabelActive:{ color: 'white' },
  durDiscount:  { fontSize: 10, fontWeight: '700', color: '#C17C74', marginTop: 2 },
  legend:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginTop: 8, marginBottom: 4 },
  legendDot:    { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fdecea', borderWidth: 1, borderColor: '#E05C5C' },
  legendText:   { fontSize: 11, color: '#9a7570' },
  dateSummary:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F2E6E3', marginHorizontal: 20, borderRadius: 14, padding: 16, marginTop: 8 },
  dateBox:      { alignItems: 'center' },
  dateBoxLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginBottom: 4 },
  dateBoxValue: { fontSize: 14, fontWeight: '700', color: '#2c2c2c' },
  priceCard:    { backgroundColor: '#F5F5F5', marginHorizontal: 20, borderRadius: 14, padding: 16, marginTop: 12, gap: 10 },
  priceRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel:   { fontSize: 13, color: '#666' },
  priceValue:   { fontSize: 13, fontWeight: '600', color: '#2c2c2c' },
  priceRowTotal:{ borderTopWidth: 1, borderTopColor: 'rgba(193,124,116,0.15)', paddingTop: 10, marginTop: 4 },
  totalLabel:   { fontSize: 15, fontWeight: '700', color: '#2c2c2c' },
  totalValue:   { fontSize: 20, fontWeight: '900', color: '#C17C74' },
  reminder:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff8e1', marginHorizontal: 20, borderRadius: 10, padding: 12, marginTop: 10 },
  reminderText: { fontSize: 12, color: '#7a5c00', flex: 1 },
  confirmBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#C17C74', marginHorizontal: 20, marginTop: 16, borderRadius: 16, paddingVertical: 16 },
  confirmBtnText:{ fontSize: 15, fontWeight: '700', color: 'white' },
});

// ── Screen styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#F5F5F5' },
  topNav:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: 'rgba(193,124,116,0.12)' },
  navBtn:          { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  navTitle:        { flex: 1, fontSize: 15, fontWeight: '700', color: '#2c2c2c', textAlign: 'center', marginHorizontal: 8 },
  fetchIndicator:  { position: 'absolute', right: 60, alignSelf: 'center' },
  scroll:          { paddingBottom: 20 },
  galleryWrap:     { width, height: width * 1.1, backgroundColor: '#F2E6E3', position: 'relative' },
  mainImage:       { width, height: width * 1.1 },
  imagePlaceholder:{ width, height: width * 1.1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2E6E3' },
  dots:            { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot:             { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive:       { backgroundColor: 'white', width: 18 },
  fashBadgeImg:    { position: 'absolute', top: 14, left: 14, backgroundColor: '#C17C74', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  fashBadgeImgText:{ color: 'white', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  section:         { paddingHorizontal: 20, paddingVertical: 16 },
  brandLabel:      { fontSize: 11, fontWeight: '700', color: '#C17C74', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  itemTitle:       { fontSize: 22, fontWeight: '800', color: '#2c2c2c', marginBottom: 8 },
  priceRow:        { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 12 },
  price:           { fontSize: 28, fontWeight: '900', color: '#C17C74' },
  perDay:          { fontSize: 14, color: '#888', fontWeight: '500' },
  description:     { fontSize: 14, color: '#666', lineHeight: 22 },
  tagsRow:         { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  tag:             { backgroundColor: '#F2E6E3', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  tagText:         { fontSize: 12, fontWeight: '600', color: '#C17C74' },
  divider:         { height: 1, backgroundColor: 'rgba(193,124,116,0.12)', marginHorizontal: 20 },
  pickerTitleRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pickerTitle:     { fontSize: 13, fontWeight: '700', color: '#2c2c2c' },
  optionsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip:      { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(193,124,116,0.25)', backgroundColor: 'white' },
  optionChipActive:{ backgroundColor: '#C17C74', borderColor: '#C17C74' },
  optionChipText:  { fontSize: 13, fontWeight: '600', color: '#2c2c2c' },
  optionChipTextActive: { color: 'white' },
  rentalInfoCard:  { backgroundColor: '#F2E6E3', borderRadius: 16, padding: 16, gap: 14 },
  rentalInfoRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rentalInfoText:  { flex: 1 },
  rentalInfoTitle: { fontSize: 13, fontWeight: '700', color: '#2c2c2c' },
  rentalInfoSub:   { fontSize: 12, color: '#888', marginTop: 2 },
  pricingTable:    { backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(193,124,116,0.12)' },
  pricingRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(193,124,116,0.08)' },
  pricingDur:      { width: 72, fontSize: 13, fontWeight: '700', color: '#2c2c2c' },
  pricingCalc:     { flex: 1, fontSize: 11, color: '#888' },
  discountPill:    { backgroundColor: '#e8f5e9', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginRight: 6 },
  discountPillText:{ fontSize: 10, fontWeight: '700', color: '#388e3c' },
  pricingTotal:    { fontSize: 13, fontWeight: '800', color: '#C17C74', minWidth: 70, textAlign: 'right' },
  ctaBar:          { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: 'rgba(193,124,116,0.12)' },
  ctaFrom:         { fontSize: 11, color: '#888', fontWeight: '500' },
  ctaPrice:        { fontSize: 18, fontWeight: '900', color: '#C17C74' },
  rentBtn:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C17C74', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14 },
  rentBtnText:     { fontSize: 14, fontWeight: '700', color: 'white' },
});