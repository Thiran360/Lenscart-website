import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showCoupon, setShowCoupon] = useState(false);

  const handleRegister = () => {
    if (name === "" || email === "" || password === "") {
      alert("Please fill all fields");
      return;
    }

    const user = { name, email, password, isVerified: true };

    localStorage.setItem("user", JSON.stringify(user));
    
    // Show coupon instead of immediately redirecting
    setShowCoupon(true);
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "400px",
          width: "90%",
          margin: "40px auto",
          padding: "20px",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,.2)",
          boxSizing: "border-box"
        }}
      >
        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "15px",
            boxSizing: "border-box",
            fontSize: "14px"
          }}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "15px",
            boxSizing: "border-box",
            fontSize: "14px"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "15px",
            boxSizing: "border-box",
            fontSize: "14px"
          }}
        />

        <button
          onClick={handleRegister}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "20px",
            background: "#3A2415",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "bold",
          }}
        >
          Sign Up
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "14px",
            lineHeight: "1.6"
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#3A2415",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Login
          </Link>
        </p>
      </div>

      {showCoupon && (
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
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            animation: "slideInText 0.5s ease-out"
          }}>
            <h2 style={{ color: "#0d6b6d", marginBottom: "10px", fontSize: "28px" }}>🎉 Welcome! 🎉</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "16px", lineHeight: "1.5" }}>
              Thank you for registering! Here is your exclusive first-time user coupon:
            </p>
            <div style={{
              background: "#ffea00",
              border: "2px dashed #333",
              padding: "15px 20px",
              fontSize: "24px",
              fontWeight: "900",
              letterSpacing: "2px",
              color: "#333",
              display: "inline-block",
              marginBottom: "20px",
              borderRadius: "8px"
            }}>
              WELCOME50
            </div>
            <p style={{ color: "#0d6b6d", fontWeight: "bold", marginBottom: "30px" }}>
              Get 50% OFF your first order!
            </p>
            <button
              onClick={() => window.location.href = "/login"}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0d6b6d",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "background 0.3s"
              }}
              onMouseOver={(e) => e.target.style.background = "#094d4f"}
              onMouseOut={(e) => e.target.style.background = "#0d6b6d"}
            >
              Claim & Login
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Register;

