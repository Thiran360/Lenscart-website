// Authentication Service using central API client
import { apiRequest } from "./api";

/**
 * Helper to ensure phone number is a clean 10-digit string without country code or symbols
 * @param {string|number} phone
 * @returns {string} 10-digit phone string
 */
export const clean10DigitPhone = (phone) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
};

/**
 * Register user via POST /register/
 * Payload: { phone: "10-digit-string", name: "string" }
 * @param {Object} userData - { phone, name }
 */
export const registerUser = async (userData) => {
  const cleanPhone = clean10DigitPhone(userData.phone);
  const payload = {
    phone: String(cleanPhone),
    name: String(userData.name || "").trim()
  };
  const response = await apiRequest("/register/", "POST", payload);

  const token = response?.data?.user_token || response?.user_token;
  if (token) {
    localStorage.setItem("user_token", token);
  }

  return response;
};

/**
 * Login user via POST /login/
 * Payload: { phone: "10-digit-string" }
 * @param {Object} credentials - { phone }
 */
export const loginUser = async (credentials) => {
  const cleanPhone = clean10DigitPhone(credentials.phone);
  const payload = {
    phone: String(cleanPhone)
  };
  const response = await apiRequest("/login/", "POST", payload);

  const token = response?.data?.user_token || response?.user_token;
  if (token) {
    localStorage.setItem("user_token", token);
  }

  return response;
};

/**
 * Logout user via POST /logout/
 * Header includes token automatically via apiRequest helper
 */
export const logoutUser = async () => {
  try {
    await apiRequest("/logout/", "POST");
  } catch (err) {
    console.warn("[Logout API Warning]:", err.message);
  } finally {
    localStorage.removeItem("user_token");
    localStorage.removeItem("userToken");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingPhone");
    localStorage.removeItem("cleanPhone");
    localStorage.removeItem("pendingName");
    localStorage.removeItem("otpFlow");
    localStorage.removeItem("otp");
    sessionStorage.clear();
  }
};

/**
 * Verify OTP via POST /verify-otp/
 * Payload: { phone: "10-digit-string", otp: "string" }
 * @param {Object} otpData - { phone, otp }
 */
export const verifyOtpApi = async (otpData) => {
  const cleanPhone = clean10DigitPhone(otpData.phone);
  const payload = {
    phone: String(cleanPhone),
    otp: String(otpData.otp || "").trim()
  };
  const response = await apiRequest("/verify-otp/", "POST", payload);
  const token = response?.data?.user_token || response?.user_token;
  if (token) {
    localStorage.setItem("user_token", token);
  }
  return response;
};



