
import React, { useState, useEffect, useRef } from 'react';
import { ChristmasTreeScene } from './components/ChristmasTreeScene';
import { UIControls } from './components/UIControls';
import { PhotoData, GestureState } from './types';
import { audioManager } from './services/audio';
import { initializeGestureRecognizer, predictWebcam } from './services/mediapipe';

const App: React.FC = () => {
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [gestureState, setGestureState] = useState<GestureState>(GestureState.NONE);
  const [isMuted, setIsMuted] = useState(false);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastGestureTime = useRef<number>(0);

  // Initialize video element once with mobile-friendly settings
  useEffect(() => {
    const vid = document.createElement("video");
    vid.playsInline = true;
    vid.muted = true;
    videoRef.current = vid;
  }, []);

  // Audio Init on first interaction
  useEffect(() => {
    const initAudio = () => {
        audioManager.startBGM().catch(() => {});
        window.removeEventListener('click', initAudio);
    };
    window.addEventListener('click', initAudio);
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const handleExplodeChange = (val: number) => {
      // Debounce sound
      if (Math.abs(val - explodeFactor) > 0.1) {
          audioManager.playSwoosh();
      }
      setExplodeFactor(val);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      audioManager.playSuccess();
      setCelebrationTrigger(Date.now()); // Trigger celebration animation
      
      const newPhotos: PhotoData[] = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        url: URL.createObjectURL(file as Blob)
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
      
      // Reset input value to allow uploading same file again if needed
      e.target.value = '';
    }
  };

  const toggleGesture = async () => {
    if (!videoRef.current) return;

    if (!gestureEnabled) {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Webcam API not supported in this environment");
            }
            
            await initializeGestureRecognizer();
            
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            
            videoRef.current.onloadeddata = () => {
                predict();
            }
            setGestureEnabled(true);
            audioManager.playPop();
        } catch (err: any) {
            console.warn("Camera access failed:", err);
            let msg = "Camera access denied or failed.";
            if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                msg = "No webcam device found.";
            } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                msg = "Camera permission denied. Check browser settings.";
            }
            alert(msg);
            setGestureEnabled(false);
        }
    } else {
        setGestureEnabled(false);
        if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
        
        const stream = videoRef.current.srcObject as MediaStream | null;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  };

  const predict = () => {
      if (!videoRef.current) return;

      if (videoRef.current.readyState === 4) {
          predictWebcam(videoRef.current, (gesture, xPos) => {
             setGestureState(gesture);
             
             // Smooth lerp based on gesture
             setExplodeFactor(prev => {
                 let target = prev;
                 if (gesture === GestureState.OPEN_PALM) target = 1;
                 if (gesture === GestureState.CLOSED_FIST) target = 0;
                 
                 // Smooth transition
                 const diff = target - prev;
                 if (Math.abs(diff) > 0.01) {
                     return prev + diff * 0.05;
                 }
                 return prev;
             });
             
             // Sound effects triggers based on gesture change
             const now = Date.now();
             if (now - lastGestureTime.current > 1000) {
                 if (gesture === GestureState.OPEN_PALM) {
                     audioManager.playSwoosh();
                     lastGestureTime.current = now;
                 } else if (gesture === GestureState.CLOSED_FIST) {
                     audioManager.playPop();
                     lastGestureTime.current = now;
                 }
             }
          });
      }
      
      // Continue loop only if gesture is enabled
      // We check the state setter's functional update or ref if we were strictly inside a closure, 
      // but here we rely on the fact that predict calls itself. 
      // However, if we toggle off, we cancel the animation frame in toggleGesture.
      requestRef.current = requestAnimationFrame(predict);
  };

  const toggleMute = () => {
      audioManager.toggleMute();
      setIsMuted(!isMuted);
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative selection:bg-yellow-500 selection:text-black">
      <ChristmasTreeScene 
        explodeFactor={explodeFactor} 
        rotationSpeed={0.2}
        photos={photos} 
        gestureState={gestureState}
        celebrationTrigger={celebrationTrigger}
      />
      <UIControls 
        explodeFactor={explodeFactor}
        setExplodeFactor={handleExplodeChange}
        onUpload={handleUpload}
        toggleGesture={toggleGesture}
        gestureEnabled={gestureEnabled}
        isMuted={isMuted}
        toggleMute={toggleMute}
      />
    </div>
  );
};

export default App;