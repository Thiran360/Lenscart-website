import axios from "axios";
import { apiRequest, BASE_API_URL } from "./api";

export const CAPSULE_API_BASE_URL = BASE_API_URL;
export const STORE_API_BASE_URL = BASE_API_URL;

/**
 * Normalizes raw product data from API into standard application product structure
 */
export const normalizeProduct = (item, index = 0) => {
  if (!item) return null;
  const id = item.id || item.product_id || item._id || `store-1200-${index + 1}`;
  const price = Number(item.price || item.unit_price || item.selling_price || 1200);
  const oldPrice = Number(item.oldPrice || item.old_price || item.mrp || (price > 0 ? Math.round(price * 1.4) : 1800));
  const discount = Number(item.discount || (oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 25));

  // Format colors array
  let colors = ["black", "blue", "brown", "gold"];
  if (Array.isArray(item.colors) && item.colors.length > 0) {
    colors = item.colors.map(c => (typeof c === "string" ? c.toLowerCase() : String(c)));
  } else if (typeof item.colors === "string" && item.colors.trim()) {
    colors = item.colors.split(",").map((c) => c.trim().toLowerCase());
  } else if (item.color) {
    colors = typeof item.color === "string"
      ? item.color.split(",").map((c) => c.trim().toLowerCase())
      : [String(item.color).toLowerCase()];
  } else if (Array.isArray(item.available_colors) && item.available_colors.length > 0) {
    colors = item.available_colors.map(c => (typeof c === "string" ? c.toLowerCase() : String(c)));
  }

  // Format image
  let image = "/eyeglass1.png";
  if (item.image) {
    image = item.image;
  } else if (item.image_url) {
    image = item.image_url;
  } else if (Array.isArray(item.images) && item.images.length > 0) {
    image = typeof item.images[0] === "string" ? item.images[0] : item.images[0]?.url || "/eyeglass1.png";
  }

  return {
    id: id,
    name: item.model_name || item.name || item.product_name || item.title || `Mr.LensMaker Eyewear ${index + 1}`,
    brand: item.brand || "Mr.LensMaker",
    category: item.collection_tier ? (item.collection_tier.charAt(0).toUpperCase() + item.collection_tier.slice(1)) : (item.category || "Classic"),
    type: item.category_type || item.type || "eyeglasses",
    gender: item.target_audience ? (item.target_audience.charAt(0).toUpperCase() + item.target_audience.slice(1)) : (item.gender || "Unisex"),
    shape: item.structure_style ? (item.structure_style.charAt(0).toUpperCase() + item.structure_style.slice(1)) : (item.shape || "Rectangle"),
    size: item.frame_size || item.size || "M",
    rating: Number(item.rating || 4.8),
    price: price,
    oldPrice: oldPrice,
    discount: discount,
    image: image,
    description: item.description || "High-quality durable frames with premium optical finish.",
    colors: colors,
    hasNosePads: item.includes_adjustable_nose_pad ?? item.adjustable_nose_pad ?? true,
    applicable_for_buy_one_get_one: Boolean(item.applicable_for_buy_one_get_one ?? item.bogo ?? false),
    isBogo: Boolean(item.applicable_for_buy_one_get_one ?? item.bogo ?? false),
    lensPower: item.lensPower || ["-2.00", "-1.50", "-1.00", "-0.50", "0.00", "+0.50", "+1.00", "+1.50", "+2.00"],
    store: item.store || "1200",
    isCustom: true,
    isApiItem: true,
    created_at: item.created_at
  };
};

/**
 * Fetch products for a specific store (e.g. store=1200 with optional product_name search)
 * GET https://capsule-most-rundown.ngrok-free.dev/api/product/?store=1200&product_name=Titanium
 */
export const getStoreProducts = async (params = "1200") => {
  let store = typeof params === "string" ? params : (params?.store || "1200");
  let productName = typeof params === "object" ? (params?.product_name || params?.search || "") : "";
  let page = typeof params === "object" ? params?.page : null;
  let limit = typeof params === "object" ? params?.limit : null;

  let queryParams = [`store=${encodeURIComponent(store)}`];
  if (productName && productName.trim()) {
    queryParams.push(`product_name=${encodeURIComponent(productName.trim())}`);
  }
  if (page) queryParams.push(`page=${page}`);
  if (limit) queryParams.push(`limit=${limit}`);

  try {
    const rawData = await apiRequest(`/product/?${queryParams.join("&")}`, "GET");
    let list = [];

    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (rawData && Array.isArray(rawData.data)) {
      list = rawData.data;
    } else if (rawData && Array.isArray(rawData.results)) {
      list = rawData.results;
    } else if (rawData && Array.isArray(rawData.products)) {
      list = rawData.products;
    } else if (rawData && typeof rawData === "object") {
      list = Object.values(rawData).filter(v => typeof v === "object" && v !== null);
    }

    const normalized = list.map((item, idx) => normalizeProduct(item, idx)).filter(Boolean);
    const totalPages = Number(rawData?.total_pages || (rawData?.total_data ? Math.ceil(rawData.total_data / (limit || 10)) : 1));
    const totalItems = Number(rawData?.total_items || rawData?.total_data || rawData?.count || normalized.length);

    return {
      products: normalized,
      totalItems,
      totalPages,
      total_pages: totalPages,
      total_data: totalItems
    };
  } catch (error) {
    console.error(`[getStoreProducts] GET /product/ failed:`, error.message);
    throw error;
  }
};

/**
 * Fetch all catalog stock products with API search and category filtering
 * GET /glass-product/
 * GET /glass-product/?filter=eyeglasses&category_type=eyeglasses&model_name=...
 */
export const getGlassProducts = async (params = {}) => {
  let queryParams = [];

  let filterValue = typeof params === "string" ? params : params?.filter;
  let searchValue = typeof params === "object" ? params?.search : null;
  let page = typeof params === "object" ? (params?.page || 1) : 1;
  let limit = typeof params === "object" ? (params?.limit || params?.count || 10) : 10;

  if (page) queryParams.push(`page=${page}`);
  if (limit) queryParams.push(`count=${limit}`);

  if (filterValue && filterValue !== "all") {
    queryParams.push(`filter=${encodeURIComponent(filterValue)}`);
    queryParams.push(`category_type=${encodeURIComponent(filterValue)}`);
  }

  if (searchValue && searchValue.trim()) {
    const trimmed = searchValue.trim();
    queryParams.push(`model_name=${encodeURIComponent(trimmed)}`);
    queryParams.push(`search=${encodeURIComponent(trimmed)}`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

  try {
    const rawData = await apiRequest(`/glass-product/${queryString}`, "GET");
    let list = [];

    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (rawData && Array.isArray(rawData.data)) {
      list = rawData.data;
    } else if (rawData && Array.isArray(rawData.results)) {
      list = rawData.results;
    } else if (rawData && Array.isArray(rawData.products)) {
      list = rawData.products;
    }

    const normalized = list.map((item, idx) => normalizeProduct(item, idx)).filter(Boolean);
    const totalPages = Number(rawData?.total_pages || (rawData?.total_data ? Math.ceil(rawData.total_data / limit) : 1));
    const totalData = Number(rawData?.total_data ?? rawData?.count ?? normalized.length);
    const currentPageNum = Number(rawData?.page || page);

    return {
      raw: rawData,
      products: normalized,
      total_pages: totalPages,
      totalPages: totalPages,
      total_data: totalData,
      totalCount: totalData,
      page: currentPageNum,
      count: rawData?.count || limit
    };
  } catch (error) {
    console.error(`[getGlassProducts] GET /glass-product/${queryString} failed:`, error.message);
    throw error;
  }
};

/**
 * Create a new glass product
 * POST /glass-product/create/
 */
export const createGlassProduct = async (productData) => {
  const productName = productData.product_name || productData.model_name || productData.name;

  const payload = {
    product_name: productName,
    model_name: productName,
    category_type: String(productData.category_type || productData.type || "eyeglasses").toLowerCase(),
    frame_size: String(productData.frame_size || productData.size || "M").toUpperCase(),
    price: Number(productData.price || 1200),
    structure_style: String(productData.structure_style || productData.shape || "round").toLowerCase(),
    target_audience: String(productData.target_audience || productData.gender || "men").toLowerCase(),
    collection_tier: String(productData.collection_tier || productData.category || "premium").toLowerCase(),
    available_colors: Array.isArray(productData.available_colors) && productData.available_colors.length > 0
      ? productData.available_colors
      : (productData.colors?.length ? productData.colors : ["black", "blue", "brown"]),
    adjustable_nose_pad: Boolean(productData.adjustable_nose_pad ?? productData.hasNosePads ?? false),
    applicable_for_buy_one_get_one: Boolean(productData.applicable_for_buy_one_get_one ?? productData.isBogo ?? false)
  };

  try {
    return await apiRequest("/glass-product/create/", "POST", payload);
  } catch (error) {
    console.error(`[createGlassProduct] POST /glass-product/create/ failed:`, error.message);
    throw error;
  }
};

/**
 * Delete a product by ID
 * DELETE /product/delete/{productId}/
 */
export const deleteGlassProduct = async (productId) => {
  try {
    return await apiRequest(`/product/delete/${productId}/`, "DELETE");
  } catch (error) {
    console.error(`[deleteGlassProduct] DELETE /product/delete/${productId}/ failed:`, error.message);
    throw error;
  }
};

/**
 * Fetch sunglasses products
 * GET /sunglasses/
 */
export const getSunglassesApi = async (params = {}) => {
  const page = typeof params === "object" ? (params?.page || 1) : 1;
  const limit = typeof params === "object" ? (params?.limit || 9) : 9;
  const offset = (page - 1) * limit;
  const queryString = `?page=${page}&limit=${limit}&page_size=${limit}&page_number=${page}&offset=${offset}`;

  const response = await apiRequest(`/sunglasses/${queryString}`, "GET");
  console.log("[Sunglasses API Response]", response);

  let list = [];
  if (Array.isArray(response)) {
    list = response;
  } else if (Array.isArray(response?.data)) {
    list = response.data;
  } else if (Array.isArray(response?.results)) {
    list = response.results;
  } else if (Array.isArray(response?.sunglasses)) {
    list = response.sunglasses;
  } else if (Array.isArray(response?.products)) {
    list = response.products;
  } else if (Array.isArray(response?.items)) {
    list = response.items;
  } else if (Array.isArray(response?.data?.results)) {
    list = response.data.results;
  } else if (Array.isArray(response?.data?.products)) {
    list = response.data.products;
  } else if (Array.isArray(response?.data?.sunglasses)) {
    list = response.data.sunglasses;
  } else if (Array.isArray(response?.data?.items)) {
    list = response.data.items;
  } else if (Array.isArray(response?.data?.data)) {
    list = response.data.data;
  }

  const normalized = list.map((item, idx) => normalizeProduct({ ...item, type: 'sunglasses' }, idx)).filter(Boolean);

  const pagination = response?.pagination || response?.data?.pagination || {};
  const totalPages = Number(pagination.total_pages || response?.total_pages || response?.data?.total_pages || (pagination.total_items ? Math.ceil(pagination.total_items / limit) : null) || Math.max(1, Math.ceil(normalized.length / limit)));
  const totalItems = Number(pagination.total_items || response?.total_items || response?.data?.total_items || pagination.count || (totalPages * limit) || normalized.length);

  return {
    products: normalized,
    totalItems: totalItems,
    totalPages: totalPages,
    pagination: pagination,
    page: Number(pagination.page || page)
  };
};

/**
 * Fetch eyeglasses products
 * GET /eyeglasses/
 */
export const getEyeglassesApi = async (params = {}) => {
  const page = typeof params === "object" ? (params?.page || 1) : 1;
  const limit = typeof params === "object" ? (params?.limit || 9) : 9;
  const offset = (page - 1) * limit;
  const queryString = `?page=${page}&limit=${limit}&page_size=${limit}&page_number=${page}&offset=${offset}`;

  const response = await apiRequest(`/eyeglasses/${queryString}`, "GET");
  console.log("[Eyeglasses API Response]", response);

  let list = [];
  if (Array.isArray(response)) {
    list = response;
  } else if (Array.isArray(response?.data)) {
    list = response.data;
  } else if (Array.isArray(response?.results)) {
    list = response.results;
  } else if (Array.isArray(response?.eyeglasses)) {
    list = response.eyeglasses;
  } else if (Array.isArray(response?.products)) {
    list = response.products;
  } else if (Array.isArray(response?.items)) {
    list = response.items;
  } else if (Array.isArray(response?.data?.results)) {
    list = response.data.results;
  } else if (Array.isArray(response?.data?.products)) {
    list = response.data.products;
  } else if (Array.isArray(response?.data?.eyeglasses)) {
    list = response.data.eyeglasses;
  } else if (Array.isArray(response?.data?.items)) {
    list = response.data.items;
  } else if (Array.isArray(response?.data?.data)) {
    list = response.data.data;
  }

  const normalized = list.map((item, idx) => normalizeProduct({ ...item, type: 'eyeglasses' }, idx)).filter(Boolean);

  const pagination = response?.pagination || response?.data?.pagination || {};
  const totalPages = Number(pagination.total_pages || response?.total_pages || response?.data?.total_pages || (pagination.total_items ? Math.ceil(pagination.total_items / limit) : null) || Math.max(1, Math.ceil(normalized.length / limit)));
  const totalItems = Number(pagination.total_items || response?.total_items || response?.data?.total_items || pagination.count || (totalPages * limit) || normalized.length);

  return {
    products: normalized,
    totalItems: totalItems,
    totalPages: totalPages,
    pagination: pagination,
    page: Number(pagination.page || page)
  };
};

/**
 * Fetch Kids Club products (with optional product_name search)
 * GET https://reformist-egotism-backlash.ngrok-free.dev/api/kids-club/
 * Headers: Authorization: Bearer <user_token>, user-token: <user_token>, user_token: <user_token>
 * Method: GET
 */
export const getKidsClubApi = async (params = {}) => {
  const page = typeof params === "object" ? (params?.page || 1) : 1;
  const limit = typeof params === "object" ? (params?.limit || 9) : 9;
  const offset = (page - 1) * limit;
  const productName = typeof params === "object" ? (params?.product_name || params?.search || "") : (typeof params === "string" ? params : "");

  let queryParts = [
    `page=${page}`,
    `limit=${limit}`,
    `page_size=${limit}`,
    `page_number=${page}`,
    `offset=${offset}`
  ];

  if (productName && productName.trim() && productName.trim() !== "kids") {
    queryParts.push(`product_name=${encodeURIComponent(productName.trim())}`);
  }

  const queryString = `?${queryParts.join("&")}`;
  const response = await apiRequest(`/kids-club/${queryString}`, "GET");
  console.log("[Kids Club API Response]", response);

  let list = [];
  if (Array.isArray(response)) {
    list = response;
  } else if (Array.isArray(response?.data)) {
    list = response.data;
  } else if (Array.isArray(response?.results)) {
    list = response.results;
  } else if (Array.isArray(response?.kids_club)) {
    list = response.kids_club;
  } else if (Array.isArray(response?.kids)) {
    list = response.kids;
  } else if (Array.isArray(response?.products)) {
    list = response.products;
  } else if (Array.isArray(response?.items)) {
    list = response.items;
  } else if (Array.isArray(response?.data?.results)) {
    list = response.data.results;
  } else if (Array.isArray(response?.data?.products)) {
    list = response.data.products;
  } else if (Array.isArray(response?.data?.kids_club)) {
    list = response.data.kids_club;
  } else if (Array.isArray(response?.data?.kids)) {
    list = response.data.kids;
  } else if (Array.isArray(response?.data?.data)) {
    list = response.data.data;
  }

  const normalized = list.map((item, idx) => normalizeProduct({
    ...item,
    category: item.collection_tier || 'Kids',
    type: item.category_type || 'kids',
    target_audience: 'kids'
  }, idx)).filter(Boolean);

  const pagination = response?.pagination || response?.data?.pagination || {};
  const totalPages = Number(pagination.total_pages || response?.total_pages || response?.data?.total_pages || (pagination.total_items ? Math.ceil(pagination.total_items / limit) : null) || Math.max(1, Math.ceil(normalized.length / limit)));
  const totalItems = Number(pagination.total_items || response?.total_items || response?.data?.total_items || pagination.count || (totalPages * limit) || normalized.length);

  return {
    products: normalized,
    totalItems: totalItems,
    totalPages: totalPages,
    pagination: pagination,
    page: Number(pagination.page || page)
  };
};

/**
 * Fetch Buy One Get One (BOGO) products
 * GET https://reformist-egotism-backlash.ngrok-free.dev/api/buy-one-get-one/
 */
export const getBuyOneGetOneApi = async (params = {}) => {
  const page = typeof params === "object" ? (params?.page || 1) : 1;
  const limit = typeof params === "object" ? (params?.limit || 9) : 9;
  const offset = (page - 1) * limit;
  const queryString = `?page=${page}&limit=${limit}&page_size=${limit}&page_number=${page}&offset=${offset}`;

  const response = await apiRequest(`/buy-one-get-one/${queryString}`, "GET");
  console.log("[Buy One Get One API Response]", response);

  let list = [];
  if (Array.isArray(response)) {
    list = response;
  } else if (Array.isArray(response?.data)) {
    list = response.data;
  } else if (Array.isArray(response?.results)) {
    list = response.results;
  } else if (Array.isArray(response?.buy_one_get_one)) {
    list = response.buy_one_get_one;
  } else if (Array.isArray(response?.bogo)) {
    list = response.bogo;
  } else if (Array.isArray(response?.products)) {
    list = response.products;
  } else if (Array.isArray(response?.items)) {
    list = response.items;
  } else if (Array.isArray(response?.data?.results)) {
    list = response.data.results;
  } else if (Array.isArray(response?.data?.products)) {
    list = response.data.products;
  } else if (Array.isArray(response?.data?.buy_one_get_one)) {
    list = response.data.buy_one_get_one;
  } else if (Array.isArray(response?.data?.bogo)) {
    list = response.data.bogo;
  } else if (Array.isArray(response?.data?.items)) {
    list = response.data.items;
  } else if (Array.isArray(response?.data?.data)) {
    list = response.data.data;
  }

  const normalized = list.map((item, idx) => normalizeProduct({
    ...item,
    applicable_for_buy_one_get_one: true,
    isBogo: true,
  }, idx)).filter(Boolean);

  const pagination = response?.pagination || response?.data?.pagination || {};
  const totalPages = Number(pagination.total_pages || response?.total_pages || response?.data?.total_pages || (pagination.total_items ? Math.ceil(pagination.total_items / limit) : null) || Math.max(1, Math.ceil(normalized.length / limit)));
  const totalItems = Number(pagination.total_items || response?.total_items || response?.data?.total_items || pagination.count || (totalPages * limit) || normalized.length);

  return {
    products: normalized,
    totalItems: totalItems,
    totalPages: totalPages,
    pagination: pagination,
    page: Number(pagination.page || page)
  };
};

/**
 * Fetch single product details by product ID
 * GET https://reformist-egotism-backlash.ngrok-free.dev/api/product-details/?product-id=46
 * @param {string|number} productId
 */
export const getProductDetailsApi = async (productId) => {
  if (!productId) return null;

  const cleanId = String(productId).trim();
  const url = `/product-details/?product-id=${encodeURIComponent(cleanId)}`;

  console.log(`[getProductDetailsApi] GET ${url} (product-id: "${cleanId}")`);

  const response = await apiRequest(url, "GET");
  console.log("[getProductDetailsApi Response]:", response);

  let rawData = response?.data?.product || 
                response?.data?.product_details || 
                response?.product_details || 
                response?.product || 
                response?.data || 
                response;

  if (Array.isArray(rawData)) {
    rawData = rawData[0];
  }

  if (rawData && typeof rawData === "object") {
    return normalizeProduct(rawData, 0);
  }
  return null;
};

export { searchProductsApi } from "./searchService";






