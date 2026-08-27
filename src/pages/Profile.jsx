import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaUser, FaBoxOpen, FaGlasses, FaHome, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../services/authService";
import "./Profile.css";
import PrescriptionManager from "../components/PrescriptionManager";
import OrderHistory from "../components/OrderHistory";
import AddressManager from "../components/AddressManager";

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

  const changeTab = (tabName) => {
    setActiveTab(tabName);
    navigate(`/profile?tab=${tabName}`, { replace: true });
  };

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab") || "profile";
    setActiveTab(tab);
  }, [location.search]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const isProfileValid = Boolean(
    editName?.trim() && 
    editEmail?.trim() && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())
  );

  const handleUpdateProfile = () => {
    if (!isProfileValid) return;
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
              <h2 style={{ margin: "2px 0 0 0", color: "#3A2415", fontSize: "20px" }}>{savedUser.name || "User"}</h2>
            </div>
          </div>
          
          <div 
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => changeTab('profile')}
          >
            <FaUser className="sidebar-icon" /> My Profile
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => changeTab('orders')}
          >
            <FaBoxOpen className="sidebar-icon" /> Order History
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => changeTab('address')}
          >
            <FaHome className="sidebar-icon" /> Saved Addresses
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
            onClick={() => changeTab('prescriptions')}
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
                  <label style={{ display: 'block', color: "#6E4B34", marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>Full Name *</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                    className="prof-input editable-input"
                    placeholder="Enter your full name"
                  />
                </div>
                <div style={{ marginBottom: 25 }}>
                  <label style={{ display: 'block', color: "#6E4B34", marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>Email Address *</label>
                  <input 
                    type="email" 
                    value={editEmail} 
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="prof-input editable-input"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 10 }}>
                  <button 
                    className="btn-primary" 
                    onClick={handleUpdateProfile}
                    disabled={!isProfileValid}
                    style={{
                      background: isProfileValid ? '#C5A059' : '#D9C8A9',
                      color: '#ffffff',
                      cursor: isProfileValid ? 'pointer' : 'not-allowed',
                      opacity: isProfileValid ? 1 : 0.6,
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 'bold',
                      width: 'fit-content'
                    }}
                  >
                    Update Profile
                  </button>
                  {!isProfileValid && (
                    <span style={{ fontSize: 13, color: '#A07844', fontStyle: 'italic' }}>
                      * Valid name (letters only) and valid email are required.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && <OrderHistory initialAction={initialAction} />}

          {activeTab === 'address' && <AddressManager />}
          
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
