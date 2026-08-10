import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-dom";
import { useLocation as useRouterLocation, useNavigate as useRouterNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaymentGatewayModal from "../components/PaymentGatewayModal";
import "./Checkout.css";

function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const location = useRouterLocation();
  const navigate = useRouterNavigate();
  const buyNowProduct = location.state?.buyNowProduct;
  
  const checkoutItems = buyNowProduct ? [buyNowProduct] : cartItems;
  const subTotal = buyNowProduct 
    ? (buyNowProduct.price + (buyNowProduct.additionalPrice || 0)) * (buyNowProduct.quantity || 1) 
    : totalPrice;
  const tax = subTotal * 0.18; // 18% tax simulation
  const shipping = subTotal > 1000 ? 0 : 50;
  const checkoutTotal = subTotal + tax + shipping;

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("gpay");
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Address Form State
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: ""
  });

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePayNow = (e) => {
    e.preventDefault();
    if (checkoutItems.length === 0) {
      alert("Your order is empty!");
      return;
    }
    
    if (paymentMethod === 'cod') {
      // Skip gateway for COD
      clearCart();
      navigate("/order-confirmed", { state: { orderId: `LK${Math.floor(10000000 + Math.random() * 90000000)}`, total: checkoutTotal } });
    } else {
      setShowPaymentGateway(true);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentGateway(false);
    clearCart();
    navigate("/order-confirmed", { state: { orderId: `LK${Math.floor(10000000 + Math.random() * 90000000)}`, total: checkoutTotal } });
  };

  return (
    <div className="checkout-page-wrapper">
      <Navbar />
      
      <PaymentGatewayModal 
        isOpen={showPaymentGateway} 
        amount={checkoutTotal}
        method={paymentMethod}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowPaymentGateway(false)}
      />

      <div className="checkout-main-container">
        <div className="checkout-columns">
          
          {/* LEFT COLUMN - Forms */}
          <div className="checkout-left">
            <h1 className="checkout-title">Checkout</h1>
            
            <div className="checkout-stepper">
              <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1. Shipping</div>
              <div className="checkout-step-line"></div>
              <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2. Payment</div>
            </div>

            {step === 1 && (
              <form className="checkout-form" onSubmit={handleContinueToPayment}>
                <h2 className="section-heading">Contact Information</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input type="text" name="firstName" required value={address.firstName} onChange={handleAddressChange} />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input type="text" name="lastName" required value={address.lastName} onChange={handleAddressChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input type="email" name="email" required value={address.email} onChange={handleAddressChange} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" name="phone" required pattern="[0-9]{10}" placeholder="10-digit mobile number" value={address.phone} onChange={handleAddressChange} />
                  </div>
                </div>

                <h2 className="section-heading" style={{ marginTop: '30px' }}>Shipping Address</h2>
                <div className="form-group">
                  <label>Street Address *</label>
                  <input type="text" name="street" required value={address.street} onChange={handleAddressChange} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input type="text" name="city" required value={address.city} onChange={handleAddressChange} />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <select name="state" required value={address.state} onChange={handleAddressChange}>
                      <option value="">Select State</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input type="text" name="pincode" required pattern="[0-9]{6}" value={address.pincode} onChange={handleAddressChange} />
                  </div>
                </div>

                <button type="submit" className="primary-checkout-btn">
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="checkout-payment-section">
                <div className="address-summary">
                  <div className="summary-row">
                    <span className="summary-label">Contact</span>
                    <span className="summary-value">{address.email}</span>
                    <button className="edit-link" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Ship to</span>
                    <span className="summary-value">{address.street}, {address.city}, {address.pincode}</span>
                    <button className="edit-link" onClick={() => setStep(1)}>Edit</button>
                  </div>
                </div>

                <h2 className="section-heading" style={{ marginTop: '30px' }}>Payment Method</h2>
                <p className="payment-subtitle">All transactions are secure and encrypted.</p>
                
                <div className="payment-methods-accordion">
                  {/* UPI */}
                  <div className={`payment-method-item ${paymentMethod === 'gpay' ? 'active' : ''}`}>
                    <label className="payment-method-header">
                      <input type="radio" name="payment" checked={paymentMethod === 'gpay'} onChange={() => setPaymentMethod('gpay')} />
                      <span className="method-title">UPI / Google Pay</span>
                      <div className="method-icons">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" height="16" />
                      </div>
                    </label>
                    {paymentMethod === 'gpay' && (
                      <div className="payment-method-content">
                        <p>You will be redirected to complete your UPI payment securely.</p>
                      </div>
                    )}
                  </div>

                  {/* Cards */}
                  <div className={`payment-method-item ${paymentMethod === 'card' ? 'active' : ''}`}>
                    <label className="payment-method-header">
                      <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                      <span className="method-title">Credit / Debit Card</span>
                      <div className="method-icons">
                        <span className="card-icon">💳</span>
                      </div>
                    </label>
                    {paymentMethod === 'card' && (
                      <div className="payment-method-content">
                        <div className="card-input-wrapper">
                          <input type="text" placeholder="Card number" maxLength="19" className="card-input" />
                          <div className="card-icons-inline">VISA</div>
                        </div>
                        <div className="form-row" style={{ marginTop: '12px' }}>
                          <input type="text" placeholder="MM / YY" maxLength="5" className="card-input" />
                          <input type="password" placeholder="CVV" maxLength="3" className="card-input" />
                        </div>
                        <input type="text" placeholder="Name on card" className="card-input" style={{ marginTop: '12px' }} />
                      </div>
                    )}
                  </div>

                  {/* COD */}
                  <div className={`payment-method-item ${paymentMethod === 'cod' ? 'active' : ''}`}>
                    <label className="payment-method-header">
                      <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                      <span className="method-title">Cash on Delivery (COD)</span>
                    </label>
                    {paymentMethod === 'cod' && (
                      <div className="payment-method-content">
                        <p>Pay with cash upon delivery. An additional fee of ₹50 may apply.</p>
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={handlePayNow} className="primary-checkout-btn submit-btn">
                  {paymentMethod === 'cod' ? 'Complete Order' : `Pay ₹${checkoutTotal.toFixed(2)}`}
                </button>
              </div>
            )}
            
          </div>

          {/* RIGHT COLUMN - Order Summary */}
          <div className="checkout-right">
            <div className="order-summary-box">
              <h3>Order Summary</h3>
              
              <div className="summary-items">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="summary-item">
                    <div className="summary-item-img">
                      <img src={item.image} alt={item.name} />
                      <span className="item-qty">{item.quantity || 1}</span>
                    </div>
                    <div className="summary-item-details">
                      <h4>{item.name}</h4>
                      <p>{item.selectedColor || 'Standard'} | {item.size || 'Medium'}</p>
                    </div>
                    <div className="summary-item-price">
                      ₹{((item.price + (item.additionalPrice || 0)) * (item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="total-row">
                  <span>Estimated Tax (18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span><span className="currency">INR</span> ₹{checkoutTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Checkout;
