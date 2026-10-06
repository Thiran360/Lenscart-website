import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './ReturnPolicy.css';

function ReturnPolicy({ onClose, product, activeTab = 'return' }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const resetScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    };
    resetScroll();
    const timeout = setTimeout(resetScroll, 50);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const pType = String(product?.type || "").toLowerCase();
  const isSevenDays = pType.includes('sunglass') || pType.includes('accessor') || pType.includes('zero');

  const renderReturnPolicy = () => (
    <>
      <div className="policy-header-section" style={{ paddingBottom: '15px' }}>
        <h1 className="policy-main-title">
          {isSevenDays ? '7-Day Free Return Policy' : '4-Day Free Return Policy'}
        </h1>
        <p className="policy-subtitle" style={{ fontSize: '15px', fontWeight: 600, color: '#0d6b6d' }}>
          {isSevenDays ? 'For Sunglasses, Zero-Power & Accessories' : 'For Prescription Eyeglasses'}
        </p>
      </div>
      <div className="policy-scrollable-content" ref={scrollRef}>
        <section className="policy-section" style={{ border: 'none', padding: 0 }}>
          <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
            You may request a free return within <strong>{isSevenDays ? '7' : '4'} calendar days from the date of delivery</strong>, without providing a reason.
          </p>
          <h3 style={{ color: '#0f172a', marginBottom: '15px' }}>To be eligible:</h3>
          <ul style={{ fontSize: '14.5px', lineHeight: '1.8', color: '#334155' }}>
            <li>The product must be completely <strong>unused and unworn</strong>.</li>
            <li>All original tags and labels must remain attached and intact.</li>
            <li>The original packaging (box, case) and all accessories must be included.</li>
            <li>The product must not have any scratches, marks, stains, damage, alterations, or modifications.</li>
            <li>The returned product must pass our inspection.</li>
          </ul>
          <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#64748b', marginTop: '10px' }}>If the product does not meet these conditions, the return may be rejected.</p>
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', marginTop: '20px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
              Note: Mr. LensMaker will bear the return shipping or pickup cost for an eligible and approved return.
            </p>
          </div>
        </section>
      </div>
    </>
  );

  const renderExchangePolicy = () => (
    <>
      <div className="policy-header-section" style={{ paddingBottom: '15px' }}>
        <h1 className="policy-main-title">14-Day Free Exchange</h1>
        <p className="policy-subtitle" style={{ fontSize: '15px', fontWeight: 600, color: '#0d6b6d' }}>For Prescription Eyeglasses</p>
      </div>
      <div className="policy-scrollable-content" ref={scrollRef}>
        <section className="policy-section" style={{ border: 'none', padding: 0 }}>
          <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
            You may request an exchange within <strong>14 calendar days from the date of delivery</strong>.
          </p>
          <h3 style={{ color: '#0f172a', marginBottom: '15px' }}>Important conditions:</h3>
          <ul style={{ fontSize: '14.5px', lineHeight: '1.8', color: '#334155' }}>
            <li>An exchange is <strong>not a money-back option</strong>; no monetary refund will be provided.</li>
            <li>The replacement product must be of the <strong>same or higher value</strong> than the original product.</li>
            <li>If the replacement product has a higher value, you must pay the difference.</li>
            <li>The original product must be completely <strong>unused and unworn</strong> with all tags and packaging intact.</li>
            <li>The product must not have scratches, marks, stains, damage, or alterations.</li>
            <li>The returned product must pass our inspection.</li>
          </ul>
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', marginTop: '20px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
              Note: Mr. LensMaker will bear the return shipping or pickup cost and the applicable shipping cost for the approved exchange.
            </p>
          </div>
        </section>
      </div>
    </>
  );

  const renderWarrantyPolicy = () => (
    <>
      <div className="policy-header-section" style={{ paddingBottom: '15px' }}>
        <h1 className="policy-main-title">365-Day Product Warranty</h1>
        <p className="policy-subtitle" style={{ fontSize: '15px', fontWeight: 600, color: '#0d6b6d' }}>Comprehensive Coverage</p>
      </div>
      <div className="policy-scrollable-content" ref={scrollRef}>
        <section className="policy-section" style={{ border: 'none', padding: 0 }}>
          <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
            Mr. LensMaker provides a <strong>365-Day Product Warranty from the date of delivery</strong> against specific manufacturing or material-related defects.
          </p>
          
          <h3 style={{ color: '#0f172a', marginBottom: '15px' }}>What Our Warranty Covers:</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Our warranty covers only the following issues:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <ul style={{ fontSize: '14.5px', lineHeight: '1.8', color: '#334155', margin: 0 }}>
              <li>Frame discoloration</li>
              <li>Lens discoloration</li>
              <li>Rust on metal frames</li>
              <li>Rust on screws</li>
              <li>Lens coating peeling off</li>
            </ul>
            <ul style={{ fontSize: '14.5px', lineHeight: '1.8', color: '#334155', margin: 0 }}>
              <li>Spotting on lenses</li>
              <li>Loose nose tip</li>
              <li>Loose frame</li>
              <li>Screw coming out</li>
            </ul>
          </div>
          
          <h3 style={{ color: '#0f172a', marginBottom: '15px', marginTop: '25px' }}>How We Resolve a Warranty Issue:</h3>
          <p style={{ fontSize: '14.5px', lineHeight: '1.6', color: '#334155', marginBottom: '10px' }}>
            A claim will be approved only if, after reviewing and inspecting the product, we determine that the reported issue is a covered manufacturing or material-related defect specifically listed in this policy.
          </p>
          <p style={{ fontSize: '14.5px', lineHeight: '1.6', color: '#334155', fontWeight: 600 }}>
            Approval of a warranty claim does not guarantee replacement. The warranty provides repair or replacement only, at the sole discretion of Mr. LensMaker. It does not provide a monetary refund.
          </p>
        </section>
      </div>
    </>
  );

  return createPortal(
    <div className="policy-modal-overlay" onClick={onClose}>
      <div className="policy-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <button className="policy-close-btn" onClick={onClose}>&times;</button>
        
        {activeTab === 'exchange' ? renderExchangePolicy() 
          : activeTab === 'warranty' ? renderWarrantyPolicy() 
          : renderReturnPolicy()}
      </div>
    </div>,
    document.body
  );
}

export default ReturnPolicy;
