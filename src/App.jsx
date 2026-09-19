import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./context/ToastContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import "./App.css";

// Lazy-loaded routes for performance & fast initial load
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmed = lazy(() => import("./pages/OrderConfirmed"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const Profile = lazy(() => import("./pages/Profile"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const SelectLenses = lazy(() => import("./pages/SelectLenses"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Admin = lazy(() => import("./pages/Admin"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));

const RouteLoader = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    color: "#0d6b6d"
  }}>
    <div style={{
      width: "36px",
      height: "36px",
      border: "3px solid rgba(13, 107, 109, 0.15)",
      borderTopColor: "#0d6b6d",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite"
    }} />
  </div>
);

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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthRequired = (event) => {
      // Suppress toast if user intentionally initiated logout
      if (typeof window !== "undefined" && window.sessionStorage?.getItem("is_logging_out") === "true") {
        return;
      }

      const message = event?.detail?.message || "user_token is required. Please login to continue.";

      // Check if already on an auth page (login, register, etc.)
      const currentPath = window.location.pathname || location.pathname;
      const authPages = ["/login", "/register", "/forgot-password", "/verify-otp"];
      const isAuthPage = authPages.some((path) => currentPath.startsWith(path));

      if (!isAuthPage) {
        if (toast?.error) {
          toast.error(message);
        }

        navigate("/login", {
          state: {
            from: currentPath + (window.location.search || location.search || ""),
            reason: message,
          },
          replace: true,
        });
      }
    };

    window.addEventListener("auth:required", handleAuthRequired);
    return () => {
      window.removeEventListener("auth:required", handleAuthRequired);
    };
  }, [location, navigate, toast]);

  return (
    <>
      <ScrollToTop />
      <div key={location.pathname + location.search} className="page-transition-wrapper">
        <Suspense fallback={<RouteLoader />}>
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
            <Route path="/admin" element={<Admin />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;