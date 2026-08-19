import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaRegHeart, FaShoppingBag, FaRegUser, FaBars, FaCamera, FaMicrophone, FaSignOutAlt } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

import VirtualTryOn from "./VirtualTryOn";
import "./Navbar.css";
import { useState, useEffect } from "react";

function Navbar() {
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate(`/products`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice search.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      navigate(`/products?search=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <nav className="navbar">
      <div className="nav-left">

        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/lenskartlogo.png" alt="LensKart" style={{ height: '52px', objectFit: 'contain' }} />
        </Link>
        <ul className="nav-links">
          <li className="category-nav-item">
            <Link
              to="/products?type=eyeglasses"
              className={currentType === 'eyeglasses' ? 'active-nav-box' : ''}
              onClick={(e) => { if (window.innerWidth <= 900) e.preventDefault(); }}
            >
              EYEGLASSES
            </Link>
          </li>
          <li className="category-nav-item">
            <Link
              to="/products?type=sunglasses"
              className={currentType === 'sunglasses' ? 'active-nav-box' : ''}
              onClick={(e) => { if (window.innerWidth <= 900) e.preventDefault(); }}
            >
              SUNGLASSES
            </Link>
          </li>
          <li className="category-nav-item">
            <Link
              to="/products?search=kids"
              className={currentSearch === 'kids' ? 'active-nav-box' : ''}
              onClick={(e) => { if (window.innerWidth <= 900) e.preventDefault(); }}
            >
              KIDS CLUB
            </Link>
          </li>
          <li className="category-nav-item has-dropdown">
            <Link
              to="/products?bogo=true"
              className={`nav-dropdown-trigger ${isBogo ? 'active-nav-box' : ''}`}
              style={{ textDecoration: 'none' }}
              onClick={(e) => { if (window.innerWidth <= 900) e.preventDefault(); }}
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
              onClick={(e) => { if (window.innerWidth <= 900) e.preventDefault(); }}
            >
              ₹1200 STORE
            </Link>
          </li>
        </ul>
      </div>
      <div className="nav-right">
        <div className="search-box">
          <FaSearch className="search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }} />
          <input
            type="text"
            placeholder='Search "unbreakable glasses for kids"'
            style={{ flex: 1 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="search-extra-icons">
            <FaMicrophone
              className="search-action-icon"
              title="Voice Search"
              onClick={handleVoiceSearch}
              style={{ color: isListening ? '#ff4d4f' : '#3A2415', cursor: 'pointer' }}
            />
            <FaCamera
              className="search-action-icon"
              title="Virtual Try-On"
              onClick={() => setIsTryOnOpen(true)}
              style={{ color: '#3A2415', cursor: 'pointer', marginLeft: '10px' }}
            />
          </div>
        </div>
        <div className="nav-icons">
          <Link to="/wishlist" className="nav-icon-link" title="Wishlist">
            <FaRegHeart />
            {totalWishlistItems > 0 && (
              <span className="cart-badge" style={{ backgroundColor: '#ff4d4f' }}>{totalWishlistItems}</span>
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
                  <div className="profile-dropdown-divider"></div>
                  <button onClick={handleLogout} className="profile-dropdown-logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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

      <VirtualTryOn
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
      />
    </nav>
  );
}
export default Navbar;