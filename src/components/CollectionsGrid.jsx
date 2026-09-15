import React from 'react';
import { Link } from 'react-router-dom';
import './CollectionsGrid.css';

const collectionsData = [
  {
    id: 1,
    title: 'Crystal Clear',
    subtitle: 'Transparent Frames',
    image: '/collection-1.jpg',
    borderColor: '#e0d4e9',
    link: '/products?collection=transparent',
  },
  {
    id: 2,
    title: 'Bestsellers',
    subtitle: 'Popmart inspired eyewear',
    image: '/collection-2.jpg',
    borderColor: '#ffd1dc',
    link: '/products?collection=bestsellers',
  },
  {
    id: 3,
    title: 'Bold Signature',
    subtitle: 'John Jacobs',
    image: '/collection-3.jpg',
    borderColor: '#c0c0d0',
    link: '/products?brand=john-jacobs',
  },
  {
    id: 4,
    title: 'The Devil Wears Prada',
    subtitle: 'John Jacobs',
    image: '/collection-4.jpg',
    borderColor: '#ffd1d1',
    link: '/products?brand=john-jacobs',
  },
  {
    id: 5,
    title: '2 in 1: Eye + Sun',
    subtitle: 'Hustlr Switch',
    image: '/collection-5.jpg',
    borderColor: '#b3d9ff',
    link: '/products?category=sunglasses',
  },
  {
    id: 6,
    title: 'Feather-light',
    subtitle: 'Ultra Light Frames',
    image: '/collection-6.avif',
    borderColor: '#d0d0e0',
    link: '/products?collection=feather-light',
  },
];

const CollectionsGrid = () => {
  return (
    <section className="collections-section">
      <div className="collections-container">
        <h2 className="collections-main-title">Exclusively at LensHub</h2>
        <div className="collections-grid">
          {collectionsData.map((collection) => (
            <Link 
              to={collection.link}
              key={collection.id} 
              className="collection-card" 
              style={{ borderColor: collection.borderColor, display: 'block', textDecoration: 'none' }}
            >
              <div className="collection-card-inner">
                <img src={collection.image} alt={collection.title} className="collection-image" />
                <div className="collection-overlay">
                  <h3 className="collection-title">{collection.title}</h3>
                  <p className="collection-subtitle">{collection.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsGrid;
