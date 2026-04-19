import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MenuItem, CartItem, LocalizedText } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity: number, notes?: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: (taxRate?: number) => number;
  getTotal: (taxRate?: number) => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((menuItem: MenuItem, quantity: number, notes?: string) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.menuItem.id === menuItem.id
      );

      if (existingIndex >= 0) {
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          notes: notes || updated[existingIndex].notes,
        };
        return updated;
      }

      return [...currentItems, { menuItem, quantity, notes }];
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.menuItem.id !== menuItemId)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => {
      const price = typeof item.menuItem.price === 'number'
        ? item.menuItem.price
        : 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  const getTax = useCallback((taxRate: number = 0.18) => {
    return Math.round(getSubtotal() * taxRate * 100) / 100;
  }, [getSubtotal]);

  const getTotal = useCallback((taxRate: number = 0.18) => {
    return getSubtotal() + getTax(taxRate);
  }, [getSubtotal, getTax]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getSubtotal,
        getTax,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function getLocalizedText(text: LocalizedText | string, lang: string): string {
  if (typeof text === 'string') {
    return text;
  }
  return text?.[lang as keyof LocalizedText] || text?.en || '';
}
