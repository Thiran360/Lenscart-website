import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import "./Wishlist.css";

function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
    navigate('/cart');
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '40px 20px' }}>
        <h1 style={{ color: '#3A2415', marginBottom: '10px' }}>My Wishlist</h1>
        <p style={{ color: '#6E4B34', marginBottom: '30px' }}>
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
        </p>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9f9f9', borderRadius: '10px' }}>
            <h2 style={{ color: '#6E4B34' }}>Your wishlist is empty</h2>
            <p style={{ color: '#6E4B34', marginBottom: '30px' }}>Save items you love to revisit them later.</p>
            <Link to="/products" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map(product => (
              <div key={product.id} className="wishlist-item-wrapper" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <ProductCard product={product} />
                <div className="wishlist-actions" style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  <button 
                    onClick={() => handleMoveToCart(product)}
                    className="btn-move-cart"
                  >
                    Move to Cart
                  </button>
                  <button 
                    onClick={() => removeFromWishlist(product.id)}
                    className="btn-remove-wishlist"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Wishlist;

