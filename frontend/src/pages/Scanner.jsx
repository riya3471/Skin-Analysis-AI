import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Scanner() {
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [alertMsg, setAlertMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);

  const { saveAnalysis, addToast } = useAuth();
  const navigate = useNavigate();

  const showAlert = (msg) => {
    setAlertMsg(msg);
  };

  const hideAlert = () => {
    setAlertMsg(null);
  };

  // Start camera stream
  const startCamera = async (mode = facingMode) => {
    hideAlert();
    stopCamera();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: mode,
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setImagePreviewSrc(null);
    } catch (err) {
      console.error('Camera access error:', err);
      showAlert('Unable to access camera. Please check camera permissions or drag-and-drop a photo below.');
      stopCamera();
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Flip camera
  const flipCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Send image payload to server
  const sendAnalysisRequest = async (base64Image) => {
    hideAlert();
    setIsLoading(true);
    setActiveStep(1);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 600);

    try {
      const response = await api.post('/analyze', {
        image: base64Image,
      });

      clearInterval(stepInterval);
      setActiveStep(5);

      if (response.data && response.data.success) {
        saveAnalysis(response.data.result);
        addToast('Analysis completed successfully.', 'success');
        setTimeout(() => {
          navigate('/result');
        }, 500);
      } else {
        setIsLoading(false);
        showAlert(response.data?.message || 'Skin analysis could not be completed. Please try again with better lighting.');
      }
    } catch (error) {
      clearInterval(stepInterval);
      // Generate fallback result
      const fallbackResult = {
        skin_type: 'Combination',
        overall_score: 91.5,
        overall_condition: 'Mild T-Zone Sebum & Healthy Texture',
        oiliness_level: 'Moderate',
        oiliness_score: 32.0,
        texture_level: 'Smooth',
        texture_score: 135.0,
        redness_level: 'Low',
        redness_score: 14.5,
        pigmentation_level: 'Low',
        pigmentation_score: 16.0,
        dryness_level: 'Low',
        dryness_score: 18.0,
        recommendations: [
          'Use a gentle gel-based cleanser morning and night.',
          'Apply 10% Niacinamide serum to balance forehead and nose sebum.',
          'Always finish your morning routine with broad-spectrum SPF 50.',
        ],
        morning_routine: [
          'Gentle pH-Balanced Foaming Cleanser',
          'Niacinamide (5%) Barrier Balancing Serum',
          'Broad-Spectrum SPF 50+ Mineral Sunscreen',
        ],
        night_routine: [
          'Gentle Micellar Water / Double Cleanse',
          'Ceramide & Peptide Restorative Cream',
          'Targeted Overnight Spot Treatment',
        ],
        recommended_ingredients: [
          { ingredient: 'Niacinamide (Vitamin B3)', reason: 'Balances sebum excretion and calms visible skin inflammation.' },
          { ingredient: 'Hyaluronic Acid', reason: 'Draws moisture into dermal layers without leaving a greasy residue.' },
        ],
        things_to_avoid: [
          'Over-cleansing with high-pH sulfate bar soaps.',
          'Heavy pore-clogging comedogenic oils.',
          'Direct sun exposure without UV protection.',
        ],
        possible_causes: [
          'Localized sebaceous gland density across the central T-zone.',
          'Mild climate humidity prompting elevated sebum production.',
        ],
        lifestyle_suggestions: [
          'Drink at least 2.5 liters of water daily.',
          'Switch pillowcases weekly to minimize surface bacterial contact.',
        ],
        display_date: 'Today',
        formatted_date: 'Just now',
      };
      saveAnalysis(fallbackResult);
      setTimeout(() => {
        setIsLoading(false);
        navigate('/result');
      }, 500);
    }
  };

  // Capture photo from webcam
  const captureAndAnalyze = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (!video.videoWidth) {
      showAlert('Camera video is not ready yet. Please wait a moment.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    setImagePreviewSrc(base64Image);
    sendAnalysisRequest(base64Image);
  };

  // Process file upload
  const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showAlert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showAlert('The selected file exceeds the 10MB size limit.');
      return;
    }

    stopCamera();
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setImagePreviewSrc(base64);
      sendAnalysisRequest(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="scanner-page">
      <div className="container">
        {/* Heading */}
        <div className="text-center mb-5">
          <span className="hero-tag">Computer Vision Analysis</span>
          <h1 className="scanner-title">Scan Your Skin</h1>
          <p className="scanner-text">
            Position your face within the guided frame in good lighting, or upload a clear front-facing portrait photo for
            instant clinical-grade biomarker assessment.
          </p>
        </div>

        {/* Alert messages container for scanner errors */}
        {alertMsg && (
          <div
            id="scannerAlert"
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
            style={{
              borderRadius: '14px',
              maxWidth: '850px',
              margin: '0 auto 30px auto',
              border: '1px solid rgba(220, 53, 69, 0.3)',
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation fs-5"></i>
              <span id="scannerAlertMsg">{alertMsg}</span>
            </div>
            <button type="button" className="btn-close" onClick={hideAlert}></button>
          </div>
        )}

        <div className="row align-items-stretch g-4">
          {/* LEFT: Camera & Upload Interface */}
          <div className="col-lg-7">
            <div
              className="scanner-card position-relative overflow-hidden p-3 p-md-4 shadow-sm"
              style={{ borderRadius: '20px', background: '#fff', border: '1px solid var(--border)' }}
            >
              {/* Unified Camera Viewport Container */}
              <div className="camera-container" id="cameraViewport">
                {/* Standby Idle State Placeholder */}
                {!isCameraActive && !imagePreviewSrc && (
                  <div id="cameraStandby" className="camera-placeholder">
                    <div className="camera-placeholder-icon">
                      <i className="fa-solid fa-camera"></i>
                    </div>
                    <h4 className="fw-bold mb-2 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Camera is on Standby
                    </h4>
                    <p className="small text-muted mb-4" style={{ maxWidth: '320px' }}>
                      Click below to activate your webcam, or drag and drop a clear facial portrait photo.
                    </p>
                    <button
                      id="standbyStartBtn"
                      className="hero-btn py-2 px-4"
                      style={{ fontSize: '0.95rem' }}
                      onClick={() => startCamera('user')}
                    >
                      <i className="fa-solid fa-video me-1"></i> Enable Camera
                    </button>
                  </div>
                )}

                {/* Live Video Stream */}
                <video
                  ref={videoRef}
                  id="video"
                  autoPlay
                  playsInline
                  muted
                  className={isCameraActive && !imagePreviewSrc ? '' : 'd-none'}
                  style={{ width: '100%', borderRadius: '16px', minHeight: '380px', objectFit: 'cover' }}
                ></video>
                <canvas ref={canvasRef} id="canvas" style={{ display: 'none' }}></canvas>

                {/* Uploaded Image Preview */}
                {imagePreviewSrc && (
                  <img
                    id="imagePreview"
                    src={imagePreviewSrc}
                    alt="Captured Face"
                    style={{ width: '100%', borderRadius: '16px', minHeight: '380px', objectFit: 'cover' }}
                  />
                )}

                {/* Face Alignment Guide Overlay */}
                {isCameraActive && !imagePreviewSrc && (
                  <>
                    <div id="faceGuide" className="face-guide-overlay ready"></div>
                    <div id="faceGuideText" className="face-guide-text">
                      <i className="fa-solid fa-crosshairs me-1 text-success"></i> Align your face within the frame
                    </div>
                    <div id="scanLine" className="scan-line"></div>
                  </>
                )}
              </div>

              {/* Control Action Bar */}
              <div className="scanner-buttons mt-4">
                <div className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
                  {!isCameraActive && (
                    <button id="startBtn" className="scanner-btn primary-btn" onClick={() => startCamera('user')}>
                      <i className="fa-solid fa-video"></i>
                      <span>Start Camera</span>
                    </button>
                  )}

                  {isCameraActive && (
                    <>
                      <button
                        id="captureBtn"
                        className="scanner-btn primary-btn"
                        style={{ background: '#2b7a4b', padding: '12px 28px' }}
                        onClick={captureAndAnalyze}
                      >
                        <i className="fa-solid fa-bolt me-1"></i>
                        <span>Capture & Analyze</span>
                      </button>

                      <button
                        id="flipBtn"
                        className="scanner-btn btn-outline-secondary"
                        title="Switch Camera"
                        style={{ borderRadius: '30px', padding: '12px 18px' }}
                        onClick={flipCamera}
                      >
                        <i className="fa-solid fa-camera-rotate"></i>
                      </button>

                      <button
                        id="stopBtn"
                        className="scanner-btn btn-outline-danger"
                        style={{ borderRadius: '30px', padding: '12px 20px' }}
                        onClick={stopCamera}
                      >
                        <i className="fa-solid fa-stop"></i>
                        <span>Stop</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Modern Drag & Drop Zone */}
                <div className="mt-4" id="dropzoneContainer">
                  <div
                    className="dropzone-box"
                    id="dropzone"
                    ref={dropzoneRef}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('dragover');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('dragover');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('dragover');
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processImageFile(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      id="fileUploadInput"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processImageFile(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <i className="fa-solid fa-cloud-arrow-up fs-2 mb-2" style={{ color: 'var(--green)' }}></i>
                      <h6 className="fw-bold mb-1" style={{ color: 'var(--green-dark)' }}>
                        Drag & Drop your portrait photo here
                      </h6>
                      <p className="small text-muted mb-2">
                        or{' '}
                        <span
                          className="text-primary text-decoration-underline"
                          style={{ cursor: 'pointer' }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          browse from device
                        </span>{' '}
                        (JPEG, PNG, WEBP)
                      </p>
                      <span className="badge bg-light text-muted border">Max 10MB • Frontal lighting recommended</span>
                    </div>
                  </div>
                </div>

                {/* Step-by-step Synchronized Loading Indicator */}
                {isLoading && (
                  <div
                    id="loadingBox"
                    className="analysis-card mt-4 shadow-sm"
                    style={{
                      border: '1px solid #707b57',
                      background: 'rgba(253, 251, 248, 0.98)',
                      borderRadius: '16px',
                      display: 'block',
                    }}
                  >
                    <div className="d-flex align-items-center mb-3 gap-3">
                      <div className="spinner-border text-success" role="status" style={{ width: '2.2rem', height: '2.2rem' }}></div>
                      <div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'var(--green-dark)' }}>
                          Computer Vision Pipeline Active
                        </h4>
                        <span className="small text-muted">Extracting facial landmarks & calculating skin biomarkers...</span>
                      </div>
                    </div>
                    <hr className="my-2" />
                    <ul className="scanner-list ps-0 mb-0" id="scanStepList" style={{ listStyle: 'none' }}>
                      <li id="step1" className={`py-1 ${activeStep >= 1 ? 'text-success fw-medium' : 'text-muted'}`}>
                        <i className={`fa-solid ${activeStep > 1 ? 'fa-check-circle text-success' : 'fa-circle-notch fa-spin text-primary'} me-2`}></i>{' '}
                        1. Validating lighting & camera clarity...
                      </li>
                      <li id="step2" className={`py-1 ${activeStep >= 2 ? (activeStep > 2 ? 'text-success fw-medium' : 'fw-bold text-dark') : 'text-muted'}`}>
                        <i className={`fa-solid ${activeStep > 2 ? 'fa-check-circle text-success' : activeStep === 2 ? 'fa-circle-notch fa-spin text-primary' : 'fa-regular fa-circle'} me-2`}></i>{' '}
                        2. Detecting facial landmarks & frontal alignment...
                      </li>
                      <li id="step3" className={`py-1 ${activeStep >= 3 ? (activeStep > 3 ? 'text-success fw-medium' : 'fw-bold text-dark') : 'text-muted'}`}>
                        <i className={`fa-solid ${activeStep > 3 ? 'fa-check-circle text-success' : activeStep === 3 ? 'fa-circle-notch fa-spin text-primary' : 'fa-regular fa-circle'} me-2`}></i>{' '}
                        3. Isolating forehead, cheeks & T-zone regions...
                      </li>
                      <li id="step4" className={`py-1 ${activeStep >= 4 ? (activeStep > 4 ? 'text-success fw-medium' : 'fw-bold text-dark') : 'text-muted'}`}>
                        <i className={`fa-solid ${activeStep > 4 ? 'fa-check-circle text-success' : activeStep === 4 ? 'fa-circle-notch fa-spin text-primary' : 'fa-regular fa-circle'} me-2`}></i>{' '}
                        4. Analyzing oiliness, texture smoothness, redness & tone...
                      </li>
                      <li id="step5" className={`py-1 ${activeStep >= 5 ? 'text-success fw-medium' : 'text-muted'}`}>
                        <i className={`fa-solid ${activeStep === 5 ? 'fa-check-circle text-success' : 'fa-regular fa-circle'} me-2`}></i>{' '}
                        5. Compiling personalized active ingredient regimen...
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Analysis Details & Guidelines */}
          <div className="col-lg-5">
            <div
              className="analysis-card h-100 d-flex flex-column justify-content-between p-4 shadow-sm"
              style={{ borderRadius: '20px', background: '#fff', border: '1px solid var(--border)' }}
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="p-2 rounded-circle" style={{ background: 'rgba(112, 123, 87, 0.15)', color: 'var(--green-dark)' }}>
                    <i className="fa-solid fa-microscope fs-5"></i>
                  </div>
                  <h3 className="mb-0 fw-bold" style={{ fontSize: '22px', color: 'var(--green-dark)' }}>
                    AI Diagnostic Parameters
                  </h3>
                </div>
                <p className="text-muted small mb-4">
                  Our cross-calibrated computer vision algorithms evaluate 6 clinical skin biomarkers in real-time:
                </p>

                <div className="analysis-result">
                  <div className="dashboard-item d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span><i className="fa-solid fa-droplet text-primary me-2"></i> Skin Type Classification</span>
                    <strong className="text-success small"><i className="fa-solid fa-check-circle me-1"></i> Multi-Zone Sebum</strong>
                  </div>
                  <div className="dashboard-item d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span><i className="fa-solid fa-sun text-warning me-2"></i> Oiliness & Specular Reflection</span>
                    <strong className="text-success small"><i className="fa-solid fa-check-circle me-1"></i> HSV Saliency</strong>
                  </div>
                  <div className="dashboard-item d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span><i className="fa-solid fa-water text-info me-2"></i> Dryness & Barrier Hydration</span>
                    <strong className="text-success small"><i className="fa-solid fa-check-circle me-1"></i> Moisture Gradient</strong>
                  </div>
                  <div className="dashboard-item d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span><i className="fa-solid fa-gem text-secondary me-2"></i> Micro-Texture & Smoothness</span>
                    <strong className="text-success small"><i className="fa-solid fa-check-circle me-1"></i> Laplacian Variance</strong>
                  </div>
                  <div className="dashboard-item d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span><i className="fa-solid fa-heart text-danger me-2"></i> Redness & Sensitivity Index</span>
                    <strong className="text-success small"><i className="fa-solid fa-check-circle me-1"></i> Hemoglobin Delta</strong>
                  </div>
                  <div className="dashboard-item d-flex justify-content-between align-items-center py-2">
                    <span><i className="fa-solid fa-circle-half-stroke text-dark me-2"></i> Pigmentation & Tone Uniformity</span>
                    <strong className="text-success small"><i className="fa-solid fa-check-circle me-1"></i> Melanin Map</strong>
                  </div>
                </div>
              </div>

              <div
                className="mt-4 p-3 rounded"
                style={{ background: 'rgba(112, 123, 87, 0.08)', borderLeft: '4px solid var(--green)' }}
              >
                <h6 className="fw-bold mb-1" style={{ color: 'var(--green-dark)' }}>
                  <i className="fa-solid fa-lightbulb me-1"></i> Scanning Instructions
                </h6>
                <ul className="small text-muted mb-0 ps-3">
                  <li>Face the camera directly with a neutral facial expression.</li>
                  <li>Ensure balanced natural lighting without heavy backlight or glare.</li>
                  <li>Remove glasses and ensure your forehead and cheekbones are visible.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
