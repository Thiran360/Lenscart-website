import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Hero.css";

const sliderData = [
  { 
    id: 1,
    image: "/hero-1.jpg",
    title: "ELEGANT EYEGLASSES",
    estText: "EST.",
    brand: "LENS 👓 MAKER",
    year: "2026"
  },
  { 
    id: 2,
    image: "/hero-2.jpg",
    title: "SUNGLASSES CLUB",
    estText: "PREMIUM",
    brand: "100% UV POLARIZED COLLECTION",
    year: "EDITION"
  },
  { 
    id: 3,
    image: "/hero-3.jpg",
    title: "AR VIRTUAL TRY-ON",
    estText: "LIVE",
    brand: "REAL-TIME 3D FITTING ROOM",
    year: "EXPERIENCE"
  },
  { 
    id: 4,
    image: "/hero-4.jpg",
    title: "POWER LENSES",
    estText: "CUSTOM",
    brand: "PRECISION PRESCRIPTION OPTICS",
    year: "SERIES"
  },
  { 
    id: 5,
    image: "/hero-5.jpg",
    title: "COMPUTER GLASSES",
    estText: "TOP",
    brand: "ANTI BLUE-LIGHT PROTECTIVE SHIELD",
    year: "QUALITY"
  },
  { 
    id: 6,
    image: "/hero-6.jpg",
    title: "LUXURY TITANIUM",
    estText: "NEW",
    brand: "ULTRA-LIGHTWEIGHT AVIATORS",
    year: "2026"
  }
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderData.length) % sliderData.length);
  };

  return (
    <section className="hero-banner">
      <div className="hero-overlay"></div>
      
      {/* 6 Downloaded Local Image Slides with Ken Burns Zoom Animation */}
      {sliderData.map((slide, index) => (
        <div 
          key={slide.id}
          className={`hero-slide ${currentSlide === index ? 'active' : ''}`}
        >
          <img 
            src={slide.image} 
            alt={slide.title} 
            className="hero-slide-img" 
          />
        </div>
      ))}

      {/* Hero Content Overlay */}
      <div className="hero-content-center" key={`content-${currentSlide}`}>
        <h1 className="campaign-title">{sliderData[currentSlide].title}</h1>
        
        <div className="est-text">
          <span>{sliderData[currentSlide].estText}</span>
          <div className="brand-logo-text">{sliderData[currentSlide].brand}</div>
          <span>{sliderData[currentSlide].year}</span>
        </div>

        <Link to="/products?type=eyeglasses" className="shop-now-btn">
          Shop Now
        </Link>
      </div>

      {/* Navigation Arrows */}
      <button 
        className="hero-nav-btn prev" 
        onClick={prevSlide}
        aria-label="Previous Slide"
      >
        <FaChevronLeft />
      </button>
      <button 
        className="hero-nav-btn next" 
        onClick={nextSlide}
        aria-label="Next Slide"
      >
        <FaChevronRight />
      </button>

      {/* Carousel Dots */}
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