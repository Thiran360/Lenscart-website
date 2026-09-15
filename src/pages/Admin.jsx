import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GlassManager from "../components/GlassManager";
import "./Admin.css";

function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userType = localStorage.getItem("user_type");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = isLoggedIn && (String(userType).toLowerCase() === "admin" || user?.user_type === "admin" || user?.is_staff || user?.is_superuser);

    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="admin-page">
      <Navbar />

      <div className="admin-container">
        <GlassManager />
      </div>

      <Footer />
    </div>
  );
}

export default Admin;
