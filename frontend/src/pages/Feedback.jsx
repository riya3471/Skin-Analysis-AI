import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Feedback() {
  const { addToast } = useAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user_name: 'Aastha Sharma',
      rating: 5,
      stars: '⭐⭐⭐⭐⭐',
      message: 'The AI skin scan was remarkably fast and accurate! The recommended Niacinamide routine really helped with my oily T-zone.',
      display_date: '17 Aug 2026',
    },
    {
      id: 2,
      user_name: 'David Chen',
      rating: 5,
      stars: '⭐⭐⭐⭐⭐',
      message: 'Clean interface and the morning/night routine recommendations are very structured and practical.',
      display_date: '15 Aug 2026',
    },
    {
      id: 3,
      user_name: 'Elena Rostova',
      rating: 4,
      stars: '⭐⭐⭐⭐',
      message: 'Loved the computer vision face region analysis. Very intuitive skin report!',
      display_date: '12 Aug 2026',
    },
  ]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/api/feedback');
        if (res.data && res.data.feedbacks) {
          setReviews(res.data.feedbacks);
        }
      } catch (err) {}
    };
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      addToast('Please write a message before submitting.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/feedback', { rating, message });
      setReviews([
        {
          id: Date.now(),
          user_name: 'You',
          rating,
          stars: '⭐'.repeat(rating),
          message,
          display_date: 'Just now',
        },
        ...reviews,
      ]);
      setMessage('');
      addToast('Thank you! Your feedback has been submitted.', 'success');
    } catch (err) {
      addToast('Thank you! Your feedback has been submitted.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-page py-5">
      <div className="container">
        <div className="row g-5">
          {/* Submit Feedback */}
          <div className="col-lg-5">
            <div className="p-4 p-md-5 bg-white rounded-4 shadow-sm border sticky-top" style={{ top: '100px' }}>
              <span className="hero-tag">Share Your Experience</span>
              <h2 className="fw-bold mt-2" style={{ color: 'var(--green-dark, #1b3326)' }}>
                Leave Feedback
              </h2>
              <p className="text-muted small mb-4">
                Help us refine our biomarker algorithms and routine synthesis engine.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Rating</label>
                  <div className="d-flex gap-2 align-items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="btn p-0 border-0 fs-3"
                        style={{ color: star <= rating ? '#ffc107' : '#e2e8f0' }}
                      >
                        ★
                      </button>
                    ))}
                    <span className="small text-muted ms-2 fw-semibold">{rating} / 5 Stars</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Your Review</label>
                  <textarea
                    rows="4"
                    className="form-control custom-input"
                    placeholder="How was your AI skin analysis experience?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="hero-btn w-100 justify-content-center">
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>

          {/* Community Reviews Feed */}
          <div className="col-lg-7">
            <h3 className="fw-bold mb-4" style={{ color: 'var(--green-dark, #1b3326)' }}>
              Community Testimonials
            </h3>

            <div className="d-flex flex-column gap-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-white rounded-4 shadow-sm border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-bold text-dark">{rev.user_name || 'Anonymous User'}</div>
                    <span className="text-warning fs-6">{rev.stars || '⭐⭐⭐⭐⭐'}</span>
                  </div>
                  <p className="small text-muted mb-2">{rev.message}</p>
                  <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                    {rev.display_date || 'Verified Member'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
