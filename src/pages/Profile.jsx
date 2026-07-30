import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaUser, FaBoxOpen, FaGlasses, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Profile.css";
import PrescriptionManager from "../components/PrescriptionManager";
import OrderHistory from "../components/OrderHistory";

function Profile() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "profile";
  const initialAction = queryParams.get("action");

  const [activeTab, setActiveTab] = useState(initialTab);
  const [savedUser, setSavedUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [editName, setEditName] = useState(savedUser.name || "");
  const [editEmail, setEditEmail] = useState(savedUser.email || "");
  const navigate = useNavigate();

  useEffect(() => {
    // If the URL changes (e.g. from navbar click), update the tab
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const handleUpdateProfile = () => {
    const updatedUser = { ...savedUser, name: editName, email: editEmail };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setSavedUser(updatedUser);
    alert("Profile updated successfully!");
  };

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div style={{ padding: "10px 25px 25px 25px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "15px" }}>
            <FaUserCircle size={45} color="#3A2415" />
            <div>
              <h3 style={{ margin: 0, color: "#6E4B34", fontSize: "14px", fontWeight: "normal" }}>Welcome back,</h3>
              <h2 style={{ margin: "2px 0 0 0", color: "#3A2415", fontSize: "20px" }}>{savedUser.name || "Guest"}</h2>
            </div>
          </div>
          
          <div 
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser className="sidebar-icon" /> My Profile
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaBoxOpen className="sidebar-icon" /> My Orders
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('prescriptions')}
          >
            <FaGlasses className="sidebar-icon" /> My Prescriptions
          </div>
          
          <div style={{ borderTop: "1px solid #eaeaea", margin: "15px 0" }}></div>
          
          <div className="sidebar-item logout-item" onClick={handleLogout}>
            <FaSignOutAlt className="sidebar-icon" /> Logout
          </div>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content">
          {activeTab === 'profile' && (
            <div className="profile-details-section">
              <h2 className="dash-header">My Profile</h2>
              
              <div className="form-grid" style={{ maxWidth: '600px', marginTop: '30px' }}>
                <div style={{ marginBottom: 25 }}>
                  <label style={{ display: 'block', color: "#6E4B34", marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="prof-input editable-input"
                    placeholder="Enter your full name"
                  />
                </div>
                <div style={{ marginBottom: 25 }}>
                  <label style={{ display: 'block', color: "#6E4B34", marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={editEmail} 
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="prof-input editable-input"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '15px', marginTop: 10 }}>
                  <button className="btn-primary" onClick={handleUpdateProfile}>Update Profile</button>
                  <Link to="/change-password">
                    <button className="btn-secondary">Change Password</button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && <OrderHistory initialAction={initialAction} />}
          
          {activeTab === 'prescriptions' && <PrescriptionManager />}
        </main>
      </div>

      <div style={{ marginTop: "auto" }}>
        <Footer />
      </div>
    </div>
  );
}

export default Profile;


