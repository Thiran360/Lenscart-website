import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";

function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = () => {
    const resetEmail = localStorage.getItem("resetEmail");
    const resetVerified = localStorage.getItem("resetVerified");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (resetVerified === "true" && resetEmail) {
      // password reset flow
      if (!newPass) {
        toast.warning("Please enter a new password");
        return;
      }

      if (savedUser && savedUser.email === resetEmail) {
        savedUser.password = newPass;
        localStorage.setItem("user", JSON.stringify(savedUser));
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetVerified");
        toast.success("Password reset successful. Please login.");
        navigate("/login");
        return;
      }

      toast.error("User not found for reset");
      return;
    }

    if (isLoggedIn && savedUser) {
      if (!current || !newPass) {
        toast.warning("Please fill current and new password");
        return;
      }

      if (savedUser.password !== current) {
        toast.error("Current password is incorrect");
        return;
      }

      savedUser.password = newPass;
      localStorage.setItem("user", JSON.stringify(savedUser));
      toast.success("Password changed successfully");
      navigate("/profile");
      return;
    }

    toast.warning("No valid password change flow detected");
  };

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "400px", width: "90%", margin: "40px auto", padding: "20px", background: "#fff", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,.2)", boxSizing: "border-box" }}>
        <h2>Change Password</h2>

        <input type="password" placeholder="Current Password" value={current} onChange={(e) => setCurrent(e.target.value)} style={{ width: "100%", padding: "10px", marginTop: "15px", boxSizing: "border-box", fontSize: "14px" }} />

        <input type="password" placeholder="New Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} style={{ width: "100%", padding: "10px", marginTop: "15px", boxSizing: "border-box", fontSize: "14px" }} />

        <button onClick={handleChange} style={{ width: "100%", padding: "10px", marginTop: "20px", background: "#0d6b6d", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          Update Password
        </button>

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          <Link to="/profile" style={{ color: "#0d6b6d", fontWeight: "bold" }}>Back to Profile</Link>
        </p>
      </div>

      <Footer />
    </>
  );
}

export default ChangePassword;
