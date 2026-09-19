// Base URL: https://capsule-most-rundown.ngrok-free.dev/api

import axios from "axios";

export const BASE_API_URL = "https://capsule-most-rundown.ngrok-free.dev/api";

let lastAuthDispatch = 0;

/**
 * Dispatches a global event to notify the application that authentication is required
 * Clears expired or invalid tokens and triggers toast + redirect in UI.
 */
export const dispatchAuthRequired = (message = "user_token is required. Please login to continue.") => {
  // If user is intentionally logging out or navigating to login, suppress auth required toast
  if (typeof window !== "undefined" && window.sessionStorage?.getItem("is_logging_out") === "true") {
    return;
  }
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
  // 500 Internal Server Errors are server bugs, never client auth errors
  if (status && status >= 500) return false;
  if (status === 401 || status === 403) return true;

  // If payload is HTML (such as Django debug traceback), never treat as auth error
  if (typeof errorOrData === "string" && errorOrData.trim().startsWith("<")) {
    return false;
  }

  let textToCheck = "";
  if (typeof errorOrData === "string") {
    textToCheck = errorOrData.toLowerCase();
  } else if (errorOrData && typeof errorOrData === "object") {
    // If the data object contains an HTML string or no recognizable auth message, ignore
    const msg = errorOrData.message || errorOrData.error || errorOrData.detail || "";
    if (typeof msg === "string" && msg.trim().startsWith("<")) return false;
    textToCheck = (typeof msg === "string" ? msg : JSON.stringify(errorOrData)).toLowerCase();
  }

  return (
    textToCheck.includes("user_token is required") ||
    textToCheck.includes("user token is required") ||
    textToCheck.includes("user-token is required") ||
    (textToCheck.includes("user_token") && (textToCheck.includes("required") || textToCheck.includes("missing") || textToCheck.includes("invalid") || textToCheck.includes("not found"))) ||
    (textToCheck.includes("token") && (textToCheck.includes("required") || textToCheck.includes("missing") || textToCheck.includes("expired") || textToCheck.includes("invalid") || textToCheck.includes("not provided"))) ||
    textToCheck.includes("authentication credentials were not provided") ||
    textToCheck.includes("unauthorized")
  );
};

const isPublicEndpoint = (endpointUrl = "") => {
  const u = String(endpointUrl).toLowerCase();
  return (
    u.includes("/logout") ||
    u.includes("/product-details") ||
    u.includes("/search") ||
    u.includes("/glass-product") ||
    u.includes("/product") ||
    u.includes("/sunglasses") ||
    u.includes("/eyeglasses") ||
    u.includes("/kids-club") ||
    u.includes("/buy-one-get-one") ||
    u.includes("/login") ||
    u.includes("/register") ||
    u.includes("/verify-otp") ||
    u.includes("/forgot-password")
  );
};

// Global Axios Response Interceptor to capture any 401s or "user_token is required" messages across all requests
axios.interceptors.response.use(
  (response) => {
    // Check if the backend responded with HTTP 200 but contained an auth error payload
    const reqUrl = response?.config?.url || "";
    if (!isPublicEndpoint(reqUrl) && response?.data && checkIsAuthTokenError(response.data, response.status)) {
      const msg = response.data?.message || response.data?.error || response.data?.detail || "user_token is required. Please login.";
      dispatchAuthRequired(msg);
    }
    return response;
  },
  (error) => {
    const reqUrl = error?.config?.url || "";
    const status = error.response?.status;
    const data = error.response?.data;
    const msg = data?.message || data?.error || data?.detail || error.message;

    if (!isPublicEndpoint(reqUrl) && checkIsAuthTokenError(data || error, status)) {
      dispatchAuthRequired(msg);
    }
    return Promise.reject(error);
  }
);

// Lightweight in-memory cache for GET requests (TTL: 60 seconds)
const apiCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

// In-flight request deduplication for concurrent GET requests
const inFlightRequests = new Map();

// Negative failure cache for remote 500 errors to prevent flooding (10 seconds TTL)
const failureBackoffCache = new Map();
const FAILURE_BACKOFF_MS = 10 * 1000;

export const clearApiCache = (pattern = null) => {
  if (!pattern) {
    apiCache.clear();
    failureBackoffCache.clear();
  } else {
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
    for (const key of failureBackoffCache.keys()) {
      if (key.includes(pattern)) {
        failureBackoffCache.delete(key);
      }
    }
  }
};

/**
 * Generic API request helper using Axios
 * Includes ngrok browser warning skip header, in-memory caching, request deduplication, and token handling.
 */
export const apiRequest = async (endpoint, method = "GET", body = null, customHeaders = {}) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_API_URL}${cleanEndpoint}`;
  const upperMethod = method.toUpperCase();
  const isGet = upperMethod === "GET";
  const cacheKey = `${url}`;

  // Instant Cache Hit for GET requests within TTL window
  if (isGet && !customHeaders["no-cache"]) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    // If endpoint recently failed with 500 within backoff window, short-circuit
    const failedAt = failureBackoffCache.get(cacheKey);
    if (failedAt && Date.now() - failedAt < FAILURE_BACKOFF_MS) {
      const backoffErr = new Error("Server is currently experiencing an issue (500). Please try again in a moment.");
      backoffErr.status = 500;
      throw backoffErr;
    }

    // Deduplicate in-flight GET requests
    if (inFlightRequests.has(cacheKey)) {
      return await inFlightRequests.get(cacheKey);
    }
  }

  const headers = {
    "ngrok-skip-browser-warning": "true",
    ...customHeaders,
  };

  // Only set Content-Type to application/json if there is a non-FormData request body
  if (body !== null && body !== undefined) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (isFormData) {
      delete headers["Content-Type"];
    } else if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
  }

  const isAuthEndpoint = cleanEndpoint.includes("/login") || cleanEndpoint.includes("/register") || cleanEndpoint.includes("/verify-otp");

  if (!isAuthEndpoint) {
    const token = localStorage.getItem("user_token") || localStorage.getItem("userToken") || localStorage.getItem("token");

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["user-token"] = token;
      headers["user_token"] = token;
    }
  }

  const reqTimeout = customHeaders?.timeout || (url.includes("/wishlist") || url.includes("/cart") ? 3500 : 8000);

  const config = {
    method: method.toLowerCase(),
    url,
    headers,
    timeout: reqTimeout,
  };

  // Only attach data property if body is provided (avoid sending null payload in DELETE / GET)
  if (body !== null && body !== undefined) {
    config.data = body;
    console.log(`[API Request] ${method} ${url}`, body);
  } else {
    console.log(`[API Request] ${method} ${url}`);
  }

  const executeRequest = async () => {
    try {
      const response = await axios(config);
      if (!isPublicEndpoint(url) && response?.data && checkIsAuthTokenError(response.data, response.status)) {
        const msg = response.data?.message || response.data?.error || response.data?.detail || "user_token is required. Please login.";
        dispatchAuthRequired(msg);
      }

      // Save successful GET requests to in-memory cache
      if (isGet && !customHeaders["no-cache"]) {
        apiCache.set(cacheKey, { timestamp: Date.now(), data: response.data });
      } else if (!isGet) {
        // Invalidate cache on mutations (POST, PUT, DELETE)
        clearApiCache();
      }

      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const responseData = error.response?.data;
      const isHtmlResponse = typeof responseData === "string" && responseData.trim().startsWith("<");
      const isTimeout = error.code === "ECONNABORTED" || String(error.message || "").toLowerCase().includes("timeout");

      let errorMsg = "";
      if (isHtmlResponse) {
        errorMsg = status >= 500 
          ? "Server is currently experiencing an issue (500). Please try again in a moment."
          : `Server responded with status ${status || 500}`;
      } else {
        errorMsg = responseData?.message || responseData?.error || responseData?.detail || error.message || `Request failed with status ${status}`;
      }

      if (isGet && status >= 500) {
        failureBackoffCache.set(cacheKey, Date.now());
      }

      // For endpoints with fallback mechanisms (catalog items, prescriptions, addresses, local cart items, orders, wishlist), log as notice
      const isFallbackEligible = isPublicEndpoint(url) || url.includes("/prescription") || url.includes("/address") || url.includes("/cart") || url.includes("/order") || url.includes("/checkout") || url.includes("/wishlist");
      if (isFallbackEligible && (status === 404 || status === 400 || status === 405 || isTimeout || (status && status >= 500))) {
        console.warn(`[API Notice] ${method} ${url}: ${errorMsg} (using local fallback)`);
      } else {
        console.error(`[API Call Error] ${method} ${url}:`, errorMsg);
      }

      if (!isPublicEndpoint(url) && checkIsAuthTokenError(responseData || error, status)) {
        dispatchAuthRequired(errorMsg);
      }
      const customError = new Error(errorMsg);
      customError.status = status;
      customError.data = responseData;
      throw customError;
    }
  };

  if (isGet && !customHeaders["no-cache"]) {
    const promise = executeRequest().finally(() => {
      inFlightRequests.delete(cacheKey);
    });
    inFlightRequests.set(cacheKey, promise);
    return await promise;
  }

  return await executeRequest();
};

