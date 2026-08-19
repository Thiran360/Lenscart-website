import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmed from "./pages/OrderConfirmed";
import About from "./pages/About";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Stores from "./pages/Stores";

import SelectLenses from "./pages/SelectLenses";
import Analytics from "./pages/Analytics";
import Wishlist from "./pages/Wishlist";
import TryAtHome from "./pages/TryAtHome";
import TrackOrder from "./pages/TrackOrder";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }, [pathname, search]);

  return null;
}

function App() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <div key={location.pathname + location.search} className="page-transition-wrapper">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/select-lenses/:id" element={<SelectLenses />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmed" element={<OrderConfirmed />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/try-at-home" element={<TryAtHome />} />
          <Route path="/stores" element={<Stores />} />
        </Routes>
      </div>
    </>
  );
}

export default App;