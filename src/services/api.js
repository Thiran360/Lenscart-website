// Centralized API Service for Mr.LensMaker Application
// Base URL: https://reformist-egotism-backlash.ngrok-free.dev/api

export const BASE_API_URL = "https://reformist-egotism-backlash.ngrok-free.dev/api";

/**
 * Generic API request helper using Fetch API
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
    headers["user_token"] = token;
  }

  const httpMethod = method ? method.toUpperCase() : "GET";

  const config = {
    method: httpMethod,
    headers,
    mode: "cors",
    referrerPolicy: "no-referrer-when-downgrade",
  };

  if (body) {
    config.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  console.log(`[API Request] ${httpMethod} ${url}`, body);

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Call Error] ${method} ${url}:`, error.message);
    throw error;
  }
};
