import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaStar, FaVideo } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { productsData } from '../data/products';
import VirtualTryOn from './VirtualTryOn';
import './BestSellers.css';

// Realistic hex values for Swatch styling
const getSwatchStyle = (colorName) => {
  const name = colorName.toLowerCase();
  switch (name) {
    case 'black': return { backgroundColor: '#1a1a1a' };
    case 'blue': return { backgroundColor: '#2e5b82' };
    case 'brown': return { backgroundColor: '#8a6240' };
    case 'gold': return { background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)' };
    case 'pink': return { backgroundColor: '#f3a3b3' };
    case 'grey': case 'gray': return { backgroundColor: '#95a5a6' };
    case 'red': return { backgroundColor: '#c0392b' };
    case 'green': return { backgroundColor: '#27ae60' };
    case 'silver': return { background: 'linear-gradient(135deg, #e0e0e0 0%, #bdc3c7 100%)' };
    case 'transparent': case 'white': return { backgroundColor: '#e2f2f5', border: '1px solid #c8d8db' };
    case 'tortoise': return { background: 'repeating-linear-gradient(45deg, #4e3629 0px, #4e3629 4px, #a05a2c 4px, #a05a2c 8px)' };
    default: return { backgroundColor: '#ccc' };
  }
};

// Dynamic SVG color-swapping logic
const getGlassImageWithColor = (imageStr, colorName) => {
  if (!imageStr || !imageStr.startsWith('data:image/svg+xml')) {
    return imageStr;
  }

  let hexColor = '#1a1a1a'; // Default
  switch (colorName.toLowerCase()) {
    case 'black': hexColor = '#1a1a1a'; break;
    case 'blue': hexColor = '#2e5b82'; break;
    case 'brown': hexColor = '#8a6240'; break;
    case 'gold': hexColor = '#b8860b'; break;
    case 'pink': hexColor = '#d9647b'; break;
    case 'grey': case 'gray': hexColor = '#7f8c8d'; break;
    case 'red': hexColor = '#c0392b'; break;
    case 'green': hexColor = '#27ae60'; break;
    case 'silver': hexColor = '#bdc3c7'; break;
    case 'transparent': case 'white': hexColor = 'rgba(255, 255, 255, 0.4)'; break;
    case 'tortoise': hexColor = '#603813'; break;
    default: hexColor = '#555555';
  }

  const encodedColor = encodeURIComponent(hexColor);
  let modifiedSvg = imageStr;

  if (colorName.toLowerCase() === 'tortoise') {
    const baseColor = encodeURIComponent('#4a2711');
    const spotsColor = encodeURIComponent('#824a24');
    modifiedSvg = modifiedSvg
      .replaceAll('%23111', baseColor)
      .replaceAll('%23333', spotsColor)
      .replaceAll('%23222', baseColor)
      .replaceAll('%231a1a1a', baseColor)
      .replaceAll('%23dcdde1', baseColor)
      .replaceAll('%23b2bec3', spotsColor)
      .replaceAll('%232c3e50', spotsColor)
      .replaceAll('%23333333', baseColor)
      .replaceAll('stroke="%23333"', `stroke="${baseColor}"`)
      .replaceAll('stroke="%23222"', `stroke="${baseColor}"`);
  } else if (colorName.toLowerCase() === 'transparent' || colorName.toLowerCase() === 'white') {
    const transparentColor = encodeURIComponent('rgba(200, 235, 240, 0.45)');
    modifiedSvg = modifiedSvg
      .replaceAll('%23111', transparentColor)
      .replaceAll('%23333', transparentColor)
      .replaceAll('%23222', transparentColor)
      .replaceAll('%231a1a1a', transparentColor)
      .replaceAll('%23dcdde1', transparentColor)
      .replaceAll('%23b2bec3', transparentColor)
      .replaceAll('%232c3e50', transparentColor)
      .replaceAll('%23333333', transparentColor)
      .replaceAll('stroke="%23333"', `stroke="${transparentColor}"`)
      .replaceAll('stroke="%23222"', `stroke="${transparentColor}"`);
  } else {
    modifiedSvg = modifiedSvg
      .replaceAll('%23111', encodedColor)
      .replaceAll('%23333', encodedColor)
      .replaceAll('%23222', encodedColor)
      .replaceAll('%231a1a1a', encodedColor)
      .replaceAll('%23dcdde1', encodedColor)
      .replaceAll('%23b2bec3', encodedColor)
      .replaceAll('%232c3e50', encodedColor)
      .replaceAll('%23333333', encodedColor)
      .replaceAll('stroke="%23333"', `stroke="${encodedColor}"`)
      .replaceAll('stroke="%23222"', `stroke="${encodedColor}"`);
  }

  return modifiedSvg;
};

// CSS Image colorizer filters for transparent PNG frames (Eyeglasses & Sunglasses)
const getImageStyle = (imageStr, colorName) => {
  if (imageStr && imageStr.startsWith('data:image/svg+xml')) {
    return {};
  }
  const name = colorName.toLowerCase();
  switch (name) {
    case 'red': 
      return { filter: 'sepia(1) saturate(6) hue-rotate(325deg) brightness(0.85) contrast(1.2)' };
    case 'blue': 
      return { filter: 'sepia(1) saturate(6) hue-rotate(185deg) brightness(0.85) contrast(1.2)' };
    case 'green': 
      return { filter: 'sepia(1) saturate(5) hue-rotate(85deg) brightness(0.85) contrast(1.2)' };
    case 'pink': 
      return { filter: 'sepia(1) saturate(5) hue-rotate(295deg) brightness(1.0) contrast(1.1)' };
    case 'gold': 
      return { filter: 'sepia(1) saturate(6) hue-rotate(15deg) brightness(1.1) contrast(1.1)' };
    case 'brown': case 'tortoise':
      return { filter: 'sepia(0.8) saturate(3) hue-rotate(350deg) brightness(0.7) contrast(1.15)' };
    case 'grey': case 'gray': 
      return { filter: 'grayscale(1) brightness(0.85) contrast(1.1)' };
    case 'silver': 
      return { filter: 'grayscale(1) brightness(1.2) contrast(1.05)' };
    case 'transparent': case 'white': 
      return { filter: 'opacity(0.75) brightness(1.4) contrast(0.9)' };
    case 'black': 
      return { filter: 'grayscale(1) brightness(0.15) contrast(1.4)' };
    default: 
      return {};
  }
};

const BestSellerCard = ({ product, onTryOn }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isSaved = isInWishlist(product.id);
  
  // Default to the first color in colors list, or 'black' if undefined
  const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'black';
  const [selectedColor, setSelectedColor] = useState(defaultColor);

  const handleHeartClick = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  // Deterministic review count
  const getReviewCount = (id) => {
    const counts = {
      14: '217',
      16: '2K+',
      13: '218',
      1: '165',
      15: '4K+',
      39: '350',
      40: '1.2K+',
      41: '520',
      42: '180',
      43: '95'
    };
    return counts[id] || '100+';
  };

  const displayImage = getGlassImageWithColor(product.image, selectedColor);
  const imageStyle = getImageStyle(product.image, selectedColor);

  return (
    <div className="bestseller-card">
      <Link to={`/product/${product.id}`} className="bestseller-card-link">
        <div className="bestseller-image-wrapper">
          <span className="bestseller-top-badge">Top rated</span>
          <button 
            type="button"
            className="bestseller-wishlist-btn" 
            onClick={handleHeartClick} 
            aria-label="Toggle wishlist"
            style={{ zIndex: 20 }}
          >
            {isSaved ? <FaHeart color="#ff4d4f" /> : <FaRegHeart />}
          </button>
          
          <img 
            src={displayImage} 
            alt={product.name} 
            className="bestseller-product-image" 
            style={imageStyle}
          />
          
          <button 
            type="button"
            className="bestseller-tryon-overlay-btn" 
            onClick={(e) => { 
              e.preventDefault(); 
              onTryOn({ ...product, image: displayImage }); // Pass active colored image version to VirtualTryOn
            }}
          >
            <FaVideo /> Try on
          </button>
        </div>

        <div className="bestseller-card-info">
          <div className="bestseller-price-rating-row">
            <span className="bestseller-price">₹{product.price}</span>
            <div className="bestseller-rating">
              <FaStar className="bestseller-star-icon" />
              <span>{product.rating}</span>
              <span className="bestseller-reviews-count">({getReviewCount(product.id)})</span>
            </div>
          </div>
          
          <div className="bestseller-shape-row">
            <span className="bestseller-shape">{product.shape}</span>
          </div>

          <div className="bestseller-delivery">
            Get it as early as Tue, Aug 11
          </div>

          <div className="bestseller-swatches">
            {product.colors && product.colors.slice(0, 4).map((color, idx) => (
              <button 
                key={idx} 
                type="button"
                className={`bestseller-swatch ${selectedColor === color ? 'active-swatch' : ''}`}
                style={getSwatchStyle(color)}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor(color);
                }}
                title={color}
              />
            ))}
            {product.colors && product.colors.length > 4 && (
              <span className="bestseller-swatch-more">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

const BestSellers = () => {
  const [activeTab, setActiveTab] = useState('eyeglasses');
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const scrollRef = useRef(null);

  // Dynamic product loading: prioritize the screenshot products, then append the rest of products from database
  const priorityEyeglasses = [14, 16, 13, 1, 15];
  const prioritySunglasses = [39, 40, 41, 42, 43];

  const filteredProducts = activeTab === 'eyeglasses'
    ? [
        ...priorityEyeglasses.map(id => productsData.find(p => p.id === id)).filter(Boolean),
        ...productsData.filter(p => p.type === 'eyeglasses' && !priorityEyeglasses.includes(p.id))
      ]
    : [
        ...prioritySunglasses.map(id => productsData.find(p => p.id === id)).filter(Boolean),
        ...productsData.filter(p => p.type === 'sunglasses' && !prioritySunglasses.includes(p.id))
      ];

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const card = scrollRef.current.querySelector('.bestseller-card');
      if (card) {
        const cardWidth = card.clientWidth;
        const gap = 20; // 20px gap
        // Scroll by exactly 2 products at a time
        const scrollAmount = (cardWidth + gap) * 2;
        const { scrollLeft } = scrollRef.current;
        scrollRef.current.scrollTo({
          left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleOpenTryOn = (product) => {
    setTryOnProduct(product);
    setIsTryOnOpen(true);
  };

  return (
    <section className="bestsellers-section">
      <div className="bestsellers-header">
        <div>
          <h2 className="bestsellers-title">BEST SELLERS</h2>
          <div className="bestsellers-tabs">
            <button 
              type="button"
              className={`bestsellers-tab ${activeTab === 'eyeglasses' ? 'active' : ''}`}
              onClick={() => setActiveTab('eyeglasses')}
            >
              Eyeglasses
            </button>
            <button 
              type="button"
              className={`bestsellers-tab ${activeTab === 'sunglasses' ? 'active' : ''}`}
              onClick={() => setActiveTab('sunglasses')}
            >
              Sunglasses
            </button>
          </div>
        </div>
        <Link to={`/products?type=${activeTab}`} className="bestsellers-shopall-btn">
          Shop all
        </Link>
      </div>

      <div className="bestsellers-carousel-wrapper">
        <button 
          type="button"
          className="bestsellers-nav-btn prev" 
          onClick={() => handleScroll('left')}
          aria-label="Previous products"
        >
          ❮
        </button>
        
        <div className="bestsellers-carousel" ref={scrollRef}>
          {filteredProducts.map(product => (
            <BestSellerCard 
              key={product.id} 
              product={product} 
              onTryOn={handleOpenTryOn} 
            />
          ))}
        </div>

        <button 
          type="button"
          className="bestsellers-nav-btn next" 
          onClick={() => handleScroll('right')}
          aria-label="Next products"
        >
          ❯
        </button>
      </div>

      {isTryOnOpen && (
        <VirtualTryOn 
          isOpen={isTryOnOpen} 
          onClose={() => setIsTryOnOpen(false)} 
          initialProduct={tryOnProduct}
        />
      )}
    </section>
  );
};

export default BestSellers;
