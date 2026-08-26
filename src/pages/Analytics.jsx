import React from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import Navbar from "../components/Navbar";
import "./Analytics.css";

// Mock Data
const trafficData = [
  { name: "Mon", visitors: 4000, pageViews: 2400 },
  { name: "Tue", visitors: 3000, pageViews: 1398 },
  { name: "Wed", visitors: 2000, pageViews: 9800 },
  { name: "Thu", visitors: 2780, pageViews: 3908 },
  { name: "Fri", visitors: 1890, pageViews: 4800 },
  { name: "Sat", visitors: 2390, pageViews: 3800 },
  { name: "Sun", visitors: 3490, pageViews: 4300 },
];

const salesData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 2000 },
  { name: "Apr", revenue: 2780 },
  { name: "May", revenue: 1890 },
  { name: "Jun", revenue: 2390 },
];

function Analytics() {
  return (
    <div className="analytics-page">
      <Navbar />
      
      <div className="analytics-container">
        <div className="analytics-header">
          <h1>Website Analytics & Performance</h1>
          <p>Real-time insights for your Mr.LensMaker store.</p>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <h3>Total Visitors</h3>
            <h2>24,592</h2>
            <span className="trend positive">↑ 12% vs last week</span>
          </div>
          <div className="kpi-card">
            <h3>Conversion Rate</h3>
            <h2>3.8%</h2>
            <span className="trend positive">↑ 0.4% vs last week</span>
          </div>
          <div className="kpi-card">
            <h3>Total Revenue</h3>
            <h2>₹1,42,390</h2>
            <span className="trend negative">↓ 2% vs last week</span>
          </div>
          <div className="kpi-card">
            <h3>Active Users (Live)</h3>
            <h2 className="live-users">142 <span>●</span></h2>
            <span className="trend neutral">Right now</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Traffic Area Chart */}
          <div className="chart-card">
            <h3>Weekly Traffic (Visitors vs PageViews)</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A66B" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#C9A66B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" stroke="#6E4B34" />
                  <YAxis stroke="#6E4B34" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', color: '#333' }} />
                  <Legend />
                  <Area type="monotone" dataKey="visitors" stroke="#C9A66B" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                  <Area type="monotone" dataKey="pageViews" stroke="#82ca9d" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales Bar Chart */}
          <div className="chart-card">
            <h3>Monthly Revenue (₹)</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" stroke="#6E4B34" />
                  <YAxis stroke="#6E4B34" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', color: '#333' }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3A2415" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;


