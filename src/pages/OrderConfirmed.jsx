import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./OrderConfirmed.css";

function OrderConfirmed() {
  const location = useLocation();
  const orderId = location.state?.orderId || `LK${Math.floor(10000000 + Math.random() * 90000000)}`;
  const total = location.state?.total || 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="order-confirmed-wrapper">
      <Navbar />
      <div className="order-confirmed-container">
        <div className="success-icon-wrapper">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        
        <h1>Thank you for your order!</h1>
        <p className="order-subtitle">Your order has been placed successfully and is being processed.</p>

        <div className="order-details-card">
          <div className="order-info-row">
            <span className="order-info-label">Order Number</span>
            <span className="order-info-value">{orderId}</span>
          </div>
          <div className="order-info-row">
            <span className="order-info-label">Amount Paid</span>
            <span className="order-info-value">₹{total > 0 ? total.toFixed(2) : "Calculated at checkout"}</span>
          </div>
          <div className="order-info-row">
            <span className="order-info-label">Estimated Delivery</span>
            <span className="order-info-value" style={{ color: '#0d6b6d', fontWeight: 'bold' }}>3 - 5 Business Days</span>
          </div>
        </div>

        <p className="email-confirmation">
          We've sent a confirmation email with your order details and tracking information.
        </p>

        <div className="action-buttons">
          <Link to="/products" className="continue-shopping-btn">Continue Shopping</Link>
          <Link to="/track-order" state={{ orderId }} className="track-order-btn">Track Order</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default OrderConfirmed;
