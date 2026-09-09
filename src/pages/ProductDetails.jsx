import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  FaTruck, 
  FaBoxOpen, 
  FaUndo, 
  FaShieldAlt, 
  FaCamera, 
  FaSpinner, 
  FaHeart, 
  FaRegHeart, 
  FaStar, 
  FaChevronRight, 
  FaChevronLeft, 
  FaRuler, 
  FaShoppingCart, 
  FaArrowRight, 
  FaCheck,
  FaTag
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import { productsData } from "../data/products";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import SizeGuideModal from "../components/SizeGuideModal";
import VirtualTryOn from "../components/VirtualTryOn";
import ProductInfoTabs from "../components/ProductInfoTabs";
import RelatedProducts from "../components/RelatedProducts";
import { useToast } from "../context/ToastContext";
import { getStoreProducts, getGlassProducts, getProductDetailsApi } from "../services/productService";
import "./ProductDetails.css";

// Color swatches helper styling
const getSwatchStyle = (colorName) => {
  const name = String(colorName || "").toLowerCase();
  switch (name) {
    case 'black': return { backgroundColor: '#1a1a1a' };
    case 'blue': return { backgroundColor: '#1e40af' };
    case 'brown': return { backgroundColor: '#854d0e' };
    case 'gold': return { background: 'linear-gradient(135deg, #fcd34d 0%, #b45309 100%)' };
    case 'pink': return { backgroundColor: '#f472b6' };
    case 'grey': case 'gray': return { backgroundColor: '#64748b' };
    case 'red': return { backgroundColor: '#dc2626' };
    case 'green': return { backgroundColor: '#16a34a' };
    case 'silver': return { background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)' };
    case 'transparent': case 'white': return { backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' };
    case 'tortoise': return { background: 'repeating-linear-gradient(45deg, #451a03 0px, #451a03 4px, #9a3412 4px, #9a3412 8px)' };
    default: return { backgroundColor: '#64748b' };
  }
};

const getImageStyle = (imageStr, colorName) => {
  const name = String(colorName || "").toLowerCase();
  switch (name) {
    case 'red': return { filter: 'contrast(1.1) sepia(1) saturate(5) hue-rotate(325deg)' };
    case 'blue': return { filter: 'contrast(1.1) sepia(1) saturate(5) hue-rotate(185deg)' };
    case 'green': return { filter: 'contrast(1.1) sepia(1) saturate(5) hue-rotate(85deg)' };
    case 'pink': return { filter: 'contrast(1.1) sepia(1) saturate(4) hue-rotate(295deg)' };
    case 'gold': return { filter: 'contrast(1.1) sepia(1) saturate(5) hue-rotate(15deg) brightness(1.2)' };
    case 'brown': case 'tortoise': return { filter: 'contrast(1.1) sepia(0.8) saturate(3) hue-rotate(350deg)' };
    case 'grey': case 'gray': return { filter: 'contrast(1.1) grayscale(1)' };
    case 'silver': return { filter: 'contrast(1.1) grayscale(1) brightness(1.3)' };
    case 'transparent': case 'white': return { filter: 'contrast(0.9) grayscale(1) brightness(1.5) opacity(0.85)' };
    case 'black': return { filter: 'contrast(1.2) grayscale(1) brightness(0.6)' };
    default: return {};
  }
};

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(() => {
    return productsData.find(p => String(p.id) === String(id)) || null;
  });
  const [loadingProduct, setLoadingProduct] = useState(!product);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'black');
  const [selectedSize, setSelectedSize] = useState(product?.size || 'M');
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [selectedAssurances, setSelectedAssurances] = useState(['return', 'warranty']);

  // Dynamic 3D Thumbnail Angle Definitions
  const angles = [
    { id: 1, label: 'Front', transform: 'rotateY(0deg) scale(1)' },
    { id: 2, label: 'Left 45°', transform: 'rotateY(40deg) scale(0.92)' },
    { id: 3, label: 'Right 45°', transform: 'rotateY(-40deg) scale(0.92)' },
    { id: 4, label: '3D Angle', transform: 'rotate(12deg) scale(1.15)' }
  ];
  const [selectedAngle, setSelectedAngle] = useState(angles[0]);

  // Load product details from Live API
  useEffect(() => {
    let isMounted = true;
    setLoadingProduct(true);

    // Call GET /product-details/?product-id=id
    getProductDetailsApi(id)
      .then((apiProduct) => {
        if (!isMounted) return;
        if (apiProduct) {
          setProduct(apiProduct);
          setSelectedColor(apiProduct?.colors?.[0] || 'black');
          setSelectedSize(apiProduct?.size || 'M');
        } else {
          fallbackLocalProduct();
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("[ProductDetails] getProductDetailsApi error, attempting fallback:", err.message);
        fallbackLocalProduct();
      })
      .finally(() => {
        if (isMounted) setLoadingProduct(false);
      });

    const fallbackLocalProduct = () => {
      const found = productsData.find(p => String(p.id) === String(id));
      if (found) {
        setProduct(found);
        setSelectedColor(found?.colors?.[0] || 'black');
        setSelectedSize(found?.size || 'M');
        return;
      }

      Promise.allSettled([getStoreProducts("1200"), getGlassProducts({ filter: "all" })])
        .then(([storeRes, glassRes]) => {
          if (!isMounted) return;
          let candidate = null;
          if (storeRes.status === "fulfilled" && Array.isArray(storeRes.value)) {
            candidate = storeRes.value.find(p => String(p.id) === String(id));
          }
          if (!candidate && glassRes.status === "fulfilled") {
            const apiProds = glassRes.value.products || [];
            candidate = apiProds.find(p => String(p.id) === String(id));
          }
          if (candidate) {
            setProduct(candidate);
            setSelectedColor(candidate?.colors?.[0] || 'black');
            setSelectedSize(candidate?.size || 'M');
          }
        });
    };

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (isOffersOpen || isTryOnOpen || isSizeGuideOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOffersOpen, isTryOnOpen, isSizeGuideOpen]);

  const toggleAssurance = (assurance) => {
    setSelectedAssurances(prev => 
      prev.includes(assurance) ? prev.filter(a => a !== assurance) : [...prev, assurance]
    );
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

  const handleCheckPincode = () => {
    if (pincode.trim().length === 6 && !isNaN(pincode)) {
      const lastDigit = parseInt(pincode.charAt(5));
      const deliveryDays = (lastDigit % 4) + 2;
      
      const d = new Date();
      d.setDate(d.getDate() + deliveryDays);
      const formattedDate = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      setDeliveryDate(formattedDate);
      toast.success(`Express Delivery to ${pincode} available by ${formattedDate}!`);
    } else {
      toast.warning("Please enter a valid 6-digit postal pincode.");
      setDeliveryDate(null);
    }
  };

  const handleSelectLenses = () => {
    if (!product) return;
    navigate(`/select-lenses/${product.id}`, { 
      state: { 
        product: {
          ...product,
          selectedSize: selectedSize
        }, 
        selectedColor 
      } 
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1, selectedColor);
    toast.success(`Added "${product.name}" to cart!`);
  };

  const coupons = [
    {
      title: "Mega Eyewear Sale",
      desc: "Get Flat 15% OFF on your first prescription order with code FIRST15.",
      code: "FIRST15"
    },
    {
      title: "HDFC Bank Discount",
      desc: "Extra 10% Instant Cashback up to ₹1,000 on HDFC Cards.",
      code: "HDFC10"
    },
    {
      title: "UPI Instant Discount",
      desc: "Save ₹150 instantly on all prepaid UPI payments.",
      code: "UPI150"
    }
  ];

  const isWish = product ? isInWishlist(product.id) : false;

  // Loading State
  if (loadingProduct && !product) {
    return (
      <div className="page-wrapper" style={{ background: '#ffffff', minHeight: '80vh' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '140px 20px', color: '#0d6b6d' }}>
          <FaSpinner className="fa-spin" style={{ fontSize: '48px', marginBottom: '20px', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Loading Eyewear Experience...</h2>
          <p style={{ fontSize: '15px', color: '#64748b' }}>Fetching live product details, high-res frames and specifications.</p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <div className="page-wrapper" style={{ background: '#ffffff' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Product Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>The requested frame could not be found or has been discontinued.</p>
          <Link to="/products?type=eyeglasses" style={{ display: 'inline-block', background: '#0d6b6d', color: '#fff', padding: '12px 28px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
            Explore Full Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isBogoEligible = Boolean(product.isBogo || product.applicable_for_buy_one_get_one);
  const displayPrice = Number(product.price || 1200);
  const displayOldPrice = Number(product.oldPrice || Math.round(displayPrice * 1.4));
  const discountPercent = Number(product.discount || (displayOldPrice > displayPrice ? Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100) : 25));

  return (
    <div className="page-wrapper" style={{ background: '#ffffff' }}>
      <Navbar />

      <div className="pd-page-container">
        
        {/* Breadcrumb Navigation */}
        <nav className="pd-breadcrumbs">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <Link to={`/products?type=${product.type || 'eyeglasses'}`}>
            {product.type === 'sunglasses' ? 'Sunglasses' : product.type === 'kids' ? 'Kids Glasses' : 'Eyeglasses'}
          </Link>
          <span className="separator">/</span>
          <span className="current">{product.name}</span>
        </nav>

        {/* Main Product Showcase Grid */}
        <div className="pd-grid-layout">
          
          {/* LEFT: 3D / AR Showcase Studio */}
          <div className="pd-showcase-column">
            
            {/* Thumbnail Angle Selectors */}
            <div className="pd-thumbnails-strip">
              {angles.map((angle) => (
                <button
                  key={angle.id}
                  className={`pd-thumb-btn ${selectedAngle.id === angle.id ? 'active' : ''}`}
                  onClick={() => setSelectedAngle(angle)}
                  title={angle.label}
                >
                  <img 
                    src={product.image} 
                    alt={angle.label} 
                    style={{ 
                      ...getImageStyle(product.image, selectedColor),
                      transform: angle.transform 
                    }} 
                  />
                  <span className="pd-thumb-label">{angle.label}</span>
                </button>
              ))}
            </div>

            {/* Main Interactive Studio Card */}
            <div className="pd-studio-card">
              
              {/* Studio 360 Badge */}
              <div className="pd-studio-badge">
                <span>✨ 360° Studio View</span>
              </div>

              {/* Floating Wishlist Button */}
              <button 
                className={`pd-wishlist-float-btn ${isWish ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                title={isWish ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                {isWish ? <FaHeart /> : <FaRegHeart />}
              </button>

              {/* Carousel Arrows */}
              <button className="pd-nav-arrow left" onClick={handlePrevAngle} title="Previous Angle">
                <FaChevronLeft />
              </button>
              <button className="pd-nav-arrow right" onClick={handleNextAngle} title="Next Angle">
                <FaChevronRight />
              </button>

              {/* Main Frame Visual */}
              <img 
                src={product.image} 
                alt={product.name} 
                className="pd-main-frame-img"
                style={{ 
                  ...getImageStyle(product.image, selectedColor),
                  transform: selectedAngle.transform 
                }} 
              />

              {/* Floating 3D Virtual Try-On Pill */}
              <button className="pd-tryon-pill-btn" onClick={() => setIsTryOnOpen(true)}>
                <FaCamera style={{ fontSize: '15px', color: '#38bdf8' }} /> 3D Virtual Try-On
              </button>
            </div>
          </div>

          {/* RIGHT: Product Specs, Pricing & Purchase Flow */}
          <div className="pd-info-column">
            
            {/* Header Tags */}
            <div className="pd-header-tags">
              <span className="pd-brand-tag">{product.brand || "Mr.LensMaker"}</span>
              <span className="pd-id-tag">Model #{product.id}</span>
              {isBogoEligible && (
                <span style={{ fontSize: '11.5px', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '6px' }}>
                  BOGO OFFER
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="pd-product-title">{product.name}</h1>

            {/* Rating Row */}
            <div className="pd-rating-row">
              <div className="pd-rating-pill">
                <FaStar className="star-icon" />
                <span>{product.rating || '4.8'}</span>
              </div>
              <a href="#reviews" className="pd-reviews-link">
                <strong>218 verified customer ratings</strong> • Top Choice
              </a>
            </div>

            {/* Luxury Price Card */}
            <div className="pd-price-card">
              <div className="pd-price-main-row">
                <span className="pd-price-current">₹{displayPrice.toLocaleString('en-IN')}</span>
                {displayOldPrice > displayPrice && (
                  <span className="pd-price-old">₹{displayOldPrice.toLocaleString('en-IN')}</span>
                )}
                {discountPercent > 0 && (
                  <span className="pd-discount-badge">{discountPercent}% OFF</span>
                )}
              </div>
              <p className="pd-tax-note">Inclusive of all taxes & free express shipping on prescription orders</p>
              
              {isBogoEligible && (
                <div className="pd-bogo-banner-pill">
                  <FaTag /> 🎁 BUY 1 GET 1 FREE Eligible • Mix & Match any frame
                </div>
              )}
            </div>

            {/* Frame Customization Block (Size & Color) */}
            <div className="pd-selection-card">
              
              {/* Frame Size Selector */}
              <div style={{ marginBottom: '18px' }}>
                <div className="pd-section-header">
                  <span>Frame Size: <strong>{selectedSize === 'S' ? 'Small' : selectedSize === 'L' ? 'Large' : 'Medium'}</strong></span>
                  <div className="pd-guide-link" onClick={() => setIsSizeGuideOpen(true)}>
                    <FaRuler style={{ fontSize: '12px' }} /> Size & Fit Guide
                  </div>
                </div>

                <div className="pd-size-pills-row">
                  {[
                    { key: 'S', title: 'Small', desc: '48 □ 16 - 135' },
                    { key: 'M', title: 'Medium', desc: '52 □ 18 - 140' },
                    { key: 'L', title: 'Large', desc: '55 □ 20 - 145' }
                  ].map((sizeItem) => (
                    <div 
                      key={sizeItem.key}
                      className={`pd-size-chip ${selectedSize === sizeItem.key ? 'active' : ''}`}
                      onClick={() => setSelectedSize(sizeItem.key)}
                    >
                      <div className="pd-size-title">{sizeItem.title}</div>
                      <div className="pd-size-desc">{sizeItem.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frame Color Swatches */}
              <div className="pd-color-section">
                <div className="pd-section-header">
                  <span>Frame Color: <strong>{selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}</strong></span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{product.colors?.length || 1} available</span>
                </div>

                <div className="pd-swatches-grid">
                  {(product.colors && product.colors.length > 0 ? product.colors : ['black', 'blue', 'brown', 'gold']).map((color) => (
                    <div
                      key={color}
                      className={`pd-swatch-ring ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                    >
                      <div 
                        className="pd-swatch-circle" 
                        style={getSwatchStyle(color)} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Frame Specs Pills */}
              <div className="pd-features-row">
                <span className="pd-feature-chip">Shape: {product.shape || 'Rectangle'}</span>
                <span className="pd-feature-chip">Gender: {product.gender || 'Unisex'}</span>
                <span className="pd-feature-chip">{product.hasNosePads ? 'Adjustable Nose Pads' : 'Comfort Fit Bridge'}</span>
              </div>
            </div>

            {/* CTAs Action Block */}
            <div className="pd-cta-block">
              <button className="pd-btn-primary-select" onClick={handleSelectLenses}>
                SELECT LENSES & BUY NOW <FaArrowRight />
              </button>

              <div className="pd-btn-secondary-row">
                <button className="pd-btn-secondary" onClick={handleAddToCart}>
                  <FaShoppingCart style={{ color: '#0d6b6d' }} /> Add to Cart
                </button>
                <button className="pd-btn-secondary" onClick={() => setIsTryOnOpen(true)}>
                  <FaCamera style={{ color: '#0d6b6d' }} /> Live 3D Try-On
                </button>
              </div>
            </div>

            {/* Delivery Pincode Checker */}
            <div className="pd-delivery-card">
              <div className="pd-delivery-header">
                <FaTruck style={{ color: '#0d6b6d', fontSize: '18px' }} /> Check Delivery & Serviceability
              </div>
              <div className="pd-pincode-input-row">
                <input 
                  type="text" 
                  placeholder="Enter 6-digit Pincode (e.g. 600001)" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  className="pd-pincode-input"
                />
                <button 
                  onClick={handleCheckPincode}
                  disabled={!pincode || pincode.length !== 6}
                  className="pd-pincode-btn"
                >
                  CHECK
                </button>
              </div>

              {deliveryDate && (
                <div className="pd-delivery-result">
                  <FaCheck /> Guaranteed Express Delivery by <strong>{deliveryDate}</strong>
                </div>
              )}
            </div>

            {/* Trust & Assurance Grid */}
            <div className="pd-trust-grid">
              <div 
                className={`pd-trust-item ${selectedAssurances.includes('return') ? 'active' : ''}`}
                onClick={() => toggleAssurance('return')}
              >
                <FaBoxOpen className="pd-trust-icon" />
                <div>
                  <div className="pd-trust-text-title">14-Day Free Returns</div>
                  <div className="pd-trust-text-sub">100% Money Back</div>
                </div>
              </div>

              <div 
                className={`pd-trust-item ${selectedAssurances.includes('warranty') ? 'active' : ''}`}
                onClick={() => toggleAssurance('warranty')}
              >
                <FaShieldAlt className="pd-trust-icon" />
                <div>
                  <div className="pd-trust-text-title">1-Year Warranty</div>
                  <div className="pd-trust-text-sub">Comprehensive Coverage</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Product Information Tabs Section */}
        <ProductInfoTabs product={product} onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />

        {/* Related Similar Products Section */}
        <RelatedProducts currentProduct={product} />

      </div>

      {/* 3D AR Virtual Try-On Modal */}
      <VirtualTryOn 
        isOpen={isTryOnOpen} 
        onClose={() => setIsTryOnOpen(false)} 
        initialProduct={product} 
        selectedColor={selectedColor}
      />

      {/* Size Guide Modal */}
      <SizeGuideModal 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
        product={product} 
      />

    </div>
  );
}

export default ProductDetails;
