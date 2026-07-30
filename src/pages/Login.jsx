import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
      alert("No account found. Please register first.");
      return;
    }

    if (savedUser.email !== email) {
      alert("No account found with that email");
      return;
    }

    if (!savedUser.isVerified) {
      alert("Please verify your account first (check OTP)");
      return;
    }

    if (savedUser.password === password) {
      alert("Login Successful");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", savedUser.email);
      window.location.href = "/";
    } else {
      alert("Invalid Email or Password");
    }
  };

  return (
    <>
      <Navbar />

      <div className="login-container">
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        <button onClick={handleLogin} className="login-btn">
          Login
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "14px",
            lineHeight: "1.6"
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#3A2415",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Sign up
          </Link>
          <br />
          <Link to="/forgot-password" style={{ color: "#3A2415", textDecoration: "none", fontWeight: "bold" }}>Forgot Password?</Link>
        </p>
      </div>

      <Footer />
    </>
  );
}

export default Login;
