import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-dom";
import { useLocation as useRouterLocation, useNavigate as useRouterNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaymentGatewayModal from "../components/PaymentGatewayModal";
import { saveAddressApi } from "../services/profileService";
import { placeOrderApi } from "../services/checkoutService";
import { useToast } from "../context/ToastContext";
import { FaCreditCard } from "react-icons/fa";
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
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("gpay");
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Auto-fill from stored user profile if available
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser) {
        const nameParts = (storedUser.name || "").trim().split(" ");
        const first = nameParts[0] ? nameParts[0].replace(/[0-9]/g, '') : "";
        const last = nameParts.slice(1).join(" ").replace(/[0-9]/g, '') || "";
        
        setAddress(prev => ({
          ...prev,
          firstName: prev.firstName || first,
          lastName: prev.lastName || last,
          email: prev.email || storedUser.email || "",
          phone: prev.phone || (storedUser.phone ? String(storedUser.phone).replace(/\D/g, '').slice(0, 10) : "")
        }));
      }
    } catch {
      // ignore JSON parse error
    }
  }, []);

  const validateField = (name, value) => {
    let error = "";
    const val = (value || "").trim();

    switch (name) {
      case "firstName":
        if (!val) {
          error = "First name is required";
        } else if (/\d/.test(val)) {
          error = "First name cannot contain numbers";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(val)) {
          error = "Only alphabetic letters are allowed";
        } else if (val.length < 2) {
          error = "First name must be at least 2 characters";
        }
        break;

      case "lastName":
        if (!val) {
          error = "Last name is required";
        } else if (/\d/.test(val)) {
          error = "Last name cannot contain numbers";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(val)) {
          error = "Only alphabetic letters are allowed";
        } else if (val.length < 1) {
          error = "Last name is required";
        }
        break;

      case "email":
        if (!val) {
          error = "Email address is required";
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
          error = "Please enter a valid email address (e.g. user@domain.com)";
        }
        break;

      case "phone":
        if (!val) {
          error = "Phone number is required";
        } else if (!/^\d{10}$/.test(val)) {
          error = "Phone number must be exactly 10 digits";
        } else if (!/^[6-9]/.test(val)) {
          error = "Mobile number should start with 6, 7, 8, or 9";
        }
        break;

      case "street":
        if (!val) {
          error = "Street address is required";
        } else if (val.length < 5) {
          error = "Please enter a complete address (minimum 5 characters)";
        } else if (/^\d+$/.test(val)) {
          error = "Address cannot be just numbers";
        }
        break;

      case "city":
        if (!val) {
          error = "City is required";
        } else if (/\d/.test(val)) {
          error = "City name cannot contain numbers";
        } else if (!/^[a-zA-Z\s.-]+$/.test(val)) {
          error = "City name should only contain letters";
        } else if (val.length < 2) {
          error = "City name must be at least 2 characters";
        }
        break;

      case "state":
        if (!val) {
          error = "Please select a state";
        }
        break;

      case "pincode":
        if (!val) {
          error = "Pincode is required";
        } else if (!/^[1-9][0-9]{5}$/.test(val)) {
          error = "Enter a valid 6-digit postal pincode";
        }
        break;

      default:
        break;
    }
    return error;
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Sanitize input in real-time
    if (name === "firstName" || name === "lastName" || name === "city") {
      // Disallow numbers and symbols
      sanitizedValue = value.replace(/[0-9]/g, '');
    } else if (name === "phone") {
      // Only digits, maximum 10 digits
      sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === "pincode") {
      // Only digits, maximum 6 digits
      sanitizedValue = value.replace(/\D/g, '').slice(0, 6);
    }

    setAddress(prev => ({ ...prev, [name]: sanitizedValue }));

    // Re-validate if field was previously touched
    if (touched[name]) {
      const fieldError = validateField(name, sanitizedValue);
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const allErrors = {};
    const allFields = ["firstName", "lastName", "email", "phone", "street", "city", "state", "pincode"];
    
    allFields.forEach(field => {
      const err = validateField(field, address[field]);
      if (err) allErrors[field] = err;
    });

    setErrors(allErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      street: true,
      city: true,
      state: true,
      pincode: true
    });

    if (Object.keys(allErrors).length > 0) {
      const firstKey = Object.keys(allErrors)[0];
      toast.warning(allErrors[firstKey] || "Please fill in all required shipping fields correctly.");
      return;
    }

    setStep(2);
  };

  const saveOrderLocally = (orderId) => {
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'In Transit',
      total: `₹${Math.round(checkoutTotal)}`,
      items: checkoutItems.map(item => ({
        name: item.name || item.title || "Mr.LensMaker Eyewear",
        image: item.image || "/frame-image1.jpg",
        price: item.price || 2000,
        color: item.selectedColor || "Black",
        lensType: item.lensDetails?.type?.title || null,
        lensPackage: item.lensDetails?.package?.title || null,
      })),
      address: {
        name: `${address.firstName} ${address.lastName}`.trim() || "Valued Customer",
        phone: address.phone || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || ""
      }
    };

    const existingOrders = JSON.parse(localStorage.getItem("placedOrders")) || [];
    localStorage.setItem("placedOrders", JSON.stringify([newOrder, ...existingOrders]));
  };

  const saveAddressToApi = async () => {
    if (address.street && address.city) {
      try {
        await saveAddressApi({
          full_name: `${address.firstName} ${address.lastName}`.trim() || "Delivery Address",
          phone: address.phone || "",
          street_address: address.street || "",
          city: address.city || "",
          state: address.state || "",
          pincode: address.pincode || ""
        });
      } catch (err) {
        console.error("Failed to save address:", err);
      }
    }
  };

  const placeOrderViaApi = async () => {
    try {
      setIsPlacingOrder(true);
      setOrderError(null);

      const response = await placeOrderApi({
        items: checkoutItems,
        address,
        paymentMethod,
        subTotal,
        tax,
        shipping,
        totalAmount: checkoutTotal,
      });

      const orderId = response?.order_id || response?.data?.order_id || `LK${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      // Also save locally for the order history page
      saveOrderLocally(orderId);
      await saveAddressToApi();

      return orderId;
    } catch (err) {
      console.error("[Checkout] API Error:", err);
      // Fallback: generate local order ID if API fails
      const fallbackId = `LK${Math.floor(10000000 + Math.random() * 90000000)}`;
      saveOrderLocally(fallbackId);
      await saveAddressToApi();
      return fallbackId;
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePayNow = (e) => {
    e.preventDefault();
    if (checkoutItems.length === 0) {
      toast.warning("Your order is empty!");
      return;
    }
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentGateway(false);
    const orderId = await placeOrderViaApi();
    clearCart();
    navigate("/order-confirmed", { state: { orderId, total: checkoutTotal } });
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
              <form className="checkout-form" onSubmit={handleContinueToPayment} noValidate>
                <h2 className="section-heading">Contact Information</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      placeholder="e.g. Rahul"
                      className={touched.firstName && errors.firstName ? "input-error" : ""}
                      value={address.firstName} 
                      onChange={handleAddressChange}
                      onBlur={handleBlur}
                    />
                    {touched.firstName && errors.firstName && (
                      <span className="field-error-msg">⚠️ {errors.firstName}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      placeholder="e.g. Sharma"
                      className={touched.lastName && errors.lastName ? "input-error" : ""}
                      value={address.lastName} 
                      onChange={handleAddressChange}
                      onBlur={handleBlur}
                    />
                    {touched.lastName && errors.lastName && (
                      <span className="field-error-msg">⚠️ {errors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="e.g. name@domain.com"
                      className={touched.email && errors.email ? "input-error" : ""}
                      value={address.email} 
                      onChange={handleAddressChange}
                      onBlur={handleBlur}
                    />
                    {touched.email && errors.email && (
                      <span className="field-error-msg">⚠️ {errors.email}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      maxLength="10"
                      placeholder="10-digit mobile (e.g. 9876543210)" 
                      className={touched.phone && errors.phone ? "input-error" : ""}
                      value={address.phone} 
                      onChange={handleAddressChange}
                      onBlur={handleBlur}
                    />
                    {touched.phone && errors.phone && (
                      <span className="field-error-msg">⚠️ {errors.phone}</span>
                    )}
                  </div>
                </div>

                <h2 className="section-heading" style={{ marginTop: '30px' }}>Shipping Address</h2>
                <div className="form-group">
                  <label>Street Address *</label>
                  <input 
                    type="text" 
                    name="street" 
                    placeholder="House / Flat No., Street, Landmark"
                    className={touched.street && errors.street ? "input-error" : ""}
                    value={address.street} 
                    onChange={handleAddressChange}
                    onBlur={handleBlur}
                  />
                  {touched.street && errors.street && (
                    <span className="field-error-msg">⚠️ {errors.street}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input 
                      type="text" 
                      name="city" 
                      placeholder="e.g. Chennai"
                      className={touched.city && errors.city ? "input-error" : ""}
                      value={address.city} 
                      onChange={handleAddressChange}
                      onBlur={handleBlur}
                    />
                    {touched.city && errors.city && (
                      <span className="field-error-msg">⚠️ {errors.city}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <select 
                      name="state" 
                      className={touched.state && errors.state ? "input-error" : ""}
                      value={address.state} 
                      onChange={handleAddressChange}
                      onBlur={handleBlur}
                    >
                      <option value="">Select State</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Odisha">Odisha</option>
                    </select>
                    {touched.state && errors.state && (
                      <span className="field-error-msg">⚠️ {errors.state}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Pincode *</label>
                    <input 
                      type="text" 
                      name="pincode" 
                      maxLength="6"
                      placeholder="6-digit pincode"
                      className={touched.pincode && errors.pincode ? "input-error" : ""}
                      value={address.pincode} 
                      onChange={handleAddressChange}
                      onBlur={handleBlur}
                    />
                    {touched.pincode && errors.pincode && (
                      <span className="field-error-msg">⚠️ {errors.pincode}</span>
                    )}
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
                        <FaCreditCard style={{ fontSize: '18px', color: '#0d6b6d' }} />
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
                </div>

                {orderError && (
                  <div style={{ color: '#e74c3c', marginTop: '12px', fontSize: '14px', textAlign: 'center' }}>
                    {orderError}
                  </div>
                )}

                <button 
                  onClick={handlePayNow} 
                  className="primary-checkout-btn submit-btn"
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? 'Processing...' : `Pay ₹${checkoutTotal.toFixed(2)}`}
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
                      <p>{item.selectedColor || item.colors?.[0] || 'Standard'} | {item.size || 'Medium'}</p>
                      {item.lensDetails && (
                        <div className="summary-item-lens-info">
                          <span className="lens-tag">{item.lensDetails.type?.title}</span>
                          <span className="lens-tag">{item.lensDetails.package?.title}</span>
                        </div>
                      )}
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
