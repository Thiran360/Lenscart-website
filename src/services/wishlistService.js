import { apiRequest } from "./api";
import { isBackendProduct } from "./productService";

/**
 * Fetch all items in user's wishlist via GET /wishlist/
 * Base URL: https://capsule-most-rundown.ngrok-free.dev/api
 */
export const getWishlistApi = async () => {
  const token = localStorage.getItem("user_token") || localStorage.getItem("userToken") || localStorage.getItem("token");
  if (!token || token.startsWith("demo_token_") || token === "null" || token === "undefined") {
    return { status: true, data: [] };
  }
  try {
    return await apiRequest("/wishlist/", "GET", null, { timeout: 3500 });
  } catch (err) {
    console.warn("[getWishlistApi Notice]:", err.message);
    return { status: false, data: [] };
  }
};

/**
 * Add product to wishlist via POST /wishlist/
 * Payload: { product_id: <number> }
 * @param {number|string} productId
 */
export const addWishlistApi = async (productId) => {
  const token = localStorage.getItem("user_token") || localStorage.getItem("userToken") || localStorage.getItem("token");
  const numId = Number(productId);

  // If unauthenticated, demo token, or purely local catalog product (not in Django DB):
  // save locally immediately without making an 8-second hanging HTTP request!
  if (!token || token.startsWith("demo_token_") || !isBackendProduct(numId)) {
    return { status: true, message: "Product saved to local wishlist", localOnly: true };
  }

  try {
    return await apiRequest("/wishlist/", "POST", {
      product_id: numId,
    }, { timeout: 3500 });
  } catch (err) {
    console.warn(`[addWishlistApi]: Product #${productId} saved locally:`, err.message);
    return { status: false, message: err.message, localOnly: true };
  }
};

/**
 * Remove / Unlike product from wishlist via DELETE /wishlist/
 * Payload key: { product_id: <number> }
 * @param {number|string} productId
 */
export const removeWishlistApi = async (productId) => {
  const token = localStorage.getItem("user_token") || localStorage.getItem("userToken") || localStorage.getItem("token");
  const numId = Number(productId);

  if (!token || token.startsWith("demo_token_") || !isBackendProduct(numId)) {
    return { status: true, message: "Product removed from local wishlist", localOnly: true };
  }

  try {
    return await apiRequest("/wishlist/", "DELETE", {
      product_id: numId,
    }, { timeout: 3500 });
  } catch (err) {
    console.warn(`[removeWishlistApi]: Product #${numId} removed locally:`, err.message);
    return { status: false, message: err.message, localOnly: true };
  }
};
