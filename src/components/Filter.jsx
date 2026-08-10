import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaSortAmountDown, FaFilter } from "react-icons/fa";
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
          <span className="checkbox-custom"></span>
          <span className="checkbox-label">{option}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <FaSortAmountDown className="sort-icon" />
        <h3 className="filter-title-text">Sort By</h3>
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

      <div className="filter-divider"></div>

      <div className="filter-section-title" onClick={() => setShowMobileFilters(!showMobileFilters)}>
        <FaFilter className="filter-icon" />
        <h3 className="filter-title-text">Filters</h3>
      </div>

      <div className={`filter-mobile-wrapper ${showMobileFilters ? 'show' : ''}`}>
        <div className="accordion-list">
          <div className={`accordion-item ${openAccordion === "BestSellers" ? "active" : ""}`} onClick={() => toggleAccordion("BestSellers")}>
            <span>Best Sellers</span>
            <span className="chevron">{openAccordion === "BestSellers" ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          {openAccordion === "BestSellers" && renderCheckboxes("bestSellers", ["Yes"])}

          <div className={`accordion-item ${openAccordion === "Sales" ? "active" : ""}`} onClick={() => toggleAccordion("Sales")}>
            <span>Sales & Offers</span>
            <span className="chevron">{openAccordion === "Sales" ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          {openAccordion === "Sales" && renderCheckboxes("sales", ["Yes"])}

          <div className={`accordion-item ${openAccordion === "Gender" ? "active" : ""}`} onClick={() => toggleAccordion("Gender")}>
            <span>Gender</span>
            <span className="chevron">{openAccordion === "Gender" ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          {openAccordion === "Gender" && renderCheckboxes("gender", ["Men", "Women", "Unisex"])}

          <div className={`accordion-item ${openAccordion === "Brand" ? "active" : ""}`} onClick={() => toggleAccordion("Brand")}>
            <span>Brand</span>
            <span className="chevron">{openAccordion === "Brand" ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          {openAccordion === "Brand" && renderCheckboxes("brand", ["John Jacobs", "Lenskart Air", "OWNDAYS", "Vincent Chase"])}

          <div className={`accordion-item ${openAccordion === "Shape" ? "active" : ""}`} onClick={() => toggleAccordion("Shape")}>
            <span>Shape & Style</span>
            <span className="chevron">{openAccordion === "Shape" ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          {openAccordion === "Shape" && renderCheckboxes("shape", ["Rectangle", "Round", "Aviator", "Wayfarer", "Cat Eye", "Square", "Oval"])}

          <div className={`accordion-item ${openAccordion === "Size" ? "active" : ""}`} onClick={() => toggleAccordion("Size")}>
            <span>Size</span>
            <span className="chevron">{openAccordion === "Size" ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          {openAccordion === "Size" && renderCheckboxes("size", ["S", "M", "L"])}

          <div className={`accordion-item ${openAccordion === "Color" ? "active" : ""}`} onClick={() => toggleAccordion("Color")}>
            <span>Color</span>
            <span className="chevron">{openAccordion === "Color" ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          {openAccordion === "Color" && renderCheckboxes("color", ["black", "blue", "brown", "gold", "pink", "grey", "red", "green", "silver", "transparent", "tortoise"])}

          <div className={`accordion-item ${openAccordion === "Price" ? "active" : ""}`} onClick={() => toggleAccordion("Price")}>
            <span>Price</span>
            <span className="chevron">{openAccordion === "Price" ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          {openAccordion === "Price" && renderCheckboxes("price", ["Under ₹2000", "₹2000 - ₹4000", "Above ₹4000"])}
        </div>
        <button className="apply-btn" onClick={() => onApplyFilters(localFilters)}>View Results</button>
      </div>
    </div>
  );
}

export default Filter;
