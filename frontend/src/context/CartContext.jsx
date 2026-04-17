import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'ep_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  // Persistir en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch { /* silencioso */ }
  }, [cartItems]);

  const isInCart = useCallback(
    (claseId) => cartItems.some(item => item.id === claseId),
    [cartItems]
  );

  const addToCart = useCallback((clase) => {
    setCartItems(prev => {
      if (prev.some(item => item.id === clase.id)) return prev;
      return [...prev, {
        id: clase.id,
        title: clase.title,
        price: clase.price,
        cover_image: clase.cover_image,
        slug: clase.slug,
        duration_hours: clase.duration_hours,
        total_lessons: clase.total_lessons,
        difficulty: clase.difficulty,
      }];
    });
  }, []);

  const removeFromCart = useCallback((claseId) => {
    setCartItems(prev => prev.filter(item => item.id !== claseId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen(o => !o), []);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price), 0);
  const count = cartItems.length;

  return (
    <CartContext.Provider value={{
      cartItems,
      count,
      total,
      isOpen,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      openCart,
      closeCart,
      toggleCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
