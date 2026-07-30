import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (name === "" || email === "" || password === "") {
      alert("Please fill all fields");
      return;
    }

    const user = { name, email, password, isVerified: true };

    localStorage.setItem("user", JSON.stringify(user));
    
    alert("Account created successfully! You can now login.");
    
    // redirect to login
    window.location.href = "/login";
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

      <Footer />
    </>
  );
}

export default Register;

