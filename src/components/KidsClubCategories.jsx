import React from 'react';
import { useNavigate } from 'react-router-dom';

const KidsClubCategories = () => {
  const navigate = useNavigate();
  const data = [
    {
      title: "KIDS Eyeglasses",
      badge: "★ 100% Kid-Proof & Durable",
      headerBg: "linear-gradient(to right, #f0fbfc, #e0f8fa)",
      image: "/kids-eyeglass.jpeg",
      items: [
        { name: "Juniors | 5 to 8 years", price: "Starts at ₹800", icon: "👓", type: "eyeglasses" },
        { name: "Tweens | 8 to 12 years", price: "Starts at ₹500", icon: "👓", type: "eyeglasses" },
        { name: "Teens | 12 to 17 years", price: "Starts at ₹1500", icon: "👓", type: "eyeglasses" },
      ]
    },
    {
      title: "KIDS Sunglasses",
      badge: "★ 100% UV Protection & Polarized",
      headerBg: "linear-gradient(to right, #f0ffff, #e0ffff)",
      image: "/kids-category.jpeg",
      items: [
        { name: "Juniors | 5 to 8 years", price: "Starts at ₹600", icon: "🕶️", type: "sunglasses" },
        { name: "Tweens | 8 to 12 years", price: "Starts at ₹600", icon: "🕶️", type: "sunglasses" },
        { name: "Teens | 12 to 17 years", price: "Starts at ₹1000", icon: "🕶️", type: "sunglasses" },
      ]
    }
  ];

  const handleItemClick = (type, e) => {
    // Force close the hover menu
    const megaMenu = e.currentTarget.closest('.category-mega-menu');
    if (megaMenu) {
      megaMenu.style.display = 'none';
      setTimeout(() => {
        megaMenu.style.display = '';
      }, 100);
    }
    
    navigate(`/products?type=${type}&search=kids`);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '10px', justifyContent: 'center' }}>
      {data.map((col, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Header Card */}
          <div style={{ 
            background: col.headerBg, 
            borderRadius: '10px', 
            padding: '12px 15px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#3A2415', fontSize: '16px', fontWeight: '600' }}>{col.title}</h3>
              <span style={{ color: '#0066cc', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {col.badge}
              </span>
            </div>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              <img src={col.image} alt={col.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          {/* List Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {col.items.map((item, i) => (
              <div key={i} 
                onClick={(e) => handleItemClick(item.type, e)}
                style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '10px 12px', 
                background: '#fff', 
                borderRadius: '6px', 
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
              }}
              >
                <div style={{ 
                  width: '32px', height: '32px', 
                  background: '#f5f5f5', borderRadius: '6px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', marginRight: '12px'
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#333', fontWeight: '500' }}>{item.name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#3A2415', fontWeight: 'bold' }}>{item.price}</p>
                </div>
                <div style={{ color: '#3A2415', fontWeight: 'bold', fontSize: '18px' }}>›</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KidsClubCategories;
