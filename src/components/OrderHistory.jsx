import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBoxOpen, FaTruck, FaUndo, FaStar, FaMapMarkerAlt } from "react-icons/fa";

function OrderHistory({ initialAction }) {
  const [activeModal, setActiveModal] = useState(null); // 'track', 'return', 'review'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersList, setOrdersList] = useState([]);

  useEffect(() => {
    // Combine mock orders with any actual orders placed during session/checkout
    const storedOrders = JSON.parse(localStorage.getItem("placedOrders")) || [];
    
    const mockOrders = [
      {
        id: "OD11223344",
        date: "Oct 12, 2026",
        status: "Delivered",
        total: "₹3499",
        items: [{
          name: "Vincent Chase Online - Wayfarer",
          image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&q=80",
          price: 3499,
          color: "Black"
        }],
        eligibleForReturn: true,
        address: {
          name: "Rahul Sharma",
          phone: "9876543210",
          street: "123 Green Park, Main Road",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600001"
        }
      },
      {
        id: "OD55667788",
        date: "Oct 24, 2026",
        status: "In Transit",
        total: "₹4500",
        items: [{
          name: "Mr.LensMaker Air - Aviator Gold",
          image: "https://images.unsplash.com/photo-1577803645773-f96470509666?w=200&q=80",
          price: 4500,
          color: "Gold"
        }],
        eligibleForReturn: false,
        address: {
          name: "Rahul Sharma",
          phone: "9876543210",
          street: "45 Anna Salai, Guindy",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600032"
        }
      }
    ];

    const combined = [...storedOrders, ...mockOrders];
    setOrdersList(combined);
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

  return (
    <div>
      <h2 className="dash-header">My Orders</h2>

      {ordersList.length === 0 ? (
        <div style={{ background: '#fff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', border: '1px border-dashed #ccc' }}>
          <FaBoxOpen size={54} color="#0d6b6d" style={{ marginBottom: '15px' }} />
          <h3 style={{ margin: '0 0 10px 0', color: '#3A2415', fontSize: '20px' }}>No Orders Placed Yet</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
            When you place orders for eyeglasses or sunglasses, your order history and live tracking details will appear here.
          </p>
          <Link to="/products" style={{ textDecoration: 'none' }}>
            <button style={{ background: '#0d6b6d', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '25px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(13, 107, 109, 0.3)' }}>
              Explore Eyewear Collection
            </button>
          </Link>
        </div>
      ) : (
        ordersList.map((order, idx) => (
          <div key={`${order.id}-${idx}`} className="order-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e0d8c8', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '15px' }}>
              <div>
                <strong style={{ fontSize: '16px', color: '#3A2415' }}>Order #{order.id}</strong>
                <div style={{ fontSize: '13px', color: '#6E4B34', marginTop: '4px' }}>Placed on {order.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="order-status" style={{ color: order.status === 'Delivered' ? '#4CAF50' : '#0d6b6d', fontWeight: 'bold', fontSize: '14px' }}>
                  {order.status === 'Delivered' ? '✓ Delivered' : '🚚 In Transit'}
                </div>
                <div style={{ fontSize: '15px', marginTop: '4px', fontWeight: 'bold', color: '#3A2415' }}>Total: {order.total}</div>
              </div>
            </div>
            
            {/* Items */}
            {order.items && order.items.map((item, itemIdx) => (
              <div key={itemIdx} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                <img src={item.image} alt={item.name} style={{ width: '70px', height: '60px', objectFit: 'contain', background: '#fbf9f6', padding: '5px', borderRadius: '8px', border: '1px solid #eee' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14.5px', color: '#3A2415' }}>{item.name}</div>
                  <div style={{ fontSize: '12.5px', color: '#666', marginTop: '2px' }}>Frame Color: {item.color || 'Standard'}</div>
                </div>
                {item.price && <div style={{ fontWeight: '700', color: '#0d6b6d', fontSize: '15px' }}>₹{item.price}</div>}
              </div>
            ))}

            {/* Delivery Address Snapshot */}
            {order.address && (
              <div style={{ background: '#fcfbfa', padding: '10px 14px', borderRadius: '8px', border: '1px solid #f0e6d6', fontSize: '12.5px', color: '#555', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaMapMarkerAlt color="#0d6b6d" />
                <span>
                  <strong>Deliver to:</strong> {order.address.name} ({order.address.phone}) - {order.address.street}, {order.address.city} {order.address.pincode}
                </span>
              </div>
            )}

            <div className="order-actions" style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => openModal('track', order)} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #0d6b6d', color: '#0d6b6d', background: '#fff', fontWeight: '700', fontSize: '13px' }}>
                Track Order
              </button>
              {order.status === 'Delivered' && order.eligibleForReturn && (
                <button className="btn-secondary" onClick={() => openModal('return', order)} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', fontWeight: '600', fontSize: '13px' }}>
                  Return / Exchange
                </button>
              )}
              {order.status === 'Delivered' && (
                <button className="btn-primary" onClick={() => openModal('review', order)} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: '#0d6b6d', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px' }}>
                  Write a Review
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Track Modal */}
      {activeModal === 'track' && selectedOrder && (
        <div className="dash-modal-overlay" onClick={closeModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '30px', maxWidth: '600px', width: '90%', position: 'relative' }}>
            <button className="close-btn" onClick={closeModal} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: '#f0f0f0', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>×</button>
            <h2 style={{ marginBottom: '5px', color: '#3A2415' }}>Live Order Tracking</h2>
            <p style={{ color: '#0d6b6d', fontWeight: '700', marginBottom: '25px' }}>Order #{selectedOrder.id}</p>
            
            <div className="timeline-extended" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', position: 'relative' }}>
              <div className="timeline-step active" style={{ textAlign: 'center' }}>
                <div className="dot" style={{ background: '#0d6b6d', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', fontWeight: 'bold' }}>✓</div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>Order Placed</p>
                <span style={{ fontSize: '11px', color: '#888' }}>{selectedOrder.date}</span>
              </div>
              <div className="timeline-step active" style={{ textAlign: 'center' }}>
                <div className="dot" style={{ background: '#0d6b6d', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', fontWeight: 'bold' }}>✓</div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>Rx Verified</p>
                <span style={{ fontSize: '11px', color: '#888' }}>Lens Check</span>
              </div>
              <div className={`timeline-step ${selectedOrder.status === 'In Transit' || selectedOrder.status === 'Delivered' ? 'active' : ''}`} style={{ textAlign: 'center' }}>
                <div className="dot" style={{ background: '#0d6b6d', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', fontWeight: 'bold' }}>✓</div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>Manufacturing</p>
                <span style={{ fontSize: '11px', color: '#888' }}>Anti-Glare Coat</span>
              </div>
              <div className={`timeline-step ${selectedOrder.status === 'In Transit' || selectedOrder.status === 'Delivered' ? 'active' : ''}`} style={{ textAlign: 'center' }}>
                <div className="dot" style={{ background: '#0d6b6d', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', fontWeight: 'bold' }}>✓</div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>Dispatched</p>
                <span style={{ fontSize: '11px', color: '#888' }}>Out for Delivery</span>
              </div>
            </div>

            {/* Courier Section */}
            <div className="courier-section" style={{ background: '#fbf9f6', padding: '16px', borderRadius: '10px', border: '1px solid #e0d8c8' }}>
              <div className="courier-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#0d6b6d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                    LK
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#3A2415' }}>Express Courier Partner</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>AWB: LK-{selectedOrder.id.replace(/\D/g, '')}</p>
                  </div>
                </div>
                <button onClick={() => alert('Live tracking portal connection active')} style={{ background: '#0d6b6d', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                  Live Track Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return/Exchange Modal */}
      {activeModal === 'return' && selectedOrder && (
        <div className="dash-modal-overlay" onClick={closeModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '30px', maxWidth: '500px', width: '90%', position: 'relative' }}>
            <button className="close-btn" onClick={closeModal} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: '#f0f0f0', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>×</button>
            <h2 style={{ margin: '0 0 10px 0', color: '#3A2415' }}>Return / Exchange Request</h2>
            <p style={{ color: '#666' }}>Order #{selectedOrder.id}</p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Select reason for return / exchange:</label>
              <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '20px' }}>
                <option>Size doesn't fit properly</option>
                <option>Damaged or defective frame</option>
                <option>Lens power clarification required</option>
                <option>Want to exchange for another frame</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { alert('Return request initiated! Courier pickup scheduled in 24h.'); closeModal(); }} style={{ flex: 1, background: '#0d6b6d', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Request</button>
                <button onClick={closeModal} style={{ background: 'none', border: '1px solid #ccc', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {activeModal === 'review' && selectedOrder && (
        <div className="dash-modal-overlay" onClick={closeModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '30px', maxWidth: '500px', width: '90%', position: 'relative' }}>
            <button className="close-btn" onClick={closeModal} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: '#f0f0f0', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>×</button>
            <h2 style={{ margin: '0 0 10px 0', color: '#3A2415' }}>Write a Review</h2>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '30px', color: '#FFD700', cursor: 'pointer', marginBottom: '20px' }}>
                ★ ★ ★ ★ ★
              </div>
              <textarea placeholder="Share your feedback on frame comfort & lens clarity..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', height: '100px', marginBottom: '20px', fontSize: '14px' }}></textarea>
              <button onClick={() => { alert('Thank you! Your review has been published.'); closeModal(); }} style={{ width: '100%', background: '#0d6b6d', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Submit Review</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default OrderHistory;
