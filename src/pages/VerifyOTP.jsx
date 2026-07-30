import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function VerifyOTP() {
  const [otpInput, setOtpInput] = useState("");

  const handleVerify = () => {
    const flow = localStorage.getItem("otpFlow");
    const otp = localStorage.getItem("otp");

    if (otpInput !== otp) {
      alert("Invalid OTP");
      return;
    }

    if (flow === "register") {
      const pending = JSON.parse(localStorage.getItem("pendingUser"));
      if (!pending) {
        alert("No pending registration found");
        return;
      }

      const user = { ...pending, isVerified: true };
      localStorage.setItem("user", JSON.stringify(user));

      // cleanup
      localStorage.removeItem("pendingUser");
      localStorage.removeItem("otp");
      localStorage.removeItem("otpFlow");

      alert("Registration verified. You can now login.");
      window.location.href = "/login";
      return;
    }

    if (flow === "reset") {
      // allow password reset
      localStorage.setItem("resetVerified", "true");
      localStorage.removeItem("otp");
      localStorage.removeItem("otpFlow");
      alert("OTP verified. You can now reset your password.");
      window.location.href = "/change-password";
      return;
    }

    alert("Unknown OTP flow");
  };

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "400px", width: "90%", margin: "40px auto", padding: "20px", background: "#fff", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,.2)", boxSizing: "border-box" }}>
        <h2>Verify OTP</h2>

        <input type="text" placeholder="Enter OTP" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} style={{ width: "100%", padding: "10px", marginTop: "15px", boxSizing: "border-box", fontSize: "14px" }} />

        <button onClick={handleVerify} style={{ width: "100%", padding: "10px", marginTop: "20px", background: "#3A2415", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "15px" }}>
          Verify
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px", lineHeight: "1.6" }}>
          Back to <Link to="/login" style={{ color: "#3A2415", textDecoration: "none", fontWeight: "bold" }}>Login</Link>
        </p>
      </div>

      <Footer />
    </>
  );
}

export default VerifyOTP;

