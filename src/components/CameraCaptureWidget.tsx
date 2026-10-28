import React, { useState, useRef, useEffect } from 'react';

interface CameraCaptureWidgetProps {
  currentPhotoUrl: string | null;
  onPhotoCaptured: (url: string, fileName?: string) => void;
  onPhotoRemoved: () => void;
}

export const CameraCaptureWidget: React.FC<CameraCaptureWidgetProps> = ({
  currentPhotoUrl,
  onPhotoCaptured,
  onPhotoRemoved,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef(true);

  // Stop camera tracks cleanly
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopCameraStream();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!isCameraActive || capturedSnapshot || !video || !stream) return;

    video.srcObject = stream;
    void video.play().catch(() => {
      setCameraError('Camera is ready, but the preview did not start. Try the camera again or upload a photo.');
    });
  }, [isCameraActive, capturedSnapshot]);

  // Request camera permission only after user explicitly clicks "Take Photo"
  const handleStartCamera = async () => {
    setCameraError(null);
    setFileError(null);
    setCapturedSnapshot(null);
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError('Camera access requires a secure connection (HTTPS). Open this app over HTTPS or use Upload Photo.');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Direct webcam capture is not supported in this browser. Please use the Upload Photo option.');
      return;
    }

    setIsRequestingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setIsCameraActive(true);
      setCameraError(null);
    } catch (err: unknown) {
      const cameraFailure = err instanceof Error ? err : new Error('Unknown camera error');
      console.warn('Camera permission or device error:', cameraFailure);
      let errorMsg = 'Unable to access your device camera.';
      if (cameraFailure.name === 'NotAllowedError' || cameraFailure.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission was denied. You can allow camera access in browser settings or choose "Upload Photo" below.';
      } else if (cameraFailure.name === 'NotFoundError' || cameraFailure.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera device was detected on your hardware. Please use "Upload Photo" instead.';
      } else if (cameraFailure.name === 'NotReadableError' || cameraFailure.name === 'TrackStartError') {
        errorMsg = 'Your camera is already in use by another application. Please close other camera apps or upload a photo.';
      }
      if (isMountedRef.current) {
        setCameraError(errorMsg);
        stopCameraStream();
      }
    } finally {
      if (isMountedRef.current) setIsRequestingCamera(false);
    }
  };

  // Capture snapshot from live video feed
  const handleCaptureSnapshot = () => {
    if (videoRef.current) {
      try {
        const video = videoRef.current;
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) {
          setCameraError('Camera preview is still starting. Wait a moment and try again.');
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setCapturedSnapshot(dataUrl);
        }
      } catch (err) {
        console.error('Failed to capture frame:', err);
        setCameraError('Failed to capture frame from video feed. Please try again.');
      }
    }
  };

  // Retake captured photo (re-opens video feed)
  const handleRetakeSnapshot = () => {
    setCapturedSnapshot(null);
    if (!streamRef.current) {
      handleStartCamera();
    }
  };

  // Commit captured snapshot
  const handleUseCapturedPhoto = () => {
    if (capturedSnapshot) {
      onPhotoCaptured(capturedSnapshot, `camera_capture_${Date.now()}.jpg`);
      setCapturedSnapshot(null);
      stopCameraStream();
    }
  };

  // Cancel camera entirely
  const handleCancelCamera = () => {
    setCapturedSnapshot(null);
    stopCameraStream();
  };

  // File Upload handler with format and file size validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate format
      if (!file.type.startsWith('image/')) {
        setFileError('Invalid file format. Please select an image (JPG, PNG, WebP, or HEIC).');
        return;
      }

      // Validate size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileError(`Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose an image under 10MB.`);
        return;
      }

      setIsProcessingUpload(true);
      const reader = new FileReader();
      reader.onload = () => {
        setIsProcessingUpload(false);
        if (reader.result && typeof reader.result === 'string') {
          onPhotoCaptured(reader.result, file.name);
        }
      };
      reader.onerror = () => {
        setIsProcessingUpload(false);
        setFileError('Failed to read the selected image file. Please try another image.');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Camera Live Viewfinder / Snapshot Review */}
      {isCameraActive && (
        <div className="relative w-full rounded-2xl overflow-hidden bg-black border-2 border-[#012d1d] shadow-md flex flex-col p-4 animate-in fade-in">
          {capturedSnapshot ? (
            // Captured Snapshot Preview before confirmation
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={capturedSnapshot}
                alt="Captured Snapshot"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-[#012d1d]/85 text-white text-xs px-2.5 py-1 rounded-md font-semibold">
                Photo Preview (Confirm or Retake)
              </div>
            </div>
          ) : (
            // Live Camera View
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Viewfinder Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 border border-white/20 rounded-xl">
                <div className="flex items-center justify-between text-[11px] text-white/90 font-mono bg-black/60 px-2.5 py-1 rounded-md self-start">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE CAMERA PREVIEW
                  </span>
                </div>
                <div className="self-center w-40 h-40 border-2 border-dashed border-white/70 rounded-2xl" />
                <div className="text-[11px] text-white/80 font-mono bg-black/60 px-2.5 py-1 rounded-md self-end">
                  FRAME ITEM CLEARLY
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar: Capture, Retake, Cancel, Use Photo */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 mt-3">
            <button
              type="button"
              onClick={handleCancelCamera}
              className="px-4 py-2 rounded-xl bg-white/15 text-white hover:bg-white/25 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            {capturedSnapshot ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetakeSnapshot}
                  className="px-4 py-2 rounded-xl bg-white text-[#012d1d] hover:bg-gray-100 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={handleUseCapturedPhoto}
                  className="px-5 py-2 rounded-xl bg-[#012d1d] text-white hover:bg-[#1b4332] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer border border-[#c1ecd4]/30"
                >
                  <span className="material-symbols-outlined text-base">check</span>
                  <span>Use Photo</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                className="px-6 py-2.5 rounded-xl bg-white text-[#012d1d] hover:bg-[#e0f2e6] text-sm font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl text-[#a23e18]">radio_button_checked</span>
                <span>Capture Photo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Photo Attached Preview State */}
      {!isCameraActive && currentPhotoUrl && (
        <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#1b4332] bg-[#fbfdf9] p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xs">
          <div className="relative w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-[#e0f2e6] border border-[#c1ecd4] shrink-0">
            <img
              src={currentPhotoUrl}
              alt="Item preview"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 bg-[#012d1d]/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
              Attached
            </span>
          </div>

          <div className="flex flex-col justify-between flex-1 gap-2 w-full">
            <div>
              <span className="text-[11px] font-bold text-[#a23e18] uppercase tracking-wider block">
                Intake Photograph Attached
              </span>
              <h4 className="text-[15px] font-bold text-[#012d1d]">Item Photo Ready for Visual Matching</h4>
              <p className="text-[12px] text-[#414844] mt-0.5">
                Our campus matching algorithm analyzes color palettes, shape contours, and brand markers to surface high-probability pairs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartCamera}
                disabled={isRequestingCamera}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#d5e7da] text-[#012d1d] text-xs font-bold hover:bg-[#e6f8eb] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                <span>{isRequestingCamera ? 'Requesting permission…' : 'Retake Photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#d5e7da] text-[#012d1d] text-xs font-bold hover:bg-[#e6f8eb] transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">image</span>
                <span>Replace Photo</span>
              </button>

              <button
                type="button"
                onClick={onPhotoRemoved}
                className="px-3 py-1.5 rounded-xl bg-[#ffdbcf] text-[#a23e18] text-xs font-bold hover:bg-[#fed3c4] transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Empty Upload Section: Exact Section 4 Specifications */}
      {!isCameraActive && !currentPhotoUrl && (
        <div className="rounded-2xl border-2 border-[#1b4332] bg-[#fbfdf9] p-6 sm:p-7 flex flex-col items-center justify-center text-center gap-3 transition-all">
          {/* Camera icon inside rounded, forest-green outlined area */}
          <div className="w-14 h-14 rounded-2xl bg-[#e6f8eb] text-[#012d1d] flex items-center justify-center border border-[#c1ecd4] shadow-xs">
            <span className="material-symbols-outlined text-3xl">photo_camera</span>
          </div>

          {/* Heading & Helper Text */}
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[17px] font-bold text-[#012d1d]">
              Add a photo of your item
            </h3>
            <p className="text-[13px] text-[#414844]">
              Take a new photo or choose one from your device
            </p>
          </div>

          {/* Take Photo and Upload Photo Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleStartCamera}
              disabled={isRequestingCamera}
              className="px-4 py-2.5 rounded-xl bg-[#012d1d] text-white text-xs sm:text-[13px] font-bold hover:bg-[#1b4332] transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-base ${isRequestingCamera ? 'animate-pulse' : ''}`}>{isRequestingCamera ? 'hourglass_top' : 'photo_camera'}</span>
              <span>{isRequestingCamera ? 'Requesting camera permission…' : 'Take Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingUpload}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#d5e7da] text-[#012d1d] text-xs sm:text-[13px] font-bold hover:bg-[#e6f8eb] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">image</span>
              <span>{isProcessingUpload ? 'Reading file...' : 'Upload Photo'}</span>
            </button>
          </div>

          <span className="text-[11px] text-[#717973]">
            Supports JPG, PNG, WebP up to 10MB · Privacy-protected
          </span>
          <span className="text-[11px] text-[#717973]">
            Your browser asks for camera access only after you select Take Photo. The camera turns off when you cancel or use the photo.
          </span>
        </div>
      )}

      {/* Error & Fallback Feedback */}
      {cameraError && (
        <div className="p-3.5 rounded-xl bg-[#ffdbcf]/80 border border-[#fe8357]/60 text-[#390c00] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-base text-[#a23e18] shrink-0 mt-0.5">info</span>
            <span>{cameraError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 rounded-lg bg-[#012d1d] text-white font-bold hover:bg-[#1b4332] cursor-pointer"
            >
              Choose Existing File
            </button>
          </div>
        </div>
      )}

      {fileError && (
        <div className="p-3 rounded-xl bg-[#ffdbcf]/80 border border-[#fe8357]/60 text-[#a23e18] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-base">warning</span>
          <span>{fileError}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
