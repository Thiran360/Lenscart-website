import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { verifyOtpApi } from "../services/authService";
import { FaTimes } from "react-icons/fa";
import "./Login.css";

function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const phone = localStorage.getItem("pendingPhone") || "+91 9876543210";
  const cleanPhone = localStorage.getItem("cleanPhone") || phone;
  const flow = localStorage.getItem("otpFlow") || "login";
  const name = localStorage.getItem("pendingName") || "";
  const serverOtp = localStorage.getItem("otp");

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    setTimer(30);
    setCanResend(false);
    setErrorMsg("");
    alert("New OTP sent to your phone! (Use test OTP: 1234)");
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!otp || otp.length < 4) {
      setErrorMsg("Please enter a valid 4-digit verification code");
      return;
    }

    setLoading(true);
    try {
      // Send phone (clean 10-digit string) & OTP payload to /verify-otp/
      const res = await verifyOtpApi({ phone: cleanPhone, otp });

      const token = res?.data?.user_token || res?.user_token;
      const apiName = res?.data?.name || res?.name;
      const apiPhone = res?.data?.phone || res?.phone;

      const registeredName = apiName || name || (flow === "register" ? "User" : "Customer");
      const registeredPhone = apiPhone || cleanPhone || phone;

      // ONLY allow inside if API returns success and token is obtained
      if (res && token) {
        localStorage.setItem("user_token", token);

        const userObj = {
          name: registeredName,
          phone: registeredPhone,
          isVerified: true
        };

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(userObj));
        localStorage.removeItem("pendingPhone");
        localStorage.removeItem("pendingName");
        localStorage.removeItem("otp");

        if (flow === "register") {
          setShowWelcomeModal(true);
        } else {
          navigate("/", { replace: true });
        }
      } else {
        const errorText = res?.message || res?.error || "OTP verification failed. Token not received from server.";
        setErrorMsg(errorText);
      }
    } catch (err) {
      console.error("[Verify OTP API Error]:", err);
      const msg = err?.data?.message || err?.data?.error || err?.message || "Invalid or expired OTP code. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAndShop = () => {
    navigate("/", { replace: true });
  };

  return (
    <div style={{ background: "#f4f7f6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Hero Banner Strip matching screenshot design */}
      <div className="otp-hero-banner">
        <p>Enter the 4-digit verification code sent to your mobile phone to complete {flow === "register" ? "registration" : "login"}.</p>
      </div>

      {/* Centered Main Card Container */}
      <div className="otp-card-wrapper">
        <div className="otp-card-container">
          <button 
            className="otp-close-btn" 
            onClick={() => navigate(flow === "register" ? "/register" : "/login")} 
            aria-label="Close"
          >
            <FaTimes />
          </button>
          
          <h2 className="otp-card-title">Enter Verification Code</h2>
          
          <div className="otp-phone-subtext">
            <span>OTP sent to <strong>{phone}</strong></span>
            <Link to={flow === "register" ? "/register" : "/login"} className="otp-edit-phone-link">
              Edit Mobile Number
            </Link>
          </div>

          {errorMsg && (
            <div className="otp-error-banner">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleVerify} style={{ width: "100%" }}>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Enter 4-Digit OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/[^0-9]/g, ""));
                  if (errorMsg) setErrorMsg("");
                }}
                className="otp-custom-input-box"
                maxLength={4}
                autoFocus
                required
              />
              <div className="otp-hint-text">
                💡 Enter 4-digit OTP code sent to your phone {serverOtp ? `(Test OTP: ${serverOtp})` : ''}
              </div>
            </div>

            <button 
              type="submit" 
              className={`login-btn otp-submit-btn ${loading ? 'disabled' : ''}`}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Proceed"}
            </button>
          </form>

          <div className="otp-timer-footer">
            {canResend ? (
              <button onClick={handleResend} className="otp-resend-btn">
                Resend OTP Code
              </button>
            ) : (
              <span>Resend OTP in <strong>{timer}s</strong></span>
            )}
          </div>
        </div>
      </div>

      {showWelcomeModal && (
        <div className="welcome-modal-overlay">
          <div className="welcome-modal-card">
            <button 
              onClick={handleClaimAndShop}
              className="welcome-close-btn"
              aria-label="Close"
            >
              ×
            </button>
            
            <h2 style={{ color: "#0d6b6d", marginBottom: "15px", fontSize: "26px", fontWeight: "800" }}>
              🎉 Welcome to Mr. Lens Maker! 🎉
            </h2>
            <p style={{ color: "#555", marginBottom: "30px", fontSize: "15px", lineHeight: "1.6" }}>
              Your account has been successfully verified & created! Experience the future of eyewear with our premium frames and 3D Virtual Try-On.
            </p>

            <button
              onClick={handleClaimAndShop}
              className="login-btn"
              style={{ padding: "15px", fontSize: "16px" }}
            >
              Shop Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyOTP;

