import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FaTimes, FaCamera, FaDownload, FaSyncAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './VirtualTryOn.css';
import { productsData, perfectSVG, roundSVG, rimlessSVG, ovalSVG, aviatorSVG, featherSVG, miniRoundSVG, boldSquareSVG, halfRimSVG, clearWayfarerSVG } from '../data/products';

const svgFrames = [
  { id: 'svg1', shape: 'Rectangle', image: perfectSVG },
  { id: 'svg2', shape: 'Round', image: roundSVG },
  { id: 'svg3', shape: 'Rimless', image: rimlessSVG },
  { id: 'svg4', shape: 'Oval', image: ovalSVG },
  { id: 'svg5', shape: 'Aviator', image: aviatorSVG },
  { id: 'svg6', shape: 'Wayfarer', image: clearWayfarerSVG },
  { id: 'svg7', shape: 'Square', image: boldSquareSVG },
  { id: 'svg8', shape: 'Round', image: miniRoundSVG },
];

const defaultFrames = productsData.filter(p => p.image && typeof p.image === 'string' && p.image.startsWith('data:image/svg'));
if (defaultFrames.length === 0) {
  defaultFrames.push(...svgFrames);
}

const VirtualTryOn = ({ isOpen, onClose, initialProduct, selectedColor }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(initialProduct || defaultFrames[0]);
  const [isMirrored, setIsMirrored] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);
  
  const [verticalOffset, setVerticalOffset] = useState(0.45);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [tiltOffset, setTiltOffset] = useState(0);
  const [scaleMultiplier, setScaleMultiplier] = useState(2.2);
  
  const verticalOffsetRef = useRef(verticalOffset);
  const horizontalOffsetRef = useRef(horizontalOffset);
  const tiltOffsetRef = useRef(tiltOffset);
  const scaleMultiplierRef = useRef(scaleMultiplier);
  
  const selectedFrameRef = useRef(selectedFrame);
  const isMirroredRef = useRef(isMirrored);
  const imageCacheRef = useRef({});
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      if (direction === 'left') {
        current.scrollBy({ left: -200, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: 200, behavior: 'smooth' });
      }
    }
  };

  const colorMap = {
    black: '#1a1a1a',
    grey: '#888888',
    silver: '#c0c0c0',
    gold: '#daa520',
    red: '#cc0000',
    blue: '#1e3799',
    green: '#218c74',
    pink: '#f8a5c2',
    brown: '#8b4513',
    transparent: '#f1f2f6',
    white: '#ffffff',
    yellow: '#fbc531',
    purple: '#8c7ae6'
  };

  const getCleanTryOnImage = (frame) => {
    if (!frame) return null;
    if (frame.image && typeof frame.image === 'string') {
      if (frame.image.startsWith('data:image/svg') || frame.image.endsWith('.png') || frame.image.endsWith('.jpg')) {
        return frame.image;
      }
    }
    
    const shape = (frame.shape || '').toLowerCase();
    
    // Use the explicitly selected color, or fallback to the product's first color, or black
    const baseColorName = selectedColor ? selectedColor.toLowerCase() : ((frame.colors && frame.colors.length > 0) ? frame.colors[0].toLowerCase() : 'black');
    const hexColor = encodeURIComponent(colorMap[baseColorName] || '#1a1a1a');
    
    let matchingSvgFrame = svgFrames.find(f => (f.shape || '').toLowerCase() === shape);
    
    if (!matchingSvgFrame) {
      if (shape.includes('round')) matchingSvgFrame = svgFrames.find(f => (f.shape || '').toLowerCase().includes('round'));
      else if (shape.includes('square')) matchingSvgFrame = svgFrames.find(f => (f.shape || '').toLowerCase().includes('square'));
      else if (shape.includes('aviator')) matchingSvgFrame = svgFrames.find(f => (f.shape || '').toLowerCase().includes('aviator'));
      else if (shape.includes('oval')) matchingSvgFrame = svgFrames.find(f => (f.shape || '').toLowerCase().includes('oval'));
      else if (shape.includes('wayfarer')) matchingSvgFrame = svgFrames.find(f => (f.shape || '').toLowerCase().includes('wayfarer'));
    }
    
    let svgStr = (matchingSvgFrame || svgFrames[0]).image;
    
    // Inject the product's exact color into the SVG to make it match!
    svgStr = svgStr.replace(/%23111/g, hexColor)
                   .replace(/%23333/g, hexColor)
                   .replace(/%231a1a1a/g, hexColor)
                   .replace(/%23b0b0b0/g, hexColor)
                   .replace(/%23e5a93d/g, hexColor)
                   .replace(/%23daa520/g, hexColor)
                   .replace(/%23444/g, hexColor)
                   .replace(/%23225588/g, hexColor);
                   
    return svgStr;
  };

  useEffect(() => {
    selectedFrameRef.current = selectedFrame;
    const cacheKey = selectedFrame ? `${selectedFrame.id}-${selectedColor || 'default'}` : null;
    
    if (selectedFrame && cacheKey && !imageCacheRef.current[cacheKey]) {
      const img = new Image();
      img.src = getCleanTryOnImage(selectedFrame);
      imageCacheRef.current[cacheKey] = img;
    }
  }, [selectedFrame, selectedColor]);

  useEffect(() => {
    isMirroredRef.current = isMirrored;
  }, [isMirrored]);
  
  useEffect(() => {
    verticalOffsetRef.current = verticalOffset;
  }, [verticalOffset]);

  useEffect(() => {
    horizontalOffsetRef.current = horizontalOffset;
  }, [horizontalOffset]);

  useEffect(() => {
    tiltOffsetRef.current = tiltOffset;
  }, [tiltOffset]);

  useEffect(() => {
    scaleMultiplierRef.current = scaleMultiplier;
  }, [scaleMultiplier]);
  
  // Load MediaPipe scripts dynamically to avoid Vite/Webpack build issues with these specific packages
  useEffect(() => {
    if (!isOpen) return;

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
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
        setScriptsLoaded(true);
      } catch (error) {
        console.error("Error loading MediaPipe scripts", error);
      }
    };

    loadScripts();
    
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
      stopCamera();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !scriptsLoaded) return;

    const initializeFaceMesh = async () => {
      if (!window.FaceMesh || !window.Camera) {
          setTimeout(initializeFaceMesh, 100);
          return;
      }

      if (faceMeshRef.current) return; // Already initialized

      const faceMesh = new window.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(onResults);
      faceMeshRef.current = faceMesh;

      if (webcamRef.current && webcamRef.current.video) {
        const camera = new window.Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (webcamRef.current && webcamRef.current.video && faceMeshRef.current) {
               await faceMeshRef.current.send({ image: webcamRef.current.video });
            }
          },
          width: 640,
          height: 480
        });
        camera.start();
        cameraRef.current = camera;
      }
    };
    
    // Delay slightly to ensure video element is fully mounted
    setTimeout(initializeFaceMesh, 500);

    return () => {
      stopCamera();
    };
  }, [isOpen, scriptsLoaded]);

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const onResults = (results) => {
    if (!isModelLoaded) setIsModelLoaded(true);
    
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    
    // Match canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If mirrored, flip the canvas context before drawing anything
    if (isMirroredRef.current) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    // Brighten the video feed so the user's face is clear even in dark rooms
    ctx.filter = 'brightness(1.3) contrast(1.1)';
    // Draw the video frame to the canvas
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none'; // reset filter

    
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // We use the outer and inner corners of the eyes for more stable tracking across all face_mesh versions
      const leftEyeOuter = 33;
      const leftEyeInner = 133;
      const rightEyeOuter = 263;
      const rightEyeInner = 362;
      
      // Convert normalized coordinates to pixel coordinates
      const w = canvas.width;
      const h = canvas.height;
      
      const leftEyeCenter = {
        x: ((landmarks[leftEyeOuter].x + landmarks[leftEyeInner].x) / 2) * w,
        y: ((landmarks[leftEyeOuter].y + landmarks[leftEyeInner].y) / 2) * h
      };
      
      const rightEyeCenter = {
        x: ((landmarks[rightEyeOuter].x + landmarks[rightEyeInner].x) / 2) * w,
        y: ((landmarks[rightEyeOuter].y + landmarks[rightEyeInner].y) / 2) * h
      };
      
      const leftOuterPt = leftEyeCenter;
      const rightOuterPt = rightEyeCenter;
      
      // Determine which eye is on the left side of the image to ensure dx is positive.
      const eye1 = leftOuterPt.x < rightOuterPt.x ? leftOuterPt : rightOuterPt;
      const eye2 = leftOuterPt.x < rightOuterPt.x ? rightOuterPt : leftOuterPt;
      const angle = Math.atan2(eye2.y - eye1.y, eye2.x - eye1.x);
      
      // Use the sides of the face (cheekbones near ears) for precise width scaling
      const leftSide = 234;
      const rightSide = 454;
      
      const leftSidePt = {
        x: landmarks[leftSide].x * w,
        y: landmarks[leftSide].y * h
      };
      
      const rightSidePt = {
        x: landmarks[rightSide].x * w,
        y: landmarks[rightSide].y * h
      };
      
      // Calculate face width to accurately scale the glasses frame from ear to ear
      const faceWidth = Math.hypot(rightSidePt.x - leftSidePt.x, rightSidePt.y - leftSidePt.y);
      
      // Calculate the exact midpoint between the eyes as the center point
      const centerPt = { 
        x: (leftOuterPt.x + rightOuterPt.x) / 2, 
        y: (leftOuterPt.y + rightOuterPt.y) / 2 
      };
      
      // Draw Glasses using faceWidth instead of pupilDistance
      drawGlasses(ctx, centerPt, faceWidth, angle);
    }
    ctx.restore();
  };

  const drawGlasses = (ctx, centerPt, faceWidth, angle) => {
    const currentFrame = selectedFrameRef.current;
    if (!currentFrame) return;
    
    const cacheKey = currentFrame ? `${currentFrame.id}-${selectedColor || 'default'}` : null;
    const img = imageCacheRef.current[cacheKey];
    
    // Wait for image to load if not already
    if (!img || !img.complete) return;

    ctx.save();
    

    // Removed 'multiply' blend mode because it causes the glasses to vanish completely in dark environments!
    ctx.globalCompositeOperation = 'source-over';
    
    // The glasses width should perfectly match the face width (ear to ear) multiplied by user scale
    const glassesWidth = faceWidth * scaleMultiplierRef.current; 
    const scale = glassesWidth / img.width;
    const glassesHeight = img.height * scale;
    
    // Move to the exact midpoint between the eyes, plus horizontal offset
    const xOffset = glassesWidth * horizontalOffsetRef.current;
    ctx.translate(centerPt.x + xOffset, centerPt.y);
    
    // Rotate to match eye angle, plus manual tilt offset
    ctx.rotate(angle + tiltOffsetRef.current);
    
    // Draw image centered at the translated origin
    // Adjust yOffset to correctly position the glasses over the eyes.
    const yOffset = -glassesHeight * verticalOffsetRef.current;
    ctx.drawImage(img, -glassesWidth / 2, yOffset, glassesWidth, glassesHeight);
    
    ctx.restore();
  };

  const handleCapture = () => {
    if (canvasRef.current) {
      const imageSrc = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(imageSrc);
    }
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
          <h2>Virtual Try-On</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Main View Area */}
        <div className="tryon-view-area">
          {/* Controls */}
          <div className="tryon-controls" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 40, background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(12px)', padding: '12px 16px', borderRadius: '12px', color: 'white', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: '160px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ccc' }}>Size</label>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{scaleMultiplier.toFixed(1)}</span>
              </div>
              <input type="range" min="0.5" max="3.0" step="0.05" value={scaleMultiplier} onChange={(e) => setScaleMultiplier(parseFloat(e.target.value))} style={{ width: '100%', height: '4px', accentColor: '#fff', cursor: 'pointer' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ccc' }}>Height (Y)</label>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{verticalOffset.toFixed(2)}</span>
              </div>
              <input type="range" min="-0.5" max="1.5" step="0.05" value={verticalOffset} onChange={(e) => setVerticalOffset(parseFloat(e.target.value))} style={{ width: '100%', height: '4px', accentColor: '#fff', cursor: 'pointer' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ccc' }}>Shift (X)</label>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{horizontalOffset.toFixed(2)}</span>
              </div>
              <input type="range" min="-0.5" max="0.5" step="0.02" value={horizontalOffset} onChange={(e) => setHorizontalOffset(parseFloat(e.target.value))} style={{ width: '100%', height: '4px', accentColor: '#fff', cursor: 'pointer' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ccc' }}>Tilt (Angle)</label>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{(tiltOffset * (180/Math.PI)).toFixed(0)}°</span>
              </div>
              <input type="range" min="-0.5" max="0.5" step="0.02" value={tiltOffset} onChange={(e) => setTiltOffset(parseFloat(e.target.value))} style={{ width: '100%', height: '4px', accentColor: '#fff', cursor: 'pointer' }} />
            </div>
          </div>

          {!isModelLoaded && (
            <div className="tryon-loading">
              <div className="spinner"></div>
              <p>Initializing AI Face Detection...</p>
            </div>
          )}
          
          {capturedImage && (
            <div className="captured-image-container" style={{ position: 'absolute', zIndex: 30, width: '100%', height: '100%', background: '#000' }}>
              <img src={capturedImage} alt="Captured" className="captured-image" />
            </div>
          )}
          
          <div className="video-container" style={{ visibility: capturedImage ? 'hidden' : 'visible' }}>
            {/* Hidden webcam, we draw everything to the canvas */}
              <Webcam
                ref={webcamRef}
                className="hidden-webcam"
                videoConstraints={{
                  facingMode: "user",
                  width: 640,
                  height: 480,
                }}
                mirrored={isMirrored}
              />
              <canvas ref={canvasRef} className="output-canvas"></canvas>
          </div>

          {/* Side Toolbar */}
          <div className="tryon-toolbar">
            {!capturedImage ? (
              <>
                <button className="tool-btn" onClick={() => setIsMirrored(!isMirrored)} title="Mirror Camera">
                  <FaSyncAlt />
                </button>
              </>
            ) : (
              <>
                <button className="tool-btn" onClick={() => setCapturedImage(null)} title="Retake">
                  <FaSyncAlt />
                </button>
                <button className="tool-btn download-btn" onClick={handleDownload} title="Download Photo">
                  <FaDownload />
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VirtualTryOn;
