import { useState, useEffect } from "react";
import { getProfileApi, updateProfileApi } from "../services/profileService";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  FaUser, 
  FaBoxOpen, 
  FaGlasses, 
  FaHome, 
  FaSignOutAlt, 
  FaUserCircle, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaCheckCircle,
  FaChevronRight,
  FaSpinner,
  FaCalendarAlt
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../services/authService";
import "./Profile.css";
import PrescriptionManager from "../components/PrescriptionManager";
import OrderHistory from "../components/OrderHistory";
import AddressManager from "../components/AddressManager";
import ConfirmModal from "../components/ConfirmModal";

function Profile() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "profile";
  const initialAction = queryParams.get("action");

  const [activeTab, setActiveTab] = useState(initialTab);
  const [savedUser, setSavedUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [editName, setEditName] = useState(savedUser.name || "");
  const [editEmail, setEditEmail] = useState(savedUser.email || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const changeTab = (tabName) => {
    setActiveTab(tabName);
    navigate(`/profile?tab=${tabName}`, { replace: true });
  };

  // Fetch live user profile data from GET /profile/ API directly
  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await getProfileApi();
      const userData = response?.data || response?.user || response;
      if (userData && (userData.name || userData.email || userData.phone)) {
        const profileObj = {
          name: userData.name || userData.full_name || "",
          email: userData.email || "",
          phone: userData.phone || userData.mobile || "",
          user_type: userData.user_type || userData.role || "customer"
        };
        setSavedUser(profileObj);
        setEditName(profileObj.name || "");
        setEditEmail(profileObj.email || "");
        localStorage.setItem("user", JSON.stringify(profileObj));
      }
    } catch (error) {
      console.warn("[Profile API Warning] Could not fetch profile from server:", error.message);
      const local = JSON.parse(localStorage.getItem("user")) || {};
      if (local.name || local.email) {
        setSavedUser(local);
        setEditName(local.name || "");
        setEditEmail(local.email || "");
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab") || "profile";
    setActiveTab(tab);
  }, [location.search]);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      setShowLogoutConfirm(false);
      toast.info("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setShowLogoutConfirm(false);
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isProfileValid = Boolean(
    editName?.trim() && 
    editEmail?.trim() && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())
  );

  const handleUpdateProfile = async () => {
    if (!isProfileValid) return;
    
    try {
      setIsUpdating(true);
      await updateProfileApi({
        name: editName.trim(),
        email: editEmail.trim()
      });

      const updatedUser = { ...savedUser, name: editName.trim(), email: editEmail.trim() };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSavedUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const userInitial = (savedUser.name || "U").charAt(0).toUpperCase();

  return (
    <div className="profile-page-wrapper">
      <Navbar />

      <div className="dashboard-container">
        {/* Modern Luxury Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-user-badge">
            <div className="sidebar-avatar-wrapper">
              <div className="sidebar-avatar">{userInitial}</div>
              <div className="sidebar-online-indicator"></div>
            </div>
            <div className="sidebar-user-text">
              <span className="sidebar-welcome">Welcome back,</span>
              <h2 className="sidebar-username">{savedUser.name || "Valued Customer"}</h2>
              <span className="sidebar-member-tag">
                <FaCheckCircle size={11} /> LensMaker Member
              </span>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <div 
              className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => changeTab('profile')}
            >
              <div className="sidebar-icon-box">
                <FaUser />
              </div>
              <span>My Profile</span>
              {activeTab === 'profile' && <FaChevronRight className="sidebar-active-indicator" />}
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => changeTab('orders')}
            >
              <div className="sidebar-icon-box">
                <FaBoxOpen />
              </div>
              <span>Order History</span>
              {activeTab === 'orders' && <FaChevronRight className="sidebar-active-indicator" />}
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'address' ? 'active' : ''}`}
              onClick={() => changeTab('address')}
            >
              <div className="sidebar-icon-box">
                <FaHome />
              </div>
              <span>Saved Addresses</span>
              {activeTab === 'address' && <FaChevronRight className="sidebar-active-indicator" />}
            </div>

            <div 
              className={`sidebar-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
              onClick={() => changeTab('prescriptions')}
            >
              <div className="sidebar-icon-box">
                <FaGlasses />
              </div>
              <span>My Prescriptions</span>
              {activeTab === 'prescriptions' && <FaChevronRight className="sidebar-active-indicator" />}
            </div>
          </nav>
          
          <div className="sidebar-divider"></div>
          
          <div className="sidebar-item logout-item" onClick={() => setShowLogoutConfirm(true)}>
            <div className="sidebar-icon-box">
              <FaSignOutAlt />
            </div>
            <span>Sign Out</span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content">
          {activeTab === 'profile' && (
            <div>
              <div className="dash-header-wrap">
                <div>
                  <h1 className="dash-header">My Profile</h1>
                  <p className="dash-header-subtitle">Manage your personal information, contact details, and account security.</p>
                </div>
                {loadingProfile && (
                  <span style={{ fontSize: '13px', color: '#0D6B6D', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaSpinner className="fa-spin" style={{ animation: "spin 1s linear infinite" }} /> Syncing profile...
                  </span>
                )}
              </div>

              {loadingProfile ? (
                <div className="skeleton-wrapper">
                  <div className="skeleton-shimmer" style={{ width: '100%', height: '110px', borderRadius: '14px' }}></div>
                  <div className="skeleton-shimmer" style={{ width: '100%', height: '260px', borderRadius: '14px' }}></div>
                </div>
              ) : (
                <>
                  {/* Profile Overview Card */}
                  <div className="profile-overview-banner">
                    <div className="profile-banner-left">
                      <div className="profile-banner-avatar">{userInitial}</div>
                      <div className="profile-banner-info">
                        <h3>{savedUser.name || "Customer"}</h3>
                        <p>{savedUser.email || "No email provided"}</p>
                      </div>
                    </div>
                    <div className="profile-stats-chip">
                      <span>✨ Verified Member Account</span>
                    </div>
                  </div>

                  {/* Personal Information Form */}
                  <div className="profile-card-section">
                    <h3 className="section-subtitle">
                      <FaUser style={{ color: '#0D6B6D' }} /> Personal Details
                    </h3>
                    
                    <div className="form-grid-modern">
                      <div className="input-field-group">
                        <label>Full Name *</label>
                        <div className="input-with-icon">
                          <FaUser className="input-prefix-icon" />
                          <input 
                            type="text" 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                            className="modern-input"
                            placeholder="e.g. John Doe"
                          />
                        </div>
                      </div>

                      <div className="input-field-group">
                        <label>Email Address *</label>
                        <div className="input-with-icon">
                          <FaEnvelope className="input-prefix-icon" />
                          <input 
                            type="email" 
                            value={editEmail} 
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="modern-input"
                            placeholder="e.g. john@example.com"
                          />
                        </div>
                      </div>

                      <div className="input-field-group">
                        <label>Mobile Number (Registered)</label>
                        <div className="input-with-icon">
                          <FaPhoneAlt className="input-prefix-icon" />
                          <input 
                            type="text" 
                            value={savedUser.phone || "Not linked"} 
                            disabled
                            className="modern-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <button 
                        className="profile-submit-btn"
                        onClick={handleUpdateProfile}
                        disabled={!isProfileValid || isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <FaSpinner className="fa-spin" style={{ animation: "spin 1s linear infinite" }} /> Updating...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>

                      {!isProfileValid && (
                        <span style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>
                          * Full name and valid email address are required to save.
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'orders' && <OrderHistory initialAction={initialAction} />}

          {activeTab === 'address' && <AddressManager />}
          
          {activeTab === 'prescriptions' && <PrescriptionManager />}
        </main>
      </div>

      {/* Dynamic Confirmation Modal */}
      <ConfirmModal
        show={showLogoutConfirm}
        title="Sign Out of Your Account?"
        message="Are you sure you want to log out of Mr.LensMaker? You can sign back in anytime using your phone or credentials."
        confirmText="Yes, Sign Out"
        cancelText="Stay Signed In"
        variant="danger"
        loading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => !isLoggingOut && setShowLogoutConfirm(false)}
      />

      <div style={{ marginTop: "auto" }}>
        <Footer />
      </div>
    </div>
  );
}

export default Profile;
