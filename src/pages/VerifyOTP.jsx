import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaTimes } from "react-icons/fa";
import "./Login.css";

function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const navigate = useNavigate();

  const phone = localStorage.getItem("pendingPhone") || "9876543210";
  const flow = localStorage.getItem("otpFlow") || "login";
  const name = localStorage.getItem("pendingName") || "";

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
    alert("New OTP sent to your phone! (Use test OTP: 1234)");
  };

  const handleVerify = (e) => {
    if (e) e.preventDefault();

    // Store user details in localStorage even if wrong/any OTP is entered
    const registeredName = name || (flow === "register" ? "User" : "Customer");
    const userObj = {
      name: registeredName,
      phone: phone,
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
      alert(`Login Successful! Welcome ${registeredName}.`);
      window.location.href = "/";
    }
  };

  const handleClaimAndShop = () => {
    window.location.href = "/";
  };

  return (
    <>
      <Navbar />
      <div className="login-page-wrapper">
        <div className="login-split-container">
          
          <div className="login-image-side">
            <span className="badge">SECURITY VERIFICATION</span>
            <h4>Almost There!</h4>
            <h1>
              <span>Verify OTP</span>
              Secure & Instant Access
            </h1>
            <p>Enter the 4-digit verification code sent to your mobile phone to complete {flow === "register" ? "registration" : "login"}.</p>
          </div>

          <div className="login-form-side">
            <button className="login-close-btn" onClick={() => navigate("/")} aria-label="Close">
              <FaTimes />
            </button>
            
            <h2>Enter Verification Code</h2>
            <p style={{ textAlign: "center", color: "#666", marginTop: "-20px", marginBottom: "25px", fontSize: "14px", lineHeight: "1.5" }}>
              OTP sent to <strong>{phone}</strong> <br />
              <Link to={flow === "register" ? "/register" : "/login"} style={{ color: "#0d6b6d", fontWeight: "600", fontSize: "12px" }}>
                Edit Mobile Number
              </Link>
            </p>

            <form onSubmit={handleVerify}>
              <div style={{ marginBottom: "25px" }}>
                <input
                  type="text"
                  placeholder="Enter 4-Digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="login-input otp-input"
                  maxLength={4}
                  autoFocus
                  required
                />
                <div style={{ textAlign: "center", fontSize: "12px", color: "#888", marginTop: "-15px" }}>
                  💡 Enter any OTP code to verify & login
                </div>
              </div>

              <button type="submit" className="login-btn">
                Verify & Proceed
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "25px", fontSize: "13px", color: "#666" }}>
              {canResend ? (
                <button
                  onClick={handleResend}
                  style={{ background: "none", border: "none", color: "#0d6b6d", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                >
                  Resend OTP Code
                </button>
              ) : (
                <span>Resend OTP in <strong style={{ color: "#3A2415" }}>{timer}s</strong></span>
              )}
            </div>

            <p className="login-footer-text">
              Didn't receive code? Check mobile signal or request resend.
            </p>
          </div>

        </div>
      </div>

      {showWelcomeModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            padding: "40px 30px 30px 30px",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "420px",
            width: "90%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            position: "relative",
            animation: "slideUpFade 0.4s ease-out"
          }}>
            <button 
              onClick={handleClaimAndShop}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "#f0f0f0",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#666",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => { e.target.style.background = "#e0e0e0"; e.target.style.color = "#000"; }}
              onMouseOut={(e) => { e.target.style.background = "#f0f0f0"; e.target.style.color = "#666"; }}
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
              style={{
                width: "100%",
                padding: "15px",
                background: "#0d6b6d",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 14px rgba(13, 107, 109, 0.3)"
              }}
              onMouseOver={(e) => { e.target.style.background = "#094d4f"; e.target.style.transform = "translateY(-2px)"; }}
              onMouseOut={(e) => { e.target.style.background = "#0d6b6d"; e.target.style.transform = "translateY(0)"; }}
            >
              Shop Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default VerifyOTP;
