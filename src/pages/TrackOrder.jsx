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
    const cleanOrderId = orderId.replace(/[^a-zA-Z0-9]/g, '');
    if (!cleanOrderId) return;

    setIsSearching(true);
    
    // Fetch live order tracking from API
    import("../services/api").then(({ apiRequest }) => {
      apiRequest(`/orders/${cleanOrderId}/`, "GET")
        .then(data => {
          if (!data) throw new Error("No data returned");
          const payload = data.data || data;
          
          if (payload.detail === "Not found." || payload.error) {
             throw new Error("Order not found");
          }
          
          setTrackingData({
            orderId: payload.orderId || payload.id || orderId.toUpperCase(),
            datePlaced: payload.datePlaced || payload.created_at || "N/A",
            estimatedDelivery: payload.estimatedDelivery || "N/A",
            status: payload.status || "processing",
            items: payload.items || 1,
            carrier: payload.carrier || "Standard Delivery"
          });
          setIsSearching(false);
        })
        .catch(err => {
          console.error("Error tracking order from API, attempting local fallback:", err);
          
          // Fallback to local storage if API fails (useful if backend returns 404 for newly created orders)
          try {
            const storedOrders = JSON.parse(localStorage.getItem("placedOrders")) || [];
            const foundLocal = storedOrders.find(o => String(o.id) === cleanOrderId || String(o.order_id) === cleanOrderId);
            
            if (foundLocal) {
              setTrackingData({
                orderId: foundLocal.id || foundLocal.order_id || cleanOrderId,
                datePlaced: foundLocal.date || "N/A",
                estimatedDelivery: "3 - 5 Business Days", // Default fallback
                status: "processing",
                items: foundLocal.items?.length || 1,
                carrier: "Standard Delivery"
              });
              setIsSearching(false);
              return;
            }
          } catch (localErr) {
            console.error("Local fallback failed:", localErr);
          }

          setTrackingData({ error: "Order not found. Please check your Order ID or contact support." });
          setIsSearching(false);
        });
    });
  };

  const getStepStatus = (stepName) => {
    if (!trackingData || trackingData.error) return "";
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

        {trackingData && trackingData.error ? (
          <div className="tracking-results-card" style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
            <h3 style={{ marginBottom: '10px' }}>⚠️ {trackingData.error}</h3>
            <p style={{ color: '#666' }}>We couldn't find an order matching that ID in our system.</p>
          </div>
        ) : trackingData && (
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
                </div>
              </div>

              <div className={`track-step ${getStepStatus("shipped")}`}>
                <div className="step-icon-wrapper">
                  <div className="step-icon pulse-icon">📦</div>
                  <div className="step-line"></div>
                </div>
                <div className="step-content">
                  <h4>Shipped</h4>
                  <p>Your order has been handed over to delivery carrier.</p>
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
