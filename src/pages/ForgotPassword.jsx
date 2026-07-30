import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser || savedUser.email !== email) {
      alert("No account found with that email");
      return;
    }

    if (!newPassword || !confirmPassword) {
      alert("Please enter a new password and confirm it");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    savedUser.password = newPassword;
    localStorage.setItem("user", JSON.stringify(savedUser));
    
    alert("Password reset successfully. You can now login.");
    window.location.href = "/login";
  };

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "400px", width: "90%", margin: "40px auto", padding: "20px", background: "#fff", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,.2)", boxSizing: "border-box" }}>
        <h2>Reset Password</h2>

        <input type="email" placeholder="Registered Mail ID" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "10px", marginTop: "15px", boxSizing: "border-box", fontSize: "14px" }} />
        
        <input type="password" placeholder="Create Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%", padding: "10px", marginTop: "15px", boxSizing: "border-box", fontSize: "14px" }} />
        
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: "100%", padding: "10px", marginTop: "15px", boxSizing: "border-box", fontSize: "14px" }} />

        <button onClick={handleResetPassword} style={{ width: "100%", padding: "10px", marginTop: "20px", background: "#3A2415", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "15px", fontWeight: "bold" }}>
          Reset Password
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px", lineHeight: "1.6" }}>
          Remembered? <Link to="/login" style={{ color: "#3A2415", textDecoration: "none", fontWeight: "bold" }}>Login</Link>
        </p>
      </div>

      <Footer />
    </>
  );
}

export default ForgotPassword;

