import { useState, useEffect, useRef } from "react";
import { FaCloudUploadAlt, FaFileAlt, FaCheckCircle, FaTrashAlt, FaPlus } from "react-icons/fa";
import { SPH_OPTIONS, CYL_OPTIONS, AXIS_OPTIONS } from "../utils/rxOptions";
import { getPrescriptionsApi, savePrescriptionApi, deletePrescriptionApi } from "../services/profileService";
import ConfirmModal from "./ConfirmModal";
import Pagination from "./Pagination";
import { useToast } from "../context/ToastContext";

function PrescriptionManager() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Server-side Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(2); // Backend returns 2 items per page

  // Confirm delete modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    rxId: null,
    rxName: "",
    loading: false
  });

  const [rxData, setRxData] = useState({
    name: "",
    birthYear: "",
    rightSph: "", rightCyl: "", rightAxis: "",
    leftSph: "", leftCyl: "", leftAxis: ""
  });

  // Fetch prescriptions from API with server-side page number
  const fetchPrescriptions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getPrescriptionsApi(page);
      let rxList = [];
      let count = 0;

      if (Array.isArray(response?.data)) {
        rxList = response.data;
        count = typeof response.count === "number" ? response.count : rxList.length;
      } else if (Array.isArray(response?.results)) {
        rxList = response.results;
        count = typeof response.count === "number" ? response.count : rxList.length;
      } else if (Array.isArray(response)) {
        rxList = response;
        count = rxList.length;
      } else if (Array.isArray(response?.prescriptions)) {
        rxList = response.prescriptions;
        count = typeof response.count === "number" ? response.count : rxList.length;
      }

      // Detect page size (backend delivers 2 items per page)
      const detectedPageSize = response?.page_size || response?.per_page || response?.limit || 2;
      const computedPages = response?.total_pages || response?.totalPages || response?.num_pages || Math.max(1, Math.ceil(count / detectedPageSize));

      setPrescriptions(rxList);
      setTotalCount(count);
      setPageSize(detectedPageSize);
      setTotalPages(computedPages);
      setCurrentPage(typeof response?.page === "number" ? response.page : page);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
      setPrescriptions([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions(1);
  }, []);

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
    rxData.birthYear &&
    (uploadedFile || (
      rxData.rightSph?.trim() &&
      rxData.leftSph?.trim()
    ))
  );

  // Save Prescription to API
  const handleSave = async () => {
    if (!isRxValid || saving) return;
    setSaving(true);

    try {
      const payload = {
        name: rxData.name.trim(),
        birth_year: rxData.birthYear ? parseInt(rxData.birthYear, 10) : null,
        right_sph: rxData.rightSph || null,
        right_cyl: rxData.rightCyl || null,
        right_axis: rxData.rightAxis || null,
        left_sph: rxData.leftSph || null,
        left_cyl: rxData.leftCyl || null,
        left_axis: rxData.leftAxis || null
      };

      await savePrescriptionApi(payload);

      setIsAdding(false);
      setUploadedFile(null);
      setRxData({
        name: "",
        birthYear: "",
        rightSph: "",
        rightCyl: "",
        rightAxis: "",
        leftSph: "",
        leftCyl: "",
        leftAxis: ""
      });

      // Re-fetch prescriptions list on page 1
      await fetchPrescriptions(1);
      toast.success("Prescription saved successfully!");
    } catch (err) {
      console.error("Failed to save prescription:", err);
      toast.error(err.message || "Failed to save prescription. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Open delete confirm modal
  const handleDeleteClick = (rx) => {
    setConfirmModal({
      show: true,
      rxId: rx.id,
      rxName: rx.name || "this prescription",
      loading: false
    });
  };

  // Confirm delete via API
  const handleConfirmDelete = async () => {
    const { rxId } = confirmModal;
    if (!rxId) return;

    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      await deletePrescriptionApi(rxId);
      await fetchPrescriptions(currentPage);
      setConfirmModal({ show: false, rxId: null, rxName: "", loading: false });
      toast.success("Prescription deleted successfully!");
    } catch (err) {
      console.error("Failed to delete prescription:", err);
      toast.error(err.message || "Failed to delete prescription. Please try again.");
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchPrescriptions(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="dash-header-wrap">
        <div>
          <h1 className="dash-header">My Prescriptions</h1>
          <p className="dash-header-subtitle">Save and manage vision power details for personalized lens crafting.</p>
        </div>
        {!isAdding && prescriptions.length > 0 && (
          <button className="btn-add-another" onClick={() => setIsAdding(true)}>
            <FaPlus size={13} /> Add Prescription
          </button>
        )}
      </div>

      {loading ? (
        <div className="skeleton-wrapper">
          <div className="skeleton-order-card skeleton-shimmer" style={{ height: '180px' }}></div>
          <div className="skeleton-order-card skeleton-shimmer" style={{ height: '180px' }}></div>
        </div>
      ) : prescriptions.length === 0 && !isAdding ? (
        <div className="empty-address-box">
          <FaGlasses size={48} color="#0D6B6D" style={{ marginBottom: '15px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '18px', fontWeight: '700' }}>No Prescriptions Saved</h3>
          <p style={{ color: '#64748B', marginBottom: '22px', fontSize: '14px' }}>Save your vision prescription details to quickly order custom lenses anytime.</p>
          <button className="btn-add-another" onClick={() => setIsAdding(true)} style={{ margin: '0 auto' }}>
            <FaPlus size={14} /> Add New Prescription
          </button>
        </div>
      ) : null}

      {!loading && prescriptions.length > 0 && !isAdding && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {prescriptions.map((rx) => {
              const rxName = rx.name;
              const birthYear = rx.birth_year || rx.birthYear;
              const rightSph = rx.right_sph || rx.rightSph;
              const rightCyl = rx.right_cyl || rx.rightCyl;
              const rightAxis = rx.right_axis || rx.rightAxis;
              const leftSph = rx.left_sph || rx.leftSph;
              const leftCyl = rx.left_cyl || rx.leftCyl;
              const leftAxis = rx.left_axis || rx.leftAxis;

              return (
                <div key={rx.id} className="rx-card-item">
                  <div className="rx-card-header">
                    <div className="rx-user-info">
                      <span className="rx-icon-badge">👓</span>
                      <div>
                        <h3 className="rx-name">{rxName}</h3>
                        <span className="rx-subtitle">Saved Vision Record</span>
                      </div>
                    </div>
                    {birthYear && (
                      <span className="rx-birth-badge">
                        Birth Year: <strong>{birthYear}</strong>
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
                          <td><span className="rx-val-chip">{rightSph || '-'}</span></td>
                          <td><span className="rx-val-chip">{rightCyl || '-'}</span></td>
                          <td><span className="rx-val-chip">{rightAxis ? `${rightAxis}°` : '-'}</span></td>
                        </tr>
                        <tr>
                          <td className="eye-col">Left (OS)</td>
                          <td><span className="rx-val-chip">{leftSph || '-'}</span></td>
                          <td><span className="rx-val-chip">{leftCyl || '-'}</span></td>
                          <td><span className="rx-val-chip">{leftAxis ? `${leftAxis}°` : '-'}</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="rx-card-footer">
                    <button 
                      onClick={() => handleDeleteClick(rx)}
                      className="rx-delete-btn"
                    >
                      <FaTrashAlt size={13} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reusable Server-side Pagination Component */}
          <Pagination
            totalItems={totalCount}
            totalPages={totalPages}
            itemsPerPage={pageSize}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {isAdding && (
        <div className="rx-card">
          <h3 style={{ marginTop: 0, color: '#3A2415', fontFamily: "'Playfair Display', serif" }}>Add Vision Prescription</h3>
          
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
                padding: "24px 20px",
                textAlign: "center",
                cursor: "pointer",
                marginBottom: "20px",
                transition: "all 0.2s ease"
              }}
            >
              <FaCloudUploadAlt size={38} color="#C5A059" style={{ marginBottom: 6 }} />
              <p style={{ margin: "0 0 4px 0", color: "#3A2415", fontWeight: "bold", fontSize: 15 }}>
                Click to Upload or Drag & Drop Prescription (Optional)
              </p>
              <span style={{ fontSize: 12.5, color: "#6E4B34" }}>Supported formats: JPG, PNG, PDF</span>
            </div>
          ) : (
            <div 
              style={{
                border: "1px solid #C5A059",
                backgroundColor: "#F4EDE2",
                borderRadius: "12px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {uploadedFile.url ? (
                  <img src={uploadedFile.url} alt="Rx preview" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc" }} />
                ) : (
                  <FaFileAlt size={28} color="#C5A059" />
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: "bold", color: "#3A2415", fontSize: "14px" }}>
                    <FaCheckCircle color="#2e7d32" /> {uploadedFile.name}
                  </div>
                  <span style={{ fontSize: 12, color: "#6E4B34" }}>File Size: {uploadedFile.size}</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setUploadedFile(null)}
                style={{ background: "none", border: "1px solid #d32f2f", color: "#d32f2f", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
              >
                Remove File
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: 20 }}>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600, color: '#3A2415', fontSize: '13.5px' }}>Name * (Letters only)</label>
              <input 
                type="text" 
                placeholder="e.g. John" 
                value={rxData.name} 
                onChange={e => setRxData({...rxData, name: e.target.value.replace(/[^a-zA-Z\s]/g, "")})} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2D7C5', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600, color: '#3A2415', fontSize: '13.5px' }}>Birth Year *</label>
              <select 
                value={rxData.birthYear} 
                onChange={e => setRxData({...rxData, birthYear: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2D7C5', fontSize: '14px', backgroundColor: '#fff', boxSizing: 'border-box' }}
              >
                <option value="">Select Birth Year</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <h4 style={{ color: '#3A2415', marginBottom: 8, fontSize: '15px' }}>Right Eye (OD) *</h4>
          <div className="rx-form-grid">
            <div className="rx-form-group">
              <label style={{ fontWeight: 600, fontSize: '13px' }}>SPH *</label>
              <select 
                value={rxData.rightSph} 
                onChange={e => setRxData({...rxData, rightSph: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2D7C5', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="">Select SPH</option>
                {SPH_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600, fontSize: '13px' }}>CYL (Optional)</label>
              <select 
                value={rxData.rightCyl} 
                onChange={e => setRxData({...rxData, rightCyl: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2D7C5', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="">Select CYL</option>
                {CYL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600, fontSize: '13px' }}>AXIS (Optional)</label>
              <select 
                value={rxData.rightAxis} 
                onChange={e => setRxData({...rxData, rightAxis: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2D7C5', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="">Select AXIS</option>
                {AXIS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <h4 style={{ color: '#3A2415', marginBottom: 8, fontSize: '15px', marginTop: 16 }}>Left Eye (OS) *</h4>
          <div className="rx-form-grid">
            <div className="rx-form-group">
              <label style={{ fontWeight: 600, fontSize: '13px' }}>SPH *</label>
              <select 
                value={rxData.leftSph} 
                onChange={e => setRxData({...rxData, leftSph: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2D7C5', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="">Select SPH</option>
                {SPH_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600, fontSize: '13px' }}>CYL (Optional)</label>
              <select 
                value={rxData.leftCyl} 
                onChange={e => setRxData({...rxData, leftCyl: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2D7C5', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="">Select CYL</option>
                {CYL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="rx-form-group">
              <label style={{ fontWeight: 600, fontSize: '13px' }}>AXIS (Optional)</label>
              <select 
                value={rxData.leftAxis} 
                onChange={e => setRxData({...rxData, leftAxis: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2D7C5', fontSize: '14px', backgroundColor: '#fff' }}
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
                className="profile-submit-btn" 
                onClick={handleSave} 
                disabled={!isRxValid || saving}
                style={{ marginTop: 0 }}
              >
                {saving ? "Saving..." : "Save Prescription"}
              </button>
              <button className="btn-outline-action" onClick={() => setIsAdding(false)} disabled={saving} style={{ padding: '12px 22px' }}>
                Cancel
              </button>
            </div>
            {!isRxValid && (
              <span style={{ fontSize: 13, color: '#64748B', fontStyle: 'italic', marginTop: 4 }}>
                * Name, Birth Year, and SPH (OD & OS) values are required (CYL & AXIS are optional).
              </span>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={confirmModal.show}
        title="Delete Prescription?"
        message={`Are you sure you want to delete the vision prescription for "${confirmModal.rxName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ show: false, rxId: null, rxName: "", loading: false })}
        loading={confirmModal.loading}
        variant="danger"
      />
    </div>
  );
}

export default PrescriptionManager;
