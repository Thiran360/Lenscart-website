import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

const sliderData = [
  { video: "/slider1.mp4", title: "BEACH CLUB", estText: "EST.", brand: "JOHN 🌴 JACOBS", year: "2024" },
  { video: "/slider2.mp4", title: "VISION PERFECTED", estText: "PREMIUM", brand: "CRAFTED LENSES", year: "EDITION" },
  { video: "/slider3.mp4", title: "URBAN CHIC", estText: "NEW", brand: "MODERN FRAMES", year: "STYLE" },
  { video: "/slider4.mp4", title: "SUMMER VIBES", estText: "HOT", brand: "SUNGLASSES", year: "COLLECTION" },
  { video: "/slider5.mp4", title: "CLEAR VISION", estText: "TOP", brand: "CONTACT LENSES", year: "QUALITY" },
  { video: "/slider6.mp4", title: "KIDS FASHION", estText: "FUN", brand: "PLAYFUL FRAMES", year: "TRENDS" }
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-banner">
      <div className="hero-overlay"></div>
      
      {/* Background Video Slider */}
      <video 
        src={sliderData[currentSlide].video} 
        className="hero-bg" 
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="hero-content-center" key={`content-${currentSlide}`}>
        <h1 className="campaign-title">{sliderData[currentSlide].title}</h1>
        
        <div className="est-text">
          <span>{sliderData[currentSlide].estText}</span>
          <div className="brand-logo-text">{sliderData[currentSlide].brand}</div>
          <span>{sliderData[currentSlide].year}</span>
        </div>

        <Link to="/products" className="shop-now-btn">
          Shop Now
        </Link>
      </div>

      <div className="carousel-dots">
        {sliderData.map((_, index) => (
          <span 
            key={index} 
            className={`dot ${currentSlide === index ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          ></span>
        ))}
      </div>
    </section>
  );
}

export default Hero;