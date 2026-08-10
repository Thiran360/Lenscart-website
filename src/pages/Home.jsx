import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import BrowseFrames from "../components/BrowseFrames";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import TrendingVideos from "../components/TrendingVideos";
import BestSellers from "../components/BestSellers";
import PromoBanner from "../components/PromoBanner";
import CollectionsGrid from "../components/CollectionsGrid";
import { productsData } from "../data/products";
import "./ProductsLayout.css"; // For .products-grid styles
import Footer from "../components/Footer";

function Home() {
  const [visibleCount, setVisibleCount] = useState(6);
  
  return (
    <>
      <Navbar />
      <Hero />
      <BrowseFrames />

      <section className="featured-products-section" style={{ backgroundColor: '#F6F1E8' }}>
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 20px' }} className="home-content-wrapper">
          <div className="marquee-wrapper">
            <div className="marquee-content">
              <span>Trending Now</span>
              <span>Trending Now</span>
              <span>Trending Now</span>
              <span>Trending Now</span>
              <span>Trending Now</span>
              <span>Trending Now</span>
            </div>
            <div className="marquee-content">
              <span>Trending Now</span>
              <span>Trending Now</span>
              <span>Trending Now</span>
              <span>Trending Now</span>
              <span>Trending Now</span>
              <span>Trending Now</span>
            </div>
          </div>
          
          <TrendingVideos />
          <BestSellers />
          <PromoBanner />
          <CollectionsGrid />

          <div className="products-grid">
            {productsData.slice(0, visibleCount).map((product) => (
              <ProductCard key={product.id} product={product} is3DMode={false} />
            ))}
          </div>
          
          {visibleCount < productsData.length && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button 
                onClick={() => setVisibleCount(prev => prev + 6)}
                style={{
                  backgroundColor: '#3A2415',
                  color: 'white',
                  padding: '12px 40px',
                  border: 'none',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,59,109,0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Learn More
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />

    </>
  );
}

export default Home;
