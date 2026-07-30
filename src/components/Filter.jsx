import { useState, useEffect } from "react";
import "./Filter.css";

function Filter({ filters, onApplyFilters, sortOrder, onSortChange, onTry3dToggle }) {
  const [openAccordion, setOpenAccordion] = useState("Gender"); // Default open
  const [localFilters, setLocalFilters] = useState(filters);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync if parent filters change (e.g. initial load or clearing)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleAccordion = (name) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  const handleCheckboxChange = (category, value) => {
    setLocalFilters(prev => {
      const currentValues = prev[category] || [];
      const newValues = currentValues.includes(value) 
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      const updatedFilters = { ...prev, [category]: newValues };
      onApplyFilters(updatedFilters); // Apply immediately
      return updatedFilters;
    });
  };

  const renderCheckboxes = (category, options) => (
    <div className="filter-options">
      {options.map((option) => (
        <label key={option} className="filter-checkbox">
          <input
            type="checkbox"
            checked={localFilters[category]?.includes(option) || false}
            onChange={() => handleCheckboxChange(category, option)}
          />
          {option}
        </label>
      ))}
    </div>
  );

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <span className="sort-icon">⇅</span>
        <h3>Sort By</h3>
        <select 
          className="sort-select" 
          value={sortOrder} 
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="Recommended">Recommended</option>
          <option value="Price: Low to High">Price: Low to High</option>
          <option value="Price: High to Low">Price: High to Low</option>
        </select>
      </div>

      <div className="filter-section try-3d-section">
        <h3>Try in 3D</h3>
        <label className="switch">
          <input type="checkbox" onChange={(e) => onTry3dToggle && onTry3dToggle(e.target.checked)} />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="filter-section-title" onClick={() => setShowMobileFilters(!showMobileFilters)} style={{ cursor: 'pointer' }}>
        <span className="filter-icon">{showMobileFilters ? '△' : '▽'}</span>
        <h3>Filters</h3>
      </div>

      <div className={`filter-mobile-wrapper ${showMobileFilters ? 'show' : ''}`}>
        <div className="accordion-list">
          <div className="accordion-item" onClick={() => toggleAccordion("Gender")}>
            <span>Gender</span>
            <span className="chevron">{openAccordion === "Gender" ? "⌃" : "⌄"}</span>
          </div>
          {openAccordion === "Gender" && renderCheckboxes("gender", ["Men", "Women", "Unisex"])}

          <div className="accordion-item" onClick={() => toggleAccordion("Brand")}>
            <span>Brand</span>
            <span className="chevron">{openAccordion === "Brand" ? "⌃" : "⌄"}</span>
          </div>
          {openAccordion === "Brand" && renderCheckboxes("brand", ["John Jacobs", "Lenskart Air", "OWNDAYS", "Vincent Chase"])}

          <div className="accordion-item" onClick={() => toggleAccordion("Shape")}>
            <span>Shape & Style</span>
            <span className="chevron">{openAccordion === "Shape" ? "⌃" : "⌄"}</span>
          </div>
          {openAccordion === "Shape" && renderCheckboxes("shape", ["Rectangle", "Round", "Aviator", "Wayfarer", "Cat Eye", "Square", "Oval"])}
        </div>
        <button className="apply-btn" onClick={() => onApplyFilters(localFilters)}>View Results</button>
      </div>
    </div>
  );
}

export default Filter;
