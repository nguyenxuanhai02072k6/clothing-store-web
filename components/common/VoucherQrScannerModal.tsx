'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  X,
  FlipHorizontal,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  RefreshCw,
  QrCode
} from 'lucide-react';
import jsQR from 'jsqr';
import { extractVoucherCodeFromQR, SAMPLE_VOUCHERS } from '@/lib/voucherQr';

interface VoucherQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
  title?: string;
  subtitle?: string;
}

export const VoucherQrScannerModal: React.FC<VoucherQrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Quét mã QR Voucher',
  subtitle = 'Hướng camera về phía mã QR voucher trên điện thoại hoặc thẻ ưu đãi',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Play audio beep feedback on scan success
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext may be blocked before gesture
    }
  };

  const handleDetectedCode = useCallback(
    (rawPayload: string) => {
      const code = extractVoucherCodeFromQR(rawPayload);
      if (!code) return;

      playBeep();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([80, 40, 80]);
        } catch {
          // ignore
        }
      }

      setScannedCode(code);

      // Stop camera feed immediately
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Small delay to allow the user to see the success state
      setTimeout(() => {
        onScanSuccess(code);
        onClose();
      }, 700);
    },
    [onScanSuccess, onClose]
  );

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setScannedCode(null);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Trình duyệt hoặc thiết bị không hỗ trợ truy cập camera.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setHasCamera(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Bạn đã từ chối quyền truy cập Camera. Vui lòng cấp quyền trong cài đặt trình duyệt hoặc tải ảnh QR lên.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Không tìm thấy thiết bị Camera trên máy này.');
      } else {
        setCameraError(`Không thể khởi động camera (${err.message || 'Lỗi thiết bị'}). Vui lòng thử tải ảnh mã QR hoặc chọn mã mẫu bên dưới.`);
      }
    }
  }, [facingMode]);

  // Frame processing loop with jsQR
  useEffect(() => {
    if (!isOpen || !hasCamera || scannedCode) return;

    let isActive = true;

    const scanFrame = () => {
      if (!isActive) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrResult = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (qrResult && qrResult.data) {
              handleDetectedCode(qrResult.data);
              return;
            }
          } catch {
            // Error reading frame, continue loop
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, hasCamera, scannedCode, handleDetectedCode]);

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScannedCode(null);
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, startCamera]);

  // Toggle front/back camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Process uploaded image containing QR
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrResult = jsQR(imageData.data, imageData.width, imageData.height);

          setIsProcessingFile(false);
          if (qrResult && qrResult.data) {
            handleDetectedCode(qrResult.data);
          } else {
            alert('Không tìm thấy mã QR hợp lệ trong hình ảnh vừa tải lên. Vui lòng thử lại với ảnh rõ nét hơn!');
          }
        } else {
          setIsProcessingFile(false);
        }
      };
      img.onerror = () => {
        setIsProcessingFile(false);
        alert('Không thể đọc file hình ảnh.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Hidden offscreen canvas for frame processing */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-1.5">
                {title}
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-neutral-400 line-clamp-1">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Camera Screen */}
        <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center">
          {hasCamera && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Scanner Overlay Frame */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Darkened corners */}
            <div className="relative w-64 h-64 border-2 border-rose-500/70 rounded-2xl overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-rose-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-rose-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-rose-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-rose-500 rounded-br-lg" />

              {/* Scanning red laser line */}
              {!scannedCode && !cameraError && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-[bounce_2s_infinite]" />
              )}

              {/* Success badge over viewfinder */}
              {scannedCode && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 animate-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest">
                    Đã nhận diện Voucher
                  </span>
                  <span className="text-xl font-black font-mono text-white tracking-widest mt-1 bg-emerald-900/60 px-4 py-1.5 rounded-xl border border-emerald-500/30">
                    {scannedCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Camera Error / Fallback Screen */}
          {cameraError && !scannedCode && (
            <div className="absolute inset-0 bg-neutral-950 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-neutral-300 max-w-xs leading-relaxed mb-4">
                {cameraError}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Thử lại
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Tải ảnh QR
                </button>
              </div>
            </div>
          )}

          {/* Viewfinder Controls Floating Over Video */}
          {!cameraError && !scannedCode && (
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
                className="px-3 py-1.5 rounded-full bg-neutral-900/85 hover:bg-neutral-800 text-neutral-200 text-xs font-medium flex items-center gap-1.5 backdrop-blur-md border border-neutral-700/60 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-rose-400" />
                {isProcessingFile ? 'Đang đọc ảnh...' : 'Tải ảnh QR'}
              </button>

              <button
                type="button"
                onClick={toggleFacingMode}
                className="w-8 h-8 rounded-full bg-neutral-900/85 hover:bg-neutral-800 text-neutral-200 flex items-center justify-center backdrop-blur-md border border-neutral-700/60 transition-colors"
                title="Đổi camera trước/sau"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Test Codes Bar (Useful for POS/Web Demo without physical papers) */}
        <div className="p-4 bg-neutral-950/80 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Tag className="w-3 h-3 text-rose-400" />
              Mã QR mẫu thử nghiệm nhanh:
            </span>
            <span className="text-[9px] text-neutral-500">Bấm mã để mô phỏng quét</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_VOUCHERS.slice(0, 3).map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleDetectedCode(item.code)}
                className="text-left p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-rose-500/40 transition-all text-xs group cursor-pointer"
              >
                <div className="font-mono font-bold text-rose-400 text-[11px] group-hover:text-rose-300">
                  {item.code}
                </div>
                <div className="text-[10px] text-neutral-400 line-clamp-1">{item.label}</div>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-center text-neutral-500 mt-3">
            Hỗ trợ tất cả mã QR in trên tem nhãn, tin nhắn SMS/Zalo hoặc trên màn hình ứng dụng NOVYN Circle.
          </p>
        </div>
      </div>
    </div>
  );
};
