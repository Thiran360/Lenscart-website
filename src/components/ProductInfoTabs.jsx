import React, { useState } from 'react';
import './ProductInfoTabs.css';

const ProductInfoTabs = ({ product, onOpenSizeGuide }) => {
  const [activeTab, setActiveTab] = useState('Description');

  const tabs = ['Fit & Size', 'Features', 'Description'];

  return (
    <div className="product-info-tabs-container">
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="tab-content">
        {activeTab === 'Description' && (
          <div className="description-tab-content">
            <div className="description-text">
              <div className="desc-section">
                <h3>Design:</h3>
                <p>Discover refined elegance with this {product.shape.toLowerCase()} frame, meticulously crafted from durable materials, offering a classic standard design that seamlessly blends simplicity with sophistication.</p>
              </div>
              
              <div className="desc-section">
                <h3>Fit:</h3>
                <p>These glasses offer exceptional comfort with their lightweight design and universal bridge fit, complemented by custom styling for a personalized touch.</p>
              </div>
              
              <div className="desc-section">
                <h3>Recommendation:</h3>
                <p>These glasses offer a sophisticated and classic style, perfectly suited for daily wear. With a {product.shape.toLowerCase()} frame, they fit both men and women, providing an elegant and effortless look.</p>
              </div>
            </div>
            <div className="description-image">
              <img src={product.image} alt={product.name} />
            </div>
          </div>
        )}
        
        {activeTab === 'Fit & Size' && (
          <div className="fit-size-tab-content">
            <h3 style={{ marginBottom: '15px' }}>Frame Measurements: {product.size}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
              <div style={{ background: '#f5f5f5', padding: '10px 15px', borderRadius: '8px', minWidth: '120px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Frame Width</div>
                <div style={{ fontWeight: 'bold' }}>{product.size === 'S' ? '130mm' : product.size === 'L' ? '145mm' : '138mm'}</div>
              </div>
              <div style={{ background: '#f5f5f5', padding: '10px 15px', borderRadius: '8px', minWidth: '120px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Lens Width</div>
                <div style={{ fontWeight: 'bold' }}>{product.size === 'S' ? '48mm' : product.size === 'L' ? '55mm' : '52mm'}</div>
              </div>
              <div style={{ background: '#f5f5f5', padding: '10px 15px', borderRadius: '8px', minWidth: '120px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Bridge</div>
                <div style={{ fontWeight: 'bold' }}>{product.size === 'S' ? '16mm' : product.size === 'L' ? '20mm' : '18mm'}</div>
              </div>
              <div style={{ background: '#f5f5f5', padding: '10px 15px', borderRadius: '8px', minWidth: '120px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Temple</div>
                <div style={{ fontWeight: 'bold' }}>{product.size === 'S' ? '135mm' : product.size === 'L' ? '145mm' : '140mm'}</div>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>Need help finding your size?</h4>
              <p style={{ marginBottom: '15px', color: '#555' }}>Use our detailed size guide to learn how to measure your current glasses and compare them to find the perfect fit.</p>
              <button 
                onClick={onOpenSizeGuide}
                style={{ background: '#0d6b6d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                View Detailed Size Guide
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'Features' && (
          <div className="features-tab-content">
            <ul>
              <li>Lightweight and durable {product.category.toLowerCase()} frame</li>
              <li>Spring hinges for a comfortable, flexible fit</li>
              <li>Adjustable nose pads (on select styles)</li>
              <li>Includes premium case and cleaning cloth</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfoTabs;
