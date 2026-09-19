import axios from "axios";
import { apiRequest, BASE_API_URL } from "./api";
import { productsData } from "../data/products";

export const CAPSULE_API_BASE_URL = BASE_API_URL;
export const STORE_API_BASE_URL = BASE_API_URL;

// Track product IDs that exist in the remote Django DB (e.g. 20, 22)
export const knownBackendProductIds = new Set([20, 22]);

export const registerBackendProductId = (id) => {
  const n = Number(id);
  if (!isNaN(n) && n > 0) knownBackendProductIds.add(n);
};

export const isBackendProduct = (id) => {
  const n = Number(id);
  return !isNaN(n) && knownBackendProductIds.has(n);
};

/**
 * Normalizes raw product data from API into standard application product structure
 */
export const normalizeProduct = (item, index = 0) => {
  if (!item) return null;
  const id = item.id || item.product_id || item._id || `store-1200-${index + 1}`;
  if (item.id || item.product_id) {
    registerBackendProductId(item.id || item.product_id);
  }
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
    store: item.store ? String(item.store) : (Number(price) === 1200 ? "1200" : null),
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

  const isStrict1200 = (p) => Number(p.price) === 1200 || p.store === "1200" || p.category === "₹1200 Store";

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
    const strictly1200 = normalized.filter(isStrict1200).map(p => ({ ...p, price: 1200 }));

    // If backend database currently has 0 store 1200 products, seamlessly fallback to catalog 1200 products
    if (strictly1200.length === 0) {
      const fallback1200 = productsData.filter(isStrict1200).map(p => ({ ...p, price: 1200 }));
      return {
        products: fallback1200,
        totalItems: fallback1200.length,
        totalPages: Math.max(1, Math.ceil(fallback1200.length / (limit || 9))),
        total_pages: Math.max(1, Math.ceil(fallback1200.length / (limit || 9))),
        total_data: fallback1200.length
      };
    }

    const totalPages = Number(rawData?.total_pages || (rawData?.total_data ? Math.ceil(rawData.total_data / (limit || 10)) : 1));
    const totalItems = Number(rawData?.total_items || rawData?.total_data || rawData?.count || strictly1200.length);

    return {
      products: strictly1200,
      totalItems,
      totalPages,
      total_pages: totalPages,
      total_data: totalItems
    };
  } catch (error) {
    console.error(`[getStoreProducts] GET /product/ failed:`, error.message);
    const fallback1200 = productsData.filter(isStrict1200).map(p => ({ ...p, price: 1200 }));
    return {
      products: fallback1200,
      totalItems: fallback1200.length,
      totalPages: Math.max(1, Math.ceil(fallback1200.length / (limit || 9))),
      total_pages: Math.max(1, Math.ceil(fallback1200.length / (limit || 9))),
      total_data: fallback1200.length
    };
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
export const createGlassProduct = async (productData, imageFile = null) => {
  let bodyPayload;

  if (typeof FormData !== "undefined" && productData instanceof FormData) {
    bodyPayload = productData;
    if (imageFile && !bodyPayload.has("image")) {
      bodyPayload.append("image", imageFile);
    }
  } else {
    const formData = new FormData();
    const productName = productData.product_name || productData.model_name || productData.name || "";
    formData.append("product_name", productName);
    formData.append("model_name", productName);
    formData.append("category_type", String(productData.category_type || productData.type || "eyeglasses").toLowerCase());
    formData.append("frame_size", String(productData.frame_size || productData.size || "M").toUpperCase());
    const isStore1200 = productData.category === "₹1200 Store" || 
                        productData.collection_tier === "essential" || 
                        productData.store === "1200" || 
                        Number(productData.price) === 1200;
    const finalPrice = (productData.category === "₹1200 Store" || productData.store === "1200") ? 1200 : Number(productData.price ?? 1200);

    formData.append("price", String(finalPrice));
    if (isStore1200) {
      formData.append("store", "1200");
    }
    formData.append("structure_style", String(productData.structure_style || productData.shape || "round").toLowerCase());
    formData.append("target_audience", String(productData.target_audience || productData.gender || "unisex").toLowerCase());
    formData.append("collection_tier", isStore1200 ? "essential" : String(productData.collection_tier || productData.category || "classic").toLowerCase());

    const colors = Array.isArray(productData.available_colors) && productData.available_colors.length > 0
      ? productData.available_colors
      : (productData.colors?.length ? productData.colors : ["black", "gold"]);
    formData.append("available_colors", JSON.stringify(colors));

    const nosePad = Boolean(productData.includes_adjustable_nose_pad ?? productData.adjustable_nose_pad ?? productData.hasNosePads ?? false);
    formData.append("includes_adjustable_nose_pad", String(nosePad));

    const bogo = Boolean(productData.applicable_for_buy_one_get_one ?? productData.isBogo ?? false);
    formData.append("applicable_for_buy_one_get_one", String(bogo));

    const fileToUpload = imageFile || productData.image || productData.file;
    if (fileToUpload instanceof File || fileToUpload instanceof Blob) {
      formData.append("image", fileToUpload);
    }

    bodyPayload = formData;
  }

  try {
    return await apiRequest("/glass-product/create/", "POST", bodyPayload);
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

  const allSunglasses = productsData.filter(p => p.type === 'sunglasses' || p.category === 'sunglasses');
  const fallbackTotalItems = allSunglasses.length;
  const fallbackTotalPages = Math.max(1, Math.ceil(fallbackTotalItems / limit));
  const fallbackSlice = allSunglasses.slice(offset, offset + limit);

  try {
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

    // If backend database has 0 sunglasses on this page or empty, seamlessly fallback to local catalog
    if (normalized.length === 0) {
      return {
        products: fallbackSlice,
        totalItems: fallbackTotalItems,
        totalPages: fallbackTotalPages,
        pagination: {
          page: page,
          total_items: fallbackTotalItems,
          total_pages: fallbackTotalPages,
        },
        page: page
      };
    }

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
  } catch (error) {
    console.warn(`[getSunglassesApi] Page ${page} failed (${error.message}). Falling back to local catalog.`);
    return {
      products: fallbackSlice,
      totalItems: fallbackTotalItems,
      totalPages: fallbackTotalPages,
      pagination: {
        page: page,
        total_items: fallbackTotalItems,
        total_pages: fallbackTotalPages,
      },
      page: page
    };
  }
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

  const allEyeglasses = productsData.filter(p => p.type === 'eyeglasses' || p.category === 'eyeglasses');
  const fallbackTotalItems = allEyeglasses.length;
  const fallbackTotalPages = Math.max(1, Math.ceil(fallbackTotalItems / limit));
  const fallbackSlice = allEyeglasses.slice(offset, offset + limit);

  try {
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

    // If backend database has 0 eyeglasses on this page or empty, seamlessly fallback to local catalog
    if (normalized.length === 0) {
      return {
        products: fallbackSlice,
        totalItems: fallbackTotalItems,
        totalPages: fallbackTotalPages,
        pagination: {
          page: page,
          total_items: fallbackTotalItems,
          total_pages: fallbackTotalPages,
        },
        page: page
      };
    }

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
  } catch (error) {
    console.warn(`[getEyeglassesApi] Page ${page} failed (${error.message}). Falling back to local catalog.`);
    return {
      products: fallbackSlice,
      totalItems: fallbackTotalItems,
      totalPages: fallbackTotalPages,
      pagination: {
        page: page,
        total_items: fallbackTotalItems,
        total_pages: fallbackTotalPages,
      },
      page: page
    };
  }
};

/**
 * Fetch Kids Club products (with optional product_name search)
 * GET https://capsule-most-rundown.ngrok-free.dev/api/kids-club/
 * Headers: Authorization: Bearer <user_token>, user-token: <user_token>, user_token: <user_token>
 * Method: GET
 */
export const getKidsClubApi = async (params = {}) => {
  const page = typeof params === "object" ? (params?.page || 1) : 1;
  const limit = typeof params === "object" ? (params?.limit || 9) : 9;
  const offset = (page - 1) * limit;
  const productName = typeof params === "object" ? (params?.product_name || params?.search || "") : (typeof params === "string" ? params : "");

  const allKids = productsData.filter(p => 
    (p.name || '').toLowerCase().includes('kid') || 
    (p.category || '').toLowerCase().includes('kid') || 
    (p.gender || '').toLowerCase().includes('kid') ||
    (p.type || '').toLowerCase().includes('kid')
  );
  const fallbackTotalItems = allKids.length;
  const fallbackTotalPages = Math.max(1, Math.ceil(fallbackTotalItems / limit));
  const fallbackSlice = allKids.slice(offset, offset + limit);

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

  try {
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

    // Fallback if empty
    if (normalized.length === 0) {
      return {
        products: fallbackSlice,
        totalItems: fallbackTotalItems,
        totalPages: fallbackTotalPages,
        pagination: {
          page: page,
          total_items: fallbackTotalItems,
          total_pages: fallbackTotalPages,
        },
        page: page
      };
    }

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
  } catch (error) {
    console.warn(`[getKidsClubApi] Page ${page} failed (${error.message}). Falling back to local catalog.`);
    return {
      products: fallbackSlice,
      totalItems: fallbackTotalItems,
      totalPages: fallbackTotalPages,
      pagination: {
        page: page,
        total_items: fallbackTotalItems,
        total_pages: fallbackTotalPages,
      },
      page: page
    };
  }
};

/**
 * Fetch Buy One Get One (BOGO) products
 * GET https://capsule-most-rundown.ngrok-free.dev/api/buy-one-get-one/
 */
export const getBuyOneGetOneApi = async (params = {}) => {
  const page = typeof params === "object" ? (params?.page || 1) : 1;
  const limit = typeof params === "object" ? (params?.limit || 9) : 9;
  const offset = (page - 1) * limit;
  const queryString = `?page=${page}&limit=${limit}&page_size=${limit}&page_number=${page}&offset=${offset}`;

  const allBogo = productsData.filter(p => p.isBogo || p.applicable_for_buy_one_get_one || (p.price && p.price <= 1500));
  const fallbackTotalItems = allBogo.length;
  const fallbackTotalPages = Math.max(1, Math.ceil(fallbackTotalItems / limit));
  const fallbackSlice = allBogo.slice(offset, offset + limit);

   try {
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

    // Fallback if empty
    if (normalized.length === 0) {
      return {
        products: fallbackSlice,
        totalItems: fallbackTotalItems,
        totalPages: fallbackTotalPages,
        pagination: {
          page: page,
          total_items: fallbackTotalItems,
          total_pages: fallbackTotalPages,
        },
        page: page
      };
    }

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
  } catch (error) {
    console.warn(`[getBuyOneGetOneApi] Page ${page} failed (${error.message}). Falling back to local catalog.`);
    return {
      products: fallbackSlice,
      totalItems: fallbackTotalItems,
      totalPages: fallbackTotalPages,
      pagination: {
        page: page,
        total_items: fallbackTotalItems,
        total_pages: fallbackTotalPages,
      },
      page: page
    };
  }
};

/**
 * Fetch single product details by product ID
 * GET https://capsule-most-rundown.ngrok-free.dev/api/product-details/?product-id=46
 * @param {string|number} productId
 */
export const getProductDetailsApi = async (productId) => {
  if (!productId) return null;

  const cleanId = String(productId).trim();
  if (!cleanId) return null;

  const url = `/product-details/?product_id=${encodeURIComponent(cleanId)}&product-id=${encodeURIComponent(cleanId)}`;

  console.log(`[getProductDetailsApi] GET ${url} (product_id: "${cleanId}")`);

  try {
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

    if (rawData && typeof rawData === "object" && (rawData.id || rawData.product_name || rawData.name)) {
      return normalizeProduct(rawData, 0);
    }
  } catch (error) {
    console.warn(`[getProductDetailsApi] Backend returned error for product #${cleanId} (${error.message}). Falling back to local catalog product.`);
  }

  // Fallback to local catalog product data if backend doesn't have it or returned 404
  const localProduct = productsData.find(p => String(p.id) === String(cleanId));
  return localProduct || null;
};

export { searchProductsApi } from "./searchService";






