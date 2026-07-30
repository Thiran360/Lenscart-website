import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { productsData } from "../data/products";
import { useCart } from "../context/CartContext";
import SelectLensesModal from "../components/SelectLensesModal";
import VirtualTryOn from "../components/VirtualTryOn";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = productsData.find(p => p.id === parseInt(id));
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'cart' or 'buy'

  const [activeIndex, setActiveIndex] = useState(0);
  // Angle states - simulating 3D views
  const angles = [
    { id: 1, transform: 'rotateY(0deg) scale(1)' },         // Front view
    { id: 2, transform: 'rotateY(45deg) scale(0.9)' },      // Angled Left
    { id: 3, transform: 'rotateY(-45deg) scale(0.9)' },     // Angled Right
    { id: 4, transform: 'rotate(15deg) scale(1.2)' }        // Close-up tilt
  ];
  const [selectedAngle, setSelectedAngle] = useState(angles[0]);

  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);


  if (!product) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2>Product Not Found</h2>
          <Link to="/products" style={{ color: 'var(--teal)' }}>Return to Shop</Link>
        </div>
      </div>
    );
  }

  // Determine if product needs lenses (only eyeglasses or products without explicit type acting as frames)
  const needsLenses = product.type === 'eyeglasses' || !product.type;

  const handleInitialAction = (action) => {
    navigate(`/select-lenses/${product.id}?action=${action}&qty=${quantity}`);
  };

  const executeAction = (action) => {
    addToCart(product, quantity);

    if (action === 'buy') {
      navigate('/checkout');
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="container details-container">
        <div className="details-layout">
          
          {/* Left Side: Product Image (Thumbnails + Main) */}
          <div className="image-column image-gallery-layout">
            
            {/* Thumbnails on the left */}
            <div className="thumbnail-column">
              {angles.map((angle) => (
                <div 
                  key={angle.id}
                  onClick={() => setSelectedAngle(angle)}
                  className={`thumbnail-item ${selectedAngle.id === angle.id ? 'active' : ''}`}
                >
                  <img 
                    src={product.image} 
                    alt={`Angle ${angle.id}`} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      transform: angle.transform,
                      transition: 'all 0.3s ease'
                    }} 
                  />
                </div>
              ))}
            </div>

            {/* Main Image */}
            <div className="main-image-wrapper">
               <div className="zoom-wrapper">
                 <img 
                   src={product.image} 
                   alt={product.name} 
                   className="details-image" 
                   style={{ 
                     maxWidth: '95%',
                     maxHeight: '450px',
                     objectFit: 'contain',
                     transform: selectedAngle.transform,
                     transition: 'transform 0.4s ease' 
                   }}
                 />
               </div>
            </div>
          </div>

          {/* Right Side: Product Info */}
          <div className="info-column">
            <h1 className="details-brand">{product.brand}</h1>
            <h2 className="details-name">{product.name}</h2>
            <p className="details-size">Size: {product.size} • <span className="details-rating">★ {product.rating}</span></p>

            <div className="details-price-box">
              <span className="details-price">₹{product.price}</span>
              <span className="details-old-price">₹{product.oldPrice}</span>
              <span className="details-discount">({product.discount}% OFF)</span>
            </div>

            <div className="details-offers">
              <p>✓ Buy 1 Get 1 Free with Gold Membership</p>
              <p>✓ ₹{Math.round(product.price/3)} X 3 months | NO COST EMI</p>
            </div>

            <p className="details-description">
              {product.description}
            </p>


            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', marginTop: '10px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '5px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ border: 'none', background: '#f5f5f5', padding: '8px 15px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                >-</button>
                <span style={{ padding: '0 20px', fontSize: '16px', fontWeight: 'bold' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ border: 'none', background: '#f5f5f5', padding: '8px 15px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                >+</button>
              </div>
            </div>



            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                className="add-to-cart-btn" 
                onClick={() => executeAction('cart')}
                style={{ backgroundColor: '#3A2415', flex: 1, fontSize: '15px' }}
              >
                Add to Cart
              </button>

              <button 
                className="add-to-cart-btn buy-now-btn" 
                onClick={() => handleInitialAction('buy')}
                style={{ backgroundColor: '#3A2415', flex: 1 }}
              >
                Buy Now
              </button>
            </div>

            {/* Reviews Section inside info-column */}
            <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
              <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Customer Reviews 
                <span style={{ fontSize: '14px', background: '#f5f5f5', padding: '4px 10px', borderRadius: '20px', color: '#6E4B34' }}>{product.rating} ★</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Review 1 */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '35px', height: '35px', background: '#e0f7fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00838f', fontWeight: 'bold', fontSize: '14px' }}>R</div>
                      <div>
                        <h4 style={{ margin: 0, color: '#333', fontSize: '14px' }}>Rahul Sharma</h4>
                        <span style={{ fontSize: '11px', color: '#00a65a', display: 'flex', alignItems: 'center', gap: '3px' }}>✓ Verified Buyer</span>
                      </div>
                    </div>
                    <span style={{ color: '#f39c12', letterSpacing: '1px', fontSize: '12px' }}>★★★★★</span>
                  </div>
                  <p style={{ color: '#6E4B34', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                    "Amazing quality and perfect fit! The frame feels very premium and lightweight. I was worried about the size, but it fits perfectly. Delivery was also super fast."
                  </p>
                  <span style={{ display: 'block', marginTop: '10px', fontSize: '11px', color: '#6E4B34' }}>2 weeks ago</span>
                </div>

                {/* Review 2 */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '35px', height: '35px', background: '#fce4ec', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c2185b', fontWeight: 'bold', fontSize: '14px' }}>P</div>
                      <div>
                        <h4 style={{ margin: 0, color: '#333', fontSize: '14px' }}>Priya Patel</h4>
                        <span style={{ fontSize: '11px', color: '#00a65a', display: 'flex', alignItems: 'center', gap: '3px' }}>✓ Verified Buyer</span>
                      </div>
                    </div>
                    <span style={{ color: '#f39c12', letterSpacing: '1px', fontSize: '12px' }}>★★★★<span style={{ color: '#ddd' }}>★</span></span>
                  </div>
                  <p style={{ color: '#6E4B34', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                    "The frame looks great but it feels slightly tight around the temples. I'll probably get used to it. The lens clarity is top notch."
                  </p>
                  <span style={{ display: 'block', marginTop: '10px', fontSize: '11px', color: '#6E4B34' }}>1 month ago</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <VirtualTryOn 
        isOpen={isTryOnOpen} 
        onClose={() => setIsTryOnOpen(false)} 
        initialProduct={product} 
      />

    </div>
  );
}

export default ProductDetails;

