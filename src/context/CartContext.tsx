import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number, packId?: string) => void;
  removeFromCart: (productId: string, packId?: string) => void;
  updateQuantity: (productId: string, quantity: number, packId?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  products: Product[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('lit_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  useEffect(() => {
    localStorage.setItem('lit_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (productId: string, quantity = 1, packId?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId && item.packId === packId);
      if (existing) {
        return prev.map(item => 
          (item.productId === productId && item.packId === packId)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity, packId }];
    });
  };

  const removeFromCart = (productId: string, packId?: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.packId === packId)));
  };

  const updateQuantity = (productId: string, quantity: number, packId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, packId);
      return;
    }
    setCart(prev => prev.map(item => 
      (item.productId === productId && item.packId === packId)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const cartTotal = cart.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartTotal, 
      cartCount,
      products 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
