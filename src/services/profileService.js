import axios from "axios";
import { apiRequest } from "./api";

/**
 * Fetch all saved addresses via GET /address/save/?page=<page>&page_size=<pageSize>
 * @param {number} page
 * @param {number} pageSize (default: 5)
 */
export const getAddressesApi = async (page = 1, pageSize = 5) => {
  return await apiRequest(`/address/save/?page=${page}&page_size=${pageSize}`, "GET");
};

/**
 * Fetch user profile via GET /profile/
 */
export const getProfileApi = async () => {
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
 * @param {Object} addressData
 */
export const saveAddressApi = async (addressData) => {
  return await apiRequest("/address/save/", "POST", addressData);
};

/**
 * Delete address via DELETE /address/delete/<address_id>/
 * @param {number|string} addressId - The address ID to delete
 */
export const deleteAddressApi = async (addressId) => {
  return await apiRequest(`/address/delete/${addressId}/`, "DELETE");
};

/**
 * Fetch all saved prescriptions via GET /prescription/?page=<page>
 * @param {number} page
 */
export const getPrescriptionsApi = async (page = 1) => {
  return await apiRequest(`/prescription/?page=${page}`, "GET");
};

/**
 * Save prescription via POST /prescription/create/
 * Payload: { name, birth_year, right_sph, right_cyl, right_axis, left_sph, left_cyl, left_axis }
 * @param {Object} prescriptionData
 */
export const savePrescriptionApi = async (prescriptionData) => {
  return await apiRequest("/prescription/create/", "POST", prescriptionData);
};

/**
 * Delete prescription via DELETE /prescription/<prescriptionId>/
 * @param {number|string} prescriptionId
 */
export const deletePrescriptionApi = async (prescriptionId) => {
  return await apiRequest(`/prescription/${prescriptionId}/`, "DELETE");
};

/**
 * Fetch orders via GET /orders/?page=<page>&page_size=<pageSize>
 * @param {number} page
 * @param {number} pageSize (default: 5)
 */
export const getOrdersApi = async (page = 1, pageSize = 5) => {
  return await apiRequest(`/orders/?page=${page}&page_size=${pageSize}`, "GET");
};



