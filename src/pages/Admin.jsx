import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GlassManager from "../components/GlassManager";
import Analytics from "./Analytics";
import { FaBoxOpen, FaChartLine, FaChevronRight, FaUserShield } from "react-icons/fa";
import "../pages/Profile.css"; // Reuse sidebar styles from Profile
import "./Admin.css";

function Admin() {
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab") || "catalog";

  const changeTab = (tabName) => {
    navigate(`/admin?tab=${tabName}`, { replace: true });
  };

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
    <div className="profile-page-wrapper admin-page">
      <Navbar />

      <div className="dashboard-container">
        {/* Admin Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-user-badge">
            <div className="sidebar-avatar-wrapper">
              <div className="sidebar-avatar">
                <FaUserShield />
              </div>
            </div>
            <div className="sidebar-user-text">
              <h2 className="sidebar-username">Admin Panel</h2>
              <span className="sidebar-member-tag">Workspace</span>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <div 
              className={`sidebar-item ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => changeTab('catalog')}
            >
              <div className="sidebar-icon-box">
                <FaBoxOpen />
              </div>
              <span>Catalog Manager</span>
              {activeTab === 'catalog' && <FaChevronRight className="sidebar-active-indicator" />}
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => changeTab('analytics')}
            >
              <div className="sidebar-icon-box">
                <FaChartLine />
              </div>
              <span>Site Traffic</span>
              {activeTab === 'analytics' && <FaChevronRight className="sidebar-active-indicator" />}
            </div>
          </nav>
        </aside>

        {/* Admin Content Area */}
        <main className="dashboard-content">
          {activeTab === 'catalog' && <GlassManager />}
          {activeTab === 'analytics' && <Analytics />}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default Admin;
