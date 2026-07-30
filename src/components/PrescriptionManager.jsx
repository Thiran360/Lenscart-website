import { useState } from "react";

function PrescriptionManager() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const [rxData, setRxData] = useState({
    name: "",
    rightSph: "", rightCyl: "", rightAxis: "",
    leftSph: "", leftCyl: "", leftAxis: ""
  });

  const handleSave = () => {
    if (!rxData.name) {
      alert("Please enter a name for this prescription (e.g., 'My Glasses')");
      return;
    }
    setPrescriptions([...prescriptions, { ...rxData, id: Date.now() }]);
    setIsAdding(false);
    setRxData({ name: "", rightSph: "", rightCyl: "", rightAxis: "", leftSph: "", leftCyl: "", leftAxis: "" });
  };

  return (
    <div>
      <h2 className="dash-header">My Prescriptions</h2>

      {prescriptions.length === 0 && !isAdding && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <img src="https://cdn-icons-png.flaticon.com/512/2983/2983057.png" alt="Rx" style={{ width: 60, opacity: 0.5, marginBottom: 15 }} />
          <p style={{ color: '#6E4B34', marginBottom: 20 }}>You haven't saved any prescriptions yet.</p>
          <button className="btn-primary" onClick={() => setIsAdding(true)}>+ Add New Prescription</button>
        </div>
      )}

      {prescriptions.length > 0 && !isAdding && (
        <>
          {prescriptions.map(rx => (
            <div key={rx.id} className="rx-card">
              <h3 style={{ marginTop: 0, color: '#3A2415' }}>{rx.name}</h3>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '8px 0' }}>Eye</th>
                    <th>SPH</th>
                    <th>CYL</th>
                    <th>AXIS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0' }}><strong>Right (OD)</strong></td>
                    <td>{rx.rightSph || '-'}</td>
                    <td>{rx.rightCyl || '-'}</td>
                    <td>{rx.rightAxis || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0' }}><strong>Left (OS)</strong></td>
                    <td>{rx.leftSph || '-'}</td>
                    <td>{rx.leftCyl || '-'}</td>
                    <td>{rx.leftAxis || '-'}</td>
                  </tr>
                </tbody>
              </table>
              <button 
                onClick={() => setPrescriptions(prescriptions.filter(p => p.id !== rx.id))}
                style={{ color: 'red', background: 'none', border: 'none', marginTop: 15, cursor: 'pointer', fontWeight: 'bold' }}
              >
                Delete
              </button>
            </div>
          ))}
          <button className="btn-secondary" onClick={() => setIsAdding(true)}>+ Add Another</button>
        </>
      )}

      {isAdding && (
        <div className="rx-card">
          <h3 style={{ marginTop: 0 }}>Add Prescription</h3>
          
          <div className="upload-area" onClick={() => alert("File picker dialog would open here!")}>
            <p style={{ margin: 0, color: '#C9A66B', fontWeight: 'bold' }}>📷 Click to Upload Prescription Image/PDF</p>
            <span style={{ fontSize: 12, color: '#6E4B34' }}>or enter manually below</span>
          </div>

          <div className="rx-form-group" style={{ marginBottom: 20 }}>
            <label>Prescription Name</label>
            <input type="text" placeholder="e.g. John's Reading Glasses" value={rxData.name} onChange={e => setRxData({...rxData, name: e.target.value})} />
          </div>

          <h4>Right Eye (OD)</h4>
          <div className="rx-form-grid">
            <div className="rx-form-group">
              <label>SPH</label>
              <input type="text" placeholder="-1.00" value={rxData.rightSph} onChange={e => setRxData({...rxData, rightSph: e.target.value})} />
            </div>
            <div className="rx-form-group">
              <label>CYL</label>
              <input type="text" placeholder="-0.50" value={rxData.rightCyl} onChange={e => setRxData({...rxData, rightCyl: e.target.value})} />
            </div>
            <div className="rx-form-group">
              <label>AXIS</label>
              <input type="text" placeholder="180" value={rxData.rightAxis} onChange={e => setRxData({...rxData, rightAxis: e.target.value})} />
            </div>
          </div>

          <h4>Left Eye (OS)</h4>
          <div className="rx-form-grid">
            <div className="rx-form-group">
              <label>SPH</label>
              <input type="text" placeholder="-1.25" value={rxData.leftSph} onChange={e => setRxData({...rxData, leftSph: e.target.value})} />
            </div>
            <div className="rx-form-group">
              <label>CYL</label>
              <input type="text" placeholder="-0.75" value={rxData.leftCyl} onChange={e => setRxData({...rxData, leftCyl: e.target.value})} />
            </div>
            <div className="rx-form-group">
              <label>AXIS</label>
              <input type="text" placeholder="170" value={rxData.leftAxis} onChange={e => setRxData({...rxData, leftAxis: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn-primary" onClick={handleSave}>Save Prescription</button>
            <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionManager;


