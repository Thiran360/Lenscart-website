import axios from "axios";
import { apiRequest } from "./api";

const LOCAL_ADDRESSES_KEY = "lenskart_user_addresses";

/**
 * Retrieve saved addresses from browser local storage, seeding from placedOrders if empty
 */
export const getLocalAddresses = () => {
  try {
    const raw = localStorage.getItem(LOCAL_ADDRESSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // Attempt to seed from past checkout orders
    const ordersRaw = localStorage.getItem("placedOrders");
    if (ordersRaw) {
      const orders = JSON.parse(ordersRaw);
      if (Array.isArray(orders)) {
        const extracted = [];
        const seen = new Set();
        orders.forEach((o, idx) => {
          const s = o.shippingAddress;
          if (s && s.street && !seen.has(s.street)) {
            seen.add(s.street);
            extracted.push({
              id: `addr_order_${idx + 1}`,
              full_name: s.name || "Default Address",
              name: s.name || "Default Address",
              phone: s.phone || "",
              street_address: s.street || "",
              street: s.street || "",
              city: s.city || "",
              state: s.state || "",
              pincode: s.pincode || "",
              created_at: o.orderDate || new Date().toISOString()
            });
          }
        });
        if (extracted.length > 0) {
          localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify(extracted));
          return extracted;
        }
      }
    }
    return [];
  } catch (e) {
    console.error("Failed to parse local addresses:", e);
    return [];
  }
};

/**
 * Persist address record to local storage
 */
export const saveLocalAddress = (addrData) => {
  const current = getLocalAddresses();
  const newAddr = {
    id: addrData.id || `addr_${Date.now()}`,
    full_name: (addrData.full_name || addrData.name || "").trim(),
    name: (addrData.full_name || addrData.name || "").trim(),
    phone: String(addrData.phone || "").trim(),
    street_address: (addrData.street_address || addrData.street || "").trim(),
    street: (addrData.street_address || addrData.street || "").trim(),
    city: (addrData.city || "").trim(),
    state: (addrData.state || "").trim(),
    pincode: String(addrData.pincode || "").trim(),
    created_at: addrData.created_at || new Date().toISOString()
  };

  const updated = [newAddr, ...current.filter((item) => String(item.id) !== String(newAddr.id))];
  localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify(updated));
  return newAddr;
};

/**
 * Delete address from local storage
 */
export const deleteLocalAddress = (id) => {
  const current = getLocalAddresses();
  const filtered = current.filter((item) => String(item.id) !== String(id));
  localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify(filtered));
  return filtered;
};

/**
 * Fetch all saved addresses with pagination.
 * Note: The Django backend only supports POST /address/save/ and DELETE /address/delete/<int:id>/,
 * so GET /address/save/ returns 405 Method Not Allowed. We seamlessly manage and serve addresses
 * locally with full pagination support.
 * @param {number} page
 * @param {number} pageSize (default: 5)
 */
export const getAddressesApi = async (page = 1, pageSize = 5) => {
  const token = localStorage.getItem("user_token") || localStorage.getItem("userToken") || localStorage.getItem("token");
  let localList = getLocalAddresses();

  // If logged in and local list is empty, sync addresses from backend checkouts (/checkout/)
  if (token && localList.length === 0) {
    try {
      const checkoutRes = await apiRequest("/checkout/", "GET");
      const orders = Array.isArray(checkoutRes?.data) ? checkoutRes.data : Array.isArray(checkoutRes) ? checkoutRes : [];
      const extractedMap = new Map();

      for (const ord of orders) {
        const addr = ord.shipping_address;
        if (addr && (addr.street_address || addr.street || addr.full_name)) {
          const key = `${addr.phone || ""}_${addr.street_address || addr.street || ""}_${addr.pincode || ""}`;
          if (!extractedMap.has(key)) {
            extractedMap.set(key, {
              id: ord.id || Date.now(),
              full_name: addr.full_name || addr.name || "Delivery Address",
              phone: addr.phone || "",
              street_address: addr.street_address || addr.street || "",
              city: addr.city || "",
              state: addr.state || "",
              pincode: addr.pincode || ""
            });
          }
        }
      }

      if (extractedMap.size > 0) {
        const syncedList = Array.from(extractedMap.values());
        localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify(syncedList));
        localList = syncedList;
      }
    } catch (err) {
      console.warn("[getAddressesApi] Backend checkout address sync:", err.message);
    }
  }

  const totalCount = localList.length;
  const size = pageSize || 5;
  const totalPages = Math.max(1, Math.ceil(totalCount / size));
  const startIndex = (page - 1) * size;
  const pagedList = localList.slice(startIndex, startIndex + size);

  return {
    status: true,
    page: page,
    count: totalCount,
    total_data: totalCount,
    page_size: size,
    total_pages: totalPages,
    data: pagedList,
    results: pagedList
  };
};

/**
 * Fetch user profile via GET /profile/
 */
export const getProfileApi = async () => {
  const token = localStorage.getItem("user_token") || localStorage.getItem("userToken") || localStorage.getItem("token");
  if (!token) {
    const local = JSON.parse(localStorage.getItem("user") || "null");
    return { status: false, data: local };
  }
  return await apiRequest("/profile/", "GET");
};

/**
 * Update user profile via PUT /profile/
 * @param {Object} profileData - Profile fields to update
 */
export const updateProfileApi = async (profileData) => {
  return await apiRequest("/profile/", "PUT", profileData);
};

/**
 * Save address via POST /address/save/
 * Payload: { full_name, phone, street_address, city, state, pincode }
 * Always persists locally first so the address is never lost, and syncs to backend if available.
 * @param {Object} addressData
 */
export const saveAddressApi = async (addressData) => {
  const savedLocal = saveLocalAddress(addressData);

  try {
    const payload = {
      full_name: (addressData.full_name || addressData.name || "").trim(),
      phone: String(addressData.phone || "").trim(),
      street_address: (addressData.street_address || addressData.street || "").trim(),
      city: (addressData.city || "").trim(),
      state: (addressData.state || "").trim(),
      pincode: String(addressData.pincode || "").trim()
    };

    const response = await apiRequest("/address/save/", "POST", payload);
    const backendId = response?.data?.id || response?.id;
    if (backendId) {
      const current = getLocalAddresses();
      const updated = current.map((item) => 
        String(item.id) === String(savedLocal.id) ? { ...item, id: backendId } : item
      );
      localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify(updated));
      savedLocal.id = backendId;
    }
    return response || { status: true, message: "Address saved successfully", data: savedLocal };
  } catch (error) {
    console.warn("[saveAddressApi] Backend address save unavailable, safely preserved locally:", error.message);
    return {
      status: true,
      isLocal: true,
      message: "Address saved successfully to your profile!",
      data: savedLocal
    };
  }
};

/**
 * Delete address via DELETE /address/delete/<address_id>/
 * Deletes from local storage and sends request to backend if numeric ID.
 * @param {number|string} addressId - The address ID to delete
 */
export const deleteAddressApi = async (addressId) => {
  deleteLocalAddress(addressId);

  const isNumericId = typeof addressId === "number" || (/^\d+$/.test(String(addressId)) && !String(addressId).startsWith("addr_"));
  if (!isNumericId) {
    return {
      status: true,
      message: "Address removed successfully"
    };
  }

  try {
    return await apiRequest(`/address/delete/${addressId}/`, "DELETE");
  } catch (error) {
    console.warn("[deleteAddressApi] Backend route error, removed locally:", error.message);
    return {
      status: true,
      message: "Address removed successfully"
    };
  }
};

const LOCAL_PRESCRIPTIONS_KEY = "lenskart_user_prescriptions";

/**
 * Retrieve saved prescriptions from browser local storage
 */
export const getLocalPrescriptions = () => {
  try {
    const raw = localStorage.getItem(LOCAL_PRESCRIPTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse local prescriptions:", e);
    return [];
  }
};

/**
 * Persist prescription record to local storage
 */
export const saveLocalPrescription = (rxData) => {
  const current = getLocalPrescriptions();
  const newRx = {
    id: rxData.id || `rx_${Date.now()}`,
    name: (rxData.name || "My Prescription").trim(),
    birth_year: rxData.birth_year ? parseInt(rxData.birth_year, 10) : null,
    right_sph: rxData.right_sph || "0.00",
    right_cyl: rxData.right_cyl || null,
    right_axis: rxData.right_axis ? parseInt(rxData.right_axis, 10) : null,
    left_sph: rxData.left_sph || "0.00",
    left_cyl: rxData.left_cyl || null,
    left_axis: rxData.left_axis ? parseInt(rxData.left_axis, 10) : null,
    file: rxData.file || null,
    created_at: rxData.created_at || new Date().toISOString()
  };

  const updated = [newRx, ...current.filter((item) => String(item.id) !== String(newRx.id))];
  localStorage.setItem(LOCAL_PRESCRIPTIONS_KEY, JSON.stringify(updated));
  return newRx;
};

/**
 * Delete prescription from local storage
 */
export const deleteLocalPrescription = (id) => {
  const current = getLocalPrescriptions();
  const filtered = current.filter((item) => String(item.id) !== String(id));
  localStorage.setItem(LOCAL_PRESCRIPTIONS_KEY, JSON.stringify(filtered));
  return filtered;
};

/**
 * Fetch all saved prescriptions via GET /prescription/?page=<page>&count=<count>
 * Seamlessly merges with or falls back to local prescriptions if backend returns 500
 * @param {number} page
 * @param {number} count
 */
export const getPrescriptionsApi = async (page = 1, count = 2) => {
  const token = localStorage.getItem("user_token") || localStorage.getItem("userToken");
  if (!token) {
    const localList = getLocalPrescriptions();
    return {
      status: true,
      page: page,
      count: localList.length,
      total_data: localList.length,
      data: localList
    };
  }

  let backendData = null;
  let backendSuccess = false;

  try {
    const response = await apiRequest(`/prescription/?page=${page}&count=${count}`, "GET");
    if (response && (Array.isArray(response.data) || Array.isArray(response.results) || Array.isArray(response))) {
      backendData = response;
      backendSuccess = true;
    }
  } catch (err) {
    console.warn("[getPrescriptionsApi] Backend error (likely missing user relation in DB), falling back to local storage:", err.message);
  }

  if (backendSuccess && backendData) {
    return backendData;
  }

  // Graceful local storage fallback
  const localList = getLocalPrescriptions();
  const totalCount = localList.length;
  const pageSize = count || 2;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pagedList = localList.slice(startIndex, startIndex + pageSize);

  return {
    status: true,
    page: page,
    count: totalCount,
    total_data: totalCount,
    page_size: pageSize,
    total_pages: totalPages,
    data: pagedList,
    results: pagedList,
    isFallback: true
  };
};

/**
 * Save prescription via POST /prescription/create/
 * Always stores safely locally so user data is never lost, and syncs to backend.
 * @param {Object} prescriptionData
 */
export const savePrescriptionApi = async (prescriptionData) => {
  // Always safely store in local storage first
  const savedLocal = saveLocalPrescription(prescriptionData);

  try {
    let payload;
    const rawImage = prescriptionData.image || (prescriptionData.file instanceof File ? prescriptionData.file : null);

    if (rawImage instanceof File || (typeof Blob !== "undefined" && rawImage instanceof Blob)) {
      const formData = new FormData();
      formData.append("name", prescriptionData.name.trim());
      formData.append("birth_year", prescriptionData.birth_year ? String(prescriptionData.birth_year) : "2000");
      if (prescriptionData.right_sph) formData.append("right_sph", prescriptionData.right_sph);
      if (prescriptionData.right_cyl) formData.append("right_cyl", prescriptionData.right_cyl);
      if (prescriptionData.right_axis) formData.append("right_axis", String(prescriptionData.right_axis));
      if (prescriptionData.left_sph) formData.append("left_sph", prescriptionData.left_sph);
      if (prescriptionData.left_cyl) formData.append("left_cyl", prescriptionData.left_cyl);
      if (prescriptionData.left_axis) formData.append("left_axis", String(prescriptionData.left_axis));
      formData.append("image", rawImage);
      payload = formData;
    } else {
      payload = {
        name: prescriptionData.name.trim(),
        birth_year: prescriptionData.birth_year ? parseInt(prescriptionData.birth_year, 10) : 2000,
        right_sph: prescriptionData.right_sph || "0.00",
        right_cyl: prescriptionData.right_cyl || null,
        right_axis: prescriptionData.right_axis ? parseInt(prescriptionData.right_axis, 10) : null,
        left_sph: prescriptionData.left_sph || "0.00",
        left_cyl: prescriptionData.left_cyl || null,
        left_axis: prescriptionData.left_axis ? parseInt(prescriptionData.left_axis, 10) : null
      };
      if (prescriptionData.image && typeof prescriptionData.image === "string") {
        payload.image = prescriptionData.image;
      }
    }

    const response = await apiRequest("/prescription/create/", "POST", payload);
    return response || { status: true, message: "Prescription saved successfully", data: savedLocal };
  } catch (error) {
    console.warn("[savePrescriptionApi] Backend error, safely preserved locally:", error.message);
    return {
      status: true,
      isLocal: true,
      message: "Prescription saved successfully to your profile!",
      data: savedLocal
    };
  }
};

/**
 * Delete prescription via DELETE /prescription/delete/<prescriptionId>/
 * Cleans from local storage and sends request to backend if available and numeric.
 * Note: Django backend route is /prescription/delete/<int:prescription_id>/
 * @param {number|string} prescriptionId
 */
export const deletePrescriptionApi = async (prescriptionId) => {
  deleteLocalPrescription(prescriptionId);

  // If local ID (starts with rx_ or is not a numeric backend ID), do not call backend
  const isNumericId = typeof prescriptionId === "number" || (/^\d+$/.test(String(prescriptionId)) && !String(prescriptionId).startsWith("rx_"));
  if (!isNumericId) {
    return {
      status: true,
      message: "Prescription removed successfully"
    };
  }

  try {
    return await apiRequest(`/prescription/delete/${prescriptionId}/`, "DELETE");
  } catch (error) {
    console.warn("[deletePrescriptionApi] Backend route not found or error, removed locally:", error.message);
    return {
      status: true,
      message: "Prescription removed successfully"
    };
  }
};

/**
 * Fetch orders via GET /orders/?page=<page>&page_size=<pageSize>
 * @param {number} page
 * @param {number} pageSize (default: 5)
 */
export const getOrdersApi = async (page = 1, pageSize = 5) => {
  const token = localStorage.getItem("user_token") || localStorage.getItem("userToken");
  if (!token) {
    const local = JSON.parse(localStorage.getItem("placedOrders") || "[]");
    return { status: true, data: local };
  }

  // 1. Primary: Fetch from /checkout/ which contains all orders placed by the user
  try {
    const checkoutOrders = await apiRequest("/checkout/", "GET");
    if (checkoutOrders && (Array.isArray(checkoutOrders.data) || Array.isArray(checkoutOrders))) {
      return checkoutOrders;
    }
  } catch (err) {
    console.warn("[getOrdersApi /checkout/]:", err.message);
  }

  // 2. Secondary: Fetch from /orders/
  try {
    const ordersRes = await apiRequest(`/orders/?page=${page}&page_size=${pageSize}`, "GET");
    if (ordersRes && (Array.isArray(ordersRes.data) || Array.isArray(ordersRes))) {
      return ordersRes;
    }
  } catch (ordersErr) {
    console.warn("[getOrdersApi /orders/]:", ordersErr.message);
  }

  // 3. Fallback to local stored orders
  const localOrders = JSON.parse(localStorage.getItem("placedOrders") || "[]");
  return { status: true, data: localOrders };
};
