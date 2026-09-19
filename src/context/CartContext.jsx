import { createContext, useState, useEffect, useContext, useRef, useCallback } from "react";
import { 
  getCartApi, 
  addToCartApi, 
  updateCartApi, 
  deleteCartItemApi, 
  clearCartApi 
} from "../services/cartService";
import { productsData } from "../data/products";
import { useToast } from "./ToastContext";

const CartContext = createContext();

const LOCAL_CART_KEY = "lenskart_cart_items";

export function CartProvider({ children }) {
  // Initialize from localStorage first for instant initial paint
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY) || localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const isFetchedFromApiRef = useRef(false);
  const { toast } = useToast();

  // Helper to persist to both primary and legacy localStorage keys
  const persistLocally = (items) => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
      localStorage.setItem("cart", JSON.stringify(items));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.warn("Failed to persist cart locally:", err);
    }
  };

  // Resolve API item with local catalog details (images, brand, size, etc.)
  const resolveCartItem = useCallback((apiItem) => {
    if (!apiItem) return null;

    const prodId = Number(apiItem.product || apiItem.product_id || apiItem.id);
    const catalogProd = productsData.find((p) => p.id === prodId) || {};

    const lensDetails = (apiItem.lens_type || apiItem.lens_package) ? {
      type: { 
        id: apiItem.lens_type, 
        title: typeof apiItem.lens_type === "string" ? apiItem.lens_type : "Selected Lenses" 
      },
      package: { 
        id: apiItem.lens_package, 
        title: typeof apiItem.lens_package === "string" ? apiItem.lens_package : "Standard Package" 
      },
      additionalPrice: parseFloat(apiItem.lens_additional_price) || 0,
      surcharge: parseFloat(apiItem.high_power_surcharge) || 0,
      prescription: apiItem.prescription || null
    } : (apiItem.lensDetails || null);

    return {
      cartItemId: apiItem.id ? String(apiItem.id) : (apiItem.cartItemId || `cart_${Date.now()}_${prodId}`),
      backendCartId: apiItem.id || apiItem.backendCartId || null,
      id: prodId,
      name: apiItem.product_name || apiItem.name || catalogProd.name || "Eyewear Frame",
      brand: apiItem.brand || catalogProd.brand || "Mr.LensMaker",
      size: apiItem.frame_size || apiItem.size || catalogProd.size || "M",
      price: parseFloat(apiItem.product_price) || parseFloat(apiItem.price) || catalogProd.price || 1500,
      image: catalogProd.image || apiItem.image || "/eyeglass1.png",
      quantity: Number(apiItem.quantity) || 1,
      selectedColor: apiItem.frame_color || apiItem.selectedColor || null,
      lensDetails
    };
  }, []);

  /**
   * Fetch cart from backend API if not already fetched
   * "idha api la fetch pani irudha vitru pana ma irudha fetch paniru"
   */
  const fetchCart = useCallback(async (force = false) => {
    // If already fetched from API and force is not set, skip redundant fetch
    if (isFetchedFromApiRef.current && !force) {
      return;
    }

    const token = localStorage.getItem("user_token") || localStorage.getItem("userToken");
    if (!token) {
      // User is guest — cart is managed via localStorage
      return;
    }

    try {
      setLoading(true);
      const res = await getCartApi();
      let rawList = [];

      if (Array.isArray(res)) {
        rawList = res;
      } else if (Array.isArray(res?.data)) {
        rawList = res.data;
      } else if (Array.isArray(res?.results)) {
        rawList = res.results;
      }

      const resolved = rawList.map(resolveCartItem).filter(Boolean);
      
      // If backend returned items, update local cart state & storage
      if (resolved.length > 0) {
        setCartItems(resolved);
        persistLocally(resolved);
      } else {
        // If backend cart is empty, check if we have any guest items to sync to backend
        const localSaved = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || "[]");
        if (localSaved.length > 0) {
          // Sync local items to backend
          for (const item of localSaved) {
            try {
              await addToCartApi(item);
            } catch (syncErr) {
              console.warn("[Cart Sync Warning]:", syncErr.message);
            }
          }
          // Re-fetch after syncing
          const refreshed = await getCartApi();
          const refreshedList = (Array.isArray(refreshed?.data) ? refreshed.data : []).map(resolveCartItem).filter(Boolean);
          if (refreshedList.length > 0) {
            setCartItems(refreshedList);
            persistLocally(refreshedList);
          }
        } else {
          setCartItems([]);
          persistLocally([]);
        }
      }

      isFetchedFromApiRef.current = true;
    } catch (err) {
      console.warn("[Cart API Fetch Warning]:", err.message);
    } finally {
      setLoading(false);
    }
  }, [resolveCartItem]);

  // Initial fetch on mount / auth change
  useEffect(() => {
    fetchCart(false);

    // Listen for auth logout / login events to reset fetch flag
    const handleAuthChange = () => {
      isFetchedFromApiRef.current = false;
      fetchCart(true);
    };

    window.addEventListener("auth:login", handleAuthChange);
    window.addEventListener("auth:required", handleAuthChange);
    return () => {
      window.removeEventListener("auth:login", handleAuthChange);
      window.removeEventListener("auth:required", handleAuthChange);
    };
  }, [fetchCart]);

  /**
   * Add item to cart (Optimistic local update + Backend API sync with ID)
   */
  const addToCart = async (product, qty = 1) => {
    const uniqueCartId = product.lensDetails
      ? `${product.id}-${product.lensDetails.type?.id || 'standard'}-${product.lensDetails.package?.id || 'basic'}`
      : product.selectedColor
        ? `${product.id}-${product.selectedColor}`
        : String(product.id);

    let updatedList = [];
    const existingIndex = cartItems.findIndex(
      (item) => item.cartItemId === uniqueCartId || (item.id === product.id && !item.lensDetails && !product.lensDetails)
    );

    if (existingIndex > -1) {
      const existing = cartItems[existingIndex];
      const newQty = existing.quantity + qty;
      updatedList = cartItems.map((item, idx) => 
        idx === existingIndex ? { ...item, quantity: newQty } : item
      );
      setCartItems(updatedList);
      persistLocally(updatedList);

      // If item has backend ID, call update endpoint
      if (existing.backendCartId) {
        try {
          await updateCartApi(existing.backendCartId, newQty);
        } catch (err) {
          console.warn("[updateCartApi]:", err.message);
        }
      }
    } else {
      const newItem = {
        ...product,
        cartItemId: uniqueCartId,
        backendCartId: null,
        quantity: qty
      };
      updatedList = [...cartItems, newItem];
      setCartItems(updatedList);
      persistLocally(updatedList);

      // Sync to backend via POST /cart/
      const token = localStorage.getItem("user_token") || localStorage.getItem("userToken");
      if (token) {
        try {
          const res = await addToCartApi({
            product_id: product.id,
            quantity: qty,
            frame_color: product.selectedColor || null,
            lens_type: product.lensDetails?.type?.id || null,
            lens_package: product.lensDetails?.package?.id || null,
            lens_additional_price: product.lensDetails?.additionalPrice || 0,
            high_power_surcharge: product.lensDetails?.surcharge || 0,
            prescription: product.lensDetails?.prescription || null
          });

          const backendId = res?.data?.id || res?.id;
          if (backendId) {
            // Update cart item with backend ID
            setCartItems((prev) => {
              const mapped = prev.map((it) => 
                it.cartItemId === uniqueCartId ? { ...it, backendCartId: backendId } : it
              );
              persistLocally(mapped);
              return mapped;
            });
          }
        } catch (err) {
          console.warn("[addToCartApi]:", err.message);
        }
      }
    }
  };

  /**
   * Remove item from cart (Backend API delete by ID + Local storage clean)
   */
  const removeFromCart = async (cartItemId) => {
    const itemToRemove = cartItems.find((it) => String(it.cartItemId) === String(cartItemId));
    const updated = cartItems.filter((item) => String(item.cartItemId) !== String(cartItemId));
    setCartItems(updated);
    persistLocally(updated);

    // Call DELETE /api/cart/delete/<id>/ based on backend cart item ID
    const backendId = itemToRemove?.backendCartId || (typeof cartItemId === "number" || /^\d+$/.test(String(cartItemId)) ? cartItemId : null);
    if (backendId) {
      try {
        await deleteCartItemApi(backendId);
      } catch (err) {
        console.warn(`[deleteCartItemApi ${backendId}]:`, err.message);
      }
    }
  };

  /**
   * Update quantity (Backend API update by ID + Local storage update)
   */
  const updateQuantity = async (cartItemId, change) => {
    const targetItem = cartItems.find((it) => String(it.cartItemId) === String(cartItemId));
    if (!targetItem) return;

    const newQty = targetItem.quantity + change;
    if (newQty <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    const updated = cartItems.map((item) => 
      String(item.cartItemId) === String(cartItemId) ? { ...item, quantity: newQty } : item
    );
    setCartItems(updated);
    persistLocally(updated);

    // Call PUT /api/cart/update/ with { cartItemId, quantity }
    const backendId = targetItem.backendCartId || (typeof cartItemId === "number" || /^\d+$/.test(String(cartItemId)) ? Number(cartItemId) : null);
    if (backendId) {
      try {
        await updateCartApi(backendId, newQty);
      } catch (err) {
        console.warn(`[updateCartApi ${backendId}]:`, err.message);
      }
    }
  };

  /**
   * Clear all items from cart (Backend API DELETE /cart/clear/ + Local clean)
   */
  const clearCart = async () => {
    setCartItems([]);
    persistLocally([]);

    const token = localStorage.getItem("user_token") || localStorage.getItem("userToken");
    if (token) {
      try {
        await clearCartApi();
      } catch (err) {
        console.warn("[clearCartApi]:", err.message);
      }
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const totalPrice = cartItems.reduce(
    (total, item) => total + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 
    0
  );

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        fetchCart,
        loading,
        totalItems, 
        totalPrice 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
