import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsData } from '../data/products';
import './TrendingVideos.css';

// Duplicate array for seamless infinite marquee loop
const extendedProducts = [...productsData, ...productsData];

const ImageCard = ({ product, index }) => {
  return (
    <Link 
      to={`/product/${product.id}`} 
      className="trending-card"
      key={`${product.id}-${index}`}
    >
      <div className="trending-card-image-box">
        <span className="trending-badge">★ {product.rating || "4.8"}</span>
        <img 
          src={product.image} 
          alt={product.title} 
          className="trending-card-img"
        />
      </div>
      <div className="trending-card-content">
        <h4 className="trending-card-name">{product.title}</h4>
        <span className="trending-action-btn">
          Shop Now ➔
        </span>
      </div>
    </Link>
  );
};

const TrendingVideos = () => {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Slow, continuous smooth scrolling using requestAnimationFrame
  useEffect(() => {
    let animationFrameId;

    const animateScroll = () => {
      const scrollContainer = scrollRef.current;
      if (scrollContainer && !isHovered) {
        // Continuous slow scroll rate (0.8px per frame)
        scrollContainer.scrollLeft += 0.8;

        // Reset scroll position seamlessly when reaching middle of duplicated track
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isHovered]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 260; // 1 card step
      const targetScroll = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount 
        : scrollRef.current.scrollLeft + scrollAmount;
        
      scrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="trending-videos-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        onClick={() => scroll('left')} 
        className="carousel-button left"
        aria-label="Scroll left"
      >
        ❮
      </button>

      <div className="trending-videos-scroll" ref={scrollRef}>
        <div className="trending-videos-track">
          {extendedProducts.map((product, idx) => (
            <ImageCard key={`${product.id}-${idx}`} product={product} index={idx} />
          ))}
        </div>
      </div>

      <button 
        onClick={() => scroll('right')} 
        className="carousel-button right"
        aria-label="Scroll right"
      >
        ❯
      </button>
    </div>
  );
};

export default TrendingVideos;
