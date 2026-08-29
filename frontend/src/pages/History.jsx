import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function History() {
  const [history, setHistory] = useState([
    {
      id: 1,
      display_date: '17 Aug 2026',
      display_time: '10:30 PM',
      skin_type: 'Combination',
      overall_condition: 'Mild T-Zone Sebum & Healthy Texture',
      overall_score: 91.5,
    },
    {
      id: 2,
      display_date: '14 Aug 2026',
      display_time: '04:15 PM',
      skin_type: 'Oily',
      overall_condition: 'Excess Sebum on Forehead',
      overall_score: 88.5,
    },
  ]);

  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [scanAId, setScanAId] = useState(1);
  const [scanBId, setScanBId] = useState(2);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/history');
        if (res.data && res.data.history) {
          setHistory(res.data.history);
          if (res.data.history.length > 0) setScanAId(res.data.history[0].id);
          if (res.data.history.length > 1) setScanBId(res.data.history[1].id);
        }
      } catch (err) {}
    };
    fetchHistory();
  }, []);

  const scanA = history.find((s) => s.id === scanAId) || history[0];
  const scanB = history.find((s) => s.id === scanBId) || (history[1] || history[0]);

  return (
    <section className="history-section">
      <div className="container">
        {/* Heading */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
          <div>
            <span className="hero-tag">Historical Progression</span>
            <h1 className="history-title mb-1">Your Previous Skin Scans</h1>
            <p className="history-text mb-0">
              Review your computer vision assessments over time and monitor improvements in your skin barrier.
            </p>
          </div>
          {history && history.length > 1 && (
            <button
              className="hero-btn-outline"
              onClick={() => setCompareModalOpen(true)}
            >
              <i className="fa-solid fa-code-compare me-2"></i> Compare Scans
            </button>
          )}
        </div>

        <div
          className="history-card p-4 p-md-5 shadow-sm mb-5"
          style={{ borderRadius: '20px', background: '#fff', border: '1px solid var(--border)' }}
        >
          {history && history.length > 0 ? (
            <div className="table-responsive">
              <table className="table history-table align-middle">
                <thead>
                  <tr>
                    <th>Scan Date</th>
                    <th>Detected Skin Type</th>
                    <th>Clinical Condition</th>
                    <th>Health Score</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => {
                    const score = Math.round(item.overall_score || 88);
                    const scoreColor = score >= 80 ? '#2b7a4b' : score >= 65 ? '#b78103' : '#dc3545';
                    return (
                      <tr key={item.id}>
                        <td className="fw-semibold">
                          <i className="fa-regular fa-calendar me-2 text-muted"></i>
                          {item.display_date}
                          {item.display_time && <span className="text-muted small d-block">{item.display_time}</span>}
                        </td>
                        <td>
                          <span
                            className="badge px-3 py-2"
                            style={{
                              background: 'rgba(112, 123, 87, 0.12)',
                              color: 'var(--green-dark)',
                              fontSize: '0.85rem',
                              borderRadius: '20px',
                            }}
                          >
                            {item.skin_type}
                          </span>
                        </td>
                        <td>{item.overall_condition || 'Healthy'}</td>
                        <td>
                          <span className="fw-bold" style={{ color: scoreColor }}>
                            {score}%
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                            <i className="fa-solid fa-check-circle me-1"></i> Completed
                          </span>
                        </td>
                        <td className="text-end">
                          <Link
                            to={`/result?id=${item.id}`}
                            className="table-action-btn"
                          >
                            <i className="fa-regular fa-eye me-1"></i> View Report
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-3 text-muted" style={{ fontSize: '48px' }}>
                <i className="fa-solid fa-clipboard-question"></i>
              </div>
              <h4 className="fw-bold text-muted">No Skin Scans Recorded Yet</h4>
              <p className="text-muted small">Perform your first AI skin scan to start building your diagnostic history.</p>
              <Link to="/scanner" className="hero-btn mt-3">
                <i className="fa-solid fa-camera me-2"></i>
                Start First Scan
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-4 d-flex justify-content-center gap-3">
          <Link to="/scanner" className="hero-btn">
            <i className="fa-solid fa-camera me-2"></i>
            Scan Again
          </Link>
          <Link to="/dashboard" className="hero-btn-outline">
            <i className="fa-solid fa-chart-pie me-1"></i> Dashboard
          </Link>
        </div>
      </div>

      {/* SCAN COMPARISON MODAL */}
      {compareModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '20px', border: '1px solid var(--border)' }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h4 className="modal-title fw-bold" style={{ color: 'var(--green-dark)' }}>
                  <i className="fa-solid fa-code-compare me-2"></i> Compare Historical Scans
                </h4>
                <button type="button" className="btn-close" onClick={() => setCompareModalOpen(false)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="small text-muted mb-4">
                  Select any two previous scans to evaluate your barrier score and characteristic shifts.
                </p>

                <div className="row g-4 mb-4">
                  {/* Baseline Scan (Scan A) */}
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Baseline Scan (Before)</label>
                    <select
                      className="form-select custom-input mb-3"
                      value={scanAId}
                      onChange={(e) => setScanAId(parseInt(e.target.value))}
                    >
                      {history.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.display_date} - {item.skin_type} ({Math.round(item.overall_score || 88)}%)
                        </option>
                      ))}
                    </select>
                    {scanA && (
                      <div className="card p-3 bg-light border-0" style={{ borderRadius: '14px' }}>
                        <h5 className="fw-bold text-success mb-1">{scanA.skin_type}</h5>
                        <span className="small text-muted mb-2 d-block">
                          Health Score: <strong>{Math.round(scanA.overall_score || 88)}%</strong>
                        </span>
                        <span className="small text-muted d-block">
                          Condition: <strong>{scanA.overall_condition || 'Healthy'}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Comparison Scan (Scan B) */}
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Recent Scan (After)</label>
                    <select
                      className="form-select custom-input mb-3"
                      value={scanBId}
                      onChange={(e) => setScanBId(parseInt(e.target.value))}
                    >
                      {history.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.display_date} - {item.skin_type} ({Math.round(item.overall_score || 88)}%)
                        </option>
                      ))}
                    </select>
                    {scanB && (
                      <div className="card p-3 bg-light border-0" style={{ borderRadius: '14px' }}>
                        <h5 className="fw-bold text-success mb-1">{scanB.skin_type}</h5>
                        <span className="small text-muted mb-2 d-block">
                          Health Score: <strong>{Math.round(scanB.overall_score || 88)}%</strong>
                        </span>
                        <span className="small text-muted d-block">
                          Condition: <strong>{scanB.overall_condition || 'Healthy'}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded text-center" style={{ background: 'rgba(112, 123, 87, 0.08)' }}>
                  <span className="small text-muted">
                    <i className="fa-solid fa-lightbulb text-warning me-1"></i> Consistent adherence to your customized
                    routine shows visible biomarker stabilization within 4–6 weeks.
                  </span>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  onClick={() => setCompareModalOpen(false)}
                  style={{ borderRadius: '20px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
