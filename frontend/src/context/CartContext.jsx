import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartApi } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cart from backend on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const items = await cartApi.get();
        setCartItems(items || []);
      } catch (err) {
        console.error('Failed to load cart:', err);
        setError(err.message);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const updatedCart = await cartApi.addItem(productId, quantity);
      console.log('Cart updated after adding item:', updatedCart);
      setCartItems(updatedCart || []);
      setError(null);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    try {
      const updatedCart = await cartApi.removeItem(productId);
      setCartItems(updatedCart || []);
      setError(null);
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      const updatedCart = await cartApi.updateItem(productId, quantity);
      setCartItems(updatedCart || []);
      setError(null);
    } catch (err) {
      console.error('Failed to update cart quantity:', err);
      setError(err.message);
      throw err;
    }
  }, [removeFromCart]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getCartTotal = useCallback((products) => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [cartItems]);

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clear();
      setCartItems([]);
      setError(null);
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const value = {
    cartItems,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartItemCount,
    getCartTotal,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

