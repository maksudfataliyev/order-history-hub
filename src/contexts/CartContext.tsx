import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  condition: string;
  dimensions: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'yeni_nefes_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_KEY);
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem(CART_KEY);
      }
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(newItems));
    setItems(newItems);
  };

  const addToCart = (item: CartItem) => {
    const exists = items.find(i => i.id === item.id);
    if (!exists) {
      saveCart([...items, item]);
    }
  };

  const removeFromCart = (id: string) => {
    saveCart(items.filter(item => item.id !== id));
  };

  const clearCart = () => {
    saveCart([]);
  };

  const itemCount = items.length;
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, itemCount, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
