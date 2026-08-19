import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GlassManager from "../components/GlassManager";
import "./Admin.css";

function Admin() {
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
