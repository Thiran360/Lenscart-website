import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import ConfirmModal from "../components/ConfirmModal";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import "./Cart.css";

function Cart() {
  const { cartItems, totalPrice, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Confirmation modal state for removing item from cart
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    item: null
  });

  const handleOpenRemoveConfirm = (item) => {
    setConfirmModal({
      show: true,
      item
    });
  };

  const handleConfirmRemove = () => {
    if (confirmModal.item) {
      removeFromCart(confirmModal.item.cartItemId);
    }
    setConfirmModal({ show: false, item: null });
  };

  const handleCancelRemove = () => {
    setConfirmModal({ show: false, item: null });
  };

  return (
    <div className="cart-page-wrapper">
      <Navbar />

      <div className="cart-container">
        <h1 className="cart-title">Shopping Cart</h1>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <h2>Your cart is empty</h2>
              <p>Add some amazing eyewear to your cart!</p>
              <Link to="/products?type=eyeglasses">Continue Shopping</Link>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <CartItem 
                  key={item.cartItemId} 
                  item={item} 
                  onRemove={handleOpenRemoveConfirm}
                />
              ))}

              <div className="cart-summary">
                <h3 className="cart-total">
                  <span>Total Price:</span> 
                  <span>₹{totalPrice}</span>
                </h3>
                <button 
                  className="cart-checkout-btn"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Reusable Dynamic Confirmation Modal */}
      <ConfirmModal
        show={confirmModal.show}
        title="Remove Item from Cart?"
        message={
          confirmModal.item ? (
            <span>
              Are you sure you want to remove <strong>"{confirmModal.item.name}"</strong> from your shopping cart?
            </span>
          ) : ""
        }
        confirmText="Yes, Remove"
        cancelText="Keep Item"
        variant="danger"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />

      <div style={{ marginTop: "100px" }}>
        <Footer />
      </div>
    </div>
  );
}

export default Cart;