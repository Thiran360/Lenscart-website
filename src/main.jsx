import { BrowserRouter } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";
import App from "./App.jsx";

// Ensure only auth data (token, user info) is retained and remove legacy cached products/wishlist from localStorage
try {
  ["customProducts", "store_1200_products", "wishlist"].forEach((key) => {
    localStorage.removeItem(key);
  });
} catch (err) {
  console.warn("Could not clean legacy localStorage keys", err);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);