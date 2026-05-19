import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCartAPI, removeFromCartAPI, clearCartAPI } from '../services/authService';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { getToken } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Normalize a backend item — never used for rental items
  const normalizeBackend = (item) => ({
    _id: item._id,
    itemId: item.itemId,
    itemType: item.itemType,
    title: item.title,
    price: item.price,
    image: item.image ?? null,
    size: item.size ?? null,
    quantity: item.quantity ?? 1,
    brand: item.brand ?? null,
    condition: item.condition ?? null,
    isRental: false,
  });

  // ── load cart on mount ──────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await getCart(token);
      const backendItems = (data.cart?.items ?? data.items ?? []).map(normalizeBackend);

      // Merge: keep local-only rental items, replace backend items
      setCartItems(prev => {
        const rentalItems = prev.filter(i => i.isRental);
        return [...rentalItems, ...backendItems];
      });
    } catch (err) {
      console.error('Failed to fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    const delay = setTimeout(() => fetchCart(), 3000);
    return () => clearTimeout(delay);
  }, [fetchCart]);

  // ── sync helper — only reconciles non-rental items ─────────────
  const syncFromResponse = (data) => {
    const backendItems = (data.cart?.items ?? data.items ?? []).map(normalizeBackend);
    setCartItems(prev => {
      const rentalItems = prev.filter(i => i.isRental);
      return [...rentalItems, ...backendItems];
    });
  };

  // ── add ─────────────────────────────────────────────────────────
  const addToCart = useCallback(async (item, itemType = 'marketplace', options = {}) => {

    // ── Rental path: local-only, no backend call ─────────────────
    if (item.isRental) {
      setCartItems(prev => [...prev, {
        // Unique cart ID so multiple rentals of same item coexist
        _id: item._id,
        itemId: item.itemId ?? item._id,
        itemType: itemType,
        isRental: true,
        title: item.title,
        brand: item.brand ?? null,
        image: item.image ?? null,
        condition: item.condition ?? null,
        size: item.rentalSize ?? options.size ?? null,
        quantity: 1,
        // ── Rental-specific fields (all preserved) ───────────────
        price: item.price,           // already = totalPrice
        rentalDays: item.rentalDays,
        rentalLabel: item.rentalLabel,
        rentalStartDate: item.rentalStartDate,
        rentalEndDate: item.rentalEndDate,
        rentalSize: item.rentalSize,
        rentalColor: item.rentalColor,
      }]);
      return;
    }

    // ── Regular path: optimistic + backend ───────────────────────
    setCartItems(prev => {
      const exists = prev.find(
        i => !i.isRental && i.itemId?.toString() === item._id?.toString()
      );
      if (exists) return prev;
      return [...prev, normalizeBackend({
        _id: item._id, itemId: item._id, itemType,
        title: item.title, price: item.price,
        image: item.image, size: options.size ?? null, quantity: 1,
        brand: item.brand, condition: item.condition,
      })];
    });

    try {
      const token = await getToken();
      const data = await addToCartAPI(token, item._id, itemType, options);
      syncFromResponse(data);
    } catch (err) {
      setCartItems(prev =>
        prev.filter(i => i.isRental || i.itemId?.toString() !== item._id?.toString())
      );
      console.error('Add to cart failed:', err.message);
    }
  }, [getToken]);

  // ── remove ──────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (cartItemId) => {
    // Check if it's a rental (local-only remove)
    const target = cartItems.find(i => i._id?.toString() === cartItemId?.toString());

    // Optimistic remove from state in both cases
    setCartItems(prev => prev.filter(i => i._id?.toString() !== cartItemId?.toString()));

    if (target?.isRental) return; // no backend call needed

    try {
      const token = await getToken();
      const data = await removeFromCartAPI(token, cartItemId);
      syncFromResponse(data);
    } catch (err) {
      console.error('Remove from cart failed:', err.message);
      fetchCart();
    }
  }, [getToken, cartItems]);

  // ── clear ───────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    setCartItems([]);
    try {
      const token = await getToken();
      await clearCartAPI(token);
    } catch (err) {
      console.error('Clear cart failed:', err.message);
      fetchCart();
    }
  }, [getToken]);

  // ── helpers ─────────────────────────────────────────────────────
  const isInCart = useCallback((id) =>
    cartItems.some(i =>
      i._id?.toString() === id?.toString() ||
      i.itemId?.toString() === id?.toString()
    ),
    [cartItems]);

  const cartCount = cartItems.reduce((sum, i) => sum + (i.quantity ?? 1), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      loading,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}