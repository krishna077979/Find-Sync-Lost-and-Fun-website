import React, { useState, useRef, useEffect } from 'react';

interface CameraCaptureWidgetProps {
  currentPhotoUrl: string | null;
  onPhotoCaptured: (url: string, fileName: string) => void;
  onPhotoRemoved: () => void;
}

export const CameraCaptureWidget: React.FC<CameraCaptureWidgetProps> = ({
  currentPhotoUrl,
  onPhotoCaptured,
  onPhotoRemoved,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setCameraError(
        'Direct webcam access not permitted in this sandbox. You can use the mock snapshot generator or upload an image file.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onPhotoCaptured(dataUrl, `camera_capture_${Date.now()}.jpg`);
        stopCamera();
      }
    }
  };

  // Mock simulated intake photo (for sandbox environments without hardware camera)
  const generateSimulatedPhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw background
      ctx.fillStyle = '#012d1d';
      ctx.fillRect(0, 0, 640, 480);

      // Gradient desk surface
      const grad = ctx.createLinearGradient(0, 240, 0, 480);
      grad.addColorStop(0, '#1b4332');
      grad.addColorStop(1, '#0e241b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 200, 640, 280);

      // Property badge
      ctx.fillStyle = '#ecfef1';
      ctx.fillRect(40, 40, 560, 30);
      ctx.fillStyle = '#012d1d';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('CALDWELL UNIVERSITY CUSTODY INTAKE PHOTOGRAPH', 50, 62);

      // Simulated object silhouette
      ctx.fillStyle = '#31684e';
      ctx.beginPath();
      ctx.arc(320, 260, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ITEM INTAKE VERIFIED', 320, 265);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#c1ecd4';
      ctx.fillText(`TIMESTAMP: ${new Date().toLocaleString()}`, 320, 420);

      const dataUrl = canvas.toDataURL('image/jpeg');
      onPhotoCaptured(dataUrl, `intake_evidence_${Date.now()}.jpg`);
      setCameraError(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onPhotoCaptured(url, file.name);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-bold text-[#101f17] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-[#012d1d]">photo_camera</span>
          Item Photograph / Intake Evidence
        </label>
        {currentPhotoUrl && (
          <button
            type="button"
            onClick={onPhotoRemoved}
            className="text-[12px] text-[#a23e18] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            <span>Remove Photo</span>
          </button>
        )}
      </div>

      {/* Active Camera Viewfinder */}
      {isCameraActive && (
        <div className="relative w-full aspect-video rounded-xl bg-black overflow-hidden border-2 border-[#1b4332] shadow-lg flex flex-col justify-between p-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Viewfinder crosshairs */}
          <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-between border border-white/40 rounded-lg p-3">
            <div className="flex justify-between text-white text-[10px] font-mono bg-black/50 px-2 py-0.5 rounded self-start">
              <span>CUSTODY SCANNER ACTIVE</span>
            </div>
            <div className="self-center w-24 h-24 border border-dashed border-white/60 rounded-xl" />
            <div className="text-right text-white text-[10px] font-mono bg-black/50 px-2 py-0.5 rounded self-end">
              <span>ALIGN ITEM IN CENTER</span>
            </div>
          </div>

          {/* Camera controls */}
          <div className="relative z-20 flex items-center justify-center gap-3 bg-black/60 backdrop-blur-xs p-2 rounded-xl mt-auto">
            <button
              type="button"
              onClick={stopCamera}
              className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-xs font-semibold hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={takeSnapshot}
              className="px-5 py-2 rounded-xl bg-white text-[#012d1d] text-sm font-bold shadow-lg hover:bg-[#e0f2e6] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-lg">circle</span>
              <span>Capture Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Current Preview If Photo Exists */}
      {!isCameraActive && currentPhotoUrl && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#c1ecd4] bg-[#e0f2e6] group shadow-xs">
          <img
            src={currentPhotoUrl}
            alt="Item photograph preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#012d1d]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
            <button
              type="button"
              onClick={startCamera}
              className="px-3 py-1.5 rounded-lg bg-white text-[#012d1d] text-xs font-bold shadow-md hover:bg-gray-100 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">photo_camera</span>
              <span>Retake with Camera</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-[#012d1d] text-white text-xs font-bold shadow-md hover:bg-[#1b4332] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              <span>Replace File</span>
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-[#012d1d]/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
            Intake Image Attached
          </div>
        </div>
      )}

      {/* No Photo State & Actions */}
      {!isCameraActive && !currentPhotoUrl && (
        <div className="flex flex-col gap-2">
          <div className="border-2 border-dashed border-[#c1ecd4] rounded-xl p-5 flex flex-col items-center justify-center text-center bg-[#f7fdf9]">
            <span className="material-symbols-outlined text-3xl text-[#1b4332] mb-1">add_a_photo</span>
            <p className="text-[13px] font-semibold text-[#101f17]">
              Attach a clear photo of the item or its purchase receipt
            </p>
            <p className="text-[11px] text-[#414844] max-w-sm mt-0.5 mb-3">
              Items with photographs match 3.8x faster with our AI visual alignment engine.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={startCamera}
                className="px-3.5 py-1.5 rounded-lg bg-[#012d1d] text-white text-[12px] font-bold hover:bg-[#1b4332] flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
                <span>Open Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-[#d5e7da] text-[#012d1d] text-[12px] font-bold hover:bg-[#e6f8eb] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-base">file_upload</span>
                <span>Upload From Device</span>
              </button>

              <button
                type="button"
                onClick={generateSimulatedPhoto}
                className="px-3 py-1.5 rounded-lg bg-[#e0f2e6] text-[#012d1d] text-[12px] font-semibold hover:bg-[#c1ecd4] cursor-pointer"
                title="Generates a calibrated custody intake test snapshot"
              >
                Simulate Camera Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-2.5 rounded-lg bg-[#ffdbcf]/50 border border-[#fe8357]/40 text-[#a23e18] text-[12px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">info</span>
            <span>{cameraError}</span>
          </div>
          <button
            type="button"
            onClick={generateSimulatedPhoto}
            className="underline font-bold whitespace-nowrap"
          >
            Use Simulated Photo
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};
