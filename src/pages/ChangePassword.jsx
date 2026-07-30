import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleChange = () => {
    const resetEmail = localStorage.getItem("resetEmail");
    const resetVerified = localStorage.getItem("resetVerified");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (resetVerified === "true" && resetEmail) {
      // password reset flow
      if (!newPass) {
        alert("Please enter a new password");
        return;
      }

      if (savedUser && savedUser.email === resetEmail) {
        savedUser.password = newPass;
        localStorage.setItem("user", JSON.stringify(savedUser));
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetVerified");
        alert("Password reset successful. Please login.");
        window.location.href = "/login";
        return;
      }

      alert("User not found for reset");
      return;
    }

    if (isLoggedIn && savedUser) {
      if (!current || !newPass) {
        alert("Please fill current and new password");
        return;
      }

      if (savedUser.password !== current) {
        alert("Current password is incorrect");
        return;
      }

      savedUser.password = newPass;
      localStorage.setItem("user", JSON.stringify(savedUser));
      alert("Password changed successfully");
      window.location.href = "/profile";
      return;
    }

    alert("No valid password change flow detected");
  };

  return (
    <>
      <Navbar />

      <div style={{ width: "90%", maxWidth: "400px", margin: "60px auto", padding: "30px", background: "#fff", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,.2)", boxSizing: "border-box" }}>
        <h2>Change Password</h2>

        <input type="password" placeholder="Current Password (if logged in)" value={current} onChange={(e) => setCurrent(e.target.value)} style={{ width: "100%", padding: "12px", marginTop: "20px", boxSizing: "border-box" }} />

        <input type="password" placeholder="New Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} style={{ width: "100%", padding: "12px", marginTop: "15px", boxSizing: "border-box" }} />

        <button onClick={handleChange} style={{ width: "100%", padding: "12px", marginTop: "20px", background: "#C9A66B", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px" }}>
          Save Password
        </button>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Back to <Link to="/profile" style={{ color: "#C9A66B", textDecoration: "none", fontWeight: "bold" }}>Profile</Link>
        </p>
      </div>

      <Footer />
    </>
  );
}

export default ChangePassword;
