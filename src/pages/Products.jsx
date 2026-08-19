import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Filter from "../components/Filter";
import ProductCard from "../components/ProductCard";
import { productsData } from "../data/products";
import "./ProductsLayout.css";

function Products() {
  const [activeTab, setActiveTab] = useState("All");
  const [filters, setFilters] = useState({ gender: [], brand: [], shape: [], size: [], color: [], price: [], material: [], bestSellers: [], sales: [], lensPower: [] });
  const [sortOrder, setSortOrder] = useState("Recommended");
  const [is3DMode, setIs3DMode] = useState(false);
  
  // Use location to get query params (e.g. ?type=sunglasses)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filterType = searchParams.get("type"); // "eyeglasses" or "sunglasses"
  const searchQuery = searchParams.get("search");

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setActiveTab("All");
    setFilters({ gender: [], brand: [], shape: [], size: [], color: [], price: [], material: [], bestSellers: [], sales: [], lensPower: [] });
  }, [filterType]);

  const isBogoShop = searchParams.get("bogo") === "true";
  const isKidsClub = searchQuery === "kids";
  const maxPriceQuery = searchParams.get("maxPrice");
  const is1200Store = maxPriceQuery === "1200";

  const getCategoryStats = (type, bogo, kids, is1200) => {
    let items = productsData;
    if (type) items = items.filter(p => p.type === type);
    if (kids) items = items.filter(p => p.category?.toLowerCase().includes('kids') || p.name?.toLowerCase().includes('kids'));
    if (is1200) items = items.filter(p => p.price <= 1200);

    if (!items.length) return { minPrice: 1000, maxPrice: 5000, maxDiscount: 50 };
    const minPrice = Math.min(...items.map(p => p.price));
    const maxPrice = Math.max(...items.map(p => p.price));
    const maxDiscount = Math.max(...items.map(p => p.discount));
    return { minPrice, maxPrice, maxDiscount };
  };

  const showBanner = filterType || isKidsClub || isBogoShop || is1200Store;
  const categoryStats = showBanner ? getCategoryStats(filterType, isBogoShop, isKidsClub, is1200Store) : null;

  const getCategoryTitle = (type, bogo, kids, is1200) => {
    if (bogo) return 'Buy 1 Get 1 Exclusive';
    if (kids) return 'Kids Club';
    if (is1200) return '₹1200 Store';
    switch (type) {
      case 'eyeglasses': return 'Eyeglasses';
      case 'sunglasses': return 'Sunglasses';
      case 'contacts': return 'Contact Lenses';
      default: return 'Products';
    }
  };

  // Filtering Logic
  let processedProducts = productsData;

  // 0. URL Query Filter (Eyeglasses vs Sunglasses)
  if (filterType) {
    processedProducts = processedProducts.filter(p => p.type === filterType);
  }

  // 0.2 Max Price Filter (e.g. ₹1200 Store)
  if (maxPriceQuery) {
    const maxVal = Number(maxPriceQuery);
    if (!isNaN(maxVal)) {
      processedProducts = processedProducts.filter(p => p.price <= maxVal);
    }
  }

  // 0.5 Search Query Filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    processedProducts = processedProducts.filter(p => 
      p.name?.toLowerCase().includes(query) || 
      p.brand?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    );
  }

  // 1. Tab Filter
  if (activeTab !== "All") {
    processedProducts = processedProducts.filter(p => p.category === activeTab);
  }

  // 2. Sidebar Filters (Gender, Brand, Shape)
  if (filters.gender.length > 0) {
    processedProducts = processedProducts.filter(p => filters.gender.includes(p.gender));
  }
  if (filters.brand.length > 0) {
    processedProducts = processedProducts.filter(p => filters.brand.includes(p.brand));
  }
  if (filters.shape?.length > 0) {
    processedProducts = processedProducts.filter(p => filters.shape.includes(p.shape));
  }

  // 3. New Sidebar Filters (Size, Color, Price, Material, Best Sellers, Sales, Lens Power)
  if (filters.size?.length > 0) {
    processedProducts = processedProducts.filter(p => filters.size.includes(p.size));
  }
  
  if (filters.color?.length > 0) {
    processedProducts = processedProducts.filter(p => 
      filters.color.some(c => p.colors?.map(color => color.toLowerCase()).includes(c.toLowerCase()))
    );
  }

  if (filters.price?.length > 0) {
    processedProducts = processedProducts.filter(p => {
      return (
        (filters.price.includes("Under ₹2000") && p.price < 2000) ||
        (filters.price.includes("₹2000 - ₹4000") && p.price >= 2000 && p.price <= 4000) ||
        (filters.price.includes("Above ₹4000") && p.price > 4000)
      );
    });
  }

  if (filters.bestSellers?.includes("Yes")) {
    processedProducts = processedProducts.filter(p => p.rating >= 4.7);
  }

  if (filters.sales?.includes("Yes")) {
    processedProducts = processedProducts.filter(p => p.discount > 0);
  }

  if (filters.material?.length > 0) {
    // Note: since material is not strictly in the DB, this might return empty if no products have material,
    // or we mock the check here by assuming specific brands or types have specific materials,
    // but the safest generic way is just to check if material field matches.
    processedProducts = processedProducts.filter(p => p.material && filters.material.includes(p.material));
  }

  if (filters.lensPower?.length > 0) {
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
                  key={filterType}
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
          
          <div className="tabs">
            <button className={activeTab === "All" ? "tab active" : "tab"} onClick={() => setActiveTab("All")}>
              All
            </button>
            <button className={activeTab === "Classic" ? "tab active" : "tab"} onClick={() => setActiveTab("Classic")}>
               Classic
            </button>
            <button className={activeTab === "Premium" ? "tab active" : "tab"} onClick={() => setActiveTab("Premium")}>
               Premium
            </button>
          </div>

          <div className="products-grid">
            {processedProducts.length === 0 ? (
              <div style={{ padding: '40px', width: '100%', textAlign: 'center', color: '#6E4B34' }}>
                <h3>No products match your filters.</h3>
              </div>
            ) : (
              processedProducts.map((product) => (
                <ProductCard key={product.id} product={product} is3DMode={is3DMode} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Products;
