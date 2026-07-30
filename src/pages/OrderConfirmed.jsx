import { Link } from "react-router-dom";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Checkout.css"; // Reuse some checkout styles if needed

function OrderConfirmed() {
  const orderNumber = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit order ID

  useEffect(() => {
    // Fire confetti when page loads
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <div className="container" style={{ textAlign: 'center', padding: '40px 20px', minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px 20px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          margin: '0 auto',
          aspectRatio: '1 / 1', /* Forces it to be roughly square shaped */
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div className="success-bounce" style={{ 
            fontSize: '40px', 
            color: 'white', 
            backgroundColor: '#4CAF50', 
            width: '60px', 
            height: '60px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: '12px',
            margin: '0 auto 15px auto',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
          }}>✓</div>
          <h1 style={{ color: 'var(--primary)', marginBottom: '5px', fontSize: '24px' }}>Order Confirmed!</h1>
          <p style={{ fontSize: '14px', color: '#6E4B34', margin: '0 auto 20px auto', maxWidth: '250px' }}>
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          
          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Order Number:</p>
            <p style={{ margin: '5px 0 0', fontSize: '20px', letterSpacing: '1px', color: 'var(--teal)' }}>
              #{orderNumber}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/products" style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 'bold',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
              flex: 1
            }}>
              Continue Shopping
            </Link>

            <Link to="/profile?tab=orders&action=track" style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: 'white',
              color: 'var(--primary)',
              border: '2px solid var(--primary)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 'bold',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
              flex: 1
            }}>
              Track Order
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default OrderConfirmed;

