import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaPinterestP, 
  FaYoutube
} from "react-icons/fa";
import "./Footer.css";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 4000);
    }
  };

  return (
    <footer className="zenni-footer">
      
      {/* Top Banner: Take 15% Off Your First Order (Clean & Elegant) */}
      <div className="zenni-footer-newsletter-banner">
        <div className="zenni-footer-container zenni-newsletter-row">
          
          {/* 15% Offer Callout on the Left */}
          <div className="zenni-offer-col">
            <span className="zenni-offer-badge">
              15% OFF
            </span>
            <h3 className="zenni-offer-heading">
              Take 15% Off Your First Order
            </h3>
          </div>

          <form className="zenni-email-form" onSubmit={handleSubscribe}>
            <div className="zenni-input-wrap">
              <input 
                type="email" 
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="zenni-newsletter-input"
                required
              />
              <button type="submit" className="zenni-newsletter-btn">
                {subscribed ? "Subscribed!" : "Sign Up"}
              </button>
            </div>
            {subscribed && (
              <span className="zenni-subscribe-success">
                🎉 Thank you for subscribing! Your 15% discount has been activated.
              </span>
            )}
          </form>

        </div>
      </div>

      {/* Main 5-Column Navigation Links (Zenni Optical Style) */}
      <div className="zenni-footer-main">
        <div className="zenni-footer-container zenni-columns-grid">

          {/* Column 1: Frequently Asked Questions & Guides */}
          <div className="zenni-col">
            <h4 className="zenni-col-title">Need Help & FAQs</h4>
            <ul className="zenni-link-list">
              <li><Link to="/select-lenses/39">How to Measure Your PD</Link></li>
              <li><Link to="/products">Virtual 3D Try-On</Link></li>
              <li><Link to="/select-lenses/39">Prescription & Lens Guide</Link></li>
              <li><Link to="/select-lenses/39">Single Vision vs Progressive</Link></li>
              <li><Link to="/select-lenses/39">Blue Light Blocking (BLU Tech)</Link></li>
              <li><Link to="/about">How to Order Glasses Online</Link></li>
              <li><Link to="/stores">Store Fitting & Adjustment</Link></li>
            </ul>
          </div>

          {/* Column 2: Customer Service */}
          <div className="zenni-col">
            <h4 className="zenni-col-title">Customer Service</h4>
            <ul className="zenni-link-list">
              <li><Link to="/track-order">Track My Order</Link></li>
              <li><Link to="/profile?tab=address">Saved Delivery Addresses</Link></li>
              <li><Link to="/profile?tab=prescriptions">My Prescriptions</Link></li>
              <li><Link to="/about">14-Day Free Returns</Link></li>
              <li><Link to="/about">1-Year Warranty Information</Link></li>
              <li><Link to="/try-at-home">Try At Home Service</Link></li>
              <li><Link to="/stores">Find Optical Stores</Link></li>
            </ul>
          </div>

          {/* Column 3: Shop Eyewear (Our Products) */}
          <div className="zenni-col">
            <h4 className="zenni-col-title">Shop Eyewear</h4>
            <ul className="zenni-link-list">
              <li><Link to="/eyeglasses">All Eyeglasses</Link></li>
              <li><Link to="/sunglasses">All Sunglasses</Link></li>
              <li><Link to="/kids-club">Kids Club Glasses</Link></li>
              <li><Link to="/buy-one-get-one">Buy 1 Get 1 Free Store</Link></li>
              <li><Link to="/1200-store">₹1200 Budget Store</Link></li>
              <li><Link to="/products">Best Sellers</Link></li>
              <li><Link to="/products">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Column 4: Shop by Style */}
          <div className="zenni-col">
            <h4 className="zenni-col-title">Shop by Style</h4>
            <ul className="zenni-link-list">
              <li><Link to="/products">Aviator Glasses</Link></li>
              <li><Link to="/products">Round & Transparent Frames</Link></li>
              <li><Link to="/products">Rectangle & Square Frames</Link></li>
              <li><Link to="/products">Cat-Eye Eyewear</Link></li>
              <li><Link to="/products">Rimless & Titanium Eyewear</Link></li>
              <li><Link to="/products">Zero Power Computer Glasses</Link></li>
              <li><Link to="/products">Polarized Sunglasses</Link></li>
            </ul>
          </div>

          {/* Column 5: About Mr.LensMaker */}
          <div className="zenni-col">
            <h4 className="zenni-col-title">About Mr.LensMaker</h4>
            <ul className="zenni-link-list">
              <li><Link to="/about">Our Eyewear Heritage</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/stores">Flagship Experience Centers</Link></li>
              <li><Link to="/about">Quality & Craftsmanship</Link></li>
              <li><Link to="/about">Terms of Use</Link></li>
              <li><Link to="/about">Privacy Policy</Link></li>
            </ul>

            <div className="zenni-support-box">
              <span>Customer Helpline:</span>
              <strong>+91 98765 43210</strong>
              <small>Available 24/7 for order support</small>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar: Copyright & Compliance */}
      <div className="zenni-footer-bottom">
        <div className="zenni-footer-container zenni-bottom-row">
          {/* Left Side: Social Icons & Copyright */}
          <div className="zenni-bottom-left">
            <div className="zenni-social-icons">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="zenni-social-icon-circle" title="Facebook" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="zenni-social-icon-circle" title="Instagram" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="zenni-social-icon-circle" title="Twitter / X" aria-label="Twitter / X">
                <FaTwitter />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="zenni-social-icon-circle" title="Pinterest" aria-label="Pinterest">
                <FaPinterestP />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="zenni-social-icon-circle" title="YouTube" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
            <div className="zenni-copyright">
              © {new Date().getFullYear()} Mr.LensMaker (LensHub) ®, Inc. All rights reserved.
            </div>
          </div>

          <div className="zenni-legal-links">
            <Link to="/about">Terms of Use</Link>
            <span className="divider">|</span>
            <Link to="/about">Privacy Policy</Link>
            <span className="divider">|</span>
            <Link to="/about">Accessibility Statement</Link>
            <span className="divider">|</span>
            <span>100% Safe & Secure Payments</span>
          </div>
        </div>
      </div>

    </footer>
  );
}

export default Footer;