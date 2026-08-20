import React, { useState, useEffect } from 'react';
import { FaHome, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';
import './AddressManager.css';

function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedAddresses')) || [];
    setAddresses(saved);
  }, []);

  const handleSaveAddresses = (updatedList) => {
    setAddresses(updatedList);
    localStorage.setItem('savedAddresses', JSON.stringify(updatedList));
  };

  const isAddrValid = Boolean(
    newAddr.name?.trim() &&
    newAddr.phone?.trim() &&
    newAddr.phone.length === 10 &&
    newAddr.street?.trim() &&
    newAddr.city?.trim() &&
    newAddr.state?.trim() &&
    newAddr.pincode?.trim() &&
    newAddr.pincode.length === 6
  );

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!isAddrValid) return;

    const created = {
      id: Date.now(),
      ...newAddr,
      isDefault: addresses.length === 0
    };

    const updated = [created, ...addresses];
    handleSaveAddresses(updated);
    setShowAddModal(false);
    setNewAddr({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  };

  const handleDelete = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    handleSaveAddresses(updated);
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    handleSaveAddresses(updated);
  };

  return (
    <div className="address-manager-wrapper">
      <div className="address-manager-header">
        <h2 className="dash-header" style={{ margin: 0 }}>Saved Addresses</h2>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="address-add-btn"
        >
          <FaPlus /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="empty-address-box">
          <FaHome size={48} color="#C5A059" style={{ marginBottom: '15px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#3A2415', fontSize: '18px' }}>No Saved Addresses Found</h3>
          <p style={{ color: '#6E4B34', fontSize: '14px', marginBottom: '20px' }}>
            Addresses saved during checkout or added manually will appear here.
          </p>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="address-add-btn"
            style={{ margin: '0 auto' }}
          >
            Add Address Now
          </button>
        </div>
      ) : (
        <div className="addresses-grid">
          {addresses.map((addr) => (
            <div 
              key={addr.id} 
              style={{
                background: '#FAF6F0',
                border: addr.isDefault ? '2px solid #C5A059' : '1px solid #E2D7C5',
                borderRadius: '16px',
                padding: '20px',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              {addr.isDefault && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#C5A059', fontWeight: '700', fontSize: '12px', marginBottom: '10px' }}>
                  <FaCheckCircle /> DEFAULT ADDRESS
                </div>
              )}
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#3A2415', fontWeight: '700' }}>
                {addr.name}
              </h4>
              <p style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#555', lineHeight: '1.4' }}>
                {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#888', fontWeight: '500' }}>
                📱 Mobile: {addr.phone}
              </p>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #E2D7C5', paddingTop: '12px' }}>
                {!addr.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(addr.id)} 
                    style={{ background: 'none', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#333' }}
                  >
                    Set as Default
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(addr.id)} 
                  style={{ background: 'none', border: 'none', color: '#ff4d4f', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="address-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="address-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="address-modal-topbar">
              <h3>Add Delivery Address</h3>
              <button 
                type="button"
                className="address-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="address-modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Full Name (Letters only)" 
                  value={newAddr.name} 
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Mobile Number (10 digits)" 
                  value={newAddr.phone} 
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, "") })}
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Flat / Building / Street Address" 
                  value={newAddr.street} 
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="City" 
                    value={newAddr.city} 
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="State" 
                    value={newAddr.state} 
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Pincode (6 digits)" 
                  value={newAddr.pincode} 
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, "") })}
                  maxLength={6}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!isAddrValid}
                className="modal-submit-btn"
              >
                Save Address
              </button>
              {!isAddrValid && (
                <span style={{ fontSize: '12px', color: '#A07844', fontStyle: 'italic', textAlign: 'center' }}>
                  * All address fields are required to enable Save Address button.
                </span>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddressManager;
