import React, { useRef, useState, useEffect } from "react";
import { createWorker } from "tesseract.js";
import { Camera, Image, RefreshCw, AlertCircle, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { toast } from "sonner";

interface MedicineScannerProps {
  onScanSuccess: (rawText: string) => void;
  onCancel: () => void;
}

export function MedicineScanner({ onScanSuccess, onCancel }: MedicineScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  
  // OCR processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      // Release any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Prioritize environment (rear) camera on mobile devices
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error: any) {
      console.error("Camera access failed:", error);
      let errorMsg = "Could not access camera. Please verify permissions.";
      if (error.name === "NotAllowedError") {
        errorMsg = "Camera permission was denied. Please enable it in browser settings.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMsg = "No camera hardware detected on this device.";
      }
      setCameraError(errorMsg);
      setCameraActive(false);
      toast.error(errorMsg);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Capture current video frame
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current || !stream) {
      toast.error("Camera stream is not ready.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas dimensions to match video stream aspect ratio
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to data URL for preview and OCR
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setPreviewImage(dataUrl);
    
    // Stop camera streams once captured to conserve battery/performance
    stopCamera();

    // Process OCR
    runOCR(dataUrl);
  };

  // Handle uploaded files as fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewImage(dataUrl);
      stopCamera();
      runOCR(dataUrl);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  // OCR Processing Logic using Tesseract.js
  const runOCR = async (imageSrc: string) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setStatusText("Loading AI engine...");

    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const progress = Math.round(m.progress * 100);
            setProcessingProgress(progress);
            setStatusText(`Scanning labels: ${progress}%`);
          } else {
            // Translate status keys into user-friendly messages
            const statusMap: Record<string, string> = {
              "loading tesseract core": "Booting scanner core...",
              "initializing api": "Configuring medical filters...",
              "recognizing text": "Extracting chemical names...",
            };
            setStatusText(statusMap[m.status] || "Analyzing bottle...");
          }
        },
      });

      const { data: { text } } = await worker.recognize(imageSrc);
      await worker.terminate();

      // Dispatch OCR text
      setIsProcessing(false);
      onScanSuccess(text);
    } catch (err: any) {
      console.error("Tesseract error:", err);
      toast.error("OCR analysis failed. Please try a clearer picture.");
      setIsProcessing(false);
      
      // Restart camera to let them try again
      startCamera();
    }
  };

  const resetScanner = () => {
    setPreviewImage(null);
    setIsProcessing(false);
    startCamera();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      {/* Hidden canvas for drawing snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for upload backup */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <Card className="overflow-hidden border border-slate-100 shadow-xl bg-white/95 backdrop-blur-md">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center gap-3 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="rounded-full h-8 w-8 hover:bg-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-[#0F172A] flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-[#0B5FA5] animate-pulse" />
              Smart Scan Medicine
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Find affordable generic equivalents instantly
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Main camera / loading viewport */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#090D1A] border border-slate-800 shadow-inner flex flex-col items-center justify-center">
            
            {/* 1. OCR Loading Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
                  <Loader2 className="h-12 w-12 text-[#2C8ED6] animate-spin relative z-10" />
                </div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
                  Reading Prescription
                </h3>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-4">
                  {statusText}
                </p>
                <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* 2. Image Capture Preview (Static) */}
            {previewImage && !isProcessing && (
              <div className="absolute inset-0 z-20 bg-slate-900 flex items-center justify-center">
                <img
                  src={previewImage}
                  alt="Captured drug label"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* 3. Camera Active Viewport */}
            {cameraActive && !previewImage && (
              <div className="absolute inset-0 w-full h-full z-10">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Visual Scanner HUD Overlay */}
                <div className="absolute inset-0 border-[24px] border-slate-950/60 pointer-events-none flex items-center justify-center">
                  <div className="relative w-full h-full max-w-[85%] max-h-[85%] border-2 border-dashed border-[#2C8ED6]/80 rounded-lg shadow-[0_0_0_999px_rgba(0,0,0,0.3)]">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#2C8ED6] -mt-1 -ml-1 rounded-tl"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#2C8ED6] -mt-1 -mr-1 rounded-tr"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#2C8ED6] -mb-1 -ml-1 rounded-bl"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#2C8ED6] -mb-1 -mr-1 rounded-br"></div>
                    
                    {/* Laser scanner guide animation */}
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#2C8ED6] to-transparent shadow-[0_0_12px_#2C8ED6] animate-[scan_2.5s_ease-in-out_infinite]"></div>

                    {/* OCR Text Frame Help Indicator */}
                    <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                      <span className="bg-slate-950/80 text-[10px] text-slate-300 font-medium px-2.5 py-1.5 rounded-full border border-slate-800 backdrop-blur-sm tracking-wide">
                        FRAME DRUG NAME CLEARLY
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Camera Error / Hardware Fallback HUD */}
            {cameraError && !previewImage && (
              <div className="p-6 text-center text-slate-400 z-10">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Camera Access Restricted</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                  {cameraError}
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startCamera}
                    className="border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Retry Cam
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#2C8ED6] hover:bg-[#2C8ED6]/90 text-white"
                  >
                    <Image className="mr-1.5 h-3.5 w-3.5" />
                    Upload Image
                  </Button>
                </div>
              </div>
            )}

            {/* Default State before Stream initializes */}
            {!cameraActive && !cameraError && !previewImage && !isProcessing && (
              <div className="text-slate-500 text-sm flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                <span>Initializing camera hardware...</span>
              </div>
            )}
          </div>

          {/* Action buttons at the bottom */}
          <div className="mt-6 flex flex-col gap-3">
            {cameraActive && !previewImage && (
              <div className="flex gap-4">
                <Button
                  onClick={captureSnapshot}
                  className="flex-1 py-6 bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6] hover:shadow-lg hover:shadow-blue-500/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 border-0 group transition-all"
                >
                  <Camera className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Capture Photo
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 px-5 rounded-xl"
                  title="Upload from gallery"
                >
                  <Image className="h-5 w-5" />
                </Button>
              </div>
            )}

            {previewImage && !isProcessing && (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={resetScanner}
                  className="flex-1 py-5 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake Photo
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 px-6 rounded-xl"
                >
                  <Image className="h-5 w-5" />
                </Button>
              </div>
            )}

            <p className="text-slate-500 text-[10px] text-center mt-2 leading-relaxed">
              * The scanner processes images entirely on your device. We do not store or transmit your photos. Ensure good lighting and hold the bottle steady.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Keyframe scan-line animation inject */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 5%; }
          50% { top: 95%; }
          100% { top: 5%; }
        }
      `}} />
    </div>
  );
}
