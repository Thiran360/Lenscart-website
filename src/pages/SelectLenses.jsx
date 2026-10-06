import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { productsData } from "../data/products";
import { useCart } from "../context/CartContext";
import { FaCloudUploadAlt, FaCheckCircle, FaFileAlt, FaGlasses, FaStar } from "react-icons/fa";
import { SPH_OPTIONS, CYL_OPTIONS, AXIS_OPTIONS } from "../utils/rxOptions";
import { getPrescriptionsApi, getLocalPrescriptions, savePrescriptionApi } from "../services/profileService";
import PDMeasurementModal from "../components/PDMeasurementModal";
import { useToast } from "../context/ToastContext";
import "./SelectLenses.css";

const PD_OPTIONS = Array.from({ length: 22 }, (_, i) => 54 + i);
const DUAL_PD_OPTIONS = Array.from({ length: 25 }, (_, i) => (26 + i * 0.5).toFixed(1));

function SelectLenses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const product = location.state?.product || productsData.find(p => p.id === parseInt(id));
  const selectedColor = location.state?.selectedColor;
  // Extract action from URL query params (e.g., ?action=buy)
  const queryParams = new URLSearchParams(location.search);
  const action = queryParams.get("action") || "cart";

  const [step, setStep] = useState(1);
  const [lensType, setLensType] = useState(null);
  const [lensPackage, setLensPackage] = useState(null);
  const [rxMethod, setRxMethod] = useState(null);
  const [rxData, setRxData] = useState({ name: "", dob: { day: "", month: "", year: "" }, rightSph: "", rightCyl: "", rightAxis: "", leftSph: "", leftCyl: "", leftAxis: "" });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [selectedSavedRx, setSelectedSavedRx] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pdValue, setPdValue] = useState("");
  const [isPdModalOpen, setIsPdModalOpen] = useState(false);
  const [hasDualPd, setHasDualPd] = useState(false);
  const [rightPd, setRightPd] = useState("");
  const [leftPd, setLeftPd] = useState("");
  const [rxRating, setRxRating] = useState(0);
  const [rxRatingHover, setRxRatingHover] = useState(0);
  const [isAddingRx, setIsAddingRx] = useState(false);
  const [savingRx, setSavingRx] = useState(false);
  const [newRxFile, setNewRxFile] = useState(null);
  const [newRxData, setNewRxData] = useState({
    name: "", birthYear: "",
    rightSph: "", rightCyl: "", rightAxis: "",
    leftSph: "", leftCyl: "", leftAxis: ""
  });
  const fileInputRef = useRef(null);
  const newRxFileInputRef = useRef(null);

  useEffect(() => {
    const loadRx = async () => {
      try {
        const res = await getPrescriptionsApi(1, 10);
        const list = Array.isArray(res?.data) ? res.data : getLocalPrescriptions();
        setSavedPrescriptions(list);
        if (list.length > 0 && !rxMethod) {
          setRxMethod("saved");
          setSelectedSavedRx(list[0]);
        } else if (list.length === 0 && !rxMethod) {
          setRxMethod("upload");
        }
      } catch {
        const localList = getLocalPrescriptions();
        setSavedPrescriptions(localList);
        if (localList.length > 0 && !rxMethod) {
          setRxMethod("saved");
          setSelectedSavedRx(localList[0]);
        } else if (localList.length === 0 && !rxMethod) {
          setRxMethod("upload");
        }
      }
    };
    loadRx();
  }, []);

  const processFile = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          type: file.type,
          url: e.target.result
        });
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type,
        url: null
      });
    }
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

  const processNewRxFile = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewRxFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          type: file.type,
          url: e.target.result,
          originalFile: file
        });
      };
      reader.readAsDataURL(file);
    } else {
      setNewRxFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type,
        url: null,
        originalFile: file
      });
    }
  };

  const handleNewRxFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processNewRxFile(e.target.files[0]);
    }
  };

  const handleNewRxDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processNewRxFile(e.dataTransfer.files[0]);
    }
  };

  const handleSaveNewRx = async () => {
    if (savingRx) return;
    if (!newRxData.name.trim()) return toast.error("Please enter a Name.");
    if (!newRxData.birthYear) return toast.error("Please select a Birth Year.");
    if (!newRxData.rightSph || !newRxData.leftSph) return toast.error("Please enter SPH for both eyes.");
    if (isCylActive(newRxData.rightCyl) && !newRxData.rightAxis) return toast.error("Please enter AXIS for Right Eye.");
    if (isCylActive(newRxData.leftCyl) && !newRxData.leftAxis) return toast.error("Please enter AXIS for Left Eye.");

    setSavingRx(true);
    try {
      const payload = {
        name: newRxData.name.trim(),
        birth_year: parseInt(newRxData.birthYear, 10),
        right_sph: newRxData.rightSph || "0.00",
        right_cyl: newRxData.rightCyl || null,
        right_axis: newRxData.rightAxis || null,
        left_sph: newRxData.leftSph || "0.00",
        left_cyl: newRxData.leftCyl || null,
        left_axis: newRxData.leftAxis || null,
        image: null,
        file: newRxFile?.originalFile || null
      };
      await savePrescriptionApi(payload);
      const res = await getPrescriptionsApi(1, 10);
      const list = Array.isArray(res?.data) ? res.data : getLocalPrescriptions();
      setSavedPrescriptions(list);
      setSelectedSavedRx(list[0]);
      setIsAddingRx(false);
      setNewRxFile(null);
      setNewRxData({
        name: "", birthYear: "", rightSph: "", rightCyl: "", rightAxis: "", leftSph: "", leftCyl: "", leftAxis: ""
      });
      toast.success("Prescription saved successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save prescription.");
    } finally {
      setSavingRx(false);
    }
  };

  useEffect(() => {
    if (!product) {
      navigate("/products");
    }
  }, [product, navigate]);

  if (!product) return null;

  const lensTypes = [
    { id: "zero", title: "Zero Power", desc: "For computer & smartphone protection", price: 0 },
    { id: "single", title: "Single Vision", desc: "For distance or near vision", price: 0 },
    { id: "bifocal", title: "Bifocal / Progressive", desc: "For both distance & near vision", price: 500 },
  ];

  const lensPackages = [
    { id: "basic", title: "Basic Anti-Glare", desc: "Scratch resistant & anti-reflective", price: 500 },
    { id: "blu", title: "BLU Tech", desc: "Blocks harmful blue light from screens", price: 1000 },
    { id: "premium", title: "Premium Hydrophobic", desc: "Water & dust repellent, highly durable", price: 1500 },
  ];

  const getHighPowerSurcharge = () => {
    if (lensType === "zero") return 0;
    
    let rSph = 0, lSph = 0, rCyl = 0, lCyl = 0;
    if (rxMethod === "manual" || rxMethod === "upload") {
      rSph = parseFloat(rxData.rightSph) || 0;
      lSph = parseFloat(rxData.leftSph) || 0;
      rCyl = parseFloat(rxData.rightCyl) || 0;
      lCyl = parseFloat(rxData.leftCyl) || 0;
    } else if (rxMethod === "saved" && selectedSavedRx) {
      rSph = parseFloat(selectedSavedRx.right_sph) || 0;
      lSph = parseFloat(selectedSavedRx.left_sph) || 0;
      rCyl = parseFloat(selectedSavedRx.right_cyl) || 0;
      lCyl = parseFloat(selectedSavedRx.left_cyl) || 0;
    } else {
      return 0;
    }

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

  // Returns true only when a real (non-zero) CYL value is present
  const isCylActive = (cylVal) => cylVal && cylVal !== "0.00";

  const handleNext = async () => {
    if (step === 1 && lensType) setStep(2);
    else if (step === 2 && lensPackage) {
      // Zero Power needs no prescription — skip step 3
      if (lensType === "zero") {
        await submitSelection();
      } else {
        setStep(3);
      }
    }
    else if (step === 3 && rxMethod) {
      // Validate forms
      if (rxMethod === 'manual') {
        if (isCylActive(rxData.rightCyl) && !rxData.rightAxis) {
          alert("Please select AXIS for Right Eye — it is required when CYL is entered.");
          return;
        }
        if (isCylActive(rxData.leftCyl) && !rxData.leftAxis) {
          alert("Please select AXIS for Left Eye — it is required when CYL is entered.");
          return;
        }
      }
      
      if (rxMethod === 'manual' || rxMethod === 'upload') {
        if (!rxData.name.trim()) {
          alert('Please enter the patient name before continuing.');
          return;
        }
        if (!rxData.dob.year) {
          alert('Please select your Year of Birth before continuing.');
          return;
        }
      }
      if (rxMethod === 'upload' && !uploadedFile) {
        alert('Please upload a prescription file before continuing.');
        return;
      }
      if (rxMethod === 'saved' && isAddingRx) {
        if (!newRxData.name.trim() || !newRxData.birthYear) {
          alert('Please enter Name and Birth Year for the new prescription.');
          return;
        }
      }
      await submitSelection();
    }
  };

  const submitSelection = async () => {
    const selectedType = lensTypes.find((l) => l.id === lensType);
    const selectedPkg = lensPackages.find((l) => l.id === lensPackage);
    
    let prescriptionDetails = null;
    if (lensType !== "zero") {
      if (rxMethod === 'manual' || rxMethod === 'upload') {
        prescriptionDetails = {
          method: rxMethod,
          name: rxData.name.trim(),
          dob: rxData.dob,
          data: rxMethod === 'manual' ? rxData : { name: rxData.name.trim(), dob: rxData.dob },
          file: rxMethod === 'upload' ? uploadedFile : null
        };
        
        // Save to user profile automatically
        try {
          const payload = {
            name: rxData.name.trim(),
            birth_year: rxData.dob.year ? parseInt(rxData.dob.year, 10) : 2000,
            right_sph: rxData.rightSph || "0.00",
            right_cyl: rxData.rightCyl || null,
            right_axis: rxData.rightAxis || null,
            left_sph: rxData.leftSph || "0.00",
            left_cyl: rxData.leftCyl || null,
            left_axis: rxData.leftAxis || null,
            image: uploadedFile?.file || null,
            file: uploadedFile ? {
              name: uploadedFile.name,
              size: uploadedFile.size,
              url: uploadedFile.url
            } : null
          };
          await savePrescriptionApi(payload);
        } catch (err) {
          console.error("Failed to save prescription to profile", err);
        }
      } else if (rxMethod === 'saved') {
        if (isAddingRx) {
          // If user filled the new Rx form but didn't click "Save", save it now and use it
          try {
            const payload = {
              name: newRxData.name.trim(),
              birth_year: newRxData.birthYear ? parseInt(newRxData.birthYear, 10) : 2000,
              right_sph: newRxData.rightSph || "0.00",
              right_cyl: newRxData.rightCyl || null,
              right_axis: newRxData.rightAxis || null,
              left_sph: newRxData.leftSph || "0.00",
              left_cyl: newRxData.leftCyl || null,
              left_axis: newRxData.leftAxis || null,
              image: newRxFile?.file || null,
              file: newRxFile ? {
                name: newRxFile.name,
                size: newRxFile.size,
                url: newRxFile.url
              } : null
            };
            const response = await savePrescriptionApi(payload);
            const savedItem = response?.data || payload;
            
            prescriptionDetails = {
              method: 'saved',
              savedId: savedItem.id || Date.now(),
              data: {
                name: savedItem.name || payload.name,
                birthYear: savedItem.birth_year || payload.birth_year,
                rightSph: savedItem.right_sph || payload.right_sph,
                rightCyl: savedItem.right_cyl || payload.right_cyl,
                rightAxis: savedItem.right_axis || payload.right_axis,
                leftSph: savedItem.left_sph || payload.left_sph,
                leftCyl: savedItem.left_cyl || payload.left_cyl,
                leftAxis: savedItem.left_axis || payload.left_axis,
              },
              file: savedItem.file || payload.file || null
            };
          } catch (err) {
            console.error("Failed to save new prescription to profile on Add to Cart", err);
          }
        } else if (selectedSavedRx) {
          prescriptionDetails = {
            method: 'saved',
            savedId: selectedSavedRx.id,
            data: {
              name: selectedSavedRx.name,
              birthYear: selectedSavedRx.birth_year,
              rightSph: selectedSavedRx.right_sph,
              rightCyl: selectedSavedRx.right_cyl,
              rightAxis: selectedSavedRx.right_axis,
              leftSph: selectedSavedRx.left_sph,
              leftCyl: selectedSavedRx.left_cyl,
              leftAxis: selectedSavedRx.left_axis,
            },
            file: selectedSavedRx.file || null
          };
        }
      }
    }

    const finalProduct = {
      ...product,
      framePrice: product.price,
      price: calculateTotal(),
      lensDetails: {
        type: selectedType,
        package: selectedPkg,
        surcharge: getHighPowerSurcharge(),
        additionalPrice: selectedType.price + selectedPkg.price + getHighPowerSurcharge(),
        prescription: prescriptionDetails,
        pd: pdValue || "63"
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
            {lensType !== "zero" && (
              <span className={`step-pill ${step >= 3 ? 'active' : ''}`}>3. Prescription</span>
            )}
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
                  <button 
                    className={`rx-tab ${rxMethod === 'saved' ? 'active' : ''}`} 
                    onClick={() => setRxMethod('saved')}
                  >
                    Use Saved Prescription ({savedPrescriptions.length})
                  </button>
                  <button className={`rx-tab ${rxMethod === 'upload' ? 'active' : ''}`} onClick={() => setRxMethod('upload')}>Open Folder</button>
                  <button className={`rx-tab ${rxMethod === 'manual' ? 'active' : ''}`} onClick={() => setRxMethod('manual')}>Enter Manually</button>
                </div>

                {rxMethod === 'saved' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    {savedPrescriptions.length > 0 && (
                      savedPrescriptions.map((rx) => {
                        const isSelected = selectedSavedRx?.id === rx.id;
                        return (
                          <div 
                            key={rx.id} 
                            onClick={() => setSelectedSavedRx(rx)}
                            style={{
                              border: isSelected ? '2px solid #0D6B6D' : '1px solid #E2E8F0',
                              backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                              borderRadius: '12px',
                              padding: '16px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? '0 4px 14px rgba(13, 107, 109, 0.12)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '18px' }}>👓</span>
                                <div>
                                  <strong style={{ color: '#0F172A', fontSize: '15px' }}>{rx.name}</strong>
                                  {rx.birth_year && (
                                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748B' }}>
                                      (Born {rx.birth_year})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 600,
                                backgroundColor: isSelected ? '#0D6B6D' : '#E2E8F0',
                                color: isSelected ? '#FFFFFF' : '#475569'
                              }}>
                                {isSelected ? 'Selected' : 'Use This Rx'}
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px', background: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                              <div><strong>OD (Right):</strong> SPH: {rx.right_sph || '0.00'} | CYL: {rx.right_cyl || '-'} | AXIS: {rx.right_axis ? `${rx.right_axis}°` : '-'}</div>
                              <div><strong>OS (Left):</strong> SPH: {rx.left_sph || '0.00'} | CYL: {rx.left_cyl || '-'} | AXIS: {rx.left_axis ? `${rx.left_axis}°` : '-'}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    
                    {!isAddingRx && (
                      <button 
                        onClick={() => setIsAddingRx(true)}
                        style={{ width: '100%', padding: '14px', marginTop: '15px', borderRadius: '8px', border: '1px dashed #0D6B6D', background: '#F0FDFA', color: '#0D6B6D', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}
                      >
                        + Add New Prescription
                      </button>
                    )}

                    {isAddingRx && (
                      <div style={{ marginTop: '20px', padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ margin: '0 0 15px 0', color: '#0F172A', fontSize: '16px' }}>Add New Prescription</h4>
                        
                        <input 
                          type="file" 
                          ref={newRxFileInputRef} 
                          accept="image/*,.pdf" 
                          style={{ display: "none" }} 
                          onChange={handleNewRxFileChange} 
                        />

                        {!newRxFile ? (
                          <div 
                            onClick={() => newRxFileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleNewRxDrop}
                            style={{
                              border: isDragging ? "2px dashed #0D6B6D" : "2px dashed #E2E8F0",
                              backgroundColor: isDragging ? "#F0FDFA" : "#F8FAFC",
                              borderRadius: "8px",
                              padding: "20px",
                              textAlign: "center",
                              cursor: "pointer",
                              marginBottom: "20px",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <FaCloudUploadAlt size={32} color={isDragging ? "#0D6B6D" : "#94A3B8"} style={{ marginBottom: 8 }} />
                            <p style={{ margin: "0 0 4px 0", color: "#334155", fontWeight: 600, fontSize: 14 }}>
                              Upload Prescription Image (Optional)
                            </p>
                            <span style={{ fontSize: 12, color: "#64748B" }}>Supported formats: JPG, PNG, PDF</span>
                          </div>
                        ) : (
                          <div 
                            style={{
                              border: "1px solid #E2E8F0",
                              backgroundColor: "#F8FAFC",
                              borderRadius: "8px",
                              padding: "12px 16px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "20px"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              {newRxFile.url ? (
                                <img src={newRxFile.url} alt="Rx preview" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, border: "1px solid #E2E8F0" }} />
                              ) : (
                                <FaFileAlt size={24} color="#0D6B6D" />
                              )}
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#0F172A", fontSize: "13px" }}>
                                  <FaCheckCircle color="#10B981" size={14} /> {newRxFile.name}
                                </div>
                                <span style={{ fontSize: 11, color: "#64748B" }}>{newRxFile.size}</span>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setNewRxFile(null)}
                              style={{ background: "none", border: "1px solid #EF4444", color: "#EF4444", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontWeight: 600, fontSize: "11px" }}
                            >
                              Remove
                            </button>
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: 20 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Name * (Letters only)</label>
                            <input 
                              type="text" 
                              placeholder="e.g. John" 
                              value={newRxData.name} 
                              onChange={e => setNewRxData({...newRxData, name: e.target.value.replace(/[^a-zA-Z\s]/g, "")})} 
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Birth Year *</label>
                            <select 
                              value={newRxData.birthYear} 
                              onChange={e => setNewRxData({...newRxData, birthYear: e.target.value})}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff', boxSizing: 'border-box' }}
                            >
                              <option value="">Select Birth Year</option>
                              {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3A2415', marginBottom: '8px' }}>Right Eye (OD) *</label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <select value={newRxData.rightSph} onChange={e => setNewRxData({...newRxData, rightSph: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', backgroundColor: '#fff' }}>
                              <option value="">SPH *</option>
                              {SPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <select value={newRxData.rightCyl} onChange={e => setNewRxData({...newRxData, rightCyl: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', backgroundColor: '#fff' }}>
                              <option value="">CYL (Opt)</option>
                              {CYL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <select value={newRxData.rightAxis} onChange={e => setNewRxData({...newRxData, rightAxis: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', backgroundColor: '#fff' }}>
                              <option value="">AXIS (Opt)</option>
                              {AXIS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3A2415', marginBottom: '8px' }}>Left Eye (OS) *</label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <select value={newRxData.leftSph} onChange={e => setNewRxData({...newRxData, leftSph: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', backgroundColor: '#fff' }}>
                              <option value="">SPH *</option>
                              {SPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <select value={newRxData.leftCyl} onChange={e => setNewRxData({...newRxData, leftCyl: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', backgroundColor: '#fff' }}>
                              <option value="">CYL (Opt)</option>
                              {CYL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <select value={newRxData.leftAxis} onChange={e => setNewRxData({...newRxData, leftAxis: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', backgroundColor: '#fff' }}>
                              <option value="">AXIS (Opt)</option>
                              {AXIS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={handleSaveNewRx} 
                            disabled={savingRx}
                            style={{ flex: 1, padding: '12px', background: '#0D6B6D', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: savingRx ? 'not-allowed' : 'pointer' }}
                          >
                            {savingRx ? 'Saving...' : 'Save Prescription'}
                          </button>
                          <button 
                            onClick={() => setIsAddingRx(false)} 
                            disabled={savingRx}
                            style={{ padding: '12px 20px', background: '#fff', color: '#475569', border: '1px solid #ccc', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {rxMethod === 'upload' && (
                  <div className="rx-manual-form">
                    <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="rx-eye-section" style={{ margin: 0 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. John" 
                          value={rxData.name} 
                          onChange={e => setRxData({...rxData, name: e.target.value.replace(/[^a-zA-Z\s]/g, "")})} 
                          style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
                        />
                      </div>
                      <div className="rx-eye-section" style={{ margin: 0 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Year of Birth</label>
                        <select
                          value={rxData.dob.year}
                          onChange={e => setRxData({...rxData, dob: {...rxData.dob, year: e.target.value}})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', backgroundColor: '#fff' }}
                        >
                          <option value="">Select Year</option>
                          {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
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
                          padding: "35px 20px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <FaCloudUploadAlt size={48} color="#C5A059" style={{ marginBottom: 10 }} />
                        <p style={{ margin: "0 0 6px 0", color: "#3A2415", fontWeight: "bold", fontSize: 18 }}>
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
                          padding: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                          {uploadedFile.url ? (
                            <img src={uploadedFile.url} alt="Rx preview" style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc" }} />
                          ) : (
                            <FaFileAlt size={40} color="#C5A059" />
                          )}
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: "bold", color: "#3A2415", fontSize: 15 }}>
                              <FaCheckCircle color="#2e7d32" /> {uploadedFile.name}
                            </div>
                            <span style={{ fontSize: 13, color: "#6E4B34" }}>File Size: {uploadedFile.size}</span>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          style={{ background: "none", border: "1px solid #d32f2f", color: "#d32f2f", borderRadius: "6px", padding: "8px 14px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}
                        >
                          Remove File
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                )}

                {rxMethod === 'manual' && (
                  <div className="rx-manual-form">


                    <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="rx-eye-section" style={{ margin: 0 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. John" 
                          value={rxData.name} 
                          onChange={e => setRxData({...rxData, name: e.target.value.replace(/[^a-zA-Z\s]/g, "")})} 
                          style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
                        />
                      </div>
                      <div className="rx-eye-section" style={{ margin: 0 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Year of Birth</label>
                        <select
                          value={rxData.dob.year}
                          onChange={e => setRxData({...rxData, dob: {...rxData.dob, year: e.target.value}})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', backgroundColor: '#fff' }}
                        >
                          <option value="">Select Year</option>
                          {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="rx-eye-section">
                      <h4>Right Eye (OD)</h4>
                      <div className="rx-grid">
                        <select
                          value={rxData.rightSph}
                          onChange={e => setRxData({...rxData, rightSph: e.target.value})}
                          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '15px' }}
                        >
                          <option value="">SPH</option>
                          {SPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <select
                          value={rxData.rightCyl}
                          onChange={e => {
                            const val = e.target.value;
                            setRxData({...rxData, rightCyl: val, rightAxis: isCylActive(val) ? rxData.rightAxis : ''});
                          }}
                          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '15px' }}
                        >
                          <option value="">CYL (Optional)</option>
                          {CYL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <div>
                          <select
                            value={rxData.rightAxis}
                            disabled={!isCylActive(rxData.rightCyl)}
                            onChange={e => setRxData({...rxData, rightAxis: e.target.value})}
                            style={{
                              padding: '12px', borderRadius: '6px', fontSize: '15px', width: '100%',
                              backgroundColor: isCylActive(rxData.rightCyl) ? '#fff' : '#f5f5f5',
                              color: isCylActive(rxData.rightCyl) ? '#222' : '#aaa',
                              border: isCylActive(rxData.rightCyl) && !rxData.rightAxis ? '2px solid #e53935' : '1px solid #ccc',
                              cursor: isCylActive(rxData.rightCyl) ? 'pointer' : 'not-allowed',
                              opacity: isCylActive(rxData.rightCyl) ? 1 : 0.6,
                            }}
                          >
                            <option value="">{isCylActive(rxData.rightCyl) ? 'AXIS (Required)' : 'AXIS (Select CYL first)'}</option>
                            {AXIS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          {isCylActive(rxData.rightCyl) && !rxData.rightAxis && (
                            <p style={{ margin: '4px 0 0 2px', fontSize: '12px', color: '#e53935', fontWeight: 500 }}>⚠ AXIS is required when CYL is selected</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="rx-eye-section">
                      <h4>Left Eye (OS)</h4>
                      <div className="rx-grid">
                        <select
                          value={rxData.leftSph}
                          onChange={e => setRxData({...rxData, leftSph: e.target.value})}
                          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '15px' }}
                        >
                          <option value="">SPH</option>
                          {SPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <select
                          value={rxData.leftCyl}
                          onChange={e => {
                            const val = e.target.value;
                            setRxData({...rxData, leftCyl: val, leftAxis: isCylActive(val) ? rxData.leftAxis : ''});
                          }}
                          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '15px' }}
                        >
                          <option value="">CYL (Optional)</option>
                          {CYL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <div>
                          <select
                            value={rxData.leftAxis}
                            disabled={!isCylActive(rxData.leftCyl)}
                            onChange={e => setRxData({...rxData, leftAxis: e.target.value})}
                            style={{
                              padding: '12px', borderRadius: '6px', fontSize: '15px', width: '100%',
                              backgroundColor: isCylActive(rxData.leftCyl) ? '#fff' : '#f5f5f5',
                              color: isCylActive(rxData.leftCyl) ? '#222' : '#aaa',
                              border: isCylActive(rxData.leftCyl) && !rxData.leftAxis ? '2px solid #e53935' : '1px solid #ccc',
                              cursor: isCylActive(rxData.leftCyl) ? 'pointer' : 'not-allowed',
                              opacity: isCylActive(rxData.leftCyl) ? 1 : 0.6,
                            }}
                          >
                            <option value="">{isCylActive(rxData.leftCyl) ? 'AXIS (Required)' : 'AXIS (Select CYL first)'}</option>
                            {AXIS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          {isCylActive(rxData.leftCyl) && !rxData.leftAxis && (
                            <p style={{ margin: '4px 0 0 2px', fontSize: '12px', color: '#e53935', fontWeight: 500 }}>⚠ AXIS is required when CYL is selected</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Frame Info Card Moved Above PD ── */}
                    <div style={{
                      marginBottom: 24, marginTop: 24,
                      paddingTop: 16, borderTop: '1px solid #E2E8F0',
                      display: 'flex', flexDirection: 'column', gap: 10
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>👓</span>
                        <h4 style={{ margin: 0, fontSize: 15, color: '#334155' }}>Selected Frame: <span style={{ color: '#0F172A' }}>{product.name}</span></h4>
                        <span style={{ fontSize: 13, color: '#64748B' }}>(Model #{product.id})</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
                        {product.size && (
                          <span style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', borderRadius: 6, padding: '4px 10px', fontWeight: 500 }}>
                            Size: {product.size === 'S' ? 'Small' : product.size === 'M' ? 'Medium' : product.size === 'L' ? 'Large' : product.size}
                          </span>
                        )}
                        {product.shape && (
                          <span style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', borderRadius: 6, padding: '4px 10px', fontWeight: 500 }}>
                            Shape: {product.shape}
                          </span>
                        )}
                        {product.gender && (
                          <span style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', borderRadius: 6, padding: '4px 10px', fontWeight: 500 }}>
                            {product.gender}
                          </span>
                        )}
                        {(() => {
                          const colorObj = selectedColor || (product.colors && product.colors[0]);
                          const colorName = colorObj ? (typeof colorObj === 'object' ? (colorObj.name || colorObj.color) : colorObj) : null;
                          return colorName ? (
                            <span style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', borderRadius: 6, padding: '4px 10px', fontWeight: 500 }}>
                              Color: <span style={{ textTransform: 'capitalize' }}>{colorName}</span>
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {/* Compact PD section matching Screenshot 4 */}
                    <div className="pd-compact-section">
                      <div className="pd-compact-row">
                        <div className="pd-compact-label">
                          <span className="pd-compact-title">PD</span>
                          <span className="pd-compact-subtitle">Pupillary</span>
                          <span className="pd-compact-subtitle">Distance</span>
                        </div>

                        <div className="pd-compact-controls">
                          <div className="pd-compact-input-row">
                            <div className={`pd-compact-dropdown ${!pdValue ? "pd-has-error" : "pd-is-selected"}`}>
                              <select 
                                value={String(pdValue || "")} 
                                onChange={(e) => setPdValue(e.target.value)}
                                className="pd-compact-select"
                                aria-label="Pupillary Distance"
                              >
                                <option value="">Enter your PD</option>
                                {PD_OPTIONS.map((val) => (
                                  <option key={val} value={String(val)}>{val}</option>
                                ))}
                              </select>
                              <div className="pd-compact-chevron-box">
                                <span className="pd-compact-chevron">▾</span>
                              </div>
                            </div>

                            <button 
                              type="button" 
                              className="pd-compact-help-link"
                              onClick={() => setIsPdModalOpen(true)}
                            >
                              Help me find my PD
                            </button>
                          </div>

                          {!pdValue ? (
                            <div className="pd-compact-warning">
                              We couldn't find a PD value. Please enter your PD.
                            </div>
                          ) : (
                            <div className="pd-compact-success">
                              ✓ PD Selected: {pdValue} mm
                            </div>
                          )}


                        </div>
                      </div>
                    </div>

                    {/* Removed Star Rating section */}
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
                  (step === 3 && rxMethod === 'upload' && !uploadedFile) ||
                  (step === 3 && rxMethod === 'saved' && !selectedSavedRx)
                }
              >
                {step === 3 ? (action === "buy" ? "Proceed to Checkout" : "Add to Cart") : "Continue to Next Step"}
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
              <h3>{product.name}</h3>
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

          {pdValue && (
            <div className="summary-row">
              <span>Pupillary Distance (PD)</span>
              <span>{pdValue} mm</span>
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

      {/* Zenni-style Pupillary Distance Measurement Modal */}
      <PDMeasurementModal 
        isOpen={isPdModalOpen}
        onClose={() => setIsPdModalOpen(false)}
        onSelectPD={(pd) => {
          setPdValue(pd.toString());
          setHasDualPd(false);
        }}
      />

      <Footer />
    </div>
  );
}

export default SelectLenses;

