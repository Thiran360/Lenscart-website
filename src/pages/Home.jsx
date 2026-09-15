import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import BrowseFrames from "../components/BrowseFrames";
import BrowseStyles from "../components/BrowseStyles";
import TrendingVideos from "../components/TrendingVideos";
import BestSellers from "../components/BestSellers";
import PromoBanner from "../components/PromoBanner";
import CollectionsGrid from "../components/CollectionsGrid";
import Footer from "../components/Footer";
import "./ProductsLayout.css";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <BrowseFrames />
      <BrowseStyles />

      <section className="featured-products-section" style={{ backgroundColor: '#F6F1E8', padding: '30px 0 40px 0' }}>
        <div className="home-content-wrapper">
          
          {/* Fixed Section Header for Trending Now */}
          <div style={{ textAlign: 'center', marginBottom: '35px' }}>
            <h2 className="trending-section-title">
              TRENDING NOW
            </h2>
            <p className="trending-section-subtitle">
              Explore our best-selling & trending eyewear collection
            </p>
          </div>
          
          <TrendingVideos />
          <BestSellers />
          <PromoBanner />
          <CollectionsGrid />
        </div>
      </section>

      <Footer />
    </>
  );
}
export default Home;
