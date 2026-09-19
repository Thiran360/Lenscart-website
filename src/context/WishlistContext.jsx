import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlistApi, addWishlistApi, removeWishlistApi } from '../services/wishlistService';
import { productsData } from '../data/products';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("local_wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Helper to resolve product from ID or API item
  const resolveProduct = useCallback((rawItem) => {
    if (!rawItem) return null;
    
    // If it's already a full product object with details
    if (rawItem.name && rawItem.price && rawItem.image) {
      return rawItem;
    }

    const productId = rawItem.product_id || (rawItem.product && (rawItem.product.id || rawItem.product_id)) || rawItem.id || rawItem;
    const numId = Number(productId);

    // Look up in catalog
    const catalogItem = productsData.find(p => p.id === numId);
    if (catalogItem) {
      return { ...catalogItem, ...rawItem, id: numId };
    }

    // Fallback if product not in catalog
    return {
      id: numId,
      name: rawItem.product_name || rawItem.name || (rawItem.product && rawItem.product.name) || `Eyewear #${numId}`,
      price: rawItem.price || (rawItem.product && rawItem.product.price) || 1200,
      image: rawItem.image || rawItem.product_image || (rawItem.product && rawItem.product.image) || '/eyeglass1.png',
      rating: rawItem.rating || 4.8,
      category: 'Classic',
      colors: ['black']
    };
  }, []);

  // Fetch wishlist from GET /wishlist/ API and sync with local storage
  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem('user_token') || localStorage.getItem('userToken');
    const localSaved = JSON.parse(localStorage.getItem("local_wishlist") || "[]");

    // If no valid backend token, use local wishlist directly
    if (!token || token.startsWith("demo_token_") || token === "null" || token === "undefined") {
      setWishlist(localSaved);
      return;
    }

    try {
      setLoading(true);
      const response = await getWishlistApi();
      let rawList = [];

      if (Array.isArray(response)) {
        rawList = response;
      } else if (Array.isArray(response?.data)) {
        rawList = response.data;
      } else if (Array.isArray(response?.results)) {
        rawList = response.results;
      } else if (Array.isArray(response?.wishlist)) {
        rawList = response.wishlist;
      }

      if (rawList && rawList.length > 0) {
        const resolved = rawList.map(resolveProduct).filter(Boolean);
        const map = new Map();
        localSaved.forEach(item => map.set(Number(item.id), item));
        resolved.forEach(item => map.set(Number(item.id), item));
        const combined = Array.from(map.values());
        setWishlist(combined);
        localStorage.setItem("local_wishlist", JSON.stringify(combined));
      } else {
        setWishlist(localSaved);
      }
    } catch (err) {
      console.warn('[Wishlist API Notice]: Using local wishlist:', err.message);
      setWishlist(localSaved);
    } finally {
      setLoading(false);
    }
  }, [resolveProduct]);

  // Initial fetch on mount / auth change
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Toggle wishlist (Optimistic update + backend sync)
  const toggleWishlist = async (product) => {
    if (!product || !product.id) return;

    const isWishlisted = wishlist.some(item => Number(item.id) === Number(product.id));
    let nextList = [];

    if (isWishlisted) {
      nextList = wishlist.filter(item => Number(item.id) !== Number(product.id));
      setWishlist(nextList);
      localStorage.setItem("local_wishlist", JSON.stringify(nextList));
      toast.info(`"${product.name || 'Item'}" removed from Wishlist`);

      removeWishlistApi(product.id).catch(err => {
        console.warn("[Wishlist Sync Notice]:", err.message);
      });
    } else {
      nextList = [...wishlist, product];
      setWishlist(nextList);
      localStorage.setItem("local_wishlist", JSON.stringify(nextList));
      toast.success(`"${product.name || 'Item'}" added to Wishlist!`);

      addWishlistApi(product.id).catch(err => {
        console.warn("[Wishlist Sync Notice]:", err.message);
      });
    }
  };

  // Remove explicitly from wishlist
  const removeFromWishlist = async (productId) => {
    const item = wishlist.find(p => Number(p.id) === Number(productId));
    const nextList = wishlist.filter(p => Number(p.id) !== Number(productId));
    setWishlist(nextList);
    localStorage.setItem("local_wishlist", JSON.stringify(nextList));
    toast.info(`"${item?.name || 'Item'}" removed from Wishlist`);

    removeWishlistApi(productId).catch(err => {
      console.warn("[Wishlist Sync Notice]:", err.message);
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => Number(item.id) === Number(productId));
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      loading,
      fetchWishlist,
      toggleWishlist, 
      removeFromWishlist,
      isInWishlist,
      totalWishlistItems: wishlist.length 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export default WishlistContext;
