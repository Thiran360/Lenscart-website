import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaRegHeart, FaShoppingBag, FaRegUser, FaBars, FaCamera, FaMicrophone } from "react-icons/fa";
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

  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(logged);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) setUserName(user.name);
  }, []);

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
        
        {/* Hamburger Menu - Navigate directly to Profile */}
        <div className="hamburger-container">
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
            <FaBars className="hamburger-icon" />
          </Link>
        </div>

        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Custom Modern Lens/Eye Logo */}
          <svg width="34" height="24" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#0d6b6d' }}>
            {/* The Eye Shape */}
            <path d="M5 35 C 30 5, 70 5, 95 35 C 70 65, 30 65, 5 35 Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            {/* The Lens / Iris */}
            <circle cx="50" cy="35" r="16" stroke="currentColor" strokeWidth="6"/>
            {/* The Pupil / Shutter */}
            <circle cx="50" cy="35" r="6" fill="currentColor"/>
            {/* Sparkle / Reflection */}
            <circle cx="55" cy="28" r="3" fill="#fff"/>
          </svg>
          <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px', whiteSpace: 'nowrap', fontFamily: "'Outfit', 'Poppins', sans-serif" }}>
            LENS<span style={{ color: '#0d6b6d' }}>HUB</span>
          </span>
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
            <Link to="/products?bogo=true" className="nav-dropdown-trigger" style={{textDecoration: 'none'}}>
              BOGO SHOP <span style={{fontSize: '10px', marginLeft: '4px', background: '#0d6b6d', color: '#fff', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0'}}>BUY 1 GET 1</span>
            </Link>
            <div className="nav-dropdown-menu mega-menu">
              <div className="mega-menu-ad">
                <div className="ad-content">
                  <h4>BOGO SALE</h4>
                  <h2>BUY 1<br/>GET 1<br/>FREE</h2>
                  <p>On all premium frames</p>
                </div>
              </div>
              <div className="mega-menu-links">
                <h5 style={{margin: '0 0 10px 16px', color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px'}}>Shop By Category</h5>
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

          {isLoggedIn ? (
            <Link to="/profile" className="nav-profile-badge" title="My Profile">
              <span className="avatar-circle">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </span>
              <span className="user-name-text">{userName || 'Profile'}</span>
            </Link>
          ) : (
            <Link to="/login" className="nav-icon-link" title="Login / Register">
              <FaRegUser />
            </Link>
          )}
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