import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./TrackOrder.css";

function TrackOrder() {
  const location = useLocation();
  const initialOrderId = location.state?.orderId || "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [isSearching, setIsSearching] = useState(false);
  const [trackingData, setTrackingData] = useState(null);

  // Auto-search if we came from OrderConfirmed
  useEffect(() => {
    if (initialOrderId) {
      handleSearch(new Event('submit'));
    }
  }, [initialOrderId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      setTrackingData({
        orderId: orderId.toUpperCase(),
        datePlaced: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }),
        status: "shipped", // "placed", "processing", "shipped", "out_for_delivery", "delivered"
        items: 1,
        carrier: "BlueDart Express"
      });
      setIsSearching(false);
    }, 800);
  };

  const getStepStatus = (stepName) => {
    if (!trackingData) return "";
    const statuses = ["placed", "processing", "shipped", "out_for_delivery", "delivered"];
    const currentIndex = statuses.indexOf(trackingData.status);
    const stepIndex = statuses.indexOf(stepName);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="track-order-page">
      <Navbar />
      
      <div className="track-order-container">
        <h1 className="page-title">Track Your Order</h1>
        
        <form className="track-search-bar" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Enter your Order ID (e.g. LK12345678)" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Track Order"}
          </button>
        </form>

        {trackingData && (
          <div className="tracking-results-card">
            
            <div className="tracking-header">
              <div className="header-info">
                <h3>Order #{trackingData.orderId}</h3>
                <p>Placed on {trackingData.datePlaced}</p>
              </div>
              <div className="header-status">
                <span className="estimated-label">Estimated Delivery</span>
                <span className="estimated-date">{trackingData.estimatedDelivery}</span>
              </div>
            </div>

            <div className="tracking-stepper-container">
              <div className={`track-step ${getStepStatus("placed")}`}>
                <div className="step-icon-wrapper">
                  <div className="step-icon">📝</div>
                  <div className="step-line"></div>
                </div>
                <div className="step-content">
                  <h4>Order Placed</h4>
                  <p>We have received your order.</p>
                  <span className="step-time">2 days ago, 10:45 AM</span>
                </div>
              </div>

              <div className={`track-step ${getStepStatus("processing")}`}>
                <div className="step-icon-wrapper">
                  <div className="step-icon">⚙️</div>
                  <div className="step-line"></div>
                </div>
                <div className="step-content">
                  <h4>Processing</h4>
                  <p>Your lenses are being cut and fitted to the frame.</p>
                  <span className="step-time">Yesterday, 02:15 PM</span>
                </div>
              </div>

              <div className={`track-step ${getStepStatus("shipped")}`}>
                <div className="step-icon-wrapper">
                  <div className="step-icon pulse-icon">📦</div>
                  <div className="step-line"></div>
                </div>
                <div className="step-content">
                  <h4>Shipped</h4>
                  <p>Your order has been handed over to {trackingData.carrier}.</p>
                  <span className="step-time">Today, 09:30 AM</span>
                </div>
              </div>

              <div className={`track-step ${getStepStatus("out_for_delivery")}`}>
                <div className="step-icon-wrapper">
                  <div className="step-icon">🚚</div>
                  <div className="step-line"></div>
                </div>
                <div className="step-content">
                  <h4>Out for Delivery</h4>
                  <p>The package is out for delivery in your area.</p>
                </div>
              </div>

              <div className={`track-step ${getStepStatus("delivered")}`}>
                <div className="step-icon-wrapper">
                  <div className="step-icon">🏠</div>
                </div>
                <div className="step-content">
                  <h4>Delivered</h4>
                  <p>Package delivered successfully.</p>
                </div>
              </div>
            </div>
            
            <div className="tracking-footer">
              <div className="support-text">
                Need help with your order? <a href="/contact">Contact Support</a>
              </div>
            </div>
            
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default TrackOrder;
