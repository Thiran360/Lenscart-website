import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaCloudUploadAlt, FaPlus, FaTrashAlt, FaGlasses, FaSearch, FaEye, FaTag, FaGift, FaRulerCombined, FaSpinner, FaSyncAlt } from "react-icons/fa";
import { createGlassProduct, getGlassProducts, deleteGlassProduct } from "../services/productService";
import ConfirmModal from "./ConfirmModal";
import Pagination from "./Pagination";
import { useToast } from "../context/ToastContext";
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
  
  // Debounced Search State
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [filterType, setFilterType] = useState("all");
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination State (Count: 10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [serverTotalData, setServerTotalData] = useState(0);
  const itemsPerPage = 10;

  const { toast } = useToast();

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    item: null
  });

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
    applicable_for_buy_one_get_one: false,
    colors: ["black", "gold"],
    rating: 4.8
  });

  // Fetch Catalog Stock directly from API
  const fetchCatalogStock = useCallback(async (selectedFilter = "all", searchVal = "", pageNum = 1) => {
    setLoadingInventory(true);
    try {
      const res = await getGlassProducts({ filter: selectedFilter, search: searchVal, page: pageNum, limit: itemsPerPage });
      const apiItems = res?.products || [];
      setProductsList(apiItems);
      setServerTotalPages(Number(res?.total_pages || res?.totalPages || 1));
      setServerTotalData(Number(res?.total_data ?? res?.totalCount ?? apiItems.length));
    } catch (err) {
      console.warn("[GlassManager] Live catalog fetch notice:", err.message);
    } finally {
      setLoadingInventory(false);
    }
  }, [itemsPerPage]);

  // Fetch when searchInput or filterType changes with 350ms debounce (also runs once on mount)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
      fetchCatalogStock(filterType, searchInput, 1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, filterType, fetchCatalogStock]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === "inventory") {
      fetchCatalogStock(filterType, searchInput, currentPage);
    }
  };

  const handleFilterClick = (type) => {
    setFilterType(type);
    setCurrentPage(1);
    fetchCatalogStock(type, searchInput, 1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleColorToggle = (color) => {
    setFormData((prev) => {
      const exists = prev.colors.includes(color);
      const newColors = exists
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color];
      return { ...prev, colors: newColors };
    });
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.warning("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImagePreview(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      toast.warning("Please enter a valid product model name and price!");
      return;
    }

    const priceNum = Number(formData.price);
    setIsSubmitting(true);

    const apiPayload = {
      product_name: formData.name.trim(),
      model_name: formData.name.trim(),
      category_type: formData.type.toLowerCase(),
      frame_size: formData.size.toUpperCase(),
      price: priceNum,
      structure_style: formData.shape.toLowerCase(),
      target_audience: formData.gender.toLowerCase(),
      collection_tier: (formData.category === "₹1200 Store" ? "essential" : formData.category.toLowerCase()),
      available_colors: formData.colors.length ? formData.colors : ["black", "blue", "brown"],
      adjustable_nose_pad: Boolean(formData.hasNosePads),
      applicable_for_buy_one_get_one: Boolean(formData.applicable_for_buy_one_get_one)
    };

    try {
      // Call POST https://capsule-most-rundown.ngrok-free.dev/api/glass-product/create/
      await createGlassProduct(apiPayload);

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
        applicable_for_buy_one_get_one: false,
        colors: ["black", "gold"],
        rating: 4.8
      });
      setImagePreview(null);
      toast.success(`Success! "${apiPayload.model_name}" created and published to inventory.`);
      
      // Switch to inventory tab and re-fetch live stock
      setActiveTab("inventory");
      fetchCatalogStock(filterType);
    } catch (error) {
      console.error("[GlassManager] Create API error:", error.message);
      toast.error(`Failed to publish: ${error.message || "Network error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = (item) => {
    setConfirmModal({
      show: true,
      item
    });
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.item) {
      const id = confirmModal.item.id;
      const itemName = confirmModal.item.name;

      try {
        // Call DELETE https://capsule-most-rundown.ngrok-free.dev/api/product/delete/{id}/
        await deleteGlassProduct(id);
        toast.success(`"${itemName}" deleted from server inventory successfully.`);
        // Re-fetch fresh live data from the server
        await fetchCatalogStock(filterType);
      } catch (err) {
        console.error(`[GlassManager] DELETE API call for product #${id} failed:`, err.message);
        toast.error(`Failed to delete "${itemName}": ${err.message || "Server error"}`);
      }
    }
    setConfirmModal({ show: false, item: null });
  };

  const handleCancelDelete = () => {
    setConfirmModal({ show: false, item: null });
  };

  const currentInventory = productsList;

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
            onClick={() => handleTabChange('add')}
          >
            <FaPlus /> ADD NEW EYEWEAR
          </button>
          <button
            className={`glass-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => handleTabChange('inventory')}
          >
            <FaEye /> Catalog Stock ({serverTotalData || productsList.length})
          </button>
        </div>
      </div>

      {activeTab === "add" ? (
        <form onSubmit={handleSubmit} className="glass-form-card">
          <h3 className="form-section-header">Product Specifications & Media</h3>

          {/* Image Upload Area */}
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
                placeholder="e.g. Urban Round"
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
                placeholder="e.g. 1200"
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
                <option value="Premium">Premium Collection</option>
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

              {/* Buy 1 Get 1 (BOGO) Offer Checkbox */}
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '10px 16px',
                background: formData.applicable_for_buy_one_get_one ? 'rgba(13, 107, 109, 0.08)' : '#FAF6F0',
                border: formData.applicable_for_buy_one_get_one ? '1.5px solid #0d6b6d' : '1px solid rgba(58, 36, 21, 0.18)',
                borderRadius: '10px',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="checkbox"
                  name="applicable_for_buy_one_get_one"
                  checked={formData.applicable_for_buy_one_get_one}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', accentColor: '#0d6b6d', cursor: 'pointer' }}
                />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: '700', color: formData.applicable_for_buy_one_get_one ? '#0d6b6d' : '#1a1a1a' }}>
                  <FaTag style={{ color: '#0d6b6d', fontSize: '13px' }} />
                  Applicable for Buy 1 Get 1
                </span>
              </label>

              {(formData.type === "power" || formData.type === "sunglasses" || formData.type === "eyeglasses") && (
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
            <button type="submit" className="save-glass-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <FaSpinner className="fa-spin" style={{ animation: "spin 1s linear infinite" }} /> Publishing to Store...
                </>
              ) : (
                <>
                  <FaPlus /> Add Glass Product
                </>
              )}
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
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="filter-badge" onClick={() => fetchCatalogStock(filterType)} title="Refresh live stock">
                  <FaSyncAlt className={loadingInventory ? "fa-spin" : ""} style={{ animation: loadingInventory ? "spin 1s linear infinite" : "none" }} /> Sync API
                </button>
                <button className="add-eyewear-btn" onClick={() => handleTabChange('add')}>
                  <FaPlus /> ADD NEW EYEWEAR
                </button>
              </div>
            </div>

            <div className="type-filter-group">
              <button
                className={`filter-badge ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterClick('all')}
              >
                All Stock Items ({serverTotalData || productsList.length})
              </button>
              {GLASS_TYPES.map(gt => (
                <button
                  key={gt.id}
                  className={`filter-badge ${filterType === gt.id ? 'active' : ''}`}
                  onClick={() => handleFilterClick(gt.id)}
                >
                  {gt.label}
                </button>
              ))}
            </div>
          </div>

          {loadingInventory ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#0d6b6d' }}>
              <FaSpinner className="fa-spin" style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontWeight: '600', fontSize: '15px' }}>Fetching latest Catalog Stock from server...</p>
            </div>
          ) : productsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
              <FaGlasses size={44} style={{ opacity: 0.35, marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>No Eyewear Items Found</h4>
              <p style={{ fontSize: '13.5px', margin: 0 }}>There are no stock products matching your search or category filter.</p>
            </div>
          ) : (
            <>
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
                    {currentInventory.map(item => (
                      <tr key={item.id}>
                        <td>
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="table-glass-thumb"
                            onError={(e) => { e.target.src = "/eyeglass1.png"; }}
                          />
                        </td>
                        <td>
                          <div className="glass-name-cell">
                            <strong>{item.name}</strong>
                            {(item.applicable_for_buy_one_get_one || item.isBogo) && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px',
                                fontSize: '10.5px',
                                fontWeight: '700',
                                color: '#0d6b6d',
                                background: '#e6f4f4',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                border: '1px solid #b2dedf'
                              }}>
                                <FaTag style={{ fontSize: '9px' }} /> BOGO Offer
                              </span>
                            )}
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
                          <button
                            className="delete-item-btn"
                            title="Delete product"
                            onClick={() => handleOpenDeleteConfirm(item)}
                          >
                            <FaTrashAlt /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Reusable Pagination Component (Driven by total_pages from API) */}
              {serverTotalPages > 1 && (
                <div style={{ marginTop: '20px' }}>
                  <Pagination
                    totalItems={serverTotalData}
                    totalPages={serverTotalPages}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      fetchCatalogStock(filterType, searchInput, page);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Dynamic Confirmation Modal */}
      <ConfirmModal
        show={confirmModal.show}
        title="Remove Eyewear from Inventory?"
        message={
          confirmModal.item ? (
            <span>
              Are you sure you want to remove <strong>"{confirmModal.item.name}"</strong> from your catalog inventory? This action cannot be undone.
            </span>
          ) : ""
        }
        confirmText="Yes, Remove"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default GlassManager;
