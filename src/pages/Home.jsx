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

      <section className="featured-products-section" style={{ backgroundColor: '#F6F1E8', padding: '50px 0 40px 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }} className="home-content-wrapper">
          
          {/* Fixed Section Header for Trending Now */}
          <div style={{ textAlign: 'center', marginBottom: '35px' }}>
            <h2 style={{
              fontSize: '34px',
              fontWeight: '700',
              color: '#3A2415',
              fontFamily: "'Playfair Display', serif",
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: 0
            }}>
              TRENDING NOW
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#6E4B34',
              marginTop: '8px',
              letterSpacing: '1px'
            }}>
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
