import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaBoxOpen, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { getOrdersApi } from "../services/profileService";
import Pagination from "./Pagination";
import "./AdminOrders.css";

function AdminOrders() {
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("user_token") || localStorage.getItem("userToken") || localStorage.getItem("token") || "";
      const res = await fetch("https://capsule-most-rundown.ngrok-free.dev/api/orders/", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch from admin orders API");
      const response = await res.json();
      
      let apiOrders = [];
      if (Array.isArray(response)) apiOrders = response;
      else if (Array.isArray(response?.results)) apiOrders = response.results;
      else if (Array.isArray(response?.data?.results)) apiOrders = response.data.results;
      else if (Array.isArray(response?.data)) apiOrders = response.data;
      else if (Array.isArray(response?.orders)) apiOrders = response.orders;

      const storedOrders = JSON.parse(localStorage.getItem("placedOrders")) || [];
      
      let formatted = [];
      if (apiOrders.length > 0) {
        formatted = apiOrders.map((ord, idx) => {
          const id = ord.id || ord.order_id || ord.order_number || `OD${1000 + idx}`;
          const date = ord.created_at
            ? new Date(ord.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : ord.date || "Recent";
          const status = ord.status || "In Transit";
          const total = typeof ord.total === "number" || typeof ord.total_amount === "number"
            ? `₹${ord.total || ord.total_amount}`
            : ord.total || ord.total_amount || "₹0";

          const rawAddr = ord.shipping_address || ord.address || (ord.full_name ? ord : null);
          const address = rawAddr ? {
            name: rawAddr.full_name || rawAddr.name || "Customer",
            phone: rawAddr.phone || "",
            street: rawAddr.street_address || rawAddr.street || "",
            city: rawAddr.city || "",
            state: rawAddr.state || "",
            pincode: rawAddr.pincode || ""
          } : null;

          const items = Array.isArray(ord.items) && ord.items.length > 0
            ? ord.items.map(it => ({
                name: it.product_name || it.name || "Eyewear Frame",
                image: it.image || it.product_image || "/eyeglass1.png",
                price: it.price || it.unit_price || 0,
                color: it.color || it.frame_color || "Standard",
                quantity: it.quantity || 1
              }))
            : Array.isArray(ord.products) && ord.products.length > 0
            ? ord.products.map(p => ({
                name: p.name || p.title || "Eyewear Frame",
                image: p.image || "/eyeglass1.png",
                price: p.price || 0,
                color: p.color || "Standard",
                quantity: p.quantity || 1
              }))
            : [{
                name: ord.product_name || "Eyewear Frame",
                image: "/eyeglass1.png",
                price: ord.total_amount || ord.price || 0,
                color: "Standard",
                quantity: 1
              }];

          return { id, date, status, total, address, rawItems: items };
        });
      }

      // Merge backend and local fallback
      const existingIds = new Set(formatted.map(o => String(o.id)));
      const uniqueStored = storedOrders.filter(o => !existingIds.has(String(o.id)));
      
      setOrdersList([...uniqueStored, ...formatted]);
    } catch (err) {
      console.error("Failed to fetch orders for admin:", err);
      const storedOrders = JSON.parse(localStorage.getItem("placedOrders")) || [];
      setOrdersList(storedOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("user_token") || localStorage.getItem("userToken") || localStorage.getItem("token") || "";
      const res = await fetch(`https://capsule-most-rundown.ngrok-free.dev/api/orders/${orderId}/`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
         console.warn("Failed to update on server, falling back to local update");
      }
      
      // Update locally for immediate feedback
      setOrdersList(prev => prev.map(o => String(o.id) === String(orderId) ? { ...o, status: newStatus } : o));
      if (selectedOrder && String(selectedOrder.id) === String(orderId)) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      // If it's a mock local order, update it in localStorage too
      if (String(orderId).startsWith('LK')) {
        const localOrders = JSON.parse(localStorage.getItem("placedOrders") || "[]");
        const updatedLocal = localOrders.map(o => String(o.id) === String(orderId) ? { ...o, status: newStatus } : o);
        localStorage.setItem("placedOrders", JSON.stringify(updatedLocal));
      }

      alert(`Status updated to ${newStatus}`);

    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const totalPages = Math.ceil(ordersList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = ordersList.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="admin-orders-wrapper">
      <div className="admin-header">
        <h2>Order Management</h2>
        <p>Review and manage customer orders.</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading orders...</div>
      ) : ordersList.length === 0 ? (
        <div className="empty-orders-state">
          <FaBoxOpen size={40} />
          <h3>No Orders Found</h3>
          <p>You haven't received any orders yet.</p>
        </div>
      ) : (
        <div className="admin-orders-table-container">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order, index) => (
                <tr key={`${order.id}-${index}`}>
                  <td><strong>#{order.id}</strong></td>
                  <td><FaCalendarAlt size={12} color="#64748B"/> {order.date}</td>
                  <td>{order.address?.name || "Guest User"}</td>
                  <td className="amount">{order.total}</td>
                  <td>
                    <span className={`status-badge ${order.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.status || 'Processing'}
                    </span>
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => setSelectedOrder(order)}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            totalItems={ordersList.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {selectedOrder && createPortal(
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setSelectedOrder(null)}>
              <FaTimes />
            </button>
            <h3>Order Details: #{selectedOrder.id}</h3>
            
            <div className="admin-modal-section">
              <h4>Customer Information</h4>
              <div className="admin-modal-grid">
                <p><strong>Name</strong> {selectedOrder.address?.name || "Guest User"}</p>
                <p><strong>Phone</strong> {selectedOrder.address?.phone || "N/A"}</p>
                <p style={{ gridColumn: '1 / -1' }}><strong>Address</strong> {selectedOrder.address?.street}, {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}</p>
              </div>
            </div>

            <div className="admin-modal-section">
              <h4>Order Summary</h4>
              <div className="admin-modal-grid">
                <p><strong>Date Placed</strong> {selectedOrder.date}</p>
                <p>
                  <strong>Status</strong> 
                  <select 
                    value={selectedOrder.status || 'Processing'} 
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    style={{ marginLeft: '10px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Order Confirmed">Order Confirmed</option>
                    <option value="Product Ready for Shipment">Product Ready for Shipment</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </p>
                <p><strong>Total Amount</strong> {selectedOrder.total}</p>
              </div>
            </div>

            <div className="admin-modal-section">
              <h4>Items</h4>
              <ul className="admin-modal-items">
                {selectedOrder.rawItems?.length > 0 ? (
                  selectedOrder.rawItems.map((item, i) => (
                    <li key={i} className="admin-modal-item">
                      <div className="admin-modal-item-info">
                        <span className="admin-modal-item-name">{item.name || item.product_name || "Eyewear Frame"}</span>
                        <span className="admin-modal-item-meta">Qty: {item.quantity || 1} {item.color ? `• Color: ${item.color}` : ''}</span>
                      </div>
                      <div className="admin-modal-item-price">
                        {item.price || item.unit_price ? `₹${item.price || item.unit_price}` : ''}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="admin-modal-item">No item details available</li>
                )}
              </ul>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default AdminOrders;
