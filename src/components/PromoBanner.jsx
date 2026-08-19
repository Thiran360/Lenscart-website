import React from 'react';
import { Link } from 'react-router-dom';
import './PromoBanner.css';

const PromoBanner = () => {
  return (
    <section className="promo-banner-section">
      <div className="promo-banner-container">
        <div className="promo-banner-content">
          <h2 className="promo-title">FREE LENS<br />REPLACEMENT</h2>
          <p className="promo-subtitle">Any Frame | Any Power | Any Reason</p>
          <Link to="/stores" className="promo-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
            Start Explore
          </Link>
          <p className="promo-terms">
            ₹199/- FITTING CHARGES APPLY | APPLICABLE ON PREMIUM ANTI-GLARE LENSES
          </p>
        </div>
        <div className="promo-banner-image-container">
          <img src="/change.webp" alt="Lens Replacement" className="promo-image" />
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
