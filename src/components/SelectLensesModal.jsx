import { useState, useRef } from "react";
import { FaCloudUploadAlt, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import { SPH_OPTIONS, CYL_OPTIONS, AXIS_OPTIONS } from "../utils/rxOptions";
import "./SelectLensesModal.css";

function SelectLensesModal({ isOpen, onClose, onConfirm, basePrice }) {
  const [step, setStep] = useState(1);
  const [lensType, setLensType] = useState(null);
  const [lensPackage, setLensPackage] = useState(null);
  
  // Step 3 state
  const [rxMethod, setRxMethod] = useState(null); // 'manual', 'upload', 'later'
  const [rxData, setRxData] = useState({
    name: "",
    birthYear: "",
    rightSph: "", rightCyl: "", rightAxis: "",
    leftSph: "", leftCyl: "", leftAxis: ""
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const fileData = {
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      type: file.type,
      url: isImage ? URL.createObjectURL(file) : null
    };
    setUploadedFile(fileData);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  const lensTypes = [
    { id: "single", title: "Single Vision", desc: "For distance or near vision", price: 0 },
    { id: "zero", title: "Zero Power", desc: "For computer & smartphone protection", price: 0 },
    { id: "bifocal", title: "Bifocal / Progressive", desc: "For both distance & near vision", price: 500 },
  ];

  const lensPackages = [
    { id: "basic", title: "Basic Anti-Glare", desc: "Scratch resistant & anti-reflective", price: 500 },
    { id: "blu", title: "BLU Tech", desc: "Blocks harmful blue light from screens", price: 1000 },
    { id: "premium", title: "Premium Hydrophobic", desc: "Water & dust repellent, highly durable", price: 1500 },
  ];

  const handleNext = () => {
    if (step === 1 && lensType) setStep(2);
    else if (step === 2 && lensPackage) {
      if (lensType !== "zero") {
        setStep(3); // Prescription step
      } else {
        submitSelection(); // Bypass prescription if Zero Power
      }
    } else if (step === 3 && rxMethod) {
      submitSelection();
    }
  };

  const submitSelection = () => {
    const selectedType = lensTypes.find((l) => l.id === lensType);
    const selectedPkg = lensPackages.find((l) => l.id === lensPackage);
    
    let prescriptionDetails = null;
    if (lensType !== "zero") {
      prescriptionDetails = {
        method: rxMethod,
        data: rxMethod === 'manual' ? rxData : null,
        file: rxMethod === 'upload' ? uploadedFile : null
      };
    }

    onConfirm({
      type: selectedType,
      package: selectedPkg,
      additionalPrice: selectedType.price + selectedPkg.price,
      prescription: prescriptionDetails
    });
    
    // reset state
    setStep(1);
    setLensType(null);
    setLensPackage(null);
    setRxMethod(null);
    setRxData({ rightSph: "", rightCyl: "", rightAxis: "", leftSph: "", leftCyl: "", leftAxis: "" });
    setUploadedFile(null);
  };

  const getStepTitle = () => {
    if (step === 1) return "Select Lens Type";
    if (step === 2) return "Select Lens Package";
    return "Provide Prescription Details";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>{getStepTitle()}</h2>
        <p className="modal-subtitle">
          {step === 3 ? "We need your eye power to craft your perfect lenses." : "Customize your perfect glasses."}
        </p>

        <div className="options-grid">
          {step === 1 && lensTypes.map((type) => (
            <div 
              key={type.id} 
              className={`option-card ${lensType === type.id ? 'selected' : ''}`}
              onClick={() => setLensType(type.id)}
            >
              <div className="option-header">
                <h3>{type.title}</h3>
                <span className="option-price">{type.price === 0 ? 'Free' : `+₹${type.price}`}</span>
              </div>
              <p>{type.desc}</p>
            </div>
          ))}

          {step === 2 && lensPackages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`option-card ${lensPackage === pkg.id ? 'selected' : ''}`}
              onClick={() => setLensPackage(pkg.id)}
            >
              <div className="option-header">
                <h3>{pkg.title}</h3>
                <span className="option-price">+₹{pkg.price}</span>
              </div>
              <p>{pkg.desc}</p>
            </div>
          ))}

          {step === 3 && (
            <div className="rx-step-container">
              <div className="rx-method-tabs">
                <button className={`rx-tab ${rxMethod === 'upload' ? 'active' : ''}`} onClick={() => setRxMethod('upload')}>Upload File</button>
                <button className={`rx-tab ${rxMethod === 'manual' ? 'active' : ''}`} onClick={() => setRxMethod('manual')}>Enter Manually</button>
                <button className={`rx-tab ${rxMethod === 'later' ? 'active' : ''}`} onClick={() => setRxMethod('later')}>Provide Later</button>
              </div>

              {rxMethod === 'upload' && (
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*,.pdf" 
                    style={{ display: "none" }} 
                    onChange={handleFileChange} 
                  />

                  {!uploadedFile ? (
                    <div 
                      className="rx-upload-area" 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      style={{
                        border: isDragging ? "2px dashed #9B7038" : "2px dashed #C5A059",
                        backgroundColor: isDragging ? "#F4EDE2" : "#FAF6F0",
                        borderRadius: "12px",
                        padding: "30px 20px",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <FaCloudUploadAlt size={42} color="#C5A059" style={{ marginBottom: 8 }} />
                      <p style={{ margin: "0 0 6px 0", color: "#3A2415", fontWeight: "bold", fontSize: 16 }}>
                        Click to Upload or Drag & Drop Prescription
                      </p>
                      <span style={{ fontSize: 13, color: "#6E4B34" }}>Supported formats: JPG, PNG, PDF</span>
                    </div>
                  ) : (
                    <div 
                      style={{
                        border: "1px solid #C5A059",
                        backgroundColor: "#FAF6F0",
                        borderRadius: "12px",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {uploadedFile.url ? (
                          <img src={uploadedFile.url} alt="Rx preview" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc" }} />
                        ) : (
                          <FaFileAlt size={32} color="#C5A059" />
                        )}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: "bold", color: "#3A2415", fontSize: 14 }}>
                            <FaCheckCircle color="#2e7d32" /> {uploadedFile.name}
                          </div>
                          <span style={{ fontSize: 12, color: "#6E4B34" }}>File Size: {uploadedFile.size}</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        style={{ background: "none", border: "1px solid #d32f2f", color: "#d32f2f", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
                      >
                        Remove File
                      </button>
                    </div>
                  )}
                </div>
              )}

              {rxMethod === 'manual' && (
                <div className="rx-manual-form">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 15 }}>
                    <div className="rx-eye-section" style={{ margin: 0 }}>
                      <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600, color: '#333' }}>Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. John" 
                        value={rxData.name} 
                        onChange={e => setRxData({...rxData, name: e.target.value.replace(/[^a-zA-Z\s]/g, "")})} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
                      />
                    </div>
                    <div className="rx-eye-section" style={{ margin: 0 }}>
                      <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600, color: '#333' }}>Birth Year</label>
                      <select 
                        value={rxData.birthYear} 
                        onChange={e => setRxData({...rxData, birthYear: e.target.value})} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff' }}
                      >
                        <option value="">Select Birth Year</option>
                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="rx-eye-section">
                    <h4>Right Eye (OD)</h4>
                    <div className="rx-grid">
                      <select value={rxData.rightSph} onChange={e => setRxData({...rxData, rightSph: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px' }}>
                        <option value="">SPH</option>
                        {SPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <select value={rxData.rightCyl} onChange={e => setRxData({...rxData, rightCyl: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px' }}>
                        <option value="">CYL</option>
                        {CYL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <select value={rxData.rightAxis} onChange={e => setRxData({...rxData, rightAxis: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px' }}>
                        <option value="">AXIS</option>
                        {AXIS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="rx-eye-section">
                    <h4>Left Eye (OS)</h4>
                    <div className="rx-grid">
                      <select value={rxData.leftSph} onChange={e => setRxData({...rxData, leftSph: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px' }}>
                        <option value="">SPH</option>
                        {SPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <select value={rxData.leftCyl} onChange={e => setRxData({...rxData, leftCyl: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px' }}>
                        <option value="">CYL</option>
                        {CYL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <select value={rxData.leftAxis} onChange={e => setRxData({...rxData, leftAxis: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px' }}>
                        <option value="">AXIS</option>
                        {AXIS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {rxMethod === 'later' && (
                <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: 8 }}>
                  <p style={{ color: '#6E4B34', fontSize: 15, margin: 0 }}>You can add this frame to cart now and upload or enter your prescription in your Dashboard or via email after checkout.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button className="back-btn" onClick={() => setStep(step - 1)}>Back</button>
          )}
          <button 
            className="continue-btn" 
            onClick={handleNext}
            disabled={
              (step === 1 && !lensType) || 
              (step === 2 && !lensPackage) || 
              (step === 3 && !rxMethod) ||
              (step === 3 && rxMethod === 'upload' && !uploadedFile)
            }
          >
            {step === 3 || (step === 2 && lensType === "zero") ? "Add to Cart" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectLensesModal;

