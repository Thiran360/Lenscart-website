import { apiRequest } from "./api";

/**
 * Fetch all items in user's cart via GET /cart/
 * Backend URL: https://capsule-most-rundown.ngrok-free.dev/api/cart/
 */
export const getCartApi = async () => {
  const token = localStorage.getItem("user_token") || localStorage.getItem("userToken") || localStorage.getItem("token");
  if (!token) {
    return { status: true, data: [] };
  }
  return await apiRequest("/cart/", "GET");
};

/**
 * Add product to cart via POST /cart/
 * Backend URL: https://capsule-most-rundown.ngrok-free.dev/api/cart/
 * Payload fields: product_id, quantity, frame_color, lens_type, lens_package, lens_additional_price, high_power_surcharge, prescription
 * @param {Object} itemData
 */
export const addToCartApi = async (itemData) => {
  const payload = {
    product_id: Number(itemData.product_id || itemData.id),
    quantity: Number(itemData.quantity) || 1,
    frame_color: itemData.frame_color || itemData.selectedColor || null,
    lens_type: itemData.lensDetails?.type?.id || itemData.lens_type || null,
    lens_package: itemData.lensDetails?.package?.id || itemData.lens_package || null,
    lens_additional_price: Number(itemData.lensDetails?.additionalPrice || itemData.lens_additional_price || 0),
    high_power_surcharge: Number(itemData.lensDetails?.surcharge || itemData.high_power_surcharge || 0),
    prescription: itemData.lensDetails?.prescription || itemData.prescription || null
  };

  try {
    return await apiRequest("/cart/", "POST", payload);
  } catch (err) {
    if (err.status === 404 || err.response?.status === 404 || (err.message && err.message.toLowerCase().includes("not found"))) {
      console.warn(`[addToCartApi]: Product #${payload.product_id} not in backend DB. Maintained in local cart.`);
      return { status: false, message: "Product maintained in local cart", data: null, localOnly: true };
    }
    throw err;
  }
};

/**
 * Update cart item quantity via PUT /cart/update/
 * Backend URL: https://capsule-most-rundown.ngrok-free.dev/api/cart/update/
 * Payload: { cartItemId: <number>, quantity: <number> }
 * @param {number|string} cartItemId - Backend Cart Item ID
 * @param {number} quantity - New quantity
 */
export const updateCartApi = async (cartItemId, quantity) => {
  return await apiRequest("/cart/update/", "PUT", {
    cartItemId: Number(cartItemId),
    quantity: Math.max(1, Number(quantity))
  });
};

/**
 * Delete item from cart via DELETE /cart/delete/<cart_item_id>/
 * Backend URL: https://capsule-most-rundown.ngrok-free.dev/api/cart/delete/<id>/
 * @param {number|string} cartItemId - Backend Cart Item ID
 */
export const deleteCartItemApi = async (cartItemId) => {
  return await apiRequest(`/cart/delete/${cartItemId}/`, "DELETE");
};

/**
 * Clear all items from user's cart via DELETE /cart/clear/
 * Backend URL: https://capsule-most-rundown.ngrok-free.dev/api/cart/clear/
 */
export const clearCartApi = async () => {
  return await apiRequest("/cart/clear/", "DELETE", null, { timeout: 2000 });
};
