import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCartAPI, removeFromCartAPI, clearCartAPI } from '../services/authService';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { getToken } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Normalize a backend item — now preserves rental fields
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
    isRental: item.isRental ?? false,
    rentalStartDate: item.rentalStartDate ?? null,
    rentalEndDate: item.rentalEndDate ?? null,
    rentalDays: item.rentalDays ?? null,
    rentalLabel: item.rentalLabel ?? null,
    rentalSize: item.rentalSize ?? null,
    rentalColor: item.rentalColor ?? null,
    isAcceptedOffer: item.isAcceptedOffer ?? false,
    originalPrice: item.originalPrice ?? null,
  });

  // ── Load cart on mount ──────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await getCart(token);
      const backendItems = (data.cart?.items ?? data.items ?? []).map(normalizeBackend);
      setCartItems(backendItems);
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

  // ── Sync helper ─────────────────────────────────────────────────
  const syncFromResponse = (data) => {
    const backendItems = (data.cart?.items ?? data.items ?? []).map(normalizeBackend);
    setCartItems(backendItems);
  };

  // ── Add ─────────────────────────────────────────────────────────
  const addToCart = useCallback(async (item, itemType = 'marketplace', options = {}) => {

    const rentalOptions = item.isRental ? {
      isRental: true,
      rentalStartDate: item.rentalStartDate,
      rentalEndDate: item.rentalEndDate,
      rentalDays: item.rentalDays,
      rentalLabel: item.rentalLabel,
      rentalSize: item.rentalSize,
      rentalColor: item.rentalColor,
      price: item.price,
    } : {};
  
    // Optimistic update
    setCartItems(prev => {
      const exists = prev.find(
        i => !i.isRental && i.itemId?.toString() === item._id?.toString()
      );
      if (exists && !item.isRental) return prev;
      return [...prev, normalizeBackend({
        _id: item._id,
        itemId: item._id,
        itemType,
        title: item.title,
        price: item.price,
        image: item.image,
        size: item.rentalSize ?? options.size ?? null,
        quantity: 1,
        brand: item.brand,
        condition: item.condition,
        isAcceptedOffer: item.isAcceptedOffer ?? false,   // ← add
        originalPrice: item.originalPrice ?? null,         // ← add
        ...rentalOptions,
      })];
    });
  
    try {
      const token = await getToken();
      const data = await addToCartAPI(
        token,
        item.itemId ?? item._id,
        itemType,
        { 
          ...options, 
          ...rentalOptions,
          isAcceptedOffer: item.isAcceptedOffer ?? false,  
          price: item.price,                                
        }
      );
        syncFromResponse(data);
    } catch (err) {
      setCartItems(prev =>
        prev.filter(i => i._id?.toString() !== item._id?.toString())
      );
      console.error('Add to cart failed:', err.message);
    }
  }, [getToken]);

  

  // ── Remove ──────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (cartItemId) => {
    setCartItems(prev => prev.filter(i => i._id?.toString() !== cartItemId?.toString()));

    try {
      const token = await getToken();
      const data = await removeFromCartAPI(token, cartItemId);
      syncFromResponse(data);
    } catch (err) {
      console.error('Remove from cart failed:', err.message);
      fetchCart();
    }
  }, [getToken, fetchCart]);

  // ── Clear ───────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    setCartItems([]);
    try {
      const token = await getToken();
      await clearCartAPI(token);
    } catch (err) {
      console.error('Clear cart failed:', err.message);
      fetchCart();
    }
  }, [getToken, fetchCart]);

  // ── Helpers ─────────────────────────────────────────────────────
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