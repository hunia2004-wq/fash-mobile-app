import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { cancelOrder } from '../../services/authService';


const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
  white: '#ffffff', border: 'rgba(193,124,116,0.18)',
  success: '#065F46', successBg: '#D1FAE5',
};

const STEPS = [
  { key: 'pending',           label: 'Order Placed',          icon: '📋' },
  { key: 'courier_dispatched',label: 'Courier Dispatched',    icon: '🔍' },
  { key: 'confirmed',         label: 'Order Confirmed',       icon: '✅' },
  { key: 'sanitizing',        label: 'Sanitization',          icon: '🧴' },
  { key: 'ready',             label: 'Ready for Delivery',    icon: '📦' },
  { key: 'shipped',           label: 'Out for Delivery',      icon: '🚚' },
  { key: 'delivered',         label: 'Delivered',             icon: '🎉' },
];

const STATUS_ORDER = [
  'pending',
  'courier_dispatched',
  'confirmed',
  'sanitizing',
  'ready',
  'shipped',
  'delivered',
];

const STATUS_CONFIG = {
  pending:            { label: 'Pending',             bg: '#FEF3C7', text: '#92400E' },
  courier_dispatched: { label: 'Courier Dispatched',  bg: '#FEF9C3', text: '#713F12' },
  confirmed:          { label: 'Confirmed',            bg: '#DBEAFE', text: '#1E40AF' },
  sanitizing:         { label: 'Sanitizing',           bg: '#FFEDD5', text: '#9A3412' },
  ready:              { label: 'Ready for Delivery',   bg: '#E0F2FE', text: '#075985' },
  shipped:            { label: 'Out for Delivery',     bg: '#EDE9FE', text: '#5B21B6' },
  on_the_way:         { label: 'On the Way',           bg: '#EDE9FE', text: '#5B21B6' },
  delivered:          { label: 'Delivered',            bg: '#D1FAE5', text: '#065F46' },
  cancelled:          { label: 'Cancelled',            bg: '#FEE2E2', text: '#991B1B' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const SectionTitle = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const TrackingTimeline = ({ status }) => {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <View style={styles.cancelledBox}>
        <Ionicons name="close-circle" size={20} color="#991B1B" style={{ marginRight: 8 }} />
        <Text style={styles.cancelledText}>This order has been cancelled</Text>
      </View>
    );
  }

  return (
    <View style={styles.timeline}>
      {STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
