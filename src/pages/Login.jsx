import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CustomPhoneInput from "../components/CustomPhoneInput";
import { FaTimes } from "react-icons/fa";
import "./Login.css";

function Login() {
  const [phone, setPhone] = useState("");
  const [countryInfo, setCountryInfo] = useState(null);
  const navigate = useNavigate();

  const handlePhoneChange = (val, countryData) => {
    setPhone(val);
    if (countryData) setCountryInfo(countryData);
  };

  const handleGetOtp = (e) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 7) {
      alert("Please enter a valid mobile phone number");
      return;
    }

    const dialCode = countryInfo?.dialCode ? `+${countryInfo.dialCode}` : "+91";
    const formattedPhone = phone.startsWith("+") ? phone : `${dialCode} ${phone}`;
    
    // Check if existing user profile exists in localStorage
    const existingUser = JSON.parse(localStorage.getItem("user"));
    if (existingUser && existingUser.name) {
      localStorage.setItem("pendingName", existingUser.name);
    }

    localStorage.setItem("pendingPhone", formattedPhone);
    localStorage.setItem("otpFlow", "login");
    localStorage.setItem("otp", "1234");

    navigate("/verify-otp");
  };

  const isPhoneValid = Boolean(phone && phone.trim().length >= 7);

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
            <p style={{ textAlign: "center", color: "#666", marginTop: "-25px", marginBottom: "30px", fontSize: "14px" }}>
              Sign in with your mobile phone number
            </p>

            <form onSubmit={handleGetOtp}>
              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#3A2415", marginBottom: "6px" }}>
                  Select Country & Mobile Number
                </label>
                <CustomPhoneInput
                  value={phone}
                  onChange={handlePhoneChange}
                  defaultCountry="in"
                />
              </div>

              <button 
                type="submit" 
                className={`login-btn ${!isPhoneValid ? 'disabled' : ''}`}
                disabled={!isPhoneValid}
              >
                Get OTP
              </button>
            </form>

            <p className="login-footer-text">
              New to LensKart?{" "}
              <Link to="/register" style={{ color: "#0d6b6d", fontWeight: "bold" }}>
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
