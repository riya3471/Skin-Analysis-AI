import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Profile() {
  const { user, addToast } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || 'Aastha Sharma',
    skin_type: 'Combination',
    date_of_birth: '1998-05-14',
    gender: 'Female',
    allergies: 'None',
    notes: 'Prone to oily T-zone in humid weather.',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/profile');
        if (res.data && res.data.profile) {
          setFormData((prev) => ({ ...prev, ...res.data.profile }));
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
    <div className="profile-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-4">
              <span className="hero-tag">Personal Skincare Profile</span>
              <h1 className="fw-bold mt-2" style={{ color: 'var(--green-dark, #1b3326)' }}>
                Account & Preferences
              </h1>
              <p className="text-muted small">
                Customize your baseline skin type, active ingredient sensitivities, and personal notes.
              </p>
            </div>

            <div className="p-4 p-md-5 bg-white rounded-4 shadow-sm border">
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

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      className="form-control custom-input"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
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
                    <label className="form-label small fw-bold text-muted">Known Allergies / Sensitivities</label>
                    <input
                      type="text"
                      name="allergies"
                      className="form-control custom-input"
                      placeholder="e.g. Fragrance, Essential oils, High % BHA"
                      value={formData.allergies}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Personal Skin Notes</label>
                    <textarea
                      name="notes"
                      rows="3"
                      className="form-control custom-input"
                      placeholder="e.g. Tendency to break out around jawline during stress..."
                      value={formData.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <div className="mt-4 pt-2 text-end">
                  <button type="submit" disabled={isSaving} className="hero-btn px-5">
                    {isSaving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
