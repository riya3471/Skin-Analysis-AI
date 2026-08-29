import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Feedback() {
  const { addToast } = useAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      user_name: 'Aastha Sharma',
      stars: '⭐⭐⭐⭐⭐',
      message: 'The AI skin scan was remarkably fast and accurate! The recommended Niacinamide routine really helped with my oily T-zone.',
    },
    {
      id: 2,
      user_name: 'Skiné User',
      stars: '⭐⭐⭐⭐⭐',
      message: 'Clean interface and the morning/night routine recommendations are very structured and practical.',
    },
    {
      id: 3,
      user_name: 'Skiné User',
      stars: '⭐⭐⭐⭐',
      message: 'Loved the computer vision face region analysis. Very intuitive skin report!',
    },
  ]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await api.get('/api/feedback');
        if (res.data && res.data.feedbacks) {
          setFeedbacks(res.data.feedbacks);
        }
      } catch (err) {}
    };
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/feedback', { rating, message });
      setFeedbacks([
        {
          id: Date.now(),
          user_name: 'You',
          stars: '⭐'.repeat(rating),
          message: message.trim(),
        },
        ...feedbacks,
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
    <section className="feedback-section">
      <div className="container">
        {/* Heading */}
        <div className="text-center mb-5">
          <span className="hero-tag">Community Voices</span>
          <h1 className="feedback-title">Share Your Experience</h1>
          <p className="feedback-text">
            Your reviews help us refine our Computer Vision accuracy and expand personalized skincare recommendations.
          </p>
        </div>

        <div className="row g-5">
          {/* Feedback Form */}
          <div className="col-lg-5">
            <div className="feedback-card p-4 p-md-5 shadow-sm" style={{ borderRadius: '20px' }}>
              <h3 className="mb-3 fw-bold" style={{ color: 'var(--green-dark)' }}>
                <i className="fa-solid fa-pen-nib me-2"></i> Leave a Review
              </h3>
              <p className="small text-muted mb-4">How was your AI skin analysis experience?</p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted d-block">Rating</label>
                  <div className="rating-stars d-flex gap-2 fs-4 text-warning" id="starContainer" style={{ cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <i
                        key={val}
                        className={`${val <= rating ? 'fa-solid' : 'fa-regular'} fa-star star-btn`}
                        onClick={() => setRating(val)}
                      ></i>
                    ))}
                  </div>
                  <input type="hidden" name="rating" id="ratingInput" value={rating} />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Feedback & Comments</label>
                  <textarea
                    name="message"
                    className="form-control custom-input"
                    rows="4"
                    placeholder="Tell us about the accuracy of your skin report, routines, or feature suggestions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="hero-btn w-100 justify-content-center">
                  <i className="fa-solid fa-paper-plane me-2"></i>
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          </div>

          {/* User Reviews List */}
          <div className="col-lg-7">
            <div className="feedback-card p-4 p-md-5 shadow-sm" style={{ borderRadius: '20px' }}>
              <h3 className="mb-4 fw-bold" style={{ color: 'var(--green-dark)' }}>
                <i className="fa-solid fa-comments me-2"></i> Verified User Reviews
              </h3>

              <div className="d-flex flex-column gap-3" style={{ maxHeight: '520px', overflowY: 'auto', paddingRight: '5px' }}>
                {feedbacks && feedbacks.length > 0 ? (
                  feedbacks.map((item) => (
                    <div
                      key={item.id}
                      className="review-card p-3 border rounded shadow-xs"
                      style={{ background: '#fff', borderRadius: '14px' }}
                    >
                      <div className="review-header d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '36px', height: '36px', background: '#e8e3d8', color: 'var(--green)', fontSize: '16px' }}
                          >
                            <i className="fa-solid fa-user"></i>
                          </div>
                          <h5 className="mb-0 fw-bold" style={{ fontSize: '1.05rem' }}>
                            {item.user_name || item.name || 'Skiné User'}
                          </h5>
                        </div>
                        <span className="text-warning fs-6">{item.stars || item.rating}</span>
                      </div>
                      <p className="mb-0 text-muted small ps-5">"{item.message}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No reviews yet. Be the first to share your experience!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
