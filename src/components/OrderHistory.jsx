import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { 
  FaBoxOpen, 
  FaTruck, 
  FaUndo, 
  FaStar, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaClock, 
  FaTimes,
  FaArrowRight
} from "react-icons/fa";
import { getOrdersApi } from "../services/profileService";
import { useToast } from "../context/ToastContext";
import Pagination from "./Pagination";

function OrderHistory({ initialAction }) {
  const [activeModal, setActiveModal] = useState(null); // 'track', 'return', 'review'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Pagination state (5 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getOrdersApi(page, 5);
      let apiOrders = [];
      if (Array.isArray(response)) {
        apiOrders = response;
      } else if (Array.isArray(response?.results)) {
        apiOrders = response.results;
      } else if (Array.isArray(response?.data?.results)) {
        apiOrders = response.data.results;
      } else if (Array.isArray(response?.data)) {
        apiOrders = response.data;
      } else if (Array.isArray(response?.orders)) {
        apiOrders = response.orders;
      }

      // Check for local stored orders from checkout session
      const storedOrders = JSON.parse(localStorage.getItem("placedOrders")) || [];

      if (apiOrders.length > 0) {
        // Map and format API orders
        const formatted = apiOrders.map((ord, idx) => {
          const id = ord.id || ord.order_id || ord.order_number || `OD${1000 + idx}`;
          const date = ord.created_at
            ? new Date(ord.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : ord.date || "Recent";
          const status = ord.status || "In Transit";
          const total = typeof ord.total === "number" || typeof ord.total_amount === "number"
            ? `₹${ord.total || ord.total_amount}`
            : ord.total || ord.total_amount || "₹0";

          const items = Array.isArray(ord.items) && ord.items.length > 0
            ? ord.items.map(it => ({
                name: it.product_name || it.name || "Eyewear Frame",
                image: it.image || it.product_image || "/eyeglass1.png",
                price: it.price || it.unit_price || 0,
                color: it.color || it.frame_color || "Standard"
              }))
            : Array.isArray(ord.products) && ord.products.length > 0
            ? ord.products.map(p => ({
                name: p.name || p.title || "Eyewear Frame",
                image: p.image || "/eyeglass1.png",
                price: p.price || 0,
                color: p.color || "Standard"
              }))
            : [{
                name: ord.product_name || "Eyewear Frame",
                image: "/eyeglass1.png",
                price: ord.total_amount || ord.price || 0,
                color: "Standard"
              }];

          const address = ord.shipping_address || ord.address || (ord.full_name ? {
            name: ord.full_name,
            phone: ord.phone,
            street: ord.street_address || ord.street,
            city: ord.city,
            state: ord.state,
            pincode: ord.pincode
          } : null);

          return {
            id,
            date,
            status,
            total,
            items,
            eligibleForReturn: status === "Delivered",
            address
          };
        });

        // Combine API orders with locally stored recent checkout orders if not duplicated
        const existingIds = new Set(formatted.map(o => String(o.id)));
        const uniqueStored = storedOrders.filter(o => !existingIds.has(String(o.id)));
        setOrdersList([...uniqueStored, ...formatted]);
      } else if (storedOrders.length > 0) {
        setOrdersList(storedOrders);
      } else {
        setOrdersList([]);
      }
    } catch (err) {
      console.warn("Failed to fetch orders from API, checking local orders:", err.message);
      const storedOrders = JSON.parse(localStorage.getItem("placedOrders")) || [];
      setOrdersList(storedOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openModal = (type, order) => {
    setSelectedOrder(order);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedOrder(null);
  };

  useEffect(() => {
    if (initialAction === 'track' && ordersList.length > 0) {
      openModal('track', ordersList[0]);
    }
  }, [initialAction, ordersList]);

  // Pagination calculation
  const totalPages = Math.ceil(ordersList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = ordersList.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [ordersList.length, totalPages, currentPage]);

  return (
    <div className="order-history-wrapper">
      <div className="dash-header-wrap">
        <div>
          <h1 className="dash-header">Order History</h1>
          <p className="dash-header-subtitle">View and track all your past and active eyewear orders.</p>
        </div>
        {!loading && ordersList.length > 0 && (
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0D6B6D', background: 'rgba(13, 107, 109, 0.08)', padding: '6px 14px', borderRadius: '20px' }}>
            {ordersList.length} {ordersList.length === 1 ? 'Order' : 'Orders'} Placed
          </span>
        )}
      </div>

      {/* Shimmer Skeleton during Loading to eliminate layout shift / width flickering */}
      {loading ? (
        <div className="skeleton-wrapper">
          <div className="skeleton-order-card skeleton-shimmer">
            <div className="skeleton-line lg skeleton-shimmer" style={{ width: '40%' }}></div>
            <div className="skeleton-line sm skeleton-shimmer" style={{ width: '25%' }}></div>
            <div className="skeleton-line md skeleton-shimmer" style={{ width: '70%', height: '50px' }}></div>
          </div>
          <div className="skeleton-order-card skeleton-shimmer">
            <div className="skeleton-line lg skeleton-shimmer" style={{ width: '45%' }}></div>
            <div className="skeleton-line sm skeleton-shimmer" style={{ width: '30%' }}></div>
            <div className="skeleton-line md skeleton-shimmer" style={{ width: '65%', height: '50px' }}></div>
          </div>
        </div>
      ) : ordersList.length === 0 ? (
        <div className="empty-history-box">
          <FaBoxOpen className="empty-history-icon" />
          <h3>No Orders Placed Yet</h3>
          <p>
            When you purchase prescription eyeglasses, sunglasses, or contact lenses, all tracking and order records will be displayed here.
          </p>
          <Link to="/products?type=eyeglasses" style={{ textDecoration: 'none' }}>
            <button className="btn-track-order" style={{ padding: '12px 28px', fontSize: '14.5px' }}>
              Explore Collection <FaArrowRight style={{ marginLeft: '6px' }} />
            </button>
          </Link>
        </div>
      ) : (
        <>
          {currentOrders.map((order, idx) => (
            <div key={`${order.id}-${idx}`} className="order-luxury-card">
              {/* Order Card Top Bar */}
              <div className="order-card-header">
                <div className="order-id-badge">
                  <span className="order-id-number">Order #{order.id}</span>
                  <span className="order-date-text">
                    <FaCalendarAlt size={12} /> {order.date}
                  </span>
                </div>

                <div className={`order-status-pill ${String(order.status).toLowerCase().replace(/\s+/g, '-')}`}>
                  <span className="order-status-dot"></span>
                  {order.status === 'Delivered' ? 'Delivered' : order.status || 'In Transit'}
                </div>
              </div>
              
              {/* Items List */}
              <div className="order-items-container">
                {order.items && order.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="order-item-row">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="order-item-thumb"
                      onError={(e) => { e.target.src = "/eyeglass1.png"; }}
                    />
                    <div className="order-item-details">
                      <div className="order-item-name">{item.name}</div>
                      <div className="order-item-meta">
                        <span>Frame Color: <strong style={{ color: '#0F172A' }}>{item.color || 'Standard'}</strong></span>
                        <span>• 1 Year LensMaker Warranty</span>
                      </div>
                    </div>
                    {item.price ? (
                      <div className="order-item-price">₹{item.price}</div>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Delivery Address Banner */}
              {order.address && (
                <div className="order-address-bar">
                  <FaMapMarkerAlt color="#0D6B6D" size={14} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Delivery Address:</strong> {order.address.name} {order.address.phone ? `(${order.address.phone})` : ""} - {order.address.street || ""}, {order.address.city || ""} {order.address.pincode || ""}
                  </span>
                </div>
              )}

              {/* Order Card Footer */}
              <div className="order-card-footer">
                <div className="order-total-block">
                  <span className="order-total-label">Grand Total:</span>
                  <span className="order-total-amount">{order.total}</span>
                </div>

                <div className="order-action-buttons">
                  <button className="btn-track-order" onClick={() => openModal('track', order)}>
                    <FaTruck /> Track Package
                  </button>

                  {order.status === 'Delivered' && order.eligibleForReturn && (
                    <button className="btn-outline-action" onClick={() => openModal('return', order)}>
                      <FaUndo /> Return / Exchange
                    </button>
                  )}

                  {order.status === 'Delivered' && (
                    <button className="btn-outline-action" onClick={() => openModal('review', order)} style={{ color: '#C5A059', borderColor: '#C5A059' }}>
                      <FaStar /> Write Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Reusable Pagination */}
          <Pagination
            totalItems={ordersList.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}

      {/* Live Order Tracking Modal */}
      {activeModal === 'track' && selectedOrder && createPortal(
        <div className="dash-modal-overlay" onClick={closeModal} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px', maxWidth: '580px', width: '100%', position: 'relative', border: '1px solid #E2E8F0', boxShadow: '0 25px 60px rgba(15, 23, 42, 0.2)', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="close-btn" onClick={closeModal} style={{ position: 'absolute', top: '18px', right: '18px', border: 'none', background: '#F1F5F9', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <FaTimes />
            </button>
            
            <h2 style={{ margin: '0 0 4px 0', color: '#0F172A', fontSize: '22px', fontWeight: '800' }}>Live Order Tracking</h2>
            <p style={{ color: '#0D6B6D', fontWeight: '700', margin: '0 0 28px 0', fontSize: '14px' }}>Order #{selectedOrder.id}</p>
            
            {/* Extended Timeline */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0D6B6D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>✓</div>
                <strong style={{ fontSize: '12px', color: '#0F172A' }}>Confirmed</strong>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>{selectedOrder.date}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0D6B6D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>✓</div>
                <strong style={{ fontSize: '12px', color: '#0F172A' }}>Lab Crafted</strong>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Lens Check</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: selectedOrder.status === 'In Transit' || selectedOrder.status === 'Delivered' ? '#0D6B6D' : '#E2E8F0', color: selectedOrder.status === 'In Transit' || selectedOrder.status === 'Delivered' ? '#fff' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>🚚</div>
                <strong style={{ fontSize: '12px', color: '#0F172A' }}>In Transit</strong>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>On the way</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: selectedOrder.status === 'Delivered' ? '#10B981' : '#E2E8F0', color: selectedOrder.status === 'Delivered' ? '#fff' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>📦</div>
                <strong style={{ fontSize: '12px', color: '#0F172A' }}>Delivered</strong>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>{selectedOrder.status === 'Delivered' ? 'Completed' : 'Expected soon'}</span>
              </div>
            </div>

            {/* Courier Section */}
            <div style={{ background: '#F8FAFC', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #0D6B6D, #14B8A6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '15px' }}>
                  LM
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14.5px', color: '#0F172A', fontWeight: '700' }}>LensMaker Express Logistics</h4>
                  <p style={{ margin: '2px 0 0 0', color: '#64748B', fontSize: '12.5px' }}>AWB: LM-{String(selectedOrder.id).replace(/\D/g, '') || '784920'}</p>
                </div>
              </div>
              <button 
                onClick={() => toast.info('Package is in active transit with our premium courier partner.')}
                className="btn-track-order"
              >
                Track Live GPS
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Return/Exchange Modal */}
      {activeModal === 'return' && selectedOrder && createPortal(
        <div className="dash-modal-overlay" onClick={closeModal} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '20px', padding: '30px', maxWidth: '480px', width: '100%', position: 'relative', border: '1px solid #E2E8F0', boxShadow: '0 25px 60px rgba(15, 23, 42, 0.2)', margin: 'auto' }}>
            <button className="close-btn" onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: '#F1F5F9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <FaTimes />
            </button>
            
            <h2 style={{ margin: '0 0 6px 0', color: '#0F172A', fontSize: '20px', fontWeight: '800' }}>Return / Exchange Request</h2>
            <p style={{ color: '#64748B', margin: '0 0 20px 0', fontSize: '13.5px' }}>Order #{selectedOrder.id}</p>
            
            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#334155', fontSize: '13px' }}>Reason for Return or Replacement:</label>
              <select style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', marginBottom: '20px', fontSize: '14px', background: '#F8FAFC', color: '#0F172A' }}>
                <option>Size or frame width doesn't fit comfortably</option>
                <option>Damaged or scratch on lens</option>
                <option>Prescription power mismatch</option>
                <option>Exchange for another color or frame style</option>
              </select>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => { toast.success('Return request initiated! Free doorstep pickup scheduled.'); closeModal(); }} 
                  className="profile-submit-btn"
                  style={{ flex: 1, marginTop: 0, justifyContent: 'center' }}
                >
                  Submit Request
                </button>
                <button 
                  onClick={closeModal} 
                  className="btn-outline-action"
                  style={{ padding: '12px 20px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Review Modal */}
      {activeModal === 'review' && selectedOrder && createPortal(
        <div className="dash-modal-overlay" onClick={closeModal} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '20px', padding: '30px', maxWidth: '480px', width: '100%', position: 'relative', border: '1px solid #E2E8F0', boxShadow: '0 25px 60px rgba(15, 23, 42, 0.2)', margin: 'auto' }}>
            <button className="close-btn" onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: '#F1F5F9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <FaTimes />
            </button>
            
            <h2 style={{ margin: '0 0 6px 0', color: '#0F172A', fontSize: '20px', fontWeight: '800' }}>Write a Product Review</h2>
            <p style={{ color: '#64748B', margin: '0 0 16px 0', fontSize: '13.5px' }}>Rate your eyewear from Order #{selectedOrder.id}</p>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', color: '#F59E0B', cursor: 'pointer', marginBottom: '16px', letterSpacing: '4px' }}>
                ★ ★ ★ ★ ★
              </div>
              <textarea 
                placeholder="How was the frame fit, lens clarity, and overall comfort?" 
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', height: '100px', marginBottom: '18px', fontSize: '14px', background: '#F8FAFC', boxSizing: 'border-box', fontFamily: 'inherit' }}
              ></textarea>
              <button 
                onClick={() => { toast.success('Thank you! Your verified review has been submitted.'); closeModal(); }} 
                className="profile-submit-btn"
                style={{ width: '100%', marginTop: 0, justifyContent: 'center' }}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default OrderHistory;
