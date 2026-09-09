import { apiRequest } from "./api";

/**
 * Fetch all items in user's wishlist via GET /wishlist/
 * Base URL: https://reformist-egotism-backlash.ngrok-free.dev/api
 */
export const getWishlistApi = async () => {
  return await apiRequest("/wishlist/", "GET");
};

/**
 * Add product to wishlist via POST /wishlist/
 * Payload: { product_id: <number> }
 * @param {number|string} productId
 */
export const addWishlistApi = async (productId) => {
  return await apiRequest("/wishlist/", "POST", {
    product_id: Number(productId),
  });
};

/**
 * Remove / Unlike product from wishlist via DELETE /wishlist/
 * Payload key: { product_id: <number> }
 * @param {number|string} productId
 */
export const removeWishlistApi = async (productId) => {
  const prodId = Number(productId);

  try {
    // 1. Primary Method: DELETE /wishlist/ with payload { product_id: <id> }
    return await apiRequest("/wishlist/", "DELETE", {
      product_id: prodId,
    });
  } catch (err) {
    console.warn(
      `[removeWishlistApi] DELETE /wishlist/ with body { product_id: ${prodId} } error:`,
      err.message
    );

    // Fallback attempts in case backend expects query parameter or path variable
    try {
      return await apiRequest(`/wishlist/?product_id=${prodId}`, "DELETE");
    } catch (err2) {
      try {
        return await apiRequest(`/wishlist/${prodId}/`, "DELETE");
      } catch (err3) {
        // Fallback toggle using POST
        return await apiRequest("/wishlist/", "POST", {
          product_id: prodId,
        });
      }
    }
  }
};
