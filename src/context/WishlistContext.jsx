import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlistApi, addWishlistApi, removeWishlistApi } from '../services/wishlistService';
import { productsData } from '../data/products';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
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
      price: rawItem.price || (rawItem.product && rawItem.product.price) || 1500,
      image: rawItem.image || rawItem.product_image || (rawItem.product && rawItem.product.image) || '/sunglass1.png',
      rating: rawItem.rating || 4.8,
      category: 'Classic',
      colors: ['black']
    };
  }, []);

  // Fetch wishlist directly from GET /wishlist/ API
  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const response = await getWishlistApi();
      let rawList = [];

      if (Array.isArray(response)) {
        rawList = response;
      } else if (Array.isArray(response?.results)) {
        rawList = response.results;
      } else if (Array.isArray(response?.data?.results)) {
        rawList = response.data.results;
      } else if (Array.isArray(response?.data)) {
        rawList = response.data;
      } else if (Array.isArray(response?.wishlist)) {
        rawList = response.wishlist;
      }

      const resolved = rawList.map(resolveProduct).filter(Boolean);
      setWishlist(resolved);
    } catch (err) {
      console.warn('[Wishlist API Warning]: Could not fetch wishlist from API:', err.message);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [resolveProduct]);

  // Initial fetch on mount / auth change
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Toggle wishlist (Make POST /wishlist/ API call, then re-fetch directly from GET /wishlist/)
  const toggleWishlist = async (product) => {
    if (!product || !product.id) return;

    const token = localStorage.getItem('user_token');
    if (!token) {
      toast.warning("Please login to save items to your wishlist");
      return;
    }

    const isWishlisted = wishlist.some(item => Number(item.id) === Number(product.id));

    if (isWishlisted) {
      try {
        await removeWishlistApi(product.id);
        toast.info(`"${product.name || 'Item'}" removed from Wishlist`);
      } catch (err) {
        console.warn('[Wishlist Remove Error]:', err.message);
        toast.error("Failed to remove item from wishlist");
      }
    } else {
      try {
        await addWishlistApi(product.id);
        toast.success(`"${product.name || 'Item'}" added to Wishlist!`);
      } catch (err) {
        console.warn('[Wishlist Add Error]:', err.message);
        toast.error("Failed to add item to wishlist");
      }
    }

    // Always re-fetch directly from the GET API to display server state
    await fetchWishlist();
  };

  // Remove explicitly from wishlist (Call API, then re-fetch from GET API)
  const removeFromWishlist = async (productId) => {
    const item = wishlist.find(p => Number(p.id) === Number(productId));
    
    try {
      await removeWishlistApi(productId);
      toast.info(`"${item?.name || 'Item'}" removed from Wishlist`);
    } catch (err) {
      console.warn('[Wishlist Remove Error]:', err.message);
      toast.error("Failed to remove item from wishlist");
    }

    // Re-fetch directly from GET API
    await fetchWishlist();
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
