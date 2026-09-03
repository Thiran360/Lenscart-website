/**
 * Checkout Service — sends full order payload to backend
 * POST /checkout/
 */
import { apiRequest } from "./api";

/**
 * Build and send the checkout payload to the backend.
 *
 * @param {Object} params
 * @param {Array}  params.items       - Cart / buyNow items array
 * @param {Object} params.address     - Shipping address fields
 * @param {string} params.paymentMethod - 'gpay' | 'card'
 * @param {number} params.subTotal
 * @param {number} params.tax
 * @param {number} params.shipping
 * @param {number} params.totalAmount
 * @returns {Promise<Object>} API response with order_id etc.
 */
export const placeOrderApi = async ({
  items,
  address,
  paymentMethod,
  subTotal,
  tax,
  shipping,
  totalAmount,
}) => {
  // Transform cart items into the backend-expected format
  const orderItems = items.map((item) => {
    const entry = {
      product_id: item.id,
      product_name: item.name || "Mr.LensMaker Eyewear",
      brand: item.brand || "Mr.LensMaker",
      category: item.category || "Eyeglasses",
      type: item.type || "eyeglasses",
      gender: item.gender || "Unisex",
      shape: item.shape || "",
      size: item.size || "M",
      frame_color: item.selectedColor || item.colors?.[0] || "Black",
      quantity: item.quantity || 1,
      unit_price: item.price || 0,
      old_price: item.oldPrice || null,
      discount: item.discount || 0,
      image: item.image || "",
      rating: item.rating || null,
      description: item.description || "",
    };

    // Attach lens details if present (from SelectLenses flow)
    if (item.lensDetails) {
      entry.lens_type = {
        id: item.lensDetails.type?.id || null,
        title: item.lensDetails.type?.title || null,
        price: item.lensDetails.type?.price || 0,
      };
      entry.lens_package = {
        id: item.lensDetails.package?.id || null,
        title: item.lensDetails.package?.title || null,
        price: item.lensDetails.package?.price || 0,
      };
      entry.lens_additional_price = item.lensDetails.additionalPrice || 0;
      entry.high_power_surcharge = item.lensDetails.surcharge || 0;

      // Attach prescription if available
      if (item.lensDetails.prescription) {
        const rx = item.lensDetails.prescription;
        entry.prescription = {
          method: rx.method, // 'manual' | 'upload'
          data: rx.data
            ? {
                name: rx.data.name || "",
                birth_year: rx.data.birthYear || "",
                right_sph: rx.data.rightSph || "",
                right_cyl: rx.data.rightCyl || "",
                right_axis: rx.data.rightAxis || "",
                left_sph: rx.data.leftSph || "",
                left_cyl: rx.data.leftCyl || "",
                left_axis: rx.data.leftAxis || "",
              }
            : null,
          file_name: rx.file?.name || null,
        };
      } else {
        entry.prescription = null;
      }
    } else {
      entry.lens_type = null;
      entry.lens_package = null;
      entry.lens_additional_price = 0;
      entry.high_power_surcharge = 0;
      entry.prescription = null;
    }

    return entry;
  });

  const payload = {
    items: orderItems,
    shipping_address: {
      full_name: `${address.firstName || ""} ${address.lastName || ""}`.trim(),
      email: address.email || "",
      phone: address.phone || "",
      street_address: address.street || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    },
    payment: {
      method: paymentMethod, // 'gpay' | 'card'
    },
    pricing: {
      sub_total: subTotal,
      tax: tax,
      shipping: shipping,
      total_amount: totalAmount,
    },
  };

  console.log("[Checkout] Sending payload:", JSON.stringify(payload, null, 2));

  return await apiRequest("/checkout/", "POST", payload);
};
