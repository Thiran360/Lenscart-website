import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CustomPhoneInput from "../components/CustomPhoneInput";
import { FaTimes } from "react-icons/fa";
import "./Login.css";

function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryInfo, setCountryInfo] = useState(null);
  const navigate = useNavigate();

  const handlePhoneChange = (val, countryData) => {
    setPhone(val);
    if (countryData) setCountryInfo(countryData);
  };

  const handleGetOtp = (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your full name");
      return;
    }
    if (!phone || phone.length < 7) {
      alert("Please enter a valid mobile phone number");
      return;
    }

    const dialCode = countryInfo?.dialCode ? `+${countryInfo.dialCode}` : "+91";
    const formattedPhone = phone.startsWith("+") ? phone : `${dialCode} ${phone}`;
    localStorage.setItem("pendingName", name);
    localStorage.setItem("pendingPhone", formattedPhone);
    localStorage.setItem("otpFlow", "register");
    localStorage.setItem("otp", "1234");

    navigate("/verify-otp");
  };

  const isFormValid = Boolean(name.trim().length > 0 && phone && phone.trim().length >= 7);

  return (
    <>
      <Navbar />
      <div className="login-page-wrapper">
        <div className="login-split-container">
          
          <div className="login-image-side">
            <span className="badge">JOIN LENSKART CLUB</span>
            <h4>Exclusive Benefits & Offers</h4>
            <h1>
              <span>Create Account</span>
              Experience The Future Of Eyewear
            </h1>
            <p>Get exclusive first-time user discounts, 3D Virtual Try-On access, and 1-Year warranty on all frames.</p>
          </div>

          <div className="login-form-side">
            <button className="login-close-btn" onClick={() => navigate("/")} aria-label="Close">
              <FaTimes />
            </button>
            
            <h2>Create Your Account</h2>
            <p style={{ textAlign: "center", color: "#666", marginTop: "-25px", marginBottom: "30px", fontSize: "14px" }}>
              Quick 1-step signup with Mobile OTP
            </p>

            <form onSubmit={handleGetOtp}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#3A2415", marginBottom: "6px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "10px",
                    border: "1.5px solid #e0e0e0",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.3s"
                  }}
                  required
                />
              </div>

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
                className={`login-btn ${!isFormValid ? 'disabled' : ''}`}
                disabled={!isFormValid}
              >
                Get OTP
              </button>
            </form>

            <p className="login-footer-text">
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#0d6b6d", fontWeight: "bold" }}>
                Login Here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

export default Register;
