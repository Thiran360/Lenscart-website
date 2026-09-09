import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import ConfirmModal from "../components/ConfirmModal";
import { FaTrashAlt, FaHeart } from "react-icons/fa";
import "./Wishlist.css";

function Wishlist() {
  const { wishlist, loading, fetchWishlist, removeFromWishlist } = useWishlist();

  // Call GET /wishlist/ on component mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Confirmation modal state for dynamic item removal
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    product: null
  });

  const handleOpenRemoveConfirm = (product) => {
    setConfirmModal({
      show: true,
      product
    });
  };

  const handleConfirmRemove = () => {
    if (confirmModal.product) {
      removeFromWishlist(confirmModal.product.id);
    }
    setConfirmModal({ show: false, product: null });
  };

  const handleCancelRemove = () => {
    setConfirmModal({ show: false, product: null });
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h1 style={{ color: '#3A2415', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaHeart color="#ff4d4f" size={24} /> My Wishlist
          </h1>
          {loading && (
            <span style={{ fontSize: '13px', color: '#0d6b6d', fontWeight: '600' }}>
              Updating wishlist...
            </span>
          )}
        </div>
        
        <p style={{ color: '#6E4B34', marginBottom: '30px' }}>
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
        </p>

        {loading && wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6E4B34' }}>
            Loading your saved eyewear wishlist...
          </div>
        ) : wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9f9f9', borderRadius: '10px' }}>
            <h2 style={{ color: '#6E4B34' }}>Your wishlist is empty</h2>
            <p style={{ color: '#6E4B34', marginBottom: '30px' }}>Save items you love to revisit them later.</p>
            <Link to="/products?type=eyeglasses" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map(product => (
              <div key={product.id} className="wishlist-item-wrapper">
                <ProductCard product={product} />
                <div className="wishlist-actions">
                  <button 
                    type="button"
                    onClick={() => handleOpenRemoveConfirm(product)}
                    className="btn-remove-wishlist"
                    title={`Remove ${product.name} from wishlist`}
                  >
                    <FaTrashAlt style={{ marginRight: '6px' }} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reusable Dynamic Confirmation Modal */}
      <ConfirmModal
        show={confirmModal.show}
        title="Remove from Wishlist?"
        message={
          confirmModal.product ? (
            <span>
              Are you sure you want to remove <strong>"{confirmModal.product.name}"</strong> from your wishlist?
            </span>
          ) : ""
        }
        confirmText="Yes, Remove"
        cancelText="Keep in Wishlist"
        variant="danger"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />

      <Footer />
    </div>
  );
}

export default Wishlist;
