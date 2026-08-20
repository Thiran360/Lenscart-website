import React, { useState, useRef, useEffect } from "react";
import { FaCloudUploadAlt, FaPlus, FaTrashAlt, FaGlasses, FaSearch, FaEye, FaTag, FaRulerCombined } from "react-icons/fa";
import { productsData } from "../data/products";
import "./GlassManager.css";

const GLASS_TYPES = [
  { id: "eyeglasses", label: "Eyeglasses" },
  { id: "sunglasses", label: "Sunglasses" },
  { id: "power", label: "Power Glass" },
  { id: "contacts", label: "Contact Lenses" },
  { id: "computer", label: "Computer & Blue Light" }
];

const GLASS_SIZES = [
  { id: "S", label: "Small (S)" },
  { id: "M", label: "Medium (M)" },
  { id: "L", label: "Large (L)" },
  { id: "XL", label: "Extra Large (XL)" }
];

const GLASS_SHAPES = ["Full Rim", "Half Rim", "Rimless", "Rectangle", "Round", "Wayfarer", "Aviator", "Cat Eye", "Square", "Oval"];
const GENDER_OPTIONS = ["Unisex", "Men", "Women", "Kids"];
const COLOR_OPTIONS = ["black", "gold", "silver", "blue", "pink", "red", "brown", "green", "transparent"];

function GlassManager() {
  const [productsList, setProductsList] = useState([]);
  const [activeTab, setActiveTab] = useState("add"); // "add" | "inventory"
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "eyeglasses",
    category: "Classic",
    price: "",
    size: "M",
    shape: "Rectangle",
    gender: "Unisex",
    hasNosePads: true,
    hasReturnPolicy: true,
    hasExchangePolicy: true,
    hasWarranty: true,
    colors: ["black", "gold"],
    rating: 4.8
  });

  // Load custom products + default products
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("customProducts") || "[]");
    setProductsList([...stored, ...productsData]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleColorToggle = (color) => {
    setFormData(prev => {
      const exists = prev.colors.includes(color);
      if (exists) {
        return { ...prev, colors: prev.colors.filter(c => c !== color) };
      } else {
        return { ...prev, colors: [...prev.colors, color] };
      }
    });
  };

  const processFile = (file) => {
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert("Please enter a valid product model name and price!");
      return;
    }

    const priceNum = Number(formData.price);

    const newGlassProduct = {
      id: Date.now(),
      name: formData.name.trim(),
      type: formData.type,
      category: formData.category,
      price: priceNum,
      size: formData.size,
      shape: formData.shape,
      gender: formData.gender,
      hasNosePads: !!formData.hasNosePads,
      hasReturnPolicy: !!formData.hasReturnPolicy,
      hasExchangePolicy: !!formData.hasExchangePolicy,
      hasWarranty: !!formData.hasWarranty,
      colors: formData.colors.length ? formData.colors : ["black"],
      image: imagePreview || "/classic_rectangle.png",
      description: `${formData.shape} ${formData.type}.`,
      rating: 4.9,
      isCustom: true
    };

    // Save to LocalStorage
    const stored = JSON.parse(localStorage.getItem("customProducts") || "[]");
    const updatedCustom = [newGlassProduct, ...stored];
    localStorage.setItem("customProducts", JSON.stringify(updatedCustom));

    setProductsList([newGlassProduct, ...productsList]);

    // Reset Form
    setFormData({
      name: "",
      type: "eyeglasses",
      category: "Classic",
      price: "",
      size: "M",
      shape: "Rectangle",
      gender: "Unisex",
      hasNosePads: true,
      hasReturnPolicy: true,
      hasExchangePolicy: true,
      hasWarranty: true,
      colors: ["black", "gold"],
      rating: 4.8
    });
    setImagePreview(null);
    alert(`Success! "${newGlassProduct.name}" has been published to inventory.`);
    setActiveTab("inventory");
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to remove this product from inventory?")) {
      const stored = JSON.parse(localStorage.getItem("customProducts") || "[]");
      const filteredCustom = stored.filter(p => p.id !== id);
      localStorage.setItem("customProducts", JSON.stringify(filteredCustom));

      setProductsList(productsList.filter(p => p.id !== id));
    }
  };

  const filteredInventory = productsList.filter(p => {
    const nameStr = p.name || '';
    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || p.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="glass-manager-container">
      {/* Header Bar */}
      <div className="glass-manager-topbar">
        <div className="glass-title-group">
          <h2><FaGlasses /> Eyewear Catalog & Inventory Management</h2>
          <p>Publish new eyewear models, configure specifications, pricing, and manage stock inventory in real time.</p>
        </div>

        <div className="glass-nav-tabs">
          <button
            className={`glass-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <FaPlus /> ADD NEW EYEWEAR
          </button>
          <button
            className={`glass-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <FaEye /> Catalog Stock ({productsList.length})
          </button>
        </div>
      </div>

      {activeTab === "add" ? (
        <form onSubmit={handleSubmit} className="glass-form-card">
          <h3 className="form-section-header">Product Specifications & Media</h3>

          {/* Image Upload Area (Moved to Top) */}
          <div className="glass-field" style={{ marginBottom: 25 }}>
            <label>Product Imagery & Asset</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {!imagePreview ? (
              <div
                className={`glass-upload-zone ${isDragging ? 'dragging' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FaCloudUploadAlt size={45} className="upload-icon" />
                <p className="upload-title">Click to Upload or Drag & Drop Product Image</p>
                <span className="upload-sub">High-resolution JPG, PNG, or WEBP supported</span>
              </div>
            ) : (
              <div className="glass-preview-card">
                <img src={imagePreview} alt="Glass Preview" className="preview-img" />
                <div className="preview-info">
                  <strong>Product Asset Loaded</strong>
                  <span>Ready for store publication</span>
                </div>
                <button
                  type="button"
                  className="remove-img-btn"
                  onClick={() => setImagePreview(null)}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          {/* Row 1: Name */}
          <div className="glass-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="glass-field">
              <label>Model Name / Product Title *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Titanium Air Flex Round Frame"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Type, Size, Price */}
          <div className="glass-form-grid three-col">
            <div className="glass-field">
              <label><FaGlasses /> Category / Type *</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                {GLASS_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="glass-field">
              <label><FaRulerCombined /> Frame Size *</label>
              <select name="size" value={formData.size} onChange={handleInputChange}>
                {GLASS_SIZES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="glass-field">
              <label><FaTag /> Price (₹) *</label>
              <input
                type="number"
                name="price"
                placeholder="e.g. 1499"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Row 3: Shape, Gender, Category */}
          <div className="glass-form-grid three-col">
            <div className="glass-field">
              <label>Frame Structure & Style</label>
              <select name="shape" value={formData.shape} onChange={handleInputChange}>
                {GLASS_SHAPES.map(sh => (
                  <option key={sh} value={sh}>{sh}</option>
                ))}
              </select>
            </div>

            <div className="glass-field">
              <label>Target Audience</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange}>
                {GENDER_OPTIONS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="glass-field">
              <label>Collection Tier</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="Classic">Classic Collection</option>
                <option value="Executive">Executive Series</option>
                <option value="Kids">Junior Eyewear</option>
                <option value="₹1200 Store">Essential Store</option>
              </select>
            </div>
          </div>

          {/* Color Selection */}
          <div className="glass-field" style={{ marginTop: 15 }}>
            <label>Available Color Variants</label>
            <div className="color-chips-container">
              {COLOR_OPTIONS.map(color => (
                <button
                  type="button"
                  key={color}
                  className={`color-chip ${formData.colors.includes(color) ? 'selected' : ''}`}
                  onClick={() => handleColorToggle(color)}
                >
                  <span className={`color-dot ${color}`}></span>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Product Badges & Guarantee Feature Boxes */}
          <div className="glass-field" style={{ marginTop: 20 }}>
            <label style={{ marginBottom: 10, fontSize: '13.5px', fontWeight: '700', color: '#1a1a1a' }}>
              Product Features & Guarantee Options
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '10px 16px',
                background: formData.hasNosePads ? 'rgba(13, 107, 109, 0.08)' : '#FAF6F0',
                border: formData.hasNosePads ? '1.5px solid #0d6b6d' : '1px solid rgba(58, 36, 21, 0.18)',
                borderRadius: '10px',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="checkbox"
                  name="hasNosePads"
                  checked={formData.hasNosePads}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', accentColor: '#0d6b6d', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1a1a1a' }}>
                  Includes Adjustable Nose Pad
                </span>
              </label>

              {(formData.type === "power" || formData.type === "sunglasses") && (
                <>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '10px 16px',
                    background: formData.hasReturnPolicy ? 'rgba(13, 107, 109, 0.08)' : '#FAF6F0',
                    border: formData.hasReturnPolicy ? '1.5px solid #0d6b6d' : '1px solid rgba(58, 36, 21, 0.18)',
                    borderRadius: '10px',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      name="hasReturnPolicy"
                      checked={formData.hasReturnPolicy}
                      onChange={handleInputChange}
                      style={{ width: '18px', height: '18px', accentColor: '#0d6b6d', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1a1a1a' }}>
                      14 Days Return Policy 🔄
                    </span>
                  </label>

                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '10px 16px',
                    background: formData.hasExchangePolicy ? 'rgba(13, 107, 109, 0.08)' : '#FAF6F0',
                    border: formData.hasExchangePolicy ? '1.5px solid #0d6b6d' : '1px solid rgba(58, 36, 21, 0.18)',
                    borderRadius: '10px',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      name="hasExchangePolicy"
                      checked={formData.hasExchangePolicy}
                      onChange={handleInputChange}
                      style={{ width: '18px', height: '18px', accentColor: '#0d6b6d', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1a1a1a' }}>
                      14 Days Exchange Policy 🔀
                    </span>
                  </label>

                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '10px 16px',
                    background: formData.hasWarranty ? 'rgba(13, 107, 109, 0.08)' : '#FAF6F0',
                    border: formData.hasWarranty ? '1.5px solid #0d6b6d' : '1px solid rgba(58, 36, 21, 0.18)',
                    borderRadius: '10px',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      name="hasWarranty"
                      checked={formData.hasWarranty}
                      onChange={handleInputChange}
                      style={{ width: '18px', height: '18px', accentColor: '#0d6b6d', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1a1a1a' }}>
                      1 Year Brand Warranty 🛡️
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="form-submit-row" style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="submit" className="save-glass-btn">
              <FaPlus /> Add Glass Product
            </button>
          </div>
        </form>
      ) : (
        /* Inventory Management View */
        <div className="inventory-card">
          <div className="inventory-header-bar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div className="search-filter-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search catalog by title, model code, or style..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="add-eyewear-btn" onClick={() => setActiveTab('add')}>
                <FaPlus /> ADD NEW EYEWEAR
              </button>
            </div>

            <div className="type-filter-group">
              <button
                className={`filter-badge ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All Stock Items ({productsList.length})
              </button>
              {GLASS_TYPES.map(gt => (
                <button
                  key={gt.id}
                  className={`filter-badge ${filterType === gt.id ? 'active' : ''}`}
                  onClick={() => setFilterType(gt.id)}
                >
                  {gt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Product Title & Model</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Style & Target Audience</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item.id}>
                    <td>
                      <img src={item.image} alt={item.name} className="table-glass-thumb" />
                    </td>
                    <td>
                      <div className="glass-name-cell">
                        <strong>{item.name}</strong>
                        {item.isCustom && <span className="custom-badge">CUSTOM ADDED</span>}
                      </div>
                    </td>
                    <td>
                      <span className="type-tag">{(item.type || 'eyeglasses').toUpperCase()}</span>
                    </td>
                    <td>
                      <span className="size-badge">Size {item.size || 'M'}</span>
                    </td>
                    <td>
                      <div className="shape-cell">
                        <span>{item.shape || 'Standard'}</span>
                        <small>{item.gender || 'Unisex'}{item.hasNosePads ? ' • Nose Pads' : ''}</small>
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">
                        <strong className="current-price">₹{item.price}</strong>
                      </div>
                    </td>
                    <td>
                      {item.isCustom ? (
                        <button
                          className="delete-item-btn"
                          title="Delete product"
                          onClick={() => handleDeleteProduct(item.id)}
                        >
                          <FaTrashAlt /> Remove
                        </button>
                      ) : (
                        <span className="default-tag">System Item</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default GlassManager;
