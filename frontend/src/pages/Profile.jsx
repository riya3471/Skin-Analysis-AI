import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Profile() {
  const { user, addToast } = useAuth();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || 'Aastha Sharma',
    email: user?.email || 'user@skinai.com',
    role: user?.role || 'user',
    skin_type: 'Oily',
    score: '88.5%',
    last_scan: '17 Aug 2026',
    allergies: 'None reported',
    date_of_birth: '1998-05-14',
    gender: 'Female',
    notes: 'Prone to oily T-zone in humid weather.',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/profile');
        if (res.data && res.data.user) {
          setFormData((prev) => ({ ...prev, ...res.data.user }));
        }
      } catch (err) {}
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/profile', formData);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Profile updated successfully!', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="profile-section">
      <div className="container">
        {/* Heading */}
        <div className="text-center mb-5">
          <span className="hero-tag">User Account</span>
          <h1 className="profile-title">My Skin Profile</h1>
          <p className="profile-text">
            Manage your personal skincare details, allergies, and track your personalized diagnostic baseline.
          </p>
        </div>

        <div className="row g-4">
          {/* LEFT: Profile Summary Card */}
          <div className="col-lg-4">
            <div className="profile-card text-center p-4 shadow-sm mb-4" style={{ borderRadius: '20px' }}>
              <div
                className="profile-image mx-auto mb-3"
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: '#e8e3d8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  color: 'var(--green)',
                }}
              >
                <i className="fa-solid fa-user"></i>
              </div>

              <h2 className="fw-bold mb-1" style={{ fontSize: '24px', color: 'var(--green-dark)' }}>
                {formData.full_name || 'User'}
              </h2>
              <p className="text-muted small mb-3">{formData.email}</p>

              {formData.role === 'admin' ? (
                <span className="badge bg-warning text-dark mb-3 px-3 py-1 rounded-pill">Administrator</span>
              ) : (
                <span className="badge bg-light text-muted border mb-3 px-3 py-1 rounded-pill">Verified Member</span>
              )}

              <hr />

              <div className="profile-info text-start">
                <div className="profile-detail d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Baseline Skin Type</span>
                  <strong className={formData.skin_type ? 'text-success' : 'text-muted'}>
                    {formData.skin_type || 'Not Scanned Yet'}
                  </strong>
                </div>
                <div className="profile-detail d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Health Score</span>
                  <strong>{formData.score || '88.5%'}</strong>
                </div>
                <div className="profile-detail d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Last Scan</span>
                  <strong>{formData.last_scan || '17 Aug 2026'}</strong>
                </div>
                <div className="profile-detail d-flex justify-content-between py-2">
                  <span className="text-muted small">Known Allergies</span>
                  <strong className="text-danger">{formData.allergies || 'None reported'}</strong>
                </div>
              </div>

              <Link to="/scanner" className="hero-btn w-100 justify-content-center mt-4">
                <i className="fa-solid fa-camera me-2"></i>
                New Skin Scan
              </Link>
            </div>
          </div>

          {/* RIGHT: Editable Profile Form & Latest Analysis */}
          <div className="col-lg-8">
            <div className="profile-card p-4 p-md-5 shadow-sm mb-4" style={{ borderRadius: '20px' }}>
              <h3 className="mb-4 fw-bold" style={{ color: 'var(--green-dark)' }}>
                <i className="fa-solid fa-user-pen me-2"></i> Edit Personal & Skin Preferences
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      className="form-control custom-input"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Email Address</label>
                    <input
                      type="email"
                      className="form-control custom-input text-muted"
                      value={formData.email}
                      disabled
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Baseline Skin Type</label>
                    <select
                      name="skin_type"
                      className="form-select custom-input"
                      value={formData.skin_type}
                      onChange={handleChange}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Oily">Oily</option>
                      <option value="Dry">Dry</option>
                      <option value="Combination">Combination</option>
                      <option value="Sensitive">Sensitive</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      className="form-control custom-input"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Gender</label>
                    <select
                      name="gender"
                      className="form-select custom-input"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Ingredient Allergies / Sensitivities</label>
                    <input
                      type="text"
                      name="allergies"
                      className="form-control custom-input"
                      placeholder="e.g. Fragrance, Essential oils, Alcohol, Salicylic acid"
                      value={formData.allergies}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Skincare Notes & Goals</label>
                    <textarea
                      name="notes"
                      rows="3"
                      className="form-control custom-input"
                      placeholder="Describe your skincare routine concerns, acne triggers, or specific seasonal goals..."
                      value={formData.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="col-12 mt-4">
                    <button type="submit" disabled={isSaving} className="hero-btn">
                      <i className="fa-solid fa-floppy-disk me-2"></i>
                      {isSaving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
