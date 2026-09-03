// Centralized API Service for Mr.LensMaker Application
// Base URL: https://reformist-egotism-backlash.ngrok-free.dev/api

import axios from "axios";

export const BASE_API_URL = "https://reformist-egotism-backlash.ngrok-free.dev/api";

let lastAuthDispatch = 0;

/**
 * Dispatches a global event to notify the application that authentication is required
 * Clears expired or invalid tokens and triggers toast + redirect in UI.
 */
export const dispatchAuthRequired = (message = "user_token is required. Please login to continue.") => {
  const now = Date.now();
  // Debounce to prevent multiple duplicate toasts or redirections within 2 seconds
  if (now - lastAuthDispatch < 2000) return;
  lastAuthDispatch = now;

  // Clear obsolete token and user data
  localStorage.removeItem("user_token");
  localStorage.removeItem("userToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user_type");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("user");

  window.dispatchEvent(
    new CustomEvent("auth:required", {
      detail: { 
        message: message || "user_token is required. Please login to continue." 
      },
    })
  );
};

/**
 * Checks whether an error, status, or response payload indicates missing/required user_token
 */
export const checkIsAuthTokenError = (errorOrData, status) => {
  if (status === 401 || status === 403) return true;

  let textToCheck = "";
  if (typeof errorOrData === "string") {
    textToCheck = errorOrData.toLowerCase();
  } else if (errorOrData && typeof errorOrData === "object") {
    const msg = errorOrData.message || errorOrData.error || errorOrData.detail || "";
    textToCheck = (typeof msg === "string" ? msg : JSON.stringify(errorOrData)).toLowerCase();
  }

  return (
    textToCheck.includes("user_token is required") ||
    textToCheck.includes("user token is required") ||
    (textToCheck.includes("user_token") && (textToCheck.includes("required") || textToCheck.includes("missing") || textToCheck.includes("invalid") || textToCheck.includes("not found"))) ||
    (textToCheck.includes("token") && (textToCheck.includes("required") || textToCheck.includes("missing") || textToCheck.includes("expired") || textToCheck.includes("invalid") || textToCheck.includes("not provided"))) ||
    textToCheck.includes("authentication credentials were not provided") ||
    textToCheck.includes("unauthorized")
  );
};

// Global Axios Response Interceptor to capture any 401s or "user_token is required" messages across all requests
axios.interceptors.response.use(
  (response) => {
    // Check if the backend responded with HTTP 200 but contained an auth error payload
    if (response?.data && checkIsAuthTokenError(response.data, response.status)) {
      const msg = response.data?.message || response.data?.error || response.data?.detail || "user_token is required. Please login.";
      dispatchAuthRequired(msg);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const msg = data?.message || data?.error || data?.detail || error.message;

    if (checkIsAuthTokenError(data || error, status)) {
      dispatchAuthRequired(msg);
    }
    return Promise.reject(error);
  }
);

/**
 * Generic API request helper using Axios
 * Includes ngrok browser warning skip header and token handling.
 */
export const apiRequest = async (endpoint, method = "GET", body = null, customHeaders = {}) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_API_URL}${cleanEndpoint}`;

  const headers = {
    "ngrok-skip-browser-warning": "true",
    ...customHeaders,
  };

  // Only set Content-Type header if there is a request body
  if (body !== null && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("user_token") || localStorage.getItem("userToken") || localStorage.getItem("token");

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["user-token"] = token;
    headers["user_token"] = token;
  }

  const config = {
    method: method.toLowerCase(),
    url,
    headers,
  };

  // Only attach data property if body is provided (avoid sending null payload in DELETE / GET)
  if (body !== null && body !== undefined) {
    config.data = body;
    console.log(`[API Request] ${method} ${url}`, body);
  } else {
    console.log(`[API Request] ${method} ${url}`);
  }

  try {
    const response = await axios(config);
    if (response?.data && checkIsAuthTokenError(response.data, response.status)) {
      const msg = response.data?.message || response.data?.error || response.data?.detail || "user_token is required. Please login.";
      dispatchAuthRequired(msg);
    }
    return response.data;
  } catch (error) {
    console.error(`[API Call Error] ${method} ${url}:`, error.message);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data?.detail || `Request failed with status ${error.response?.status}`;
    if (checkIsAuthTokenError(error.response?.data || error, error.response?.status)) {
      dispatchAuthRequired(errorMsg);
    }
    const customError = new Error(errorMsg);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    throw customError;
  }
};

