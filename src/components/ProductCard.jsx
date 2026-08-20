import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegHeart, FaHeart, FaStar } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import "./ProductCard.css";

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

const getOverlayColor = (colorName) => {
  const name = colorName.toLowerCase();
  switch (name) {
    case 'black': return '#000000';
    case 'blue': return '#1e90ff';
    case 'brown': case 'tortoiseshell': case 'tortoise': return '#8b4513';
    case 'gold': return '#daa520';
    case 'pink': return '#ff69b4';
    case 'grey': case 'gray': return '#808080';
    case 'red': return '#dc143c';
    case 'green': return '#228b22';
    case 'silver': return '#c0c0c0';
    case 'transparent': case 'white': return 'transparent'; // Use original image colors
    default: return 'transparent';
  }
};

const getLightenColor = (colorName) => {
  const name = colorName.toLowerCase();
  switch (name) {
    case 'black': return 'transparent';
    case 'blue': return '#001133';
    case 'brown': case 'tortoiseshell': case 'tortoise': return '#221100';
    case 'gold': return '#332200';
    case 'pink': return '#330011';
    case 'grey': case 'gray': return '#222222';
    case 'red': return '#330000';
    case 'green': return '#002200';
    case 'silver': return '#333333';
    case 'transparent': case 'white': return 'transparent'; // Do not lighten
    default: return 'transparent';
  }
};

const getImageStyle = (imageStr, colorName) => {
  const name = colorName.toLowerCase();
  
  switch (name) {
    case 'red': return { filter: 'contrast(1.1) sepia(1) saturate(5) hue-rotate(325deg)' };
    case 'blue': return { filter: 'contrast(1.1) sepia(1) saturate(5) hue-rotate(185deg)' };
    case 'green': return { filter: 'contrast(1.1) sepia(1) saturate(5) hue-rotate(85deg)' };
    case 'pink': return { filter: 'contrast(1.1) sepia(1) saturate(4) hue-rotate(295deg)' };
    case 'gold': return { filter: 'contrast(1.1) sepia(1) saturate(5) hue-rotate(15deg) brightness(1.2)' };
    case 'brown': case 'tortoise': case 'tortoiseshell': return { filter: 'contrast(1.1) sepia(0.8) saturate(3) hue-rotate(350deg)' };
    case 'grey': case 'gray': return { filter: 'contrast(1.1) grayscale(1)' };
    case 'silver': return { filter: 'contrast(1.1) grayscale(1) brightness(1.3)' };
    case 'transparent': case 'white': return { filter: 'contrast(0.9) grayscale(1) brightness(1.5) opacity(0.8)' };
    case 'black': return { filter: 'contrast(1.2) grayscale(1) brightness(0.6)' };
    default: return {};
  }
};
  



function ProductCard({ product, is3DMode, onTryOn }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // If no product is passed, render a generic one to prevent crashing
  const p = product || {
    id: 1,
    brand: "John Jacobs",
    name: "Classic Eyeglasses",
    size: "M",
    rating: 4.5,
    price: 3000,
    oldPrice: 4000,
    discount: 25,
    image: "https://picsum.photos/400/200",
    colors: ["black"]
  };
  
  const [selectedColor, setSelectedColor] = useState(p.colors && p.colors.length > 0 ? p.colors[0] : 'black');
  const isSaved = isInWishlist(p.id);

  const handleHeartClick = (e) => {
    e.preventDefault();
    toggleWishlist(p);
  };

  const handleTryOn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTryOn) {
      onTryOn(p, selectedColor);
    }
  };
  
  return (
    <Link to={`/product/${p.id}`} className="product-card" style={{ textDecoration: 'none' }}>
      <div className="card-image-section">
        <div className="badge-row">
          <div className="rating-badge">
            ★ {p.rating}
          </div>
          <div onClick={handleHeartClick} style={{ cursor: 'pointer', zIndex: 10 }}>
            {isSaved ? <FaHeart color="#ff4d4f" className="heart-icon" /> : <FaRegHeart className="heart-icon" />}
          </div>
        </div>
        <div className="product-image-container" style={{ position: 'relative', height: '160px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={p.image} 
            alt={p.name} 
            className={`product-image ${is3DMode ? 'effect-3d' : ''}`} 
            style={{ ...getImageStyle(p.image, selectedColor), width: '100%', height: '100%', objectFit: 'contain', marginBottom: 0 }}
          />
          {onTryOn && (
            <div 
              className="ar-try-badge"
              onClick={handleTryOn}
              title="Click for Real-time 3D Camera Try On"
            >
              👓 TRY ON
            </div>
          )}
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: '#F8EEDC', color: '#8A6240', fontWeight: '800', fontSize: '10px', padding: '5px 10px', borderRadius: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            EXTRA 20% OFF
          </div>
        </div>
        
      </div>

      <div className="card-details">
        <h4 className="product-name">{p.name}</h4>
        
        <div className="color-swatches" style={{ margin: '12px 0', display: 'flex', gap: '8px' }}>
          {p.colors && p.colors.slice(0, 4).map((color, idx) => (
            <div 
              key={idx}
              className={`product-swatch ${selectedColor === color ? 'active' : ''}`}
              style={{
                ...getSwatchStyle(color),
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: selectedColor === color ? '2px solid #0d6b6d' : '1px solid #ddd',
                cursor: 'pointer',
                boxShadow: selectedColor === color ? '0 0 0 2px #fff inset' : 'none'
              }}
              onClick={(e) => {
                e.preventDefault();
                setSelectedColor(color);
              }}
              title={color}
            />
          ))}
        </div>

        <div className="price-row" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="current-price">₹{p.price}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            {onTryOn && (
              <button 
                type="button" 
                className="card-tryon-btn" 
                onClick={handleTryOn}
                title="Try on glasses in 3D AR Camera"
              >
                👓 TRY ON
              </button>
            )}
            <button className="buy-now-btn" style={{ 
              background: '#0d6b6d', 
              color: '#fff', 
              border: 'none', 
              padding: '12px 15px', 
              borderRadius: '8px', 
              fontWeight: '900', 
              fontSize: '13px', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flex: 1,
              letterSpacing: '0.5px',
              boxShadow: '0 4px 10px rgba(13, 107, 109, 0.2)'
            }} onClick={(e) => { 
              e.preventDefault(); 
              navigate(`/select-lenses/${p.id}`, { state: { product: p, selectedColor, quantity: 1 } });
            }}
            onMouseOver={(e) => { e.target.style.background = '#094d4f'; e.target.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.target.style.background = '#0d6b6d'; e.target.style.transform = 'translateY(0)'; }}
            >
              SELECT LENSES
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
export default ProductCard;

