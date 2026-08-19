import { useState, useRef } from "react";
import { FaCloudUploadAlt, FaFileAlt, FaCheckCircle, FaTrashAlt, FaPlus } from "react-icons/fa";
import { SPH_OPTIONS, CYL_OPTIONS, AXIS_OPTIONS } from "../utils/rxOptions";

function PrescriptionManager() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [rxData, setRxData] = useState({
    name: "",
    birthYear: "",
    rightSph: "", rightCyl: "", rightAxis: "",
    leftSph: "", leftCyl: "", leftAxis: ""
  });

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

  const isRxValid = Boolean(
    rxData.name?.trim() &&
    rxData.birthYear?.trim() &&
    (uploadedFile || (
      rxData.rightSph?.trim() &&
      rxData.rightCyl?.trim() &&
      rxData.rightAxis?.trim() &&
      rxData.leftSph?.trim() &&
      rxData.leftCyl?.trim() &&
      rxData.leftAxis?.trim()
    ))
  );

  const handleSave = () => {
    if (!isRxValid) return;
    setPrescriptions([...prescriptions, { ...rxData, file: uploadedFile, id: Date.now() }]);
    setIsAdding(false);
    setUploadedFile(null);
    setRxData({ name: "", birthYear: "", rightSph: "", rightCyl: "", rightAxis: "", leftSph: "", leftCyl: "", leftAxis: "" });
  };

  return (
    <div>
      <h2 className="dash-header">My Prescriptions</h2>

      {prescriptions.length === 0 && !isAdding && (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2D7C5' }}>
          <img src="https://cdn-icons-png.flaticon.com/512/2983/2983057.png" alt="Rx" style={{ width: 70, opacity: 0.6, marginBottom: 15 }} />
          <h3 style={{ color: '#3A2415', margin: '0 0 8px 0', fontFamily: "'Playfair Display', serif" }}>No Prescriptions Saved</h3>
          <p style={{ color: '#8C6E54', marginBottom: 25, fontSize: '14.5px' }}>Save your vision prescription details to quickly order custom lenses anytime.</p>
          <button className="btn-add-another" onClick={() => setIsAdding(true)}>
            <FaPlus size={14} /> Add New Prescription
          </button>
        </div>
      )}

      {prescriptions.length > 0 && !isAdding && (
        <>
          {prescriptions.map(rx => (
            <div key={rx.id} className="rx-card-item">
              <div className="rx-card-header">
                <div className="rx-user-info">
                  <span className="rx-icon-badge">👓</span>
                  <div>
                    <h3 className="rx-name">{rx.name}</h3>
                    <span className="rx-subtitle">Saved Vision Record</span>
                  </div>
                </div>
                {rx.birthYear && (
                  <span className="rx-birth-badge">
                    Birth Year: <strong>{rx.birthYear}</strong>
                  </span>
                )}
              </div>

              {rx.file && (
                <div className="rx-file-banner">
                  {rx.file.url ? (
                    <img src={rx.file.url} alt="Rx Document" className="rx-file-thumb" />
                  ) : (
                    <FaFileAlt size={30} color="#C5A059" />
                  )}
                  <div className="rx-file-info">
                    <strong className="rx-file-title">📄 {rx.file.name}</strong>
                    <span className="rx-file-size">Uploaded Document ({rx.file.size})</span>
                  </div>
                </div>
              )}

              <div className="rx-table-container">
                <table className="rx-details-table">
                  <thead>
                    <tr>
                      <th>Eye</th>
                      <th>SPH</th>
                      <th>CYL</th>
                      <th>AXIS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="eye-col">Right (OD)</td>
                      <td><span className="rx-val-chip">{rx.rightSph || '-'}</span></td>
                      <td><span className="rx-val-chip">{rx.rightCyl || '-'}</span></td>
                      <td><span className="rx-val-chip">{rx.rightAxis ? `${rx.rightAxis}°` : '-'}</span></td>
                    </tr>
                    <tr>
                      <td className="eye-col">Left (OS)</td>
                      <td><span className="rx-val-chip">{rx.leftSph || '-'}</span></td>
                      <td><span className="rx-val-chip">{rx.leftCyl || '-'}</span></td>
                      <td><span className="rx-val-chip">{rx.leftAxis ? `${rx.leftAxis}°` : '-'}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rx-card-footer">
                <button 
                  onClick={() => setPrescriptions(prescriptions.filter(p => p.id !== rx.id))}
                  className="rx-delete-btn"
                >
                  <FaTrashAlt size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 20 }}>
            <button className="btn-add-another" onClick={() => setIsAdding(true)}>
              <FaPlus size={14} /> Add Another Prescription
            </button>
          </div>
        </>
      )}

      {isAdding && (
        <div className="rx-card">
          <h3 style={{ marginTop: 0, color: '#3A2415' }}>Add Prescription</h3>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*,.pdf" 
            style={{ display: "none" }} 
            onChange={handleFileChange} 
          />

          {!uploadedFile ? (
            <div 
              className="upload-area" 
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
                marginBottom: "20px",
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
                backgroundColor: "#F4EDE2",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {uploadedFile.url ? (
                  <img src={uploadedFile.url} alt="Rx preview" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc" }} />
                ) : (
                  <FaFileAlt size={32} color="#C5A059" />
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: "bold", color: "#3A2415" }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: 20 }}>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600 }}>Name * (Letters only)</label>
              <input type="text" placeholder="e.g. John" value={rxData.name} onChange={e => setRxData({...rxData, name: e.target.value.replace(/[^a-zA-Z\s]/g, "")})} />
            </div>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600 }}>Birth Year *</label>
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

          <h4 style={{ color: '#3A2415', marginBottom: 8 }}>Right Eye (OD) *</h4>
          <div className="rx-form-grid">
            <div className="rx-form-group">
              <label style={{ fontWeight: 600 }}>SPH *</label>
              <select 
                value={rxData.rightSph} 
                onChange={e => setRxData({...rxData, rightSph: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="">Select SPH</option>
                {SPH_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600 }}>CYL *</label>
              <select 
                value={rxData.rightCyl} 
                onChange={e => setRxData({...rxData, rightCyl: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="">Select CYL</option>
                {CYL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600 }}>AXIS *</label>
              <select 
                value={rxData.rightAxis} 
                onChange={e => setRxData({...rxData, rightAxis: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="">Select AXIS</option>
                {AXIS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <h4 style={{ color: '#3A2415', marginBottom: 8 }}>Left Eye (OS) *</h4>
          <div className="rx-form-grid">
            <div className="rx-form-group">
              <label style={{ fontWeight: 600 }}>SPH *</label>
              <select 
                value={rxData.leftSph} 
                onChange={e => setRxData({...rxData, leftSph: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="">Select SPH</option>
                {SPH_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600 }}>CYL *</label>
              <select 
                value={rxData.leftCyl} 
                onChange={e => setRxData({...rxData, leftCyl: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="">Select CYL</option>
                {CYL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600 }}>AXIS *</label>
              <select 
                value={rxData.leftAxis} 
                onChange={e => setRxData({...rxData, leftAxis: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="">Select AXIS</option>
                {AXIS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 25 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                className="btn-primary" 
                onClick={handleSave} 
                disabled={!isRxValid}
                style={{
                  background: isRxValid ? '#C5A059' : '#D9C8A9',
                  color: '#ffffff',
                  cursor: isRxValid ? 'pointer' : 'not-allowed',
                  opacity: isRxValid ? 1 : 0.6,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '15px'
                }}
              >
                Save Prescription
              </button>
              <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
            </div>
            {!isRxValid && (
              <span style={{ fontSize: 13, color: '#A07844', fontStyle: 'italic', marginTop: 4 }}>
                * All fields (Name, Birth Year, OD & OS SPH/CYL/AXIS) are required to enable Save button.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionManager;


