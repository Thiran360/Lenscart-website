import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Stores.css';

const dummyStores = [
  {
    id: 1,
    name: 'LensHub Anna Nagar',
    address: '123, 2nd Avenue, Near Roundtana, Anna Nagar, Chennai 600040',
    timings: '10:00 AM - 09:30 PM',
    phone: '+91 98765 43210',
    distance: '2.5 km',
  },
  {
    id: 2,
    name: 'LensHub T. Nagar',
    address: '45, Pondy Bazaar, Opp. Big Bazaar, T. Nagar, Chennai 600017',
    timings: '10:00 AM - 10:00 PM',
    phone: '+91 98765 43211',
    distance: '5.1 km',
  },
  {
    id: 3,
    name: 'LensHub Velachery',
    address: '89, 100 Feet Road, Near Phoenix Marketcity, Velachery, Chennai 600042',
    timings: '10:30 AM - 10:00 PM',
    phone: '+91 98765 43212',
    distance: '8.4 km',
  },
  {
    id: 4,
    name: 'LensHub OMR',
    address: 'Unit 4, Marina Mall, OMR, Egattur, Chennai 603103',
    timings: '11:00 AM - 10:00 PM',
    phone: '+91 98765 43213',
    distance: '15.2 km',
  },
  {
    id: 5,
    name: 'LensHub Adyar',
    address: '7, Sardar Patel Road, Near Adyar Signal, Adyar, Chennai 600020',
    timings: '10:00 AM - 09:00 PM',
    phone: '+91 98765 43214',
    distance: '7.8 km',
  }
];

function Stores() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredStores = dummyStores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <div className="stores-header-banner">
        <h1>Find a LensHub Store Near You</h1>
        <p>Experience our premium eyewear collection in person with free eye check-ups.</p>
        
        <div className="stores-search-bar">
          <input 
            type="text" 
            placeholder="Search by city, area, or pincode..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>Search</button>
        </div>
      </div>

      <div className="stores-content-container">
        <div className="stores-list-section">
          <h2>{filteredStores.length} Stores Found</h2>
          <div className="stores-grid">
            {filteredStores.length > 0 ? (
              filteredStores.map(store => (
                <div key={store.id} className="store-card">
                  <div className="store-card-header">
                    <h3>{store.name}</h3>
                    <span className="store-distance">{store.distance}</span>
                  </div>
                  <p className="store-address">{store.address}</p>
                  
                  <div className="store-details-row">
                    <div className="detail-item">
                      <span className="icon">🕒</span>
                      <span>{store.timings}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">📞</span>
                      <span>{store.phone}</span>
                    </div>
                  </div>

                  <div className="store-actions">
                    <button className="btn-directions">Get Directions</button>
                    <button className="btn-book-appointment">Book Eye Test</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-stores">
                <p>No stores found for "{searchQuery}". Try a different location.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="stores-map-placeholder">
          <div className="map-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3A2415" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <h3>Interactive Map</h3>
            <p>Select a store to view its location on the map.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Stores;

