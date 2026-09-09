import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import { productsData } from '../data/products';
import './RelatedProducts.css';

const RelatedProducts = ({ currentProduct }) => {
  const carouselRef = useRef(null);

  // Filter out the current product and ensure the type (eyeglasses/sunglasses) matches exactly
  const relatedProducts = productsData
    .filter(p => p.id !== currentProduct.id && p.type === currentProduct.type && (p.category === currentProduct.category || p.gender === currentProduct.gender))
    .slice(0, 10); // show up to 10 products

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (relatedProducts.length === 0) return null;

  return (
    <div className="related-products-section">
      <div className="related-products-header">
        <h2>You Might Also Like</h2>
        <div className="carousel-controls">
          <button className="nav-btn" onClick={scrollLeft}>&lt;</button>
          <button className="nav-btn" onClick={scrollRight}>&gt;</button>
        </div>
      </div>
      
      <div className="related-products-carousel" ref={carouselRef}>
        {relatedProducts.map(product => (
          <div key={product.id} className="carousel-item">
            <ProductCard product={product} is3DMode={false} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
