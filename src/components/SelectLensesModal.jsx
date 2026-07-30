import { useState } from "react";
import "./SelectLensesModal.css";

function SelectLensesModal({ isOpen, onClose, onConfirm, basePrice }) {
  const [step, setStep] = useState(1);
  const [lensType, setLensType] = useState(null);
  const [lensPackage, setLensPackage] = useState(null);
  
  // Step 3 state
  const [rxMethod, setRxMethod] = useState(null); // 'manual', 'upload', 'later'
  const [rxData, setRxData] = useState({
    rightSph: "", rightCyl: "", rightAxis: "",
    leftSph: "", leftCyl: "", leftAxis: ""
  });
  const [uploadedFile, setUploadedFile] = useState(null);

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
                <div className="rx-upload-area" onClick={() => setUploadedFile("prescription_image.jpg")}>
                  {uploadedFile ? (
                    <div style={{ color: '#C9A66B', fontWeight: 'bold' }}>✓ File Selected: {uploadedFile}</div>
                  ) : (
                    <>
                      <p style={{ margin: 0, color: '#C9A66B', fontWeight: 'bold', fontSize: 18 }}>📷 Click to Upload Prescription Image/PDF</p>
                      <span style={{ fontSize: 13, color: '#6E4B34' }}>Supported formats: JPG, PNG, PDF</span>
                    </>
                  )}
                </div>
              )}

              {rxMethod === 'manual' && (
                <div className="rx-manual-form">
                  <div className="rx-eye-section">
                    <h4>Right Eye (OD)</h4>
                    <div className="rx-grid">
                      <input type="text" placeholder="SPH" value={rxData.rightSph} onChange={e => setRxData({...rxData, rightSph: e.target.value})} />
                      <input type="text" placeholder="CYL" value={rxData.rightCyl} onChange={e => setRxData({...rxData, rightCyl: e.target.value})} />
                      <input type="text" placeholder="AXIS" value={rxData.rightAxis} onChange={e => setRxData({...rxData, rightAxis: e.target.value})} />
                    </div>
                  </div>
                  <div className="rx-eye-section">
                    <h4>Left Eye (OS)</h4>
                    <div className="rx-grid">
                      <input type="text" placeholder="SPH" value={rxData.leftSph} onChange={e => setRxData({...rxData, leftSph: e.target.value})} />
                      <input type="text" placeholder="CYL" value={rxData.leftCyl} onChange={e => setRxData({...rxData, leftCyl: e.target.value})} />
                      <input type="text" placeholder="AXIS" value={rxData.leftAxis} onChange={e => setRxData({...rxData, leftAxis: e.target.value})} />
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

