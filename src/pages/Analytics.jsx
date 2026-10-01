import React, { useState, useEffect } from "react";
import { FaUsers, FaUserTag, FaFileAlt, FaGlobe } from "react-icons/fa";
import "./Analytics.css";

function Analytics() {
  const [trafficData, setTrafficData] = useState({
    totalVisitors: "--",
    uniqueVisitors: "--",
    pageViews: "--",
    activeVisitors: "--"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Generate dates for the last 30 days to satisfy backend requirements
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const endStr = endDate.toISOString().split('T')[0];
    const startStr = startDate.toISOString().split('T')[0];

    import("../services/api").then(({ apiRequest }) => {
      apiRequest(`/analytics/traffic?start_date=${startStr}&end_date=${endStr}`, "GET")
        .then(data => {
          const payload = data.data || data;
          setTrafficData({
            totalVisitors: payload.total_visitors || payload.totalVisitors || "0",
            uniqueVisitors: payload.unique_visitors || payload.uniqueVisitors || "0",
            pageViews: payload.page_views || payload.pageViews || "0",
            activeVisitors: payload.active_visitors || payload.activeVisitors || "0"
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching analytics:", err);
          setError("Analytics not configured yet. Connect a data source to see live traffic.");
          setLoading(false);
        });
    });
  }, []);

  return (
    <div className="analytics-container" style={{ padding: 0 }}>
      <div className="dash-header-wrap">
        <div>
          <h1 className="dash-header">Site Traffic</h1>
          <p className="dash-header-subtitle">Monitor your website traffic and visitor activity.</p>
        </div>
      </div>

      {error && (
        <div className="analytics-not-configured" style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(224, 216, 200, 0.6)',
          marginBottom: '24px',
          textAlign: 'center',
          color: '#6E4B34'
        }}>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ opacity: loading ? 0.7 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaUsers style={{ color: '#0d6b6d' }} />
            <h3 style={{ margin: 0 }}>Total Visitors</h3>
          </div>
          <h2>{loading ? "..." : trafficData.totalVisitors}</h2>
        </div>
        
        <div className="kpi-card" style={{ opacity: loading ? 0.7 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaUserTag style={{ color: '#0d6b6d' }} />
            <h3 style={{ margin: 0 }}>Unique Visitors</h3>
          </div>
          <h2>{loading ? "..." : trafficData.uniqueVisitors}</h2>
        </div>
        
        <div className="kpi-card" style={{ opacity: loading ? 0.7 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaFileAlt style={{ color: '#0d6b6d' }} />
            <h3 style={{ margin: 0 }}>Total Page Views</h3>
          </div>
          <h2>{loading ? "..." : trafficData.pageViews}</h2>
        </div>
        
        <div className="kpi-card" style={{ opacity: loading ? 0.7 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaGlobe style={{ color: '#0d6b6d' }} />
            <h3 style={{ margin: 0 }}>Active Visitors</h3>
          </div>
          <h2 className="live-users" style={{ color: error ? '#aaa' : '#0d6b6d' }}>
            {loading ? "..." : trafficData.activeVisitors} <span style={{ color: error ? '#aaa' : '#2e7d32' }}>●</span>
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Analytics;


