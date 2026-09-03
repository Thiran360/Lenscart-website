import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CustomPhoneInput from "../components/CustomPhoneInput";
import { registerUser, clean10DigitPhone } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { FaTimes } from "react-icons/fa";
import "./Login.css";

function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryInfo, setCountryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePhoneChange = (val, countryData) => {
    setPhone(val);
    if (countryData) setCountryInfo(countryData);
    if (errorMsg) setErrorMsg("");
  };

  const handleGetOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      toast.warning("Please enter your full name");
      return;
    }
    
    const cleanPhone = clean10DigitPhone(phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      toast.warning("Please enter a valid 10-digit mobile phone number");
      return;
    }

    const dialCode = countryInfo?.dialCode ? `+${countryInfo.dialCode}` : "+91";
    const formattedDisplayPhone = `${dialCode} ${cleanPhone}`;

    setLoading(true);
    try {
      // Execute registerUser from central authService (POST /register/) with payload { phone: "9876543210", name: "User Name" }
      const response = await registerUser({
        name: name.trim(),
        phone: cleanPhone
      });

      // ONLY navigate on API SUCCESS
      if (response) {
        const token = response?.data?.user_token || response?.user_token;
        if (token) {
          localStorage.setItem("user_token", token);
        }

        const serverOtp = response?.data?.otp || response?.otp;
        if (serverOtp) {
          sessionStorage.setItem("otp", String(serverOtp));
        }

        localStorage.setItem("pendingName", name.trim());
        localStorage.setItem("pendingPhone", formattedDisplayPhone);
        localStorage.setItem("cleanPhone", cleanPhone);
        sessionStorage.setItem("otpFlow", "register");

        navigate("/verify-otp");
      }
    } catch (err) {
      console.error("[Register API Error]:", err);
      const msg = err?.data?.message || err?.data?.error || err?.message || "Registration failed. Please check your details.";
      setErrorMsg(msg);
      // DO NOT navigate on failure
    } finally {
      setLoading(false);
    }
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
                className={`login-btn ${!isFormValid || loading ? 'disabled' : ''}`}
                disabled={!isFormValid || loading}
              >
                {loading ? "Sending OTP..." : "Get OTP"}
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
