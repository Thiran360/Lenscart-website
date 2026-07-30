import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaRegHeart, FaShoppingBag, FaRegUser, FaBars, FaCamera, FaMicrophone } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import EyeglassCategories from "./EyeglassCategories";
import SunglassCategories from "./SunglassCategories";
import ContactCategories from "./ContactCategories";
import VirtualTryOn from "./VirtualTryOn";
import "./Navbar.css";
import { useState, useEffect } from "react";

function Navbar() {
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(logged);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) setUserName(user.name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn'); 
    localStorage.removeItem('currentUser'); 
    navigate('/');
    setIsMenuOpen(false);
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
        
        {/* Hamburger Menu */}
        <div className="hamburger-container">
          <FaBars className="hamburger-icon" onClick={() => setIsMenuOpen(!isMenuOpen)} />
          {isMenuOpen && (
            <div className="hamburger-dropdown">
              <ul>
                <li><Link to="/profile?tab=orders" onClick={() => setIsMenuOpen(false)}>My Order</Link></li>
                <li><Link to="/profile?tab=orders&action=track" onClick={() => setIsMenuOpen(false)}>Track Order</Link></li>
                <li><Link to="/profile?tab=profile" onClick={() => setIsMenuOpen(false)}>Profile</Link></li>
                <li><Link to="/analytics" onClick={() => setIsMenuOpen(false)}>Analytics & Performance</Link></li>
                <li><button onClick={handleLogout} className="dropdown-logout-btn">Logout</button></li>
              </ul>
            </div>
          )}
        </div>

        <Link to="/" className="logo">
          {/* Using a generic infinity-like Lenskart logo mockup */}
          <svg width="40" height="20" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 25C25 15 35 15 35 25C35 35 25 35 25 25Z" stroke="currentColor" strokeWidth="6"/>
            <path d="M75 25C75 15 65 15 65 25C65 35 75 35 75 25Z" stroke="currentColor" strokeWidth="6"/>
            <path d="M35 25H65" stroke="currentColor" strokeWidth="6"/>
          </svg>
          <span style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '1px', whiteSpace: 'nowrap', marginLeft: '5px' }}>LENS HUB</span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/">HOME</Link></li>
          <li className="category-nav-item">
            <Link to="/products?type=eyeglasses" onClick={(e) => { if (window.innerWidth <= 900) e.preventDefault(); }}>EYEGLASSES&nbsp;▾</Link>
            <div className="category-mega-menu">
              <EyeglassCategories />
            </div>
          </li>
          <li className="category-nav-item">
            <Link to="/products?type=sunglasses" onClick={(e) => { if (window.innerWidth <= 900) e.preventDefault(); }}>SUNGLASSES&nbsp;▾</Link>
            <div className="category-mega-menu">
              <SunglassCategories />
            </div>
          </li>
          <li className="category-nav-item">
            <Link to="/products?type=contacts" onClick={(e) => { if (window.innerWidth <= 900) e.preventDefault(); }}>CONTACTS&nbsp;▾</Link>
            <div className="category-mega-menu">
              <ContactCategories />
            </div>
          </li>
          <li><Link to="/try-at-home">TRY@HOME</Link></li>
          <li><Link to="/about">ABOUT</Link></li>
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
          <Link to="/wishlist" style={{ position: "relative" }}>
            <FaRegHeart />
            {totalWishlistItems > 0 && (
              <span className="cart-badge" style={{ backgroundColor: '#ff4d4f' }}>{totalWishlistItems}</span>
            )}
          </Link>
          <Link to="/cart" style={{ position: "relative" }}>
            <FaShoppingBag />
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </Link>
            {isLoggedIn ? (
              <>
                <Link to="/profile" style={{ marginLeft: 12, color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}>{userName || 'Profile'}</Link>
                <button onClick={() => { localStorage.removeItem('isLoggedIn'); localStorage.removeItem('currentUser'); window.location.href = '/'; }} style={{ marginLeft: 12, background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
              </>
            ) : (
              <Link to="/login"><FaRegUser /></Link>
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