import React, { useState, useEffect } from 'react';
import { FaHome, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 className="dash-header" style={{ margin: 0 }}>Saved Addresses</h2>
        <button 
          onClick={() => setShowAddModal(true)} 
          style={{
            background: '#C5A059',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaPlus /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div style={{ background: '#FAF6F0', padding: '40px 20px', borderRadius: '16px', textAlign: 'center', border: '1px dashed #E2D7C5' }}>
          <FaHome size={48} color="#C5A059" style={{ marginBottom: '15px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#3A2415', fontSize: '18px' }}>No Saved Addresses Found</h3>
          <p style={{ color: '#6E4B34', fontSize: '14px', marginBottom: '20px' }}>
            Addresses saved during checkout or added manually will appear here.
          </p>
          <button 
            onClick={() => setShowAddModal(true)} 
            style={{ background: '#C5A059', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Add Address Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FAF6F0', borderRadius: '16px', padding: '30px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #E2D7C5', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2D7C5', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#3A2415', fontSize: '22px', fontFamily: "'Playfair Display', 'Georgia', serif" }}>Add Delivery Address</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{ background: '#E5DAC9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer', color: '#3A2415', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3A2415', marginBottom: '4px' }}>Full Name * (Letters only)</label>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={newAddr.name} 
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E2D7C5', borderRadius: '8px', fontSize: '14px', background: '#F4EDE2', color: '#3A2415', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3A2415', marginBottom: '4px' }}>Mobile Number (10 digits) *</label>
                <input 
                  type="text" 
                  placeholder="Mobile Number" 
                  value={newAddr.phone} 
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, "") })}
                  maxLength={10}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E2D7C5', borderRadius: '8px', fontSize: '14px', background: '#F4EDE2', color: '#3A2415', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3A2415', marginBottom: '4px' }}>Street Address *</label>
                <input 
                  type="text" 
                  placeholder="Flat / Building / Street Address" 
                  value={newAddr.street} 
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E2D7C5', borderRadius: '8px', fontSize: '14px', background: '#F4EDE2', color: '#3A2415', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3A2415', marginBottom: '4px' }}>City * (Letters only)</label>
                  <input 
                    type="text" 
                    placeholder="City" 
                    value={newAddr.city} 
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                    style={{ width: '100%', padding: '12px', border: '1px solid #E2D7C5', borderRadius: '8px', fontSize: '14px', background: '#F4EDE2', color: '#3A2415', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3A2415', marginBottom: '4px' }}>State * (Letters only)</label>
                  <input 
                    type="text" 
                    placeholder="State" 
                    value={newAddr.state} 
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                    style={{ width: '100%', padding: '12px', border: '1px solid #E2D7C5', borderRadius: '8px', fontSize: '14px', background: '#F4EDE2', color: '#3A2415', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3A2415', marginBottom: '4px' }}>Pincode (6 digits) *</label>
                <input 
                  type="text" 
                  placeholder="Pincode" 
                  value={newAddr.pincode} 
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, "") })}
                  maxLength={6}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E2D7C5', borderRadius: '8px', fontSize: '14px', background: '#F4EDE2', color: '#3A2415', boxSizing: 'border-box' }}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!isAddrValid}
                style={{ 
                  background: isAddrValid ? '#C5A059' : '#D9C8A9', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '14px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '15px', 
                  cursor: isAddrValid ? 'pointer' : 'not-allowed', 
                  opacity: isAddrValid ? 1 : 0.6,
                  marginTop: '10px' 
                }}
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
