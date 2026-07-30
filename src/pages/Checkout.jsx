import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Checkout.css";

function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("gpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    // Simulate secure payment process
    setIsProcessing(true);
    setPaymentStatus("Initiating Secure Connection...");
    
    setTimeout(() => {
      setPaymentStatus("Verifying Payment Details...");
    }, 1000);
    
    setTimeout(() => {
      setPaymentStatus("Payment Successful!");
    }, 2500);

    setTimeout(() => {
      clearCart();
      window.location.href = "/order-confirmed";
    }, 3500);
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      
      {/* Payment Processing Modal */}
      {isProcessing && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="spinner"></div>
            <h2 style={{ marginTop: 20 }}>Processing Payment</h2>
            <p style={{ color: '#6E4B34', marginTop: 10 }}>{paymentStatus}</p>
            <div className="secure-lock">
              🔒 128-bit Secure SSL Connection
            </div>
          </div>
        </div>
      )}

      <div className="checkout-container">
        <h1>Checkout</h1>

        <div className="checkout-content">
          <form className="checkout-form" onSubmit={handleSubmit}>
            
            <section className="checkout-section">
              <h2>1. Shipping Address</h2>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" required placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" required placeholder="9876543210" pattern="[0-9]{10}" />
              </div>
              <div className="form-group">
                <label>Address Line</label>
                <input type="text" required placeholder="123 Street Name, Apartment" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" required placeholder="Chennai" />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input type="text" required placeholder="600001" pattern="[0-9]{6}" />
                </div>
              </div>
            </section>

            <section className="checkout-section">
              <h2>2. Secure Payment Method</h2>
              
              <label className={`payment-option ${paymentMethod === 'gpay' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="gpay" 
                  checked={paymentMethod === "gpay"}
                  onChange={() => setPaymentMethod("gpay")}
                />
                <span className="payment-label">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" style={{ height: '20px', marginRight: '10px' }} />
                  Google Pay (UPI)
                </span>
              </label>

              <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="card" 
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <span className="payment-label">
                  Credit / Debit Card
                </span>
              </label>
              
              {paymentMethod === 'card' && (
                <div style={{ marginTop: 15, padding: 15, background: '#f9f9f9', borderRadius: 8, border: '1px solid #eee' }}>
                   <div className="form-group">
                     <input type="text" placeholder="Card Number" maxLength="16" required style={{ width: '100%', padding: 10, borderRadius: 5, border: '1px solid #ccc' }} />
                   </div>
                   <div style={{ display: 'flex', gap: 15, marginTop: 10 }}>
                     <input type="text" placeholder="MM/YY" maxLength="5" required style={{ width: '50%', padding: 10, borderRadius: 5, border: '1px solid #ccc' }} />
                     <input type="password" placeholder="CVV" maxLength="3" required style={{ width: '50%', padding: 10, borderRadius: 5, border: '1px solid #ccc' }} />
                   </div>
                </div>
              )}

              <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`} style={{ marginTop: paymentMethod === 'card' ? 15 : 0 }}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod" 
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span className="payment-label">
                  Cash on Delivery (COD)
                </span>
              </label>

            </section>

            <button type="submit" className="place-order-btn">Secure Checkout</button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#6E4B34', marginTop: 10 }}>
               🔒 Payments are secured by 128-bit SSL encryption.
            </p>
          </form>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cartItems.map((item, index) => (
                <div className="summary-item" key={index}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h4>{item.name}</h4>
                    <p style={{ margin: "5px 0", fontSize: "13px" }}>Qty: {item.quantity}</p>
                    {item.lensDetails && (
                      <div style={{ marginTop: 5 }}>
                        <p style={{ color: "#C9A66B", fontSize: "12px", margin: "2px 0", fontWeight: 'bold' }}>
                          + {item.lensDetails.type.title}
                        </p>
                        {item.lensDetails.surcharge > 0 && (
                          <p style={{ color: "#d32f2f", fontSize: "11px", margin: "2px 0", fontWeight: 'bold' }}>
                            + High Power Surcharge
                          </p>
                        )}
                        {item.lensDetails.prescription && (
                          <p style={{ color: "#6E4B34", fontSize: "11px", margin: "2px 0" }}>
                            Rx: {item.lensDetails.prescription.method === 'later' ? 'Provide Later' : 'Provided'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: 'green' }}>FREE</span>
              </div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Checkout;
