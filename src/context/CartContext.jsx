import { createContext, useState, useContext } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, qty = 1) => {
    // Generate a unique ID for the cart item based on product ID, selected lenses, and selected color
    const uniqueCartId = product.lensDetails
      ? `${product.id}-${product.lensDetails.type.id}-${product.lensDetails.package.id}`
      : product.selectedColor
        ? `${product.id}-${product.selectedColor}`
        : product.id;
      
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.cartItemId === uniqueCartId);
      if (existingItem) {
        return prevItems.map(item =>
          item.cartItemId === uniqueCartId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prevItems, { ...product, cartItemId: uniqueCartId, quantity: qty }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, change) => {
    setCartItems((prevItems) => {
      return prevItems.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
