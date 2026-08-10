import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaTimes } from "react-icons/fa";
import "./Login.css";

function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();

  const handleGetOtp = () => {
    if (phone.length < 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    // Mock OTP sending
    setShowOtp(true);
    alert("OTP sent to your phone number! (Use 1234 for testing)");
  };

  const handleLogin = () => {
    if (otp === "1234") {
      alert("Login Successful");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", phone);
      window.location.href = "/";
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-page-wrapper">
        <div className="login-split-container">
          
          <div className="login-image-side">
            <span className="badge">DISCOVER PREMIUM EYEWEAR</span>
            <h4>Many stylish solutions</h4>
            <h1>
              <span>Lenskart</span>
              Experience The Clarity Of Vision
            </h1>
            <p>Authentic premium frames with carefully sourced lenses for your daily vision and lifestyle.</p>
          </div>

          <div className="login-form-side">
            <button className="login-close-btn" onClick={() => navigate("/")} aria-label="Close">
              <FaTimes />
            </button>
            
            <h2>Welcome To Lenskart!</h2>

            {!showOtp ? (
              <>
                <div className="phone-input-group">
                  <div className="country-code">
                    <img src="https://flagcdn.com/w20/in.png" alt="India Flag" />
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="login-input"
                    maxLength={10}
                  />
                </div>
                <button onClick={handleGetOtp} className="login-btn">
                  Submit
                </button>
              </>
            ) : (
              <>
                <p style={{ textAlign: "center", marginBottom: "15px", fontSize: "14px", color: "#666" }}>
                  OTP sent to +91 {phone} <br />
                  <span style={{ color: "#2e7d32", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }} onClick={() => setShowOtp(false)}>Change Number</span>
                </p>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="login-input otp-input"
                  maxLength={4}
                />
                <button onClick={handleLogin} className="login-btn">
                  Verify & Login
                </button>
              </>
            )}

            <p className="login-footer-text">
              By logging in, you're agreeing to our <Link to="#">Privacy Policy</Link> <br />
              <Link to="#">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
