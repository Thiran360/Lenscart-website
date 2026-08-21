import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaSearch, 
  FaRegHeart, 
  FaShoppingBag, 
  FaRegUser, 
  FaBars, 
  FaTimes, 
  FaSignOutAlt,
  FaGlasses,
  FaSun,
  FaChild,
  FaTag,
  FaUserShield,
  FaTruck
} from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

function Navbar() {
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const currentType = urlParams.get('type');
  const currentSearch = urlParams.get('search');
  const isBogo = urlParams.get('bogo') === 'true';
  const currentMaxPrice = urlParams.get('maxPrice');

  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(logged);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) setUserName(user.name);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Prevent background scroll when mobile drawer is open while allowing drawer scrolling
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate(`/products`);
    }
    setIsMobileMenuOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <>
      <header className="navbar-header">
        <nav className="navbar-container">
          {/* Main Top Bar */}
          <div className="navbar-main">
            {/* Left section: Hamburger button (mobile) + Logo */}
            <div className="nav-brand-section">
              <button 
                type="button" 
                className="mobile-menu-btn" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>

              <Link to="/" className="nav-logo">
                <img src="/lenskartlogo.png" alt="LensKart" className="logo-img" />
              </Link>
            </div>

            {/* Desktop Category Links (shown on >= 1024px) */}
            <ul className="desktop-nav-links">
              <li className="category-nav-item">
                <Link
                  to="/products?type=eyeglasses"
                  className={currentType === 'eyeglasses' ? 'active-nav-box' : ''}
                >
                  EYEGLASSES
                </Link>
              </li>
              <li className="category-nav-item">
                <Link
                  to="/products?type=sunglasses"
                  className={currentType === 'sunglasses' ? 'active-nav-box' : ''}
                >
                  SUNGLASSES
                </Link>
              </li>
              <li className="category-nav-item">
                <Link
                  to="/products?search=kids"
                  className={currentSearch === 'kids' ? 'active-nav-box' : ''}
                >
                  KIDS CLUB
                </Link>
              </li>
              <li className="category-nav-item has-dropdown">
                <Link
                  to="/products?bogo=true"
                  className={`nav-dropdown-trigger ${isBogo ? 'active-nav-box' : ''}`}
                >
                  BUY 1 GET 1 SHOP
                </Link>
                <div className="nav-dropdown-menu mega-menu">
                  <div className="mega-menu-ad">
                    <div className="ad-content">
                      <h4>BOGO SALE</h4>
                      <h2>BUY 1<br />GET 1<br />FREE</h2>
                      <p>On all premium frames</p>
                    </div>
                  </div>
                  <div className="mega-menu-links">
                    <h5 style={{ margin: '0 0 10px 16px', color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Shop By Category</h5>
                    <Link to="/products?gender=Men&bogo=true">
                      <span className="link-icon">👨</span> Men's Collection
                    </Link>
                    <Link to="/products?gender=Women&bogo=true">
                      <span className="link-icon">👩</span> Women's Collection
                    </Link>
                    <Link to="/products?gender=Kids&bogo=true">
                      <span className="link-icon">👦</span> Kids Club
                    </Link>
                  </div>
                </div>
              </li>
              <li className="category-nav-item">
                <Link
                  to="/products?maxPrice=1200"
                  className={currentMaxPrice === '1200' ? 'active-nav-box' : ''}
                >
                  ₹1200 STORE
                </Link>
              </li>
              <li className="category-nav-item">
                <Link
                  to="/admin"
                  className={location.pathname === '/admin' || location.pathname === '/analytics' ? 'active-nav-box' : ''}
                >
                  ADMIN
                </Link>
              </li>
            </ul>

            {/* Clean Search Box (without mic & camera icons) */}
            <div className="search-box">
              <FaSearch className="search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }} />
              <input
                type="text"
                placeholder='Search "unbreakable glasses for kids"'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Action Icons (Wishlist, Cart, Profile) */}
            <div className="nav-action-icons">
              <Link to="/wishlist" className="nav-icon-link" title="Wishlist">
                <FaRegHeart />
                {totalWishlistItems > 0 && (
                  <span className="cart-badge" style={{ backgroundColor: '#ff4d4f' }}>{totalWishlistItems}</span>
                )}
              </Link>

              <Link to="/cart" className="nav-icon-link" title="Shopping Cart">
                <FaShoppingBag />
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Link>

              <div className="profile-dropdown-container">
                {isLoggedIn ? (
                  <Link to="/profile" className="nav-profile-badge" title="My Profile">
                    <span className="avatar-circle">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span className="user-name-text">{userName || 'Profile'}</span>
                  </Link>
                ) : (
                  <Link to="/login" className="nav-icon-link" title="Account">
                    <FaRegUser />
                  </Link>
                )}

                <div className="profile-dropdown-menu">
                  {isLoggedIn ? (
                    <>
                      <div className="profile-dropdown-header">
                        <div className="dropdown-user-name">👋 Hi, {userName || 'User'}</div>
                        <div className="dropdown-user-sub">Welcome back to Mr. Lens Maker</div>
                      </div>
                      <div className="profile-dropdown-divider"></div>
                      <Link to="/profile?tab=profile" className="profile-dropdown-item">
                        👤 My Profile
                      </Link>
                      <Link to="/profile?tab=orders" className="profile-dropdown-item">
                        📦 Order History
                      </Link>
                      <Link to="/profile?tab=address" className="profile-dropdown-item">
                        🏠 Saved Addresses
                      </Link>
                      <Link to="/profile?tab=prescriptions" className="profile-dropdown-item">
                        📜 My Prescriptions
                      </Link>
                      <Link to="/admin" className="profile-dropdown-item">
                        📊 Admin Dashboard
                      </Link>
                      <div className="profile-dropdown-divider"></div>
                      <button onClick={handleLogout} className="profile-dropdown-logout-btn">
                        <FaSignOutAlt style={{ color: '#ff4d4f', fontSize: '15px' }} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="profile-dropdown-header">
                        <div className="dropdown-user-name">Welcome Guest</div>
                        <div className="dropdown-user-sub">Login to access your profile & orders</div>
                      </div>
                      <div className="profile-dropdown-divider"></div>
                      <Link to="/login" className="profile-dropdown-action-btn primary">
                        Login
                      </Link>
                      <Link to="/register" className="profile-dropdown-action-btn secondary">
                        Register / Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Sub-Header Navigation for Tablet / Medium screens (< 1024px) */}
          <div className="subnav-category-bar">
            <Link to="/products?type=eyeglasses" className={currentType === 'eyeglasses' ? 'active' : ''}>
              EYEGLASSES
            </Link>
            <Link to="/products?type=sunglasses" className={currentType === 'sunglasses' ? 'active' : ''}>
              SUNGLASSES
            </Link>
            <Link to="/products?search=kids" className={currentSearch === 'kids' ? 'active' : ''}>
              KIDS CLUB
            </Link>
            <Link to="/products?bogo=true" className={isBogo ? 'active' : ''}>
              BUY 1 GET 1 SHOP
            </Link>
            <Link to="/products?maxPrice=1200" className={currentMaxPrice === '1200' ? 'active' : ''}>
              ₹1200 STORE
            </Link>
            <Link to="/admin" className={location.pathname === '/admin' || location.pathname === '/analytics' ? 'active' : ''}>
              ADMIN
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && createPortal(
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-logo">
                <img src="/lenskartlogo.png" alt="LensKart" style={{ height: '36px', objectFit: 'contain' }} />
              </div>
              <button 
                type="button" 
                className="mobile-drawer-close"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            {isLoggedIn ? (
              <div className="mobile-user-card">
                <div className="mobile-user-avatar">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="mobile-user-info">
                  <h4>Hi, {userName || 'User'}</h4>
                  <p>Welcome back</p>
                </div>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="mobile-auth-btn primary" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="mobile-auth-btn secondary" onClick={() => setIsMobileMenuOpen(false)}>
                  Register
                </Link>
              </div>
            )}

            <div className="mobile-drawer-nav">
              <h5 className="mobile-nav-heading">Shop Eyewear</h5>
              <Link to="/products?type=eyeglasses" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <FaGlasses className="mobile-link-icon" /> Eyeglasses
              </Link>
              <Link to="/products?type=sunglasses" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <FaSun className="mobile-link-icon" /> Sunglasses
              </Link>
              <Link to="/products?search=kids" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <FaChild className="mobile-link-icon" /> Kids Club
              </Link>
              <Link to="/products?bogo=true" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <FaTag className="mobile-link-icon" /> Buy 1 Get 1 Shop
              </Link>
              <Link to="/products?maxPrice=1200" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <FaTag className="mobile-link-icon" style={{ color: '#0d6b6d' }} /> ₹1200 Store
              </Link>

              {isLoggedIn && (
                <>
                  <h5 className="mobile-nav-heading" style={{ marginTop: '20px' }}>My Account</h5>
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                    👤 Profile & Orders
                  </Link>
                  <button 
                    type="button" 
                    className="mobile-logout-btn"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
export default Navbar;