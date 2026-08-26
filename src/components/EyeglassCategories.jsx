import React from 'react';
import { useNavigate } from 'react-router-dom';

const EyeglassCategories = () => {
  const navigate = useNavigate();
  const data = [
    {
      title: "MEN Eyeglasses",
      badge: "★ with FREE lenses",
      headerBg: "linear-gradient(to right, #f4f6fa, #eef1f6)",
      image: "/men-eyeglass.jpeg",
      items: [
        { name: "John Jacobs | Owndays | Le Petit", price: "Starts at ₹3000", icon: "👓" },
        { name: "Vincent Chase | Mr.LensMaker Air", price: "Starts at ₹1500", icon: "👓" },
        { name: "Hustlr", price: "Starts at ₹500", icon: "👓" },
        { name: "Essentials", price: "Starts at ₹500", icon: "👓" },
      ]
    },
    {
      title: "WOMEN Eyeglasses",
      badge: "★ with FREE lenses",
      headerBg: "linear-gradient(to right, #fdf5f5, #fcebeb)",
      image: "/women-eyeglass.jpeg",
      items: [
        { name: "John Jacobs | Owndays | Le Petit", price: "Starts at ₹3000", icon: "👓" },
        { name: "Vincent Chase | Mr.LensMaker Air", price: "Starts at ₹1500", icon: "👓" },
        { name: "Hustlr", price: "Starts at ₹500", icon: "👓" },
        { name: "Essentials", price: "Starts at ₹500", icon: "👓" },
      ]
    },
    {
      title: "KIDS Eyeglasses",
      badge: "★ with FREE lenses",
      headerBg: "linear-gradient(to right, #f0fbfc, #e0f8fa)",
      image: "/kids-eyeglass.jpeg",
      items: [
        { name: "Juniors | 5 to 8 years", price: "Starts at ₹800", icon: "👓" },
        { name: "Tweens | 8 to 12 years", price: "Starts at ₹500", icon: "👓" },
        { name: "Teens | 12 to 17 years", price: "Starts at ₹1500", icon: "👓" },
      ]
    }
  ];

  const handleItemClick = (itemName, e) => {
    // Force close the hover menu
    const megaMenu = e.currentTarget.closest('.category-mega-menu');
    if (megaMenu) {
      megaMenu.style.display = 'none';
      setTimeout(() => {
        megaMenu.style.display = '';
      }, 100);
    }
    
    navigate('/products?type=eyeglasses');
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px', justifyContent: 'center' }}>
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>
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
                onClick={(e) => handleItemClick(item.name, e)}
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

export default EyeglassCategories;

