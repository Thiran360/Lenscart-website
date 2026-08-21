// Authentication Service using central API client
import { apiRequest } from "./api";

/**
 * Register user via POST /auth/register
 * @param {Object} userData - { name, phone, email, etc. }
 */
export const registerUser = async (userData) => {
  return await apiRequest("/auth/register", "POST", userData);
};

/**
 * Login user via POST /auth/login
 * @param {Object} credentials - { phone, password / otp }
 */
export const loginUser = async (credentials) => {
  return await apiRequest("/auth/login", "POST", credentials);
};

/**
 * Verify OTP via POST /auth/verify-otp
 * @param {Object} otpData - { phone, otp }
 */
export const verifyOtpApi = async (otpData) => {
  return await apiRequest("/auth/verify-otp", "POST", otpData);
};
