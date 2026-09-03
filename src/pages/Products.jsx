import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Filter from "../components/Filter";
import ProductCard from "../components/ProductCard";
import VirtualTryOn from "../components/VirtualTryOn";
import Pagination from "../components/Pagination";
import { productsData } from "../data/products";
import { getStoreProducts, getSunglassesApi, getEyeglassesApi, getKidsClubApi, getBuyOneGetOneApi, searchProductsApi } from "../services/productService";
import { FaSearchMinus, FaRedo, FaSpinner } from "react-icons/fa";
import "./ProductsLayout.css";

function Products() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ gender: [], brand: [], shape: [], size: [], color: [], price: [], material: [], bestSellers: [], sales: [], lensPower: [] });
  const [sortOrder, setSortOrder] = useState("Recommended");
  const [is3DMode, setIs3DMode] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  // 1200 Store API State
  const [storeApiProducts, setStoreApiProducts] = useState([]);
  const [isLoadingStore, setIsLoadingStore] = useState(false);

  // Category (Eyeglasses / Sunglasses / Kids) API State
  const [categoryApiProducts, setCategoryApiProducts] = useState([]);
  const [categoryApiTotalItems, setCategoryApiTotalItems] = useState(0);
  const [categoryApiTotalPages, setCategoryApiTotalPages] = useState(1);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);

  // Search API State
  const [searchApiProducts, setSearchApiProducts] = useState([]);
  const [searchApiTotalItems, setSearchApiTotalItems] = useState(0);
  const [searchApiTotalPages, setSearchApiTotalPages] = useState(1);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // Buy One Get One (BOGO) API State
  const [bogoApiProducts, setBogoApiProducts] = useState([]);
  const [bogoApiTotalItems, setBogoApiTotalItems] = useState(0);
  const [bogoApiTotalPages, setBogoApiTotalPages] = useState(1);
  const [isLoadingBogo, setIsLoadingBogo] = useState(false);
  
  // AR Virtual Try-On Modal State
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [tryOnColor, setTryOnColor] = useState("black");

  const handleOpenTryOn = (product, selectedColor) => {
    setTryOnProduct(product);
    setTryOnColor(selectedColor || product?.colors?.[0] || "black");
    setIsTryOnOpen(true);
  };
  
  // Use location to get query params (e.g. ?type=sunglasses, ?store=1200)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filterType = searchParams.get("type"); // "eyeglasses" or "sunglasses" or "kids"
  const searchQuery = searchParams.get("search");
  const storeQuery = searchParams.get("store");
  const maxPriceQuery = searchParams.get("maxPrice");
  const isBogoShop = searchParams.get("bogo") === "true";
  const is1200Store = storeQuery === "1200" || maxPriceQuery === "1200";

  // Hide / Redirect bare /products route with no query params to /products?type=eyeglasses
  useEffect(() => {
    if (!filterType && !searchQuery && !storeQuery && !isBogoShop && !maxPriceQuery) {
      navigate("/products?type=eyeglasses", { replace: true });
    }
  }, [filterType, searchQuery, storeQuery, isBogoShop, maxPriceQuery, navigate]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setFilters({ gender: [], brand: [], shape: [], size: [], color: [], price: [], material: [], bestSellers: [], sales: [], lensPower: [] });
    setCurrentPage(1);
  }, [filterType, storeQuery]);

  // Search API fetch when searchQuery query param is present (except "kids" which uses Kids Club API)
  useEffect(() => {
    if (!searchQuery || !searchQuery.trim() || searchQuery === "kids") {
      setSearchApiProducts([]);
      setSearchApiTotalItems(0);
      setSearchApiTotalPages(1);
      setIsLoadingSearch(false);
      return;
    }

    let isMounted = true;
    setIsLoadingSearch(true);

    searchProductsApi({ filter: searchQuery.trim(), page: currentPage, limit: itemsPerPage })
      .then((res) => {
        if (!isMounted) return;
        const prods = Array.isArray(res) ? res : res?.products || [];
        const total = Number(res?.totalItems || res?.pagination?.total_items || prods.length);
        const totalPages = Number(res?.totalPages || res?.pagination?.total_pages || Math.max(1, Math.ceil(total / itemsPerPage)));

        if (prods.length > 0) {
          setSearchApiProducts(prods);
          setSearchApiTotalItems(total);
          setSearchApiTotalPages(totalPages);
        } else {
          setSearchApiProducts([]);
          setSearchApiTotalItems(0);
          setSearchApiTotalPages(1);
        }
      })
      .catch((err) => {
        console.warn("[Search API Warning]:", err.message);
        setSearchApiProducts([]);
        setSearchApiTotalItems(0);
        setSearchApiTotalPages(1);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSearch(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, currentPage]);

  // Fetch Category Products from API when type is eyeglasses, sunglasses, or kids
  useEffect(() => {
    if (filterType === "kids" || searchQuery === "kids") {
      let isMounted = true;
      setIsLoadingCategory(true);

      const kidSearchParam = (searchQuery && searchQuery !== "kids") ? searchQuery : "";
      getKidsClubApi({ page: currentPage, limit: itemsPerPage, product_name: kidSearchParam })
        .then((res) => {
          if (!isMounted) return;
          const prods = Array.isArray(res) ? res : res?.products || [];
          const total = Number(res?.totalItems || res?.pagination?.total_items || prods.length);
          const totalPages = Number(res?.totalPages || res?.pagination?.total_pages || Math.max(1, Math.ceil(total / itemsPerPage)));

          if (prods.length > 0) {
            setCategoryApiProducts(prods);
            setCategoryApiTotalItems(total);
            setCategoryApiTotalPages(totalPages);
          } else {
            setCategoryApiProducts([]);
            setCategoryApiTotalItems(0);
            setCategoryApiTotalPages(1);
          }
        })
        .catch((err) => {
          console.warn("Kids Club API fetch warning:", err.message);
          setCategoryApiProducts([]);
          setCategoryApiTotalItems(0);
          setCategoryApiTotalPages(1);
        })
        .finally(() => {
          if (isMounted) setIsLoadingCategory(false);
        });

      return () => {
        isMounted = false;
      };
    } else if (searchQuery && searchQuery !== "kids") {
      return; // If general searching, let search API handle results
    } else if (filterType === "sunglasses") {
      let isMounted = true;
      setIsLoadingCategory(true);

      getSunglassesApi({ page: currentPage, limit: itemsPerPage })
        .then((res) => {
          if (!isMounted) return;
          const prods = Array.isArray(res) ? res : res?.products || [];
          const total = Number(res?.totalItems || res?.pagination?.total_items || prods.length);
          const totalPages = Number(res?.totalPages || res?.pagination?.total_pages || Math.max(1, Math.ceil(total / itemsPerPage)));

          if (prods.length > 0) {
            setCategoryApiProducts(prods);
            setCategoryApiTotalItems(total);
            setCategoryApiTotalPages(totalPages);
          } else {
            setCategoryApiProducts([]);
            setCategoryApiTotalItems(0);
            setCategoryApiTotalPages(1);
          }
        })
        .catch((err) => {
          console.warn("Sunglasses API fetch warning:", err.message);
          setCategoryApiProducts([]);
          setCategoryApiTotalItems(0);
          setCategoryApiTotalPages(1);
        })
        .finally(() => {
          if (isMounted) setIsLoadingCategory(false);
        });

      return () => {
        isMounted = false;
      };
    } else if (filterType === "eyeglasses") {
      let isMounted = true;
      setIsLoadingCategory(true);

      getEyeglassesApi({ page: currentPage, limit: itemsPerPage })
        .then((res) => {
          if (!isMounted) return;
          const prods = Array.isArray(res) ? res : res?.products || [];
          const total = Number(res?.totalItems || res?.pagination?.total_items || prods.length);
          const totalPages = Number(res?.totalPages || res?.pagination?.total_pages || Math.max(1, Math.ceil(total / itemsPerPage)));

          if (prods.length > 0) {
            setCategoryApiProducts(prods);
            setCategoryApiTotalItems(total);
            setCategoryApiTotalPages(totalPages);
          } else {
            setCategoryApiProducts([]);
            setCategoryApiTotalItems(0);
            setCategoryApiTotalPages(1);
          }
        })
        .catch((err) => {
          console.warn("Eyeglasses API fetch warning:", err.message);
          setCategoryApiProducts([]);
          setCategoryApiTotalItems(0);
          setCategoryApiTotalPages(1);
        })
        .finally(() => {
          if (isMounted) setIsLoadingCategory(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setCategoryApiProducts([]);
      setCategoryApiTotalItems(0);
      setCategoryApiTotalPages(1);
      setIsLoadingCategory(false);
    }
  }, [filterType, currentPage, searchQuery]);

  // Fetch 1200 Store products from API when store=1200 (supports product_name search)
  useEffect(() => {
    if (is1200Store) {
      let isMounted = true;
      setIsLoadingStore(true);

      getStoreProducts({ store: "1200", product_name: searchQuery || "", page: currentPage, limit: itemsPerPage })
        .then((res) => {
          if (!isMounted) return;
          const prods = Array.isArray(res) ? res : (res?.products || []);
          if (Array.isArray(prods) && prods.length > 0) {
            setStoreApiProducts(prods);
          } else {
            setStoreApiProducts([]);
          }
        })
        .catch((err) => {
          console.warn("1200 Store API fetch failed:", err.message);
          setStoreApiProducts([]);
        })
        .finally(() => {
          if (isMounted) setIsLoadingStore(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setStoreApiProducts([]);
      setIsLoadingStore(false);
    }
  }, [is1200Store, searchQuery, currentPage]);

  // Fetch Buy One Get One (BOGO) products from API when isBogoShop is active
  useEffect(() => {
    if (isBogoShop) {
      let isMounted = true;
      setIsLoadingBogo(true);

      getBuyOneGetOneApi({ page: currentPage, limit: itemsPerPage })
        .then((res) => {
          if (!isMounted) return;
          const prods = Array.isArray(res) ? res : res?.products || [];
          const total = Number(res?.totalItems || res?.pagination?.total_items || prods.length);
          const totalPages = Number(res?.totalPages || res?.pagination?.total_pages || Math.max(1, Math.ceil(total / itemsPerPage)));

          if (prods.length > 0) {
            setBogoApiProducts(prods);
            setBogoApiTotalItems(total);
            setBogoApiTotalPages(totalPages);
          } else {
            setBogoApiProducts([]);
            setBogoApiTotalItems(0);
            setBogoApiTotalPages(1);
          }
        })
        .catch((err) => {
          console.warn("Buy One Get One API fetch warning:", err.message);
          setBogoApiProducts([]);
          setBogoApiTotalItems(0);
          setBogoApiTotalPages(1);
        })
        .finally(() => {
          if (isMounted) setIsLoadingBogo(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setBogoApiProducts([]);
      setBogoApiTotalItems(0);
      setBogoApiTotalPages(1);
      setIsLoadingBogo(false);
    }
  }, [isBogoShop, currentPage]);

  const isKidsClub = searchQuery === "kids" || filterType === "kids";

  const allProductsList = productsData;

  // Base list strictly depending on active search, active category, bogo, or store API
  let baseProducts = [];
  if (isBogoShop) {
    // Buy One Get One: strictly use BOGO API products
    baseProducts = bogoApiProducts;
  } else if (filterType === "kids" || searchQuery === "kids") {
    // Kids Club: strictly use Kids Club API products
    baseProducts = categoryApiProducts;
  } else if (is1200Store) {
    // 1200 Store: strictly use 1200 API products
    baseProducts = storeApiProducts;
  } else if (searchQuery && searchQuery !== "kids") {
    // When searching: strictly use searchApiProducts (if API fails or returns 0, stays empty)
    baseProducts = searchApiProducts;
  } else if (filterType === "sunglasses" || filterType === "eyeglasses") {
    // Eyeglasses / Sunglasses: strictly use API products
    baseProducts = categoryApiProducts;
  } else {
    // Default root /products view
    baseProducts = allProductsList;
  }

  const getCategoryStats = (type, bogo, kids, is1200) => {
    let items = baseProducts;
    if (type && type !== 'kids') items = items.filter(p => p.type === type);
    if (kids) items = items.filter(p => p.category?.toLowerCase().includes('kids') || p.name?.toLowerCase().includes('kids') || p.gender?.toLowerCase().includes('kids'));
    if (is1200 && storeApiProducts.length === 0) items = items.filter(p => p.price <= 1200);

    if (!items.length) return { minPrice: 1000, maxPrice: 5000, maxDiscount: 33 };
    const prices = items.map(p => Number(p.price)).filter(p => !isNaN(p) && p > 0);
    const discounts = items.map(p => Number(p.discount)).filter(d => !isNaN(d) && d > 0);

    const minPrice = prices.length ? Math.min(...prices) : 1200;
    const maxPrice = prices.length ? Math.max(...prices) : 4000;
    const maxDiscount = discounts.length ? Math.max(...discounts) : 33;
    return { minPrice, maxPrice, maxDiscount };
  };

  const showBanner = filterType || isKidsClub || isBogoShop || is1200Store;
  const categoryStats = showBanner ? getCategoryStats(filterType, isBogoShop, isKidsClub, is1200Store) : null;

  const getCategoryTitle = (type, bogo, kids, is1200) => {
    if (searchQuery && searchQuery !== 'kids') return `Search: "${searchQuery}"`;
    if (bogo) return 'Buy 1 Get 1 Exclusive';
    if (kids) return 'Kids Club';
    if (is1200) return '₹1200 Store';
    switch (type) {
      case 'eyeglasses': return 'Eyeglasses';
      case 'sunglasses': return 'Sunglasses';
      case 'kids': return 'Kids Glasses';
      case 'contacts': return 'Contact Lenses';
      default: return 'Products';
    }
  };

  // Filtering Logic
  let processedProducts = [...baseProducts];

  // 0. URL Query Filter (Eyeglasses vs Sunglasses vs Kids) - only active if not searching
  if (filterType && (!searchQuery || searchQuery === "kids")) {
    const targetType = filterType.toLowerCase();
    if (targetType === 'kids') {
      processedProducts = processedProducts.filter(p => 
        p.category?.toLowerCase().includes('kids') || 
        p.gender?.toLowerCase().includes('kids') || 
        p.name?.toLowerCase().includes('kids') ||
        String(p.type || '').toLowerCase() === 'kids'
      );
    } else {
      processedProducts = processedProducts.filter(p => 
        String(p.type || '').toLowerCase() === targetType
      );
    }
  }

  // 0.2 Max Price Filter (e.g. ₹1200 Store local fallback filter if API not used)
  if (maxPriceQuery && (!is1200Store || storeApiProducts.length === 0)) {
    const maxVal = Number(maxPriceQuery);
    if (!isNaN(maxVal)) {
      processedProducts = processedProducts.filter(p => p.price <= maxVal);
    }
  }

  // 1. Sidebar Filters (Gender, Brand, Shape)
  if (filters.gender && filters.gender.length > 0) {
    const lowerGenders = filters.gender.map(g => g.toLowerCase());
    processedProducts = processedProducts.filter(p => 
      p.gender && (lowerGenders.includes(p.gender.toLowerCase()) || (p.gender.toLowerCase() === 'unisex'))
    );
  }
  if (filters.brand && filters.brand.length > 0) {
    const lowerBrands = filters.brand.map(b => b.toLowerCase());
    processedProducts = processedProducts.filter(p => 
      p.brand && lowerBrands.some(b => p.brand.toLowerCase().includes(b))
    );
  }
  if (filters.shape && filters.shape.length > 0) {
    const lowerShapes = filters.shape.map(s => s.toLowerCase());
    processedProducts = processedProducts.filter(p => 
      p.shape && lowerShapes.includes(p.shape.toLowerCase())
    );
  }

  // 2. Sidebar Filters (Size, Color, Price, Material, Best Sellers, Sales, Lens Power)
  if (filters.size && filters.size.length > 0) {
    const upperSizes = filters.size.map(s => s.toUpperCase());
    processedProducts = processedProducts.filter(p => 
      p.size && upperSizes.includes(String(p.size).toUpperCase())
    );
  }
  
  if (filters.color && filters.color.length > 0) {
    const lowerColors = filters.color.map(c => c.toLowerCase());
    processedProducts = processedProducts.filter(p => 
      Array.isArray(p.colors) && p.colors.some(c => lowerColors.includes(String(c).toLowerCase()))
    );
  }

  if (filters.price && filters.price.length > 0) {
    processedProducts = processedProducts.filter(p => {
      return (
        (filters.price.includes("Under ₹2000") && p.price < 2000) ||
        (filters.price.includes("₹2000 - ₹4000") && p.price >= 2000 && p.price <= 4000) ||
        (filters.price.includes("Above ₹4000") && p.price > 4000)
      );
    });
  }

  if (filters.bestSellers?.includes("Yes")) {
    processedProducts = processedProducts.filter(p => Number(p.rating || 0) >= 4.7);
  }

  if (filters.sales?.includes("Yes")) {
    processedProducts = processedProducts.filter(p => Number(p.discount || 0) > 0);
  }

  if (filters.material && filters.material.length > 0) {
    const lowerMaterials = filters.material.map(m => m.toLowerCase());
    processedProducts = processedProducts.filter(p => 
      p.material && lowerMaterials.includes(p.material.toLowerCase())
    );
  }

  if (filters.lensPower && filters.lensPower.length > 0) {
    processedProducts = processedProducts.filter(p => 
      p.lensPower && Array.isArray(p.lensPower) && filters.lensPower.some(power => p.lensPower.includes(power))
    );
  }

  // 3. Sorting
  if (sortOrder === "Price: Low to High") {
    processedProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "Price: High to Low") {
    processedProducts.sort((a, b) => b.price - a.price);
  }

  // Check if any client-side sidebar filters are active
  const hasActiveSidebarFilters = Boolean(
    (filters.gender && filters.gender.length > 0) ||
    (filters.brand && filters.brand.length > 0) ||
    (filters.shape && filters.shape.length > 0) ||
    (filters.size && filters.size.length > 0) ||
    (filters.color && filters.color.length > 0) ||
    (filters.price && filters.price.length > 0) ||
    (filters.bestSellers && filters.bestSellers.length > 0) ||
    (filters.sales && filters.sales.length > 0) ||
    (filters.material && filters.material.length > 0) ||
    (filters.lensPower && filters.lensPower.length > 0)
  );

  // 4. Pagination calculations
  const isBogoServerPaginated = Boolean(isBogoShop && bogoApiProducts.length > 0 && !hasActiveSidebarFilters);
  const isSearchServerPaginated = Boolean(searchQuery && searchQuery !== "kids" && searchApiProducts.length > 0 && !hasActiveSidebarFilters);
  const isCategoryServerPaginated = Boolean(
    (filterType === "sunglasses" || filterType === "eyeglasses" || filterType === "kids" || searchQuery === "kids") && 
    categoryApiProducts.length > 0 &&
    !hasActiveSidebarFilters
  );
  const isServerPaginated = isBogoServerPaginated || isSearchServerPaginated || isCategoryServerPaginated;

  const activeServerTotalPages = isBogoServerPaginated
    ? bogoApiTotalPages
    : isSearchServerPaginated
    ? searchApiTotalPages
    : categoryApiTotalPages;

  const activeServerTotalItems = isBogoServerPaginated
    ? bogoApiTotalItems
    : isSearchServerPaginated
    ? searchApiTotalItems
    : categoryApiTotalItems;

  const totalPages = isServerPaginated 
    ? (activeServerTotalPages || Math.max(1, Math.ceil((activeServerTotalItems || processedProducts.length) / itemsPerPage)))
    : Math.max(1, Math.ceil(processedProducts.length / itemsPerPage));

  const totalItems = isServerPaginated 
    ? (activeServerTotalItems || (totalPages * itemsPerPage))
    : processedProducts.length;

  let currentProducts = [];
  if (isServerPaginated) {
    // API already returned the sliced items for current page
    currentProducts = processedProducts;
  } else {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    currentProducts = processedProducts.slice(indexOfFirstItem, indexOfLastItem);
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="main-layout">
        <aside className="sidebar">
          <Filter 
            filters={filters} 
            onApplyFilters={handleApplyFilters} 
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            onTry3dToggle={setIs3DMode}
          />
        </aside>

        <section className="product-area">
          {categoryStats && (
            <div className={`category-offer-banner ${isBogoShop ? 'bogo-poster-banner' : ''}`}>
              <div className="banner-content">
                <div className="banner-badge">🎉 {isBogoShop ? "MEGA BOGO SALE" : isKidsClub ? "Kids Special Offer" : "Limited Time Offer"}</div>
                <h2>{isBogoShop ? "BUY 1 GET 1 FREE" : `Explore Our ${getCategoryTitle(filterType, isBogoShop, isKidsClub, is1200Store)} Collection`}</h2>
                <div className="offer-details">
                  <span className="offer-highlight">{isBogoShop ? "Mix & Match Any Frames" : `Up To ${categoryStats.maxDiscount}% OFF!`}</span>
                </div>
                <div className="offer-extras" style={{ marginBottom: '20px' }}>
                  {isKidsClub ? (
                    <>
                      <span>✨ Unbreakable Flex Frames</span>
                      <span>✨ Blue Light Protection</span>
                      <span>✨ Fun Colors & Designs</span>
                      <span>✨ 1 Year Warranty</span>
                    </>
                  ) : isBogoShop ? (
                    <>
                      <span>✨ Pay for 1, Get 2</span>
                      <span>✨ Premium Lenses Included</span>
                      <span>✨ Valid on Top Brands</span>
                      <span>✨ 1 Year Warranty on Both</span>
                    </>
                  ) : (
                    <>
                      <span>✨ Free Premium Lenses</span>
                      <span>✨ Starting at ₹{categoryStats.minPrice} to ₹{categoryStats.maxPrice}</span>
                      <span>✨ 1 Year Warranty</span>
                      <span>✨ Free Home Delivery</span>
                    </>
                  )}
                </div>
              </div>
              {isKidsClub ? (
                <img 
                  src="/kids-category.jpeg" 
                  alt="Kids Club Collection"
                  className="banner-image" 
                  style={{ objectFit: 'cover' }}
                />
              ) : isBogoShop ? (
                <video 
                  src="/slider4.mp4" 
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="banner-image" 
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <video 
                  key={filterType || 'default'}
                  src={filterType === 'eyeglasses' ? "/eyeglasses-video.mp4" : filterType === 'contacts' ? "/contacts-video.mp4?v=2" : "/lens-video.mp4"} 
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="banner-image" 
                />
              )}
            </div>
          )}

          {isLoadingStore || isLoadingCategory || isLoadingBogo ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#0d6b6d" }}>
              <FaSpinner className="fa-spin" style={{ fontSize: "36px", marginBottom: "15px", animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: "16px", fontWeight: 600 }}>{isBogoShop ? "Loading Buy 1 Get 1 collection..." : "Loading eyewear collection..."}</p>
            </div>
          ) : isLoadingSearch ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#0d6b6d" }}>
              <FaSpinner className="fa-spin" style={{ fontSize: "36px", marginBottom: "15px", animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: "16px", fontWeight: 600 }}>Searching matching eyewear models...</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {processedProducts.length === 0 ? (
                  <div className="no-products-container">
                    <div className="no-products-icon-wrapper">
                      <FaSearchMinus className="no-products-icon" />
                    </div>
                    <h3 className="no-products-title">No products match your filters.</h3>
                    <p className="no-products-subtitle">
                      We couldn't find any eyewear matching your selected filters or price range. Try adjusting or clearing your filters to explore more options.
                    </p>
                    <button 
                      type="button" 
                      className="no-products-reset-btn"
                      onClick={() => {
                        setFilters({ gender: [], brand: [], shape: [], size: [], color: [], price: [], material: [], bestSellers: [], sales: [], lensPower: [] });
                        if (searchQuery) {
                          const currentParams = new URLSearchParams(location.search);
                          currentParams.delete('search');
                          const newQueryStr = currentParams.toString();
                          const targetQuery = newQueryStr ? `?${newQueryStr}` : '?type=eyeglasses';
                          navigate(`/products${targetQuery}`, { replace: true });
                        }
                      }}
                    >
                      <FaRedo style={{ marginRight: '8px' }} /> Clear All Filters
                    </button>
                  </div>
                ) : (
                  currentProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      is3DMode={is3DMode} 
                      onTryOn={handleOpenTryOn}
                    />
                  ))
                )}
              </div>

              {processedProducts.length > 0 && totalPages > 1 && (
                <div style={{ marginTop: '36px', marginBottom: '20px' }}>
                  <Pagination
                    totalItems={totalItems}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <VirtualTryOn
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
        initialProduct={tryOnProduct}
        selectedColor={tryOnColor}
      />
    </div>
  );
}

export default Products;

