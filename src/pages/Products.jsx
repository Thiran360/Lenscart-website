import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Filter from "../components/Filter";
import ProductCard from "../components/ProductCard";
import { productsData } from "../data/products";
import "./ProductsLayout.css";

function Products() {
  const [activeTab, setActiveTab] = useState("All");
  const [filters, setFilters] = useState({ gender: [], brand: [], shape: [] });
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
    setFilters({ gender: [], brand: [], shape: [] });
  }, [filterType]);

  const getCategoryStats = (type) => {
    const items = productsData.filter(p => p.type === type);
    if (!items.length) return null;
    const minPrice = Math.min(...items.map(p => p.price));
    const maxPrice = Math.max(...items.map(p => p.price));
    const maxDiscount = Math.max(...items.map(p => p.discount));
    return { minPrice, maxPrice, maxDiscount };
  };

  const categoryStats = filterType ? getCategoryStats(filterType) : null;

  const getCategoryTitle = (type) => {
    switch (type) {
      case 'eyeglasses': return 'Eyeglasses';
      case 'sunglasses': return 'Sunglasses';
      case 'contacts': return 'Contact Lenses';
      default: return 'Products';
    }
  };

  const getBannerImage = (type) => {
    switch (type) {
      case 'eyeglasses': return 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&q=80';
      case 'sunglasses': return 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80';
      case 'contacts': return 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=600&q=80';
      default: return 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&q=80';
    }
  };

  // Filtering Logic
  let processedProducts = productsData;

  // 0. URL Query Filter (Eyeglasses vs Sunglasses)
  if (filterType) {
    processedProducts = processedProducts.filter(p => p.type === filterType);
  }

  // 0.5 Search Query Filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    processedProducts = processedProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
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
  if (filters.shape.length > 0) {
    processedProducts = processedProducts.filter(p => filters.shape.includes(p.shape));
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
            <div className="category-offer-banner">
              <div className="banner-content">
                <div className="banner-badge">🎉 Limited Time Offer</div>
                <h2>Explore Our {getCategoryTitle(filterType)} Collection</h2>
                <div className="offer-details">
                  <span className="offer-highlight">Up To {categoryStats.maxDiscount}% OFF!</span>
                  <span className="offer-bogo">BUY 1 GET 1 FREE</span>
                </div>
                <div className="offer-extras" style={{ marginBottom: '20px' }}>
                  <span>✨ Free Premium Lenses</span>
                  <span>✨ Starting at ₹{categoryStats.minPrice} to ₹{categoryStats.maxPrice}</span>
                  <span>✨ 1 Year Warranty</span>
                  <span>✨ Free Home Delivery</span>
                </div>
              </div>
              <video 
                key={filterType}
                src={filterType === 'eyeglasses' ? "/eyeglasses-video.mp4" : filterType === 'contacts' ? "/contacts-video.mp4?v=2" : "/lens-video.mp4"} 
                autoPlay
                loop
                muted
                playsInline
                className="banner-image" 
              />
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
