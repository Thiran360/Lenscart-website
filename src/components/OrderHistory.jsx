import { useState, useEffect } from "react";

function OrderHistory({ initialAction }) {
  const [activeModal, setActiveModal] = useState(null); // 'track', 'return', 'review'
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock Orders
  const orders = [
    {
      id: "OD11223344",
      date: "Oct 12, 2026",
      status: "Delivered",
      total: "₹3499",
      item: "Vincent Chase Online - Wayfarer",
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&q=80",
      eligibleForReturn: true
    },
    {
      id: "OD55667788",
      date: "Oct 24, 2026",
      status: "In Transit",
      total: "₹4500",
      item: "Lenskart Air - Aviator",
      image: "https://images.unsplash.com/photo-1577803645773-f96470509666?w=100&q=80",
      eligibleForReturn: false
    }
  ];

  const openModal = (type, order) => {
    setSelectedOrder(order);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedOrder(null);
  };

  useEffect(() => {
    if (initialAction === 'track' && orders.length > 0) {
      // Just mock opening the first order for tracking
      openModal('track', orders[0]);
    }
  }, [initialAction]);

  return (
    <div>
      <h2 className="dash-header">My Orders</h2>

      {orders.map(order => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <div>
              <strong>Order #{order.id}</strong>
              <div style={{ fontSize: 13, color: '#6E4B34', marginTop: 4 }}>Placed on {order.date}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="order-status" style={{ color: order.status === 'Delivered' ? '#4CAF50' : '#FF9800' }}>
                {order.status}
              </div>
              <div style={{ fontSize: 14, marginTop: 4, fontWeight: 'bold' }}>Total: {order.total}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <img src={order.image} alt="product" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
            <div style={{ flex: 1 }}>{order.item}</div>
          </div>

          <div className="order-actions">
            <button className="btn-secondary" onClick={() => openModal('track', order)}>Track Order</button>
            {order.status === 'Delivered' && order.eligibleForReturn && (
              <button className="btn-secondary" onClick={() => openModal('return', order)}>Return / Exchange</button>
            )}
            {order.status === 'Delivered' && (
              <button className="btn-primary" onClick={() => openModal('review', order)}>Write a Review</button>
            )}
          </div>
        </div>
      ))}

      {/* Track Modal */}
      {activeModal === 'track' && (
        <div className="dash-modal-overlay" onClick={closeModal}>
          <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <button className="close-btn" onClick={closeModal}>×</button>
            <h2 style={{ marginBottom: 5 }}>Track Order</h2>
            <p style={{ color: '#6E4B34', marginBottom: 25 }}>Order #{selectedOrder.id}</p>
            
            <div className="timeline-extended">
              <div className="timeline-step active">
                <div className="dot">✓</div>
                <p>Order Placed</p>
                <span>{selectedOrder.date}</span>
              </div>
              <div className="timeline-step active">
                <div className="dot">✓</div>
                <p>Rx Verified</p>
                <span>Verified</span>
              </div>
              <div className={`timeline-step ${selectedOrder.status === 'In Transit' || selectedOrder.status === 'Delivered' ? 'active' : ''}`}>
                <div className="dot">{selectedOrder.status === 'In Transit' || selectedOrder.status === 'Delivered' ? '✓' : ''}</div>
                <p>Manufacturing</p>
                <span>Quality Check</span>
              </div>
              <div className={`timeline-step ${selectedOrder.status === 'In Transit' || selectedOrder.status === 'Delivered' ? 'active' : ''}`}>
                <div className="dot">{selectedOrder.status === 'In Transit' || selectedOrder.status === 'Delivered' ? '✓' : ''}</div>
                <p>Shipped</p>
                <span>Dispatched</span>
              </div>
              <div className={`timeline-step ${selectedOrder.status === 'Delivered' ? 'active' : ''}`}>
                <div className="dot">{selectedOrder.status === 'Delivered' ? '✓' : ''}</div>
                <p>Delivered</p>
                <span>{selectedOrder.status === 'Delivered' ? 'Arrived' : 'Pending'}</span>
              </div>
            </div>

            {/* Courier Section */}
            {(selectedOrder.status === 'In Transit' || selectedOrder.status === 'Delivered') && (
              <div className="courier-section">
                <div className="courier-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#3A2415' }}>
                      DL
                    </div>
                    <div>
                      <h4 style={{ margin: 0 }}>Delhivery Courier</h4>
                      <p style={{ margin: 0, color: '#6E4B34', fontSize: 13 }}>Tracking ID: DEL-{selectedOrder.id.replace('OD', '')}</p>
                    </div>
                  </div>
                  <button className="btn-secondary" onClick={() => alert('Redirecting to Delhivery Tracking Portal...')} style={{ background: '#fff', color: '#C9A66B', border: '1px solid #C9A66B' }}>
                    Live Track Package
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Return/Exchange Modal */}
      {activeModal === 'return' && (
        <div className="dash-modal-overlay" onClick={closeModal}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>×</button>
            <h2>Return / Exchange</h2>
            <p>Order #{selectedOrder.id}</p>
            <div style={{ marginTop: 20 }}>
              <label>Reason for return:</label>
              <select style={{ width: '100%', padding: 10, marginTop: 5, marginBottom: 20, borderRadius: 5 }}>
                <option>Size doesn't fit</option>
                <option>Damaged product</option>
                <option>Changed my mind</option>
              </select>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-primary" onClick={() => { alert('Return request submitted!'); closeModal(); }}>Submit Request</button>
                <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {activeModal === 'review' && (
        <div className="dash-modal-overlay" onClick={closeModal}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>×</button>
            <h2>Write a Review</h2>
            <p>{selectedOrder.item}</p>
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 30, color: '#FFD700', cursor: 'pointer', marginBottom: 20 }}>
                ★ ★ ★ ★ ☆
              </div>
              <textarea placeholder="Tell us what you liked..." style={{ width: '100%', padding: 10, borderRadius: 5, height: 80, marginBottom: 20 }}></textarea>
              <button className="btn-primary" onClick={() => { alert('Review submitted!'); closeModal(); }} style={{ width: '100%' }}>Submit Review</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default OrderHistory;


