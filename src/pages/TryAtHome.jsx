import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './TryAtHome.css';

function TryAtHome() {
  const [showModal, setShowModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const handleBookSubmit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowModal(false);
    }, 3000);
  };

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f9f9f9', position: 'relative' }}>
      <Navbar />
      <div className="container try-at-home-wrapper" style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', minHeight: '60vh' }}>
        <div className="try-at-home-inner" style={{
          display: 'flex',
          backgroundColor: '#fff',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Left Side - Image */}
          <div style={{ flex: '1 1 500px' }}>
            <img 
              src="https://images.pexels.com/photos/1125028/pexels-photo-1125028.jpeg?auto=compress&cs=tinysrgb&w=800" 
              alt="Get your eyes checked at home"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '400px' }}
            />
          </div>

          {/* Right Side - Content */}
          <div className="try-at-home-content" style={{ flex: '1 1 400px', padding: '50px 40px', textAlign: 'center' }}>
            <h1 className="try-at-home-title" style={{ color: '#3A2415', marginBottom: '40px', fontWeight: '800' }}>
              Get your eyes checked at home
            </h1>

            <div className="try-at-home-features">
              
              {/* Feature 1 */}
              <div className="try-at-home-feature-item">
                <div style={{ fontSize: '30px', color: '#3A2415', marginBottom: '10px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <p style={{ color: '#3A2415', fontSize: '14px', fontWeight: '600', margin: 0, lineHeight: '1.4' }}>
                  12 Step Eye<br/>Checkup
                </p>
              </div>

              {/* Feature 2 */}
              <div className="try-at-home-feature-item">
                <div style={{ fontSize: '30px', color: '#3A2415', marginBottom: '10px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <p style={{ color: '#3A2415', fontSize: '14px', fontWeight: '600', margin: 0, lineHeight: '1.4' }}>
                  Latest Eye Test<br/>Equipments
                </p>
              </div>

              {/* Feature 3 */}
              <div className="try-at-home-feature-item">
                <div style={{ fontSize: '30px', color: '#3A2415', marginBottom: '10px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="15" r="4"></circle>
                    <circle cx="18" cy="15" r="4"></circle>
                    <path d="M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2"></path>
                    <path d="M2.5 13L5 7c.7-1.3 1.4-2 3-2"></path>
                    <path d="M21.5 13L19 7c-.7-1.3-1.5-2-3-2"></path>
                  </svg>
                </div>
                <p style={{ color: '#3A2415', fontSize: '14px', fontWeight: '600', margin: 0, lineHeight: '1.4' }}>
                  Try 150+ frames<br/>at home
                </p>
              </div>

            </div>

            <button 
              onClick={() => setShowModal(true)}
              style={{
                backgroundColor: '#3A2415',
                color: 'white',
                padding: '15px 40px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,66,0.3)',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Book appointment
            </button>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6E4B34' }}
            >
              &times;
            </button>
            
            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ color: '#4caf50', fontSize: '48px', marginBottom: '20px' }}>✓</div>
                <h2 style={{ color: '#3A2415', margin: 0 }}>Booking Confirmed!</h2>
                <p style={{ color: '#6E4B34', marginTop: '10px' }}>Our specialist will contact you shortly.</p>
              </div>
            ) : (
              <>
                <h2 style={{ color: '#3A2415', marginTop: 0, marginBottom: '25px', textAlign: 'center' }}>Book Your Home Checkup</h2>
                <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>Full Name</label>
                    <input type="text" required placeholder="Enter your name" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>Age</label>
                    <input type="number" required placeholder="Enter your age" min="1" max="120" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>Preferred Date</label>
                      <input type="date" required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>Preferred Time</label>
                      <input type="time" required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <button type="submit" style={{
                    backgroundColor: '#3A2415',
                    color: 'white',
                    padding: '15px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '15px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#000066'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#3A2415'}
                  >
                    Confirm Booking
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default TryAtHome;


