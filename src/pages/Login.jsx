import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CustomPhoneInput from "../components/CustomPhoneInput";
import { loginUser, clean10DigitPhone } from "../services/authService";
import { FaTimes } from "react-icons/fa";
import "./Login.css";

function Login() {
  const [phone, setPhone] = useState("");
  const [countryInfo, setCountryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handlePhoneChange = (val, countryData) => {
    setPhone(val);
    if (countryData) setCountryInfo(countryData);
    if (errorMsg) setErrorMsg("");
  };

  const handleGetOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const cleanPhone = clean10DigitPhone(phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit mobile phone number");
      return;
    }

    const dialCode = countryInfo?.dialCode ? `+${countryInfo.dialCode}` : "+91";
    const formattedDisplayPhone = `${dialCode} ${cleanPhone}`;

    setLoading(true);
    try {
      // POST /login/ with payload { phone: "9876543210" } (pure 10-digit string)
      const response = await loginUser({ phone: cleanPhone });
      
      // ONLY navigate on API SUCCESS
      if (response) {
        const token = response?.data?.user_token || response?.user_token;
        if (token) {
          localStorage.setItem("user_token", token);
        }

        const serverOtp = response?.data?.otp || response?.otp;
        if (serverOtp) {
          localStorage.setItem("otp", String(serverOtp));
        }

        // Save session items only when API call succeeds
        const existingUser = JSON.parse(localStorage.getItem("user"));
        if (existingUser && existingUser.name) {
          localStorage.setItem("pendingName", existingUser.name);
        }

        localStorage.setItem("pendingPhone", formattedDisplayPhone);
        localStorage.setItem("cleanPhone", cleanPhone);
        localStorage.setItem("otpFlow", "login");

        navigate("/verify-otp");
      }
    } catch (err) {
      console.error("[Login API Error]:", err);
      const msg = err?.data?.message || err?.data?.error || err?.message || "Failed to send OTP. Please check your mobile number.";
      setErrorMsg(msg);
      // DO NOT navigate on failure
    } finally {
      setLoading(false);
    }
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
              <span>Mr.LensMaker</span>
              Experience The Clarity Of Vision
            </h1>
            <p>Authentic premium frames with carefully sourced lenses for your daily vision and lifestyle.</p>
          </div>

          <div className="login-form-side">
            <button className="login-close-btn" onClick={() => navigate("/")} aria-label="Close">
              <FaTimes />
            </button>
            
            <h2>Welcome To Mr.LensMaker!</h2>
            <p style={{ textAlign: "center", color: "#666", marginTop: "-25px", marginBottom: "30px", fontSize: "14px" }}>
              Sign in with your mobile phone number
            </p>

            {errorMsg && (
              <div style={{
                background: "#ffebee",
                color: "#c62828",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "20px",
                textAlign: "center",
                border: "1px solid #ffcdd2",
                fontWeight: "500"
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

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
                className={`login-btn ${!isPhoneValid || loading ? 'disabled' : ''}`}
                disabled={!isPhoneValid || loading}
              >
                {loading ? "Sending OTP..." : "Get OTP"}
              </button>
            </form>

            <p className="login-footer-text">
              New to Mr.LensMaker?{" "}
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

