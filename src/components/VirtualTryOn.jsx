import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FaTimes, FaCamera, FaDownload, FaSyncAlt, FaUndo } from 'react-icons/fa';
import './VirtualTryOn.css';
import { productsData } from '../data/products';
import { TryOnRenderer } from '../tryon/tryOnRenderer';
import { computeHeadPose } from '../tryon/headPose';
import { DEFAULT_ADJUSTMENTS } from '../tryon/constants';

const VirtualTryOn = ({ isOpen, onClose, initialProduct, selectedColor }) => {
  const webcamRef = useRef(null);
  const threeContainerRef = useRef(null);
  const tryOnRendererRef = useRef(null);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(initialProduct || productsData[0]);
  const [activeColor, setActiveColor] = useState(selectedColor || (initialProduct?.colors?.[0] || 'black'));
  const [isMirrored, setIsMirrored] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);

  // Fine-tuning adjustment sliders
  const [verticalOffset, setVerticalOffset] = useState(DEFAULT_ADJUSTMENTS.verticalOffset);
  const [horizontalOffset, setHorizontalOffset] = useState(DEFAULT_ADJUSTMENTS.horizontalOffset);
  const [tiltOffset, setTiltOffset] = useState(DEFAULT_ADJUSTMENTS.tiltOffset);
  const [scaleMultiplier, setScaleMultiplier] = useState(DEFAULT_ADJUSTMENTS.scaleMultiplier);

  const verticalOffsetRef = useRef(verticalOffset);
  const horizontalOffsetRef = useRef(horizontalOffset);
  const tiltOffsetRef = useRef(tiltOffset);
  const scaleMultiplierRef = useRef(scaleMultiplier);

  const selectedFrameRef = useRef(selectedFrame);
  const activeColorRef = useRef(activeColor);
  const isMirroredRef = useRef(isMirrored);
  const scrollRef = useRef(null);

  const resetAdjustments = () => {
    setVerticalOffset(DEFAULT_ADJUSTMENTS.verticalOffset);
    setHorizontalOffset(DEFAULT_ADJUSTMENTS.horizontalOffset);
    setTiltOffset(DEFAULT_ADJUSTMENTS.tiltOffset);
    setScaleMultiplier(DEFAULT_ADJUSTMENTS.scaleMultiplier);
  };

  useEffect(() => {
    if (initialProduct) {
      setSelectedFrame(initialProduct);
      if (selectedColor) {
        setActiveColor(selectedColor);
      } else if (initialProduct.colors && initialProduct.colors.length > 0) {
        setActiveColor(initialProduct.colors[0]);
      }
    }
  }, [initialProduct, selectedColor]);

  useEffect(() => {
    selectedFrameRef.current = selectedFrame;
    activeColorRef.current = activeColor;
    if (tryOnRendererRef.current) {
      tryOnRendererRef.current.setProduct(selectedFrame, activeColor);
    }
  }, [selectedFrame, activeColor]);

  useEffect(() => {
    isMirroredRef.current = isMirrored;
    if (tryOnRendererRef.current) {
      tryOnRendererRef.current.setMirrored(isMirrored);
    }
  }, [isMirrored]);

  useEffect(() => {
    verticalOffsetRef.current = verticalOffset;
    horizontalOffsetRef.current = horizontalOffset;
    tiltOffsetRef.current = tiltOffset;
    scaleMultiplierRef.current = scaleMultiplier;
  }, [verticalOffset, horizontalOffset, tiltOffset, scaleMultiplier]);

  // Dynamically load MediaPipe FaceMesh script
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const loadScripts = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
        if (isMounted) setScriptsLoaded(true);
      } catch (error) {
        console.error("Error loading MediaPipe scripts", error);
        if (isMounted) {
          setScriptsLoaded(true);
          setIsModelLoaded(true);
        }
      }
    };

    if (window.FaceMesh) {
      setScriptsLoaded(true);
    } else {
      loadScripts();
    }

    // Safety fallback timer: unlock loading spinner after 2.5s max no matter what
    const safetyTimer = setTimeout(() => {
      if (isMounted) setIsModelLoaded(true);
    }, 2500);

    document.body.style.overflow = 'hidden';
    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      document.body.style.overflow = 'unset';
      stopCamera();
    };
  }, [isOpen]);

  // Initialize Three.js renderer and MediaPipe face tracking loop
  useEffect(() => {
    if (!isOpen || !scriptsLoaded) return;

    let isSubscribed = true;
    let isProcessing = false;

    // Smooth frame processing loop using requestAnimationFrame
    const processFrame = async () => {
      if (!isSubscribed) return;

      const video = webcamRef.current?.video;
      if (video && video.readyState >= 2 && !video.paused && faceMeshRef.current) {
        if (!isProcessing) {
          isProcessing = true;
          try {
            await faceMeshRef.current.send({ image: video });
          } catch (err) {
            console.warn("[TryOn] Frame processing error:", err);
          } finally {
            isProcessing = false;
          }
        }
      }

      animationRef.current = requestAnimationFrame(processFrame);
    };

    const initializeTryOn = async () => {
      if (!isSubscribed) return;

      // Setup Three.js Renderer in container (idempotent)
      if (threeContainerRef.current && !tryOnRendererRef.current) {
        const renderer = new TryOnRenderer(threeContainerRef.current);
        renderer.setMirrored(isMirroredRef.current);
        await renderer.setProduct(selectedFrameRef.current, activeColorRef.current);
        tryOnRendererRef.current = renderer;
      }

      // Setup FaceMesh (idempotent)
      if (window.FaceMesh && !faceMeshRef.current) {
        try {
          const faceMesh = new window.FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          });

          faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          faceMesh.onResults(onResults);
          faceMeshRef.current = faceMesh;
        } catch (e) {
          console.warn("[TryOn] FaceMesh init error:", e);
        }
      }

      // Mark model initialized so UI becomes active
      setIsModelLoaded(true);

      // Start processing frames
      animationRef.current = requestAnimationFrame(processFrame);
    };

    const handleWindowResize = () => {
      if (tryOnRendererRef.current) {
        tryOnRendererRef.current.resize();
      }
    };

    window.addEventListener('resize', handleWindowResize);
    initializeTryOn();

    return () => {
      isSubscribed = false;
      window.removeEventListener('resize', handleWindowResize);
      stopCamera();
    };
  }, [isOpen, scriptsLoaded]);

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
    if (tryOnRendererRef.current) {
      tryOnRendererRef.current.dispose();
      tryOnRendererRef.current = null;
    }
  };

  const onResults = (results) => {
    if (!isModelLoaded) setIsModelLoaded(true);

    const video = webcamRef.current?.video;
    const renderer = tryOnRendererRef.current;
    if (!renderer || !video) return;

    renderer.setVideo(video);
    renderer.resize();

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      const transformMatrix = results.facialTransformationMatrixes?.[0];
      const videoWidth = video.videoWidth || 1280;
      const videoHeight = video.videoHeight || 720;

      const rawPose = computeHeadPose(
        landmarks,
        transformMatrix,
        videoWidth,
        videoHeight,
        isMirroredRef.current
      );

      renderer.setAdjustments({
        scaleMultiplier: scaleMultiplierRef.current,
        verticalOffset: verticalOffsetRef.current,
        horizontalOffset: horizontalOffsetRef.current,
        tiltOffset: tiltOffsetRef.current,
      });

      renderer.updateFaceMesh(landmarks);
      renderer.updateGlassesPose(rawPose);
    }

    renderer.render();
  };

  const handleCapture = () => {
    const video = webcamRef.current?.video;
    const renderer = tryOnRendererRef.current;
    if (!video || !renderer) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = video.videoWidth || 1280;
    exportCanvas.height = video.videoHeight || 720;
    const ctx = exportCanvas.getContext('2d');

    ctx.save();
    if (isMirrored) {
      ctx.translate(exportCanvas.width, 0);
      ctx.scale(-1, 1);
    }
    // Draw bright webcam feed
    ctx.drawImage(video, 0, 0, exportCanvas.width, exportCanvas.height);
    ctx.restore();

    // Draw Three.js 3D glasses overlay on top
    const threeCanvas = renderer.renderer.domElement;
    ctx.drawImage(threeCanvas, 0, 0, exportCanvas.width, exportCanvas.height);

    setCapturedImage(exportCanvas.toDataURL('image/jpeg', 0.95));
  };

  const handleDownload = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = 'lenskart-tryon.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tryon-overlay">
      <div className="tryon-container">
        {/* Header */}
        <div className="tryon-header">
          <h2>Virtual 3D Try-On</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Main View Area */}
        <div className="tryon-view-area">
          {/* Fine-Tuning Slider Controls */}
          <div className="tryon-controls" style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 40,
            background: 'rgba(15, 15, 15, 0.7)',
            backdropFilter: 'blur(12px)',
            padding: '12px 16px',
            borderRadius: '12px',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            width: '160px'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: '#ccc' }}>Scale</label>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{scaleMultiplier.toFixed(1)}</span>
              </div>
              <input type="range" min="0.5" max="2.0" step="0.05" value={scaleMultiplier} onChange={(e) => setScaleMultiplier(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#329999', cursor: 'pointer' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: '#ccc' }}>Height (Y)</label>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{verticalOffset.toFixed(2)}</span>
              </div>
              <input type="range" min="-0.3" max="0.5" step="0.02" value={verticalOffset} onChange={(e) => setVerticalOffset(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#329999', cursor: 'pointer' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: '#ccc' }}>Shift (X)</label>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{horizontalOffset.toFixed(2)}</span>
              </div>
              <input type="range" min="-0.3" max="0.3" step="0.02" value={horizontalOffset} onChange={(e) => setHorizontalOffset(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#329999', cursor: 'pointer' }} />
            </div>
            <div style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: '#ccc' }}>Tilt</label>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{(tiltOffset * (180 / Math.PI)).toFixed(0)}°</span>
              </div>
              <input type="range" min="-0.4" max="0.4" step="0.02" value={tiltOffset} onChange={(e) => setTiltOffset(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#329999', cursor: 'pointer' }} />
            </div>
            <button className="tryon-reset-btn" onClick={resetAdjustments} title="Reset sliders to default">
              Reset
            </button>
          </div>

          {!isModelLoaded && (
            <div className="tryon-loading">
              <div className="spinner"></div>
              <p>Initializing AI 3D Tracking...</p>
            </div>
          )}

          {capturedImage && (
            <div className="captured-image-container" style={{ position: 'absolute', zIndex: 30, width: '100%', height: '100%', background: '#000' }}>
              <img src={capturedImage} alt="Captured Try-On" className="captured-image" />
            </div>
          )}

          <div className="video-container" style={{ visibility: capturedImage ? 'hidden' : 'visible' }}>
            {/* Natural Brightness Video Camera Stream */}
            <Webcam
              ref={webcamRef}
              className="tryon-video"
              videoConstraints={{
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }}
              mirrored={isMirrored}
              onUserMedia={() => {
                setTimeout(() => setIsModelLoaded(true), 300);
              }}
              onUserMediaError={(err) => {
                console.error("Webcam access error:", err);
                setIsModelLoaded(true);
              }}
            />
            {/* Transparent 3D Three.js Overlay */}
            <div ref={threeContainerRef} className="tryon-three-container" />
          </div>

          {/* Side Toolbar */}
          <div className="tryon-toolbar">
            {!capturedImage ? (
              <>
                <button className="tool-btn capture-btn" onClick={handleCapture} title="Take Photo">
                  <FaCamera />
                </button>
                <button className="tool-btn" onClick={() => setIsMirrored(!isMirrored)} title="Mirror Camera">
                  <FaSyncAlt />
                </button>
              </>
            ) : (
              <>
                <button className="tool-btn" onClick={() => setCapturedImage(null)} title="Retake Photo">
                  <FaSyncAlt />
                </button>
                <button className="tool-btn download-btn" onClick={handleDownload} title="Download Photo">
                  <FaDownload />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer Product Carousel */}
        <div className="tryon-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3>Select Glasses Frame</h3>
            {selectedFrame?.colors && selectedFrame.colors.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#aaa' }}>Color:</span>
                {selectedFrame.colors.map(col => (
                  <button
                    key={col}
                    onClick={() => setActiveColor(col)}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: col === 'transparent' ? '#f0f0f0' : col,
                      border: activeColor === col ? '2px solid #329999' : '1px solid #666',
                      cursor: 'pointer',
                      transform: activeColor === col ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                    title={col}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="frames-carousel" ref={scrollRef}>
            {productsData.map((item) => (
              <div
                key={item.id}
                className={`frame-option ${selectedFrame?.id === item.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedFrame(item);
                  if (item.colors && item.colors.length > 0) {
                    setActiveColor(item.colors[0]);
                  }
                }}
              >
                <img src={item.image} alt={item.name} />
                <span className="frame-name">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VirtualTryOn;

