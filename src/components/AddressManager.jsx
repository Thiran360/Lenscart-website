import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaHome, FaPlus, FaTrash, FaMapMarkerAlt, FaPhoneAlt, FaUser, FaCity, FaRoad, FaEnvelope } from 'react-icons/fa';
import { getAddressesApi, saveAddressApi, deleteAddressApi } from '../services/profileService';
import ConfirmModal from './ConfirmModal';
import Pagination from './Pagination';
import { useToast } from '../context/ToastContext';
import './AddressManager.css';

function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [newAddr, setNewAddr] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    addressId: null,
    addressName: '',
    loading: false
  });

  // Fetch addresses from API on mount (page_size = 5)
  const fetchAddresses = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getAddressesApi(page, itemsPerPage);
      let addressList = [];

      if (Array.isArray(response)) {
        addressList = response;
      } else if (Array.isArray(response?.results)) {
        addressList = response.results;
      } else if (Array.isArray(response?.data?.results)) {
        addressList = response.data.results;
      } else if (Array.isArray(response?.data)) {
        addressList = response.data;
      } else if (Array.isArray(response?.addresses)) {
        addressList = response.addresses;
      }

      // Check all possible total count keys from API backend
      const rawTotal = 
        response?.total_data ?? 
        response?.total_count ?? 
        response?.total_records ?? 
        response?.total ?? 
        (typeof response?.count === 'number' && response.count > addressList.length ? response.count : null);

      const rawTotalPages = 
        response?.total_pages ?? 
        response?.totalPages ?? 
        response?.num_pages;

      let calculatedTotal = rawTotal != null ? Number(rawTotal) : (addressList.length === itemsPerPage ? (page * itemsPerPage + 1) : (page - 1) * itemsPerPage + addressList.length);
      let calculatedPages = rawTotalPages != null ? Number(rawTotalPages) : Math.max(1, Math.ceil(calculatedTotal / itemsPerPage));

      // If we received a full page of items (5), there are more pages available
      if (addressList.length === itemsPerPage && calculatedPages <= page) {
        calculatedPages = page + 1;
        calculatedTotal = Math.max(calculatedTotal, calculatedPages * itemsPerPage);
      }

      setAddresses(addressList);
      setTotalCount(calculatedTotal);
      setTotalPages(calculatedPages);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      setAddresses([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses(1);
  }, []);

  // Lock body & html scroll when Add Address modal is open
  useEffect(() => {
    if (showAddModal) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [showAddModal]);

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

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!isAddrValid) return;

    setSaving(true);
    try {
      const payload = {
        full_name: newAddr.name,
        phone: newAddr.phone,
        street_address: newAddr.street,
        city: newAddr.city,
        state: newAddr.state,
        pincode: newAddr.pincode
      };

      await saveAddressApi(payload);

      setShowAddModal(false);
      setNewAddr({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });

      toast.success("Address saved successfully!");
      // Re-fetch from API to get the latest list
      await fetchAddresses();
    } catch (err) {
      console.error("Failed to save address:", err);
      toast.error(err.message || "Failed to save address to the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Open confirm modal for delete
  const handleDeleteClick = (addr) => {
    setConfirmModal({
      show: true,
      addressId: addr.id,
      addressName: addr.full_name || addr.name || 'this address',
      loading: false
    });
  };

  // Confirm delete — call API then re-fetch
  const handleConfirmDelete = async () => {
    const { addressId } = confirmModal;
    setConfirmModal(prev => ({ ...prev, loading: true }));

    try {
      await deleteAddressApi(addressId);

      // Re-fetch from API to get the latest list
      await fetchAddresses();
      setConfirmModal({ show: false, addressId: null, addressName: '', loading: false });
      toast.success("Address deleted successfully!");
    } catch (err) {
      console.error("Failed to delete address:", err);
      toast.error(err.message || "Failed to delete address. Please try again.");
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    if (confirmModal.loading) return;
    setConfirmModal({ show: false, addressId: null, addressName: '', loading: false });
  };

  // Reset to last valid page if addresses shrink (e.g., after delete)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="address-manager-wrapper">
      <div className="dash-header-wrap">
        <div>
          <h1 className="dash-header">Saved Addresses</h1>
          <p className="dash-header-subtitle">Manage your delivery locations and shipping preferences.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="address-add-btn"
        >
          <FaPlus /> Add New Address
        </button>
      </div>

      {loading ? (
        <div className="skeleton-wrapper">
          <div className="skeleton-order-card skeleton-shimmer" style={{ height: '160px' }}></div>
          <div className="skeleton-order-card skeleton-shimmer" style={{ height: '160px' }}></div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="empty-address-box">
          <FaHome size={48} color="#0D6B6D" style={{ marginBottom: '15px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '18px', fontWeight: '700' }}>No Saved Addresses Found</h3>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>
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
        <>
          <div className="addresses-grid">
            {addresses.map((addr) => (
              <div key={addr.id} className="address-luxury-card">
                <div className="address-card-topbar">
                  <div className="address-recipient-info">
                    <div className="address-icon-pill">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <h4 className="address-recipient-name">
                        {addr.full_name || addr.name}
                      </h4>
                      <span className="address-type-tag">Delivery Destination</span>
                    </div>
                  </div>
                </div>

                <div className="address-card-content">
                  <p className="address-line-text">
                    {addr.street_address || addr.street}
                  </p>
                  <p className="address-city-state">
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>
                  <div className="address-phone-badge">
                    <FaPhoneAlt size={11} color="#0D6B6D" />
                    <span>+91 {addr.phone}</span>
                  </div>
                </div>

                <div className="address-card-action-bar">
                  <button 
                    onClick={() => handleDeleteClick(addr)} 
                    className="address-delete-btn"
                    title="Remove address"
                  >
                    <FaTrash size={12} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Reusable Pagination Component (Count = 5) */}
          <div style={{ marginTop: '24px' }}>
            <Pagination
              totalItems={totalCount || addresses.length}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              currentPage={currentPage}
              forceShow={true}
              onPageChange={(page) => fetchAddresses(page)}
            />
          </div>
        </>
      )}

      {/* Add Address Modal rendered via Portal */}
      {showAddModal &&
        createPortal(
          <div className="address-modal-overlay">
            <div className="address-modal-card">
              <div className="address-modal-topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="address-modal-icon-badge">
                    <FaHome />
                  </div>
                  <div>
                    <h3>Add New Delivery Address</h3>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>Enter shipping details for fast and accurate order delivery.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="address-modal-close"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="address-modal-body">
                <form onSubmit={handleAddAddress} className="address-form-grid">
                  <div className="address-field-group">
                    <label>Full Name *</label>
                    <div className="input-with-icon">
                      <FaUser className="input-prefix-icon" />
                      <input
                        type="text"
                        placeholder="e.g. Jayakumar V"
                        value={newAddr.name}
                        onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value.replace(/[0-9]/g, "") })}
                        className="modern-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="address-field-group">
                    <label>Mobile Number * (10 Digits)</label>
                    <div className="input-with-icon">
                      <FaPhoneAlt className="input-prefix-icon" />
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        maxLength="10"
                        value={newAddr.phone}
                        onChange={(e) =>
                          setNewAddr({
                            ...newAddr,
                            phone: e.target.value.replace(/\D/g, "").slice(0, 10)
                          })
                        }
                        className="modern-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="address-field-group full-width">
                    <label>Street Address / Building / Flat *</label>
                    <div className="input-with-icon">
                      <FaRoad className="input-prefix-icon" />
                      <input
                        type="text"
                        placeholder="e.g. Flat 402, Green Avenue, North Street"
                        value={newAddr.street}
                        onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                        className="modern-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="address-field-group">
                    <label>City *</label>
                    <div className="input-with-icon">
                      <FaCity className="input-prefix-icon" />
                      <input
                        type="text"
                        placeholder="e.g. Madurai"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value.replace(/[0-9]/g, "") })}
                        className="modern-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="address-field-group">
                    <label>State *</label>
                    <div className="input-with-icon">
                      <FaMapMarkerAlt className="input-prefix-icon" />
                      <input
                        type="text"
                        placeholder="e.g. Tamil Nadu"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value.replace(/[0-9]/g, "") })}
                        className="modern-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="address-field-group full-width">
                    <label>PIN Code * (6 Digits)</label>
                    <div className="input-with-icon">
                      <FaEnvelope className="input-prefix-icon" />
                      <input
                        type="text"
                        placeholder="e.g. 625503"
                        maxLength="6"
                        value={newAddr.pincode}
                        onChange={(e) =>
                          setNewAddr({
                            ...newAddr,
                            pincode: e.target.value.replace(/\D/g, "")
                          })
                        }
                        className="modern-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="address-modal-actions">
                    <button
                      type="submit"
                      disabled={!isAddrValid || saving}
                      className="profile-submit-btn"
                      style={{ marginTop: 0 }}
                    >
                      {saving ? "Saving..." : "Save Address"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="btn-outline-action"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Confirmation Modal */}
      <ConfirmModal
        show={confirmModal.show}
        title="Remove Saved Address?"
        message={
          <span>
            Are you sure you want to remove <strong>"{confirmModal.addressName}"</strong> from your saved delivery addresses?
          </span>
        }
        confirmText={confirmModal.loading ? "Removing..." : "Yes, Remove"}
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default AddressManager;
