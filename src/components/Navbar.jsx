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
  FaTruck,
  FaUser,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaChartBar,
  FaUserCircle,
  FaSpinner
} from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { logoutUser } from "../services/authService";
import { searchProductsApi } from "../services/searchService";
import ConfirmModal from "./ConfirmModal";
import "./Navbar.css";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function Navbar() {
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [liveSearchResults, setLiveSearchResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [showLiveSearchDropdown, setShowLiveSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const currentType = urlParams.get('type');
  const currentSearch = urlParams.get('search');
  const isBogo = urlParams.get('bogo') === 'true';
  const currentMaxPrice = urlParams.get('maxPrice');
  const currentStore = urlParams.get('store');
  const is1200Active = currentStore === '1200' || currentMaxPrice === '1200';

  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(logged);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setUserName(user.name || user.phone || "");

    const storedUserType = localStorage.getItem("user_type") || user?.user_type || user?.role;
    const adminCheck = logged && (String(storedUserType).toLowerCase() === "admin" || user?.is_staff || user?.is_superuser);
    setIsAdmin(Boolean(adminCheck));
  }, [location.pathname]);

  // Sync search input with URL search param
  useEffect(() => {
    if (currentSearch && currentSearch !== 'kids') {
      setSearchTerm(currentSearch);
    }
  }, [currentSearch]);

  const buildSearchUrl = (searchVal) => {
    const currentParams = new URLSearchParams(location.search);
    const trimmed = (searchVal || "").trim();

    if (trimmed) {
      currentParams.set('search', trimmed);
    } else {
      currentParams.delete('search');
    }

    const queryStr = currentParams.toString();
    if (location.pathname === '/products') {
      return queryStr ? `/products?${queryStr}` : `/products`;
    }

    // If starting from home or other page, go to /products?search=<keyword>
    return trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : `/products`;
  };

  // Live dropdown suggestions when typing
  useEffect(() => {
    const trimmed = (searchTerm || "").trim();

    if (!trimmed || trimmed.length < 2) {
      setLiveSearchResults([]);
      setIsSearchingLive(false);
      setShowLiveSearchDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearchingLive(true);
      searchProductsApi({ filter: trimmed })
        .then((res) => {
          const prods = Array.isArray(res) ? res : res?.products || [];
          setLiveSearchResults(prods);
          setShowLiveSearchDropdown(prods.length > 0);
        })
        .catch(() => {
          setLiveSearchResults([]);
        })
        .finally(() => {
          setIsSearchingLive(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close live search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowLiveSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowLiveSearchDropdown(false);
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

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserName("");
      setIsMobileMenuOpen(false);
      setShowLogoutConfirm(false);
      toast.info("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setShowLogoutConfirm(false);
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSearch = (e) => {
    if (e) {
      e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    setShowLiveSearchDropdown(false);
    const trimmed = (searchTerm || "").trim();

    const currentParams = new URLSearchParams(location.search);
    if (trimmed) {
      currentParams.set('search', trimmed);
    } else {
      currentParams.delete('search');
    }

    const newQueryStr = currentParams.toString();
    if (location.pathname === '/products') {
      const targetQuery = newQueryStr ? `?${newQueryStr}` : '?type=eyeglasses';
      navigate(`/products${targetQuery}`);
    } else {
      if (trimmed) {
        navigate(`/products?search=${encodeURIComponent(trimmed)}`);
      } else {
        navigate(`/products?type=eyeglasses`);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      handleSearch(e);
    }
  };

  const handleSelectSearchResult = (product) => {
    setShowLiveSearchDropdown(false);
    navigate(`/product/${product.id}`);
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
                <img src="/lensmakerlogo.png" alt="Mr.LensMaker" className="logo-img" />
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
                  to="/products?type=kids"
                  className={currentType === 'kids' || currentSearch === 'kids' ? 'active-nav-box' : ''}
                >
                  KIDS CLUB
                </Link>
              </li>
              <li className="category-nav-item">
                <Link
                  to="/products?bogo=true"
                  className={isBogo ? 'active-nav-box' : ''}
                >
                  BUY 1 GET 1 SHOP
                </Link>
              </li>
              <li className="category-nav-item">
                <Link
                  to="/products?store=1200"
                  className={is1200Active ? 'active-nav-box' : ''}
                >
                  ₹1200 STORE
                </Link>
              </li>
              {isAdmin && (
                <li className="category-nav-item">
                  <Link
                    to="/admin"
                    className={location.pathname === '/admin' || location.pathname === '/analytics' ? 'active-nav-box' : ''}
                  >
                    ADMIN
                  </Link>
                </li>
              )}
            </ul>

            {/* Clean Search Box with Live Autocomplete */}
            <div className="search-box-wrapper" ref={searchContainerRef}>
              <div className="search-box">
                <FaSearch className="search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }} />
                <input
                  type="text"
                  placeholder='Search "unbreakable glasses for kids"'
                  value={searchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchTerm(val);
                    if (!val.trim()) {
                      setShowLiveSearchDropdown(false);
                      if (location.pathname === '/products' && currentSearch) {
                        const currentParams = new URLSearchParams(location.search);
                        currentParams.delete('search');
                        const newQueryStr = currentParams.toString();
                        const targetQuery = newQueryStr ? `?${newQueryStr}` : '?type=eyeglasses';
                        navigate(`/products${targetQuery}`, { replace: true });
                      }
                    } else if (!showLiveSearchDropdown && val.trim().length >= 2) {
                      setShowLiveSearchDropdown(true);
                    }
                  }}
                  onFocus={() => {
                    if (liveSearchResults.length > 0) setShowLiveSearchDropdown(true);
                  }}
                  onKeyDown={handleKeyDown}
                />
                {isSearchingLive && (
                  <FaSpinner 
                    className="fa-spin" 
                    style={{ color: "#0d6b6d", fontSize: "12px", animation: "spin 1s linear infinite", flexShrink: 0 }} 
                  />
                )}
              </div>

              {showLiveSearchDropdown && liveSearchResults.length > 0 && (
                <div className="search-autocomplete-dropdown">
                  <div className="search-dropdown-header">Matching Results ({liveSearchResults.length})</div>
                  {liveSearchResults.map((prod) => (
                    <div 
                      key={prod.id} 
                      className="search-dropdown-item" 
                      onClick={() => handleSelectSearchResult(prod)}
                    >
                      <img src={prod.image} alt={prod.name} className="search-item-thumb" />
                      <div className="search-item-info">
                        <span className="search-item-title">{prod.name}</span>
                        <div className="search-item-meta">
                          <span className="search-item-price">₹{prod.price}</span>
                          <span className="search-item-badge">{prod.type || prod.category || "eyewear"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="search-dropdown-footer" onClick={handleSearch}>
                    View all results for "{searchTerm}" →
                  </div>
                </div>
              )}
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
                        <div className="dropdown-user-name">
                          <FaUserCircle style={{ color: '#0d6b6d', fontSize: '15px', marginRight: '6px', verticalAlign: '-2px' }} />
                          Hi, {userName || 'User'}
                        </div>
                        <div className="dropdown-user-sub">Welcome back to Mr. Lens Maker</div>
                      </div>
                      <div className="profile-dropdown-divider"></div>
                      <Link to="/profile?tab=profile" className="profile-dropdown-item">
                        <FaUser className="profile-item-icon" /> <span>My Profile</span>
                      </Link>
                      <Link to="/profile?tab=orders" className="profile-dropdown-item">
                        <FaBoxOpen className="profile-item-icon" /> <span>Order History</span>
                      </Link>
                      <Link to="/profile?tab=address" className="profile-dropdown-item">
                        <FaMapMarkerAlt className="profile-item-icon" /> <span>Saved Addresses</span>
                      </Link>
                      <Link to="/profile?tab=prescriptions" className="profile-dropdown-item">
                        <FaGlasses className="profile-item-icon" /> <span>My Prescriptions</span>
                      </Link>

                      <div className="profile-dropdown-divider"></div>
                      <button onClick={() => setShowLogoutConfirm(true)} className="profile-dropdown-logout-btn">
                        <FaSignOutAlt style={{ color: '#ff4d4f', fontSize: '15px' }} /> <span>Logout</span>
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
            <Link to="/products?store=1200" className={is1200Active ? 'active' : ''}>
              ₹1200 STORE
            </Link>
            {isAdmin && (
              <Link to="/admin" className={location.pathname === '/admin' || location.pathname === '/analytics' ? 'active' : ''}>
                ADMIN
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && createPortal(
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-logo">
                <img src="/lensmakerlogo.png" alt="Mr.LensMaker" style={{ height: '36px', objectFit: 'contain' }} />
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
              <Link to="/products?store=1200" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <FaTag className="mobile-link-icon" style={{ color: '#0d6b6d' }} /> ₹1200 Store
              </Link>

              {isLoggedIn && (
                <>
                  <h5 className="mobile-nav-heading" style={{ marginTop: '20px' }}>My Account</h5>
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                    <FaUser className="mobile-link-icon" /> Profile & Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                      <FaUserShield className="mobile-link-icon" /> Admin Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    className="mobile-logout-btn"
                    onClick={() => setShowLogoutConfirm(true)}
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

      {/* Dynamic Logout Confirmation Modal */}
      <ConfirmModal
        show={showLogoutConfirm}
        title="Sign Out of Your Account?"
        message="Are you sure you want to logout from Mr.LensMaker? You will need to verify your phone number to sign back in."
        confirmText="Yes, Logout"
        cancelText="Stay Logged In"
        variant="danger"
        loading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => !isLoggingOut && setShowLogoutConfirm(false)}
      />
    </>
  );
}
export default Navbar;