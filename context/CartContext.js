import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCartAPI, removeFromCartAPI, clearCartAPI } from '../services/authService';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { getToken } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading,   setLoading]   = useState(false);

  const normalize = (item) => ({
    _id:       item._id,
    itemId:    item.itemId,
    itemType:  item.itemType,
    title:     item.title,
    price:     item.price,
    image:     item.image  ?? null,
    size:      item.size   ?? null,
    quantity:  item.quantity ?? 1,
    brand:     item.brand  ?? null,
    condition: item.condition ?? null,
  });

  //  load cart on mount 
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await getCart(token);
      const items = (data.cart?.items ?? data.items ?? []).map(normalize);
      setCartItems(items);
    } catch (err) {
      console.error('Failed to fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchCart(); }, []);

  //  sync helper — updates state from backend response 
  const syncFromResponse = (data) => {
    const items = (data.cart?.items ?? data.items ?? []).map(normalize);
    setCartItems(items);
    return items;
  };

  //  add 
  const addToCart = useCallback(async (item, itemType = 'marketplace', options = {}) => {
    // Optimistic — add immediately so UI feels instant
    setCartItems(prev => {
      const exists = prev.find(i => i.itemId?.toString() === item._id?.toString());
      if (exists) return prev;
      return [...prev, normalize({
        _id: item._id, itemId: item._id, itemType,
        title: item.title, price: item.price,
        image: item.image, size: options.size ?? null, quantity: 1,
        brand: item.brand, condition: item.condition,
      })];
    });

    try {
      const token = await getToken();
      const data = await addToCartAPI(token, item._id, itemType, options);
      syncFromResponse(data); // reconcile with backend
    } catch (err) {
      // Revert optimistic update on failure
      setCartItems(prev => prev.filter(i => i.itemId?.toString() !== item._id?.toString()));
      console.error('Add to cart failed:', err.message);
    }
  }, [getToken]);

  //  remove 
  const removeFromCart = useCallback(async (cartItemId) => {
    // Optimistic remove
    setCartItems(prev => prev.filter(i => i._id?.toString() !== cartItemId?.toString()));

    try {
      const token = await getToken();
      const data = await removeFromCartAPI(token, cartItemId);
      syncFromResponse(data);
    } catch (err) {
      console.error('Remove from cart failed:', err.message);
      fetchCart(); // re-fetch to restore correct state
    }
  }, [getToken]);

  //  clear 
  const clearCart = useCallback(async () => {
    setCartItems([]); // optimistic
    try {
      const token = await getToken();
      await clearCartAPI(token);
    } catch (err) {
      console.error('Clear cart failed:', err.message);
      fetchCart();
    }
  }, [getToken]);

  // helpers 
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