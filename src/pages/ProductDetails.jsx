import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaTruck } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { productsData } from "../data/products";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import SizeGuideModal from "../components/SizeGuideModal";
import VirtualTryOn from "../components/VirtualTryOn";
import ProductInfoTabs from "../components/ProductInfoTabs";
import RelatedProducts from "../components/RelatedProducts";
import "./ProductDetails.css";

// Reusing the sepia colorizer from BestSellers for color accuracy on grayscale frames
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

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = productsData.find(p => p.id === parseInt(id));
  const { addToCart } = useCart();
  
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'black');
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);

  const coupons = [
    {
      title: "Coupon Discount",
      desc: "EXTRA 10% - OFF (Use: BFS10) on Min Bill value of select products Rs.2,999 &...",
      code: "BFS10"
    },
    {
      title: "Bank Offer",
      desc: "5% Cashback on HDFC Bank Credit Cards, up to Rs.1000",
      code: "HDFC5"
    }
  ];

  const handleNextCoupon = () => {
    setCurrentCouponIndex((prev) => (prev + 1) % coupons.length);
  };

  const handlePrevCoupon = () => {
    setCurrentCouponIndex((prev) => (prev - 1 + coupons.length) % coupons.length);
  };

  const handleCheckPincode = () => {
    if (pincode.trim().length === 6 && !isNaN(pincode)) {
      // Calculate dynamic delivery days (2 to 6 days) based on pincode digits
      const lastDigit = parseInt(pincode.charAt(5));
      const deliveryDays = (lastDigit % 5) + 2;
      
      const d = new Date();
      d.setDate(d.getDate() + deliveryDays);
      setDeliveryDate(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    } else {
      alert("Please enter a valid 6-digit pincode.");
      setDeliveryDate(null);
    }
  };

  // Angle states - simulating 3D views for thumbnails
  const angles = [
    { id: 1, transform: 'rotateY(0deg) scale(1)' },         // Front view
    { id: 2, transform: 'rotateY(45deg) scale(0.9)' },      // Angled Left
    { id: 3, transform: 'rotateY(-45deg) scale(0.9)' },     // Angled Right
    { id: 4, transform: 'rotate(15deg) scale(1.2)' }        // Close-up tilt
  ];
  const [selectedAngle, setSelectedAngle] = useState(angles[0]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2>Product Not Found</h2>
          <Link to="/products" style={{ color: '#0d6b6d' }}>Return to Shop</Link>
        </div>
      </div>
    );
  }

  const handleSelectLenses = () => {
    navigate(`/select-lenses/${product.id}`, { state: { product, selectedColor } });
  };

  const handleNextAngle = () => {
    const currentIndex = angles.findIndex(a => a.id === selectedAngle.id);
    const nextIndex = (currentIndex + 1) % angles.length;
    setSelectedAngle(angles[nextIndex]);
  };

  const handlePrevAngle = () => {
    const currentIndex = angles.findIndex(a => a.id === selectedAngle.id);
    const prevIndex = (currentIndex - 1 + angles.length) % angles.length;
    setSelectedAngle(angles[prevIndex]);
  };

  return (
    <div className="page-wrapper" style={{ background: '#fff' }}>
      <Navbar />

      <div className="details-container">
        <div className="details-layout">
          
          {/* Left Side: Product Image (Thumbnails + Main) */}
          <div className="image-column">
            
            {/* Thumbnails on the side */}
            <div className="thumbnail-column">
              <div className="thumbnail-icon-360">360°</div>
              {angles.map((angle) => (
                <div key={angle.id} className={`thumbnail-item ${selectedAngle.id === angle.id ? 'active' : ''}`} onClick={() => setSelectedAngle(angle)}>
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img 
                      src={product.image} 
                      alt="" 
                      style={{ 
                        width: '100%', height: '100%', objectFit: 'contain',
                        transform: angle.transform,
                        ...getImageStyle(product.image, selectedColor)
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Main Image */}
            <div className="main-image-wrapper">
               <button className="wishlist-icon">♡</button>
               <button className="carousel-arrow left" onClick={handlePrevAngle}>&lt;</button>
               <button className="carousel-arrow right" onClick={handleNextAngle}>&gt;</button>
               
               <div className="main-image-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="details-image" 
                      style={{ 
                        ...getImageStyle(product.image, selectedColor),
                        transform: selectedAngle.transform
                      }}
                    />
               </div>

               <button className="try-on-btn" onClick={() => setIsTryOnOpen(true)}>
                 Try On
               </button>
            </div>
          </div>

          {/* Right Side: Product Info */}
          <div className="info-column" style={{ padding: '0 20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000', margin: '0 0 16px 0' }}>{product.name} #{product.id}</h1>
            
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 4px 0' }}>Starting at</p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span style={{ fontSize: '42px', fontWeight: 'bold', color: '#000' }}>${(product.price / 80).toFixed(2)}</span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fffbeb', padding: '6px 16px', borderRadius: '20px' }}>
                <span style={{ color: '#facc15', fontSize: '20px' }}>★</span>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{product.rating}</span>
                <a href="#" style={{ color: '#0d6b6d', textDecoration: 'underline', fontSize: '14px' }}>218 reviews</a>
              </div>
            </div>

            {/* Grey Box for Size and Color */}
            <div style={{ background: '#f7f7f7', borderRadius: '16px', padding: '24px', marginBottom: '30px' }}>
              
              {/* Size Section */}
              <div className="zenni-size-block">
                <div className="zenni-size-header">
                  <div>Size: <span>{product.size === 'S' ? '48 □ 16 - 135' : product.size === 'L' ? '55 □ 20 - 145' : '52 □ 18 - 140'}</span></div>
                  <div className="zenni-size-link" style={{ cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); setIsSizeGuideOpen(true); }}>Size and fit</div>
                </div>
                <button style={{ background: '#4a4a4a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '32px' }}>
                  {product.size === 'M' ? 'Medium' : product.size === 'L' ? 'Large' : 'Small'}
                </button>
              </div>

              {/* Color Section */}
              <div style={{ fontSize: '18px', marginBottom: '16px' }}>
                <strong style={{ color: '#000' }}>Frame Color:</strong> <span style={{ color: '#000' }}>{selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {product.colors && product.colors.map(color => (
                  <div 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: color === 'transparent' || color === 'white' ? '2px solid #ccc' : 'none',
                      outline: selectedColor === color ? '2px solid #000' : 'none',
                      outlineOffset: '2px',
                      ...getSwatchStyle(color)
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Delivery Pincode */}
            {(() => {
              const isPincodeValid = Boolean(pincode && pincode.trim().length === 6 && !isNaN(pincode));
              return (
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#3A2415', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaTruck style={{ color: '#0d6b6d', fontSize: '17px' }} /> Check Delivery Date
                  </div>
                  <div style={{ display: 'flex', alignItems: 'stretch', height: '48px', maxWidth: '400px' }}>
                    <input 
                      type="text" 
                      placeholder="Enter Pincode" 
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      maxLength={6}
                      style={{ 
                        flex: 1, 
                        border: '1px solid #dcdcdc', 
                        borderRight: 'none',
                        borderRadius: '8px 0 0 8px', 
                        padding: '0 16px', 
                        fontSize: '16px',
                        color: '#333',
                        outline: 'none'
                      }} 
                    />
                    <button 
                      onClick={handleCheckPincode}
                      disabled={!isPincodeValid}
                      style={{ 
                        background: isPincodeValid ? '#222' : '#cccccc', 
                        color: isPincodeValid ? '#fff' : '#888888', 
                        border: 'none', 
                        padding: '0 32px', 
                        borderRadius: '0 8px 8px 0', 
                        cursor: isPincodeValid ? 'pointer' : 'not-allowed',
                        fontWeight: '800',
                        fontSize: '14px',
                        letterSpacing: '0.5px',
                        opacity: isPincodeValid ? 1 : 0.7,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      CHECK
                    </button>
                  </div>
                  {deliveryDate && (
                    <div style={{ color: '#007a68', fontWeight: 'bold', fontSize: '15px', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>✓</span> Get it as early as {deliveryDate}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* GET ASSURED YOU Section */}
            {(() => {
              const isSunglass = Boolean(
                product?.type?.toLowerCase().includes('sunglasses') || 
                product?.name?.toLowerCase().includes('sunglass') || 
                product?.category?.toLowerCase().includes('sunglasses')
              );

              return (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eaeaea', marginBottom: '25px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#3A2415', marginBottom: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    GET ASSURED YOU
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fcfbfa', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(224, 216, 200, 0.6)', flex: '1', minWidth: '130px' }}>
                      <span style={{ fontSize: '20px' }}>📦</span>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#3A2415' }}>
                          {isSunglass ? "14 Days Return" : "14 Days Return"}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>Full Money Back</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fcfbfa', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(224, 216, 200, 0.6)', flex: '1', minWidth: '130px' }}>
                      <span style={{ fontSize: '20px' }}>🔄</span>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#3A2415' }}>14 Days Exchange</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>Hassle-Free Replacement</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fcfbfa', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(224, 216, 200, 0.6)', flex: '1', minWidth: '130px' }}>
                      <span style={{ fontSize: '20px' }}>🛡️</span>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#3A2415' }}>1 Year Warranty</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>Brand Protection</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Offers & Discounts */}
            <div className="offers-container" style={{ marginBottom: '20px', borderTop: '1px solid #eaeaea', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d4af37', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', fontSize: '12px', fontWeight: 'bold', border: '2px solid #b38b22' }}>%</div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#222' }}>Offers & Discounts</h3>
                </div>
                <button onClick={() => setIsOffersOpen(true)} style={{ background: 'none', border: 'none', color: '#6b4c9a', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>View all</button>
              </div>

              <div style={{ position: 'relative', border: '1px dashed #ccc', padding: '16px', borderRadius: '4px', background: '#fff' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#222' }}>{coupons[currentCouponIndex].title}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.5', paddingRight: '20px', minHeight: '42px' }}>
                  {coupons[currentCouponIndex].desc}
                </p>
                <button onClick={() => alert("Coupon applied!")} style={{ position: 'absolute', bottom: '-1px', right: '-1px', background: '#6b4c9a', color: '#fff', border: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderTopLeftRadius: '4px', fontSize: '18px' }}>
                  +
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '16px', gap: '16px' }}>
                <span style={{ fontSize: '16px', color: '#222' }}>{currentCouponIndex + 1}/{coupons.length}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handlePrevCoupon} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>&lt;</button>
                  <button onClick={handleNextCoupon} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>&gt;</button>
                </div>
              </div>
            </div>

            {/* Select Lenses Button */}
            <button 
              onClick={handleSelectLenses} 
              style={{ width: '100%', padding: '18px', background: '#0d6b6d', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'block', textTransform: 'uppercase', letterSpacing: '1.5px', boxShadow: '0 6px 20px rgba(13, 107, 109, 0.3)', transition: 'all 0.3s ease' }}
              onMouseOver={(e) => { e.target.style.background = '#094d4f'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.target.style.background = '#0d6b6d'; e.target.style.transform = 'translateY(0)'; }}
            >
              SELECT LENSES
            </button>


          </div>
        </div>

        {/* Product Information Tabs */}
        <ProductInfoTabs product={product} onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />

        {/* You Might Also Like Section */}
        <RelatedProducts currentProduct={product} />
      </div>

      {/* Try On Modal */}
      {isTryOnOpen && (
        <div className="tryon-overlay" onClick={() => setIsTryOnOpen(false)}>
          <div className="tryon-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsTryOnOpen(false)}>×</button>
            <h2>Virtual Try-On</h2>
            <div className="webcam-placeholder">
              <p>Camera access required</p>
              <button className="enable-cam-btn">Enable Camera</button>
            </div>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} product={product} />

      {/* Offers Modal */}
      {isOffersOpen && (
        <div className="tryon-overlay" onClick={() => setIsOffersOpen(false)} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }}>
          <div className="tryon-modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <button style={{ position: 'absolute', top: '20px', right: '20px', background: '#f5f5f5', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }} onClick={() => setIsOffersOpen(false)}>×</button>
            <h2 style={{ marginBottom: '24px', fontSize: '22px', borderBottom: '1px solid #eee', paddingBottom: '16px', color: '#222' }}>All Offers & Discounts</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {coupons.map((coupon, idx) => (
                <div key={idx} style={{ position: 'relative', border: idx === 0 ? '1.5px dashed #6b4c9a' : '1px dashed #ccc', padding: '20px', borderRadius: '8px', background: idx === 0 ? '#fcfaff' : '#fff' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#222' }}>{coupon.title}</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#555', lineHeight: '1.5' }}>
                    {coupon.desc}
                  </p>
                  <div style={{ color: '#6b4c9a', fontWeight: 'bold', fontSize: '14px', background: '#f0eaff', display: 'inline-block', padding: '4px 8px', borderRadius: '4px' }}>Code: {coupon.code}</div>
                  <button onClick={() => { alert("Coupon applied!"); setIsOffersOpen(false); }} style={{ position: 'absolute', bottom: '20px', right: '20px', background: '#6b4c9a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <VirtualTryOn 
        isOpen={isTryOnOpen} 
        onClose={() => setIsTryOnOpen(false)} 
        initialProduct={product} 
        selectedColor={selectedColor}
      />

    </div>
  );
}

export default ProductDetails;
