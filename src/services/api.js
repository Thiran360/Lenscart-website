// Centralized API Service for Mr.LensMaker Application
// Base URL: https://concise-egomaniac-starved.ngrok-free.dev/api/v1/

export const BASE_API_URL = "https://concise-egomaniac-starved.ngrok-free.dev/api/v1";

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

  const token = localStorage.getItem("userToken") || localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

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
