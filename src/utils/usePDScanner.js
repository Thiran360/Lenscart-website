import { useEffect, useState } from 'react';

export function usePDScanner(videoRef, isScanning) {
  const [pdResult, setPdResult] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (!isScanning || !videoRef.current) return;
    
    // Reset previous result
    setPdResult(null);

    let camera = null;
    let faceMeshObj = null;
    let framesProcessed = 0;
    const pdMeasurements = [];
    const MAX_FRAMES = 40;
    let isActive = true;

    const initScanner = async () => {
      try {
        const loadScript = (src) => {
          return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        };

        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');

        if (!isActive) return;

        const FaceMesh = window.FaceMesh;
        const Camera = window.Camera;

        if (!FaceMesh || !Camera) {
          throw new Error("Mediapipe globals not loaded");
        }

        faceMeshObj = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        faceMeshObj.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMeshObj.onResults((results) => {
          if (!isActive) return;
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            const video = videoRef.current;
            const w = video.videoWidth || 640;
            const h = video.videoHeight || 480;

            let pixelsPerMm = 0;
            let pdDistancePx = 0;

            if (landmarks.length >= 478) {
              const leftPupil = { x: landmarks[468].x * w, y: landmarks[468].y * h };
              const rightPupil = { x: landmarks[473].x * w, y: landmarks[473].y * h };
              
              const dxPd = leftPupil.x - rightPupil.x;
              const dyPd = leftPupil.y - rightPupil.y;
              pdDistancePx = Math.sqrt(dxPd * dxPd + dyPd * dyPd);

              const leftIrisLeft = { x: landmarks[471].x * w, y: landmarks[471].y * h };
              const leftIrisRight = { x: landmarks[469].x * w, y: landmarks[469].y * h };
              
              const dxIris = leftIrisRight.x - leftIrisLeft.x;
              const dyIris = leftIrisRight.y - leftIrisLeft.y;
              const irisWidthPx = Math.sqrt(dxIris * dxIris + dyIris * dyIris);

              pixelsPerMm = irisWidthPx / 11.7; 
            } else {
              const leftCheek = { x: landmarks[234].x * w, y: landmarks[234].y * h };
              const rightCheek = { x: landmarks[454].x * w, y: landmarks[454].y * h };
              
              const dxFace = rightCheek.x - leftCheek.x;
              const dyFace = rightCheek.y - leftCheek.y;
              const faceWidthPx = Math.sqrt(dxFace * dxFace + dyFace * dyFace);
              
              pixelsPerMm = faceWidthPx / 145.0;

              const rOuter = { x: landmarks[33].x * w, y: landmarks[33].y * h };
              const rInner = { x: landmarks[133].x * w, y: landmarks[133].y * h };
              const lInner = { x: landmarks[362].x * w, y: landmarks[362].y * h };
              const lOuter = { x: landmarks[263].x * w, y: landmarks[263].y * h };

              const rightPupil = { x: (rOuter.x + rInner.x) / 2, y: (rOuter.y + rInner.y) / 2 };
              const leftPupil = { x: (lOuter.x + lInner.x) / 2, y: (lOuter.y + lInner.y) / 2 };

              const dxPd = leftPupil.x - rightPupil.x;
              const dyPd = leftPupil.y - rightPupil.y;
              pdDistancePx = Math.sqrt(dxPd * dxPd + dyPd * dyPd);
            }

            const currentPdMm = pdDistancePx / pixelsPerMm;

            if (currentPdMm > 40 && currentPdMm < 85) {
              pdMeasurements.push(currentPdMm);
            }
          }

          framesProcessed++;
          setScanProgress(Math.min(100, Math.floor((framesProcessed / MAX_FRAMES) * 100)));

          if (framesProcessed >= MAX_FRAMES) {
            if (camera) camera.stop();
            if (pdMeasurements.length > 0) {
              pdMeasurements.sort((a, b) => a - b);
              const trimCount = Math.floor(pdMeasurements.length * 0.2);
              const trimmed = pdMeasurements.slice(trimCount, pdMeasurements.length - trimCount);
              const avg = trimmed.reduce((a, b) => a + b, 0) / (trimmed.length || 1);
              setPdResult(Math.round(avg));
            } else {
              setPdResult(0); // Flag as invalid instead of faking it
            }
          }
        });

        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (isActive && framesProcessed < MAX_FRAMES && videoRef.current && faceMeshObj) {
              try {
                await faceMeshObj.send({ image: videoRef.current });
              } catch(e) {
                console.error("FaceMesh error:", e);
              }
            }
          },
          width: 640,
          height: 480
        });
        
        camera.start().catch(e => {
          console.error("Camera start error:", e);
          if (isActive) {
            setScanProgress(100);
            setPdResult(0); // Flag as invalid
          }
        });

        // Failsafe: if scanner gets stuck (e.g. mock camera or mediapipe fails to process frames)
        setTimeout(() => {
          if (isActive && framesProcessed < MAX_FRAMES) {
            console.warn("PD Scanner timed out. No face detected.");
            if (camera) camera.stop();
            setScanProgress(100);
            if (pdMeasurements.length > 0) {
              pdMeasurements.sort((a, b) => a - b);
              setPdResult(Math.round(pdMeasurements[Math.floor(pdMeasurements.length / 2)]));
            } else {
              setPdResult(0); // Flag as invalid instead of faking it
            }
          }
        }, 12000); // 12 seconds max

      } catch (err) {
        console.error("Failed to init PD scanner:", err);
      }
    };

    initScanner();

    return () => {
      isActive = false;
      if (camera) camera.stop();
      if (faceMeshObj) faceMeshObj.close();
    };
  }, [isScanning, videoRef]);

  return { pdResult, scanProgress };
}
