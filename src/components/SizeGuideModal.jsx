import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './SizeGuideModal.css';

function SizeGuideModal({ isOpen, onClose, product }) {
  const [activeTab, setActiveTab] = useState('how-to-measure');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="size-guide-overlay" onClick={onClose}>
      <div className="size-guide-modal" onClick={e => e.stopPropagation()}>
        <div className="size-guide-header">
          <h2>Size Guide</h2>
          <button className="size-guide-close" onClick={onClose}>✕</button>
        </div>

        <div className="size-guide-tabs">
          <button 
            className={`tab-btn ${activeTab === 'how-to-measure' ? 'active' : ''}`}
            onClick={() => setActiveTab('how-to-measure')}
          >
            How to measure
          </button>
          <button 
            className={`tab-btn ${activeTab === 'size-specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('size-specs')}
          >
            Size & Specs
          </button>
        </div>

        <div className="size-guide-content">
          {activeTab === 'how-to-measure' && (
            <div className="how-to-measure-tab">
              <h3>How to measure your size:</h3>
              <div className="steps-container">
                <div className="step-row">
                  <div className="step-image">
                    <img src="/images/size-guide/temple.jpg" alt="Temple arm numbers" />
                  </div>
                  <div className="step-text">
                    <div className="step-number">1</div>
                    <div>
                      <h4>Find your lens width using frames you already own.</h4>
                      <p>Look inside the temple arm for a set of numbers (e.g. 56 □ 18-135). The first number is your lens width.</p>
                    </div>
                  </div>
                </div>

                <div className="step-row">
                  <div className="step-image">
                    <img src="/images/size-guide/compare.jpg" alt="Comparing glasses" />
                  </div>
                  <div className="step-text">
                    <div className="step-number">2</div>
                    <div>
                      <h4>Compare your current lens width to the frames you're shopping for.</h4>
                      <p>If the new frames' lens width is within ±1-2 mm of your current frames, they should feel similar in size.</p>
                    </div>
                  </div>
                </div>

                <div className="step-row">
                  <div className="step-image">
                    <img src="/images/size-guide/faces.jpg" alt="Faces fit guide" />
                  </div>
                  <div className="step-text">
                    <div className="step-number">3</div>
                    <div>
                      <h4>Go wider if tight, narrower if loose.</h4>
                      <p>If your current glasses feel tight, try a slightly wider lens width. If they feel loose, try a slightly narrower width.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'size-specs' && (
            <div className="size-specs-tab">
              <h3>Detailed Specifications for {product?.name || 'this product'}</h3>
              <p style={{ marginBottom: '20px', color: '#666' }}>These are the exact dimensions for the selected frame to ensure a perfect fit.</p>
              
              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Lens Width</span>
                  <span className="spec-value">{product?.size === 'S' ? '48' : product?.size === 'L' ? '55' : '52'} mm</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Bridge Width</span>
                  <span className="spec-value">{product?.size === 'S' ? '16' : product?.size === 'L' ? '20' : '18'} mm</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Temple Length</span>
                  <span className="spec-value">{product?.size === 'S' ? '135' : product?.size === 'L' ? '145' : '140'} mm</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Lens Height</span>
                  <span className="spec-value">{product?.size === 'S' ? '38' : product?.size === 'L' ? '46' : '42'} mm</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Frame Width</span>
                  <span className="spec-value">{product?.size === 'S' ? '130' : product?.size === 'L' ? '142' : '136'} mm</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Frame Weight</span>
                  <span className="spec-value">{product?.type === 'sunglasses' ? '24g' : '16g'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Frame Material</span>
                  <span className="spec-value">Premium Acetate / TR90</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SizeGuideModal;
