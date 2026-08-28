// Centralized API Service for Mr.LensMaker Application
// Base URL: https://reformist-egotism-backlash.ngrok-free.dev/api

import axios from "axios";

export const BASE_API_URL = "https://reformist-egotism-backlash.ngrok-free.dev/api";

/**
 * Generic API request helper using Axios
 * Includes ngrok browser warning skip header and token handling.
 */
export const apiRequest = async (endpoint, method = "GET", body = null, customHeaders = {}) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_API_URL}${cleanEndpoint}`;

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...customHeaders,
  };

  const token = localStorage.getItem("user_token");

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["user-token"] = token;
  }

  const config = {
    method: method.toLowerCase(),
    url,
    headers,
    data: body,
  };

  console.log(`[API Request] ${method} ${url}`, body);

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`[API Call Error] ${method} ${url}:`, error.message);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || `Request failed with status ${error.response?.status}`;
    const customError = new Error(errorMsg);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    throw customError;
  }
};
