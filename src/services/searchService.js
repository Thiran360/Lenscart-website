import { apiRequest } from "./api";
import { normalizeProduct } from "./productService";
import { productsData } from "../data/products";

/**
 * Reusable Search Products API Service
 * Endpoint: GET https://capsule-most-rundown.ngrok-free.dev/api/search/?filter=<search_query>
 * 
 * @param {string|object} params - Search keyword string or options object { filter, page, limit }
 * @returns {Promise<{ products: Array, totalItems: number, totalPages: number, page: number, pagination: object }>}
 */ 
export const searchProductsApi = async (params = {}) => {
  const filterVal = typeof params === "string" ? params : (params?.filter || params?.search || params?.q || "");
  const page = typeof params === "object" ? (params?.page || 1) : 1;
  const limit = typeof params === "object" ? (params?.limit || 9) : 9;

  if (!filterVal || !filterVal.trim()) {
    return { products: [], totalItems: 0, totalPages: 1, pagination: {}, page: 1 };
  }

  // Clean query string: only pass filter (and page only if > 1)
  const queryParts = [`filter=${encodeURIComponent(filterVal.trim())}`];
  if (page && page > 1) {
    queryParts.push(`page=${page}`);
  }

  const queryString = `?${queryParts.join("&")}`;
  
  try {
    const response = await apiRequest(`/search/${queryString}`, "GET");
    console.log(`[searchProductsApi] GET /search/${queryString}`, response);

    let list = [];
    if (Array.isArray(response)) {
      list = response;
    } else if (Array.isArray(response?.data)) {
      list = response.data;
    } else if (Array.isArray(response?.results)) {
      list = response.results;
    } else if (Array.isArray(response?.products)) {
      list = response.products;
    } else if (Array.isArray(response?.items)) {
      list = response.items;
    } else if (Array.isArray(response?.sunglasses)) {
      list = response.sunglasses;
    } else if (Array.isArray(response?.eyeglasses)) {
      list = response.eyeglasses;
    } else if (Array.isArray(response?.data?.results)) {
      list = response.data.results;
    } else if (Array.isArray(response?.data?.products)) {
      list = response.data.products;
    } else if (Array.isArray(response?.data?.items)) {
      list = response.data.items;
    } else if (Array.isArray(response?.data?.data)) {
      list = response.data.data;
    }

    const normalized = list.map((item, idx) => normalizeProduct(item, idx)).filter(Boolean);

    const pagination = response?.pagination || response?.data?.pagination || {};
    const totalPages = Number(
      pagination.total_pages || 
      response?.total_pages || 
      response?.data?.total_pages || 
      (pagination.total_items ? Math.ceil(pagination.total_items / limit) : null) || 
      Math.max(1, Math.ceil(normalized.length / limit))
    );

    const totalItems = Number(
      pagination.total_items || 
      response?.total_items || 
      response?.data?.total_items || 
      pagination.count || 
      (totalPages * limit) || 
      normalized.length
    );

    return {
      products: normalized,
      totalItems: totalItems,
      totalPages: totalPages,
      pagination: pagination,
      page: Number(pagination.page || page)
    };
  } catch (error) {
    console.warn(`[searchProductsApi] Search failed for filter="${filterVal}":`, error.message);
    // Seamless fallback to catalog products matching search keywords when backend API throws FieldError (500)
    const searchLower = filterVal.toLowerCase().trim();
    const localMatches = productsData.filter((p) => {
      const nameMatch = (p.name || "").toLowerCase().includes(searchLower);
      const brandMatch = (p.brand || "").toLowerCase().includes(searchLower);
      const typeMatch = (p.type || "").toLowerCase().includes(searchLower);
      const shapeMatch = (p.shape || "").toLowerCase().includes(searchLower);
      const catMatch = (p.category || "").toLowerCase().includes(searchLower);
      return nameMatch || brandMatch || typeMatch || shapeMatch || catMatch;
    });

    return {
      products: localMatches,
      totalItems: localMatches.length,
      totalPages: Math.max(1, Math.ceil(localMatches.length / limit)),
      pagination: {
        page: page,
        total_items: localMatches.length,
        total_pages: Math.max(1, Math.ceil(localMatches.length / limit)),
      },
      page: page,
    };
  }
};
