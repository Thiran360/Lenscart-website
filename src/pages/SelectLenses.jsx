import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { productsData } from "../data/products";
import { useCart } from "../context/CartContext";
import "./SelectLenses.css";

function SelectLenses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  
  const product = productsData.find(p => p.id === parseInt(id));
  
  // Extract action from URL query params (e.g., ?action=buy)
  const queryParams = new URLSearchParams(location.search);
  const action = queryParams.get("action") || "cart";

  const [step, setStep] = useState(1);
  const [lensType, setLensType] = useState(null);
  const [lensPackage, setLensPackage] = useState(null);
  const [rxMethod, setRxMethod] = useState(null);
  const [rxData, setRxData] = useState({ rightSph: "", rightCyl: "", rightAxis: "", leftSph: "", leftCyl: "", leftAxis: "" });
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if (!product) {
      navigate("/products");
    }
  }, [product, navigate]);

  if (!product) return null;

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

  const getHighPowerSurcharge = () => {
    if (lensType === "zero" || rxMethod !== "manual") return 0;
    
    // Parse floats, defaulting to 0 if invalid/empty
    const rSph = parseFloat(rxData.rightSph) || 0;
    const lSph = parseFloat(rxData.leftSph) || 0;
    const rCyl = parseFloat(rxData.rightCyl) || 0;
    const lCyl = parseFloat(rxData.leftCyl) || 0;

    // Check if any SPH or CYL exceeds ±6.00
    if (Math.abs(rSph) > 6 || Math.abs(lSph) > 6 || Math.abs(rCyl) > 6 || Math.abs(lCyl) > 6) {
      return 1000;
    }
    return 0;
  };

  const calculateTotal = () => {
    let total = product.price;
    if (lensType) total += lensTypes.find(l => l.id === lensType).price;
    if (lensPackage) total += lensPackages.find(l => l.id === lensPackage).price;
    total += getHighPowerSurcharge();
    return total;
  };

  const handleNext = () => {
    if (step === 1 && lensType) setStep(2);
    else if (step === 2 && lensPackage) {
      if (lensType !== "zero") setStep(3);
      else submitSelection();
    }
    else if (step === 3 && rxMethod) {
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

    const finalProduct = {
      ...product,
      price: calculateTotal(),
      lensDetails: {
        type: selectedType,
        package: selectedPkg,
        surcharge: getHighPowerSurcharge(),
        additionalPrice: selectedType.price + selectedPkg.price + getHighPowerSurcharge(),
        prescription: prescriptionDetails
      }
    };

    const qty = parseInt(queryParams.get("qty")) || 1;

    if (action === "buy") {
      navigate("/checkout", { state: { buyNowProduct: { ...finalProduct, quantity: qty } } });
    } else {
      addToCart(finalProduct, qty);
      navigate("/cart");
    }
  };

  return (
    <div className="lens-page-wrapper">
      <Navbar />
      
      <div className="lens-selection-container">
        {/* Left Side: Steps */}
        <div className="lens-steps-area">
          <div className="step-indicator">
            <span className={`step-pill ${step >= 1 ? 'active' : ''}`}>1. Lens Type</span>
            <span className={`step-pill ${step >= 2 ? 'active' : ''}`}>2. Lens Package</span>
            <span className={`step-pill ${step >= 3 ? 'active' : ''}`}>3. Prescription</span>
          </div>

          <div className="step-content">
            {step === 1 && (
              <>
                <h2>Select Lens Type</h2>
                <p className="subtitle">Choose the vision correction you need.</p>
                <div className="options-grid">
                  {lensTypes.map((type) => (
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
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2>Select Lens Package</h2>
                <p className="subtitle">Choose your lens quality and coatings.</p>
                <div className="options-grid">
                  {lensPackages.map((pkg) => (
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
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2>Provide Prescription</h2>
                <p className="subtitle">We need your eye power to craft your perfect lenses.</p>
                
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
                        <span style={{ fontSize: 13, color: '#6E4B34', display: 'block', marginTop: 10 }}>Supported formats: JPG, PNG, PDF</span>
                      </>
                    )}
                  </div>
                )}

                {rxMethod === 'manual' && (
                  <div className="rx-manual-form">
                    <div className="rx-eye-section">
                      <h4>Right Eye (OD)</h4>
                      <div className="rx-grid">
                        <input type="text" placeholder="SPH (e.g. -1.00)" value={rxData.rightSph} onChange={e => setRxData({...rxData, rightSph: e.target.value})} />
                        <input type="text" placeholder="CYL (e.g. -0.50)" value={rxData.rightCyl} onChange={e => setRxData({...rxData, rightCyl: e.target.value})} />
                        <input type="text" placeholder="AXIS (e.g. 180)" value={rxData.rightAxis} onChange={e => setRxData({...rxData, rightAxis: e.target.value})} />
                      </div>
                    </div>
                    <div className="rx-eye-section">
                      <h4>Left Eye (OS)</h4>
                      <div className="rx-grid">
                        <input type="text" placeholder="SPH (e.g. -1.25)" value={rxData.leftSph} onChange={e => setRxData({...rxData, leftSph: e.target.value})} />
                        <input type="text" placeholder="CYL (e.g. -0.75)" value={rxData.leftCyl} onChange={e => setRxData({...rxData, leftCyl: e.target.value})} />
                        <input type="text" placeholder="AXIS (e.g. 170)" value={rxData.leftAxis} onChange={e => setRxData({...rxData, leftAxis: e.target.value})} />
                      </div>
                    </div>
                  </div>
                )}

                {rxMethod === 'later' && (
                  <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: 8 }}>
                    <p style={{ color: '#6E4B34', fontSize: 15, margin: 0 }}>You can proceed to checkout now and upload or enter your prescription in your Dashboard later.</p>
                  </div>
                )}
              </>
            )}

            <div className="step-navigation">
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
                {step === 3 || (step === 2 && lensType === "zero") ? (action === "buy" ? "Proceed to Checkout" : "Add to Cart") : "Continue to Next Step"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lens-summary-area">
          <h2 style={{ marginTop: 0, marginBottom: 20, color: '#333', fontSize: 20 }}>Order Summary</h2>
          
          <div className="summary-product">
            <img src={product.image} alt={product.name} />
            <div className="summary-details">
              <h3>{product.brand} - {product.name}</h3>
              <p>Size: {product.size}</p>
            </div>
          </div>

          <div className="summary-row">
            <span>Frame Price</span>
            <span>₹{product.price}</span>
          </div>

          {lensType && (
            <div className="summary-row">
              <span>{lensTypes.find(l => l.id === lensType).title}</span>
              <span>{lensTypes.find(l => l.id === lensType).price === 0 ? 'Free' : `+₹${lensTypes.find(l => l.id === lensType).price}`}</span>
            </div>
          )}

          {lensPackage && (
            <div className="summary-row">
              <span>{lensPackages.find(l => l.id === lensPackage).title}</span>
              <span>+₹{lensPackages.find(l => l.id === lensPackage).price}</span>
            </div>
          )}

          {getHighPowerSurcharge() > 0 && (
            <div className="summary-row" style={{ color: '#d32f2f' }}>
              <span>High Power Surcharge (&gt;&plusmn;6.00)</span>
              <span>+₹1000</span>
            </div>
          )}

          <div className="summary-row total">
            <span>Total Estimated Price</span>
            <span>₹{calculateTotal()}</span>
          </div>
          
          <p style={{ fontSize: 12, color: '#6E4B34', marginTop: 15, textAlign: 'center' }}>
            Final price may vary based on complex prescriptions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SelectLenses;

