import { Dimensions, PixelRatio,} from 'react-native';

const { width, height } = Dimensions.get('window');

// Base dimensions (iPhone 14 Pro — 393x852)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/**
 * Scale a size horizontally relative to screen width
 * Use for: widths, paddingHorizontal, marginHorizontal, fontSize
 */
export const wp = (size) => (width / BASE_WIDTH) * size;

/**
 * Scale a size vertically relative to screen height
 * Use for: heights, paddingVertical, marginVertical
 */
export const hp = (size) => (height / BASE_HEIGHT) * size;

/**
 * Scale font sizes — slightly more conservative than wp
 * Prevents fonts from becoming too large on big screens
 */
export const fp = (size) => {
  const scale = width / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Raw screen dimensions — use when you need exact values
 */
export const SCREEN = { width, height };

/**
 * Common responsive values pre-calculated
 */
export const R = {
  // Padding
  paddingH: wp(20),         // standard horizontal padding
  paddingV: hp(16),         // standard vertical padding
  cardGap: wp(12),          // gap between cards

  // Card widths
  cardHalf: (width - wp(20) * 2 - wp(12)) / 2,   // 2-col card
  cardThird: (width - wp(20) * 2 - wp(12) * 2) / 3, // 3-col card
  cardScroll: width * 0.42, // horizontal scroll card

  // Border radius
  radiusSm: wp(10),
  radiusMd: wp(16),
  radiusLg: wp(20),

  // Icon sizes
  iconSm: wp(18),
  iconMd: wp(24),
  iconLg: wp(32),

  // Font sizes
  fontXs: fp(11),
  fontSm: fp(13),
  fontMd: fp(15),
  fontLg: fp(18),
  fontXl: fp(22),
  fontXxl: fp(28),
};