import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { createWorker } from "tesseract.js";
import { extractMedicineName } from "../app/utils/textParser";
import { 
  Activity, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  ExternalLink, 
  Camera, 
  Image, 
  RefreshCw, 
  BookOpen, 
  Sparkles, 
  Heart,
  Pill,
  Clock,
  AlertCircle,
  TrendingDown,
  Loader2
} from "lucide-react";
import { Button } from "../app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../app/components/ui/card";
import { toast } from "sonner";

export interface MedicalHistory {
  id: string;
  patient_name: string;
  next_checkup_due: string;
  last_checkup_date: string;
  blood_group: string;
  allergies: string[];
}

export interface DiagnosticTest {
  id: string;
  name: string;
  provider: string; // Thyrocare, Dr Lal PathLabs, Apollo Diagnostics
  price: number;
  original_price: number;
  description: string;
  partner_payment_url: string;
}

export interface AIAdvisory {
  brand_name: string;
  generic_name: string;
  dosage: string;
  interval: string;
  meal_pairing: string;
  precautions: string;
}

// Pre-seeded high-fidelity mock databases for immediate offline sandbox testing
const MOCK_HISTORY: MedicalHistory = {
  id: "h1",
  patient_name: "John Doe",
  next_checkup_due: "2026-05-15", // Overdue relative to 2026-06-01!
  last_checkup_date: "2025-11-15",
  blood_group: "O-Positive",
  allergies: ["Penicillin", "Peanuts"]
};

const MOCK_DIAGNOSTIC_TESTS: DiagnosticTest[] = [
  {
    id: "t1",
    name: "Executive Full Body Health Checkup",
    provider: "Thyrocare",
    price: 49.00,
    original_price: 120.00,
    description: "Complete screening of liver, kidney, thyroid, heart, and hemogram with 82 vital bio-parameters.",
    partner_payment_url: "https://www.thyrocare.com/"
  },
  {
    id: "t2",
    name: "Complete Hemogram & Diabetes Screen",
    provider: "Dr Lal PathLabs",
    price: 29.00,
    original_price: 65.00,
    description: "Vital screen checking HbA1c, fasting blood glucose, and complete blood count (CBC) profiles.",
    partner_payment_url: "https://www.lalpathlabs.com/"
  },
  {
    id: "t3",
    name: "Vitamin D & B12 Vitality Screening",
    provider: "Apollo Diagnostics",
    price: 35.00,
    original_price: 80.00,
    description: "Targeted screening assessing vital neuro-muscular health, bone strength, and immunity levels.",
    partner_payment_url: "https://www.apollodiagnostics.in/"
  },
  {
    id: "t4",
    name: "Cardiac Risk Profile & Lipid Test",
    provider: "Max Labs",
    price: 55.00,
    original_price: 110.00,
    description: "Comprehensive lipid assessment checking cholesterol, HDL, LDL, and cardiac risk triglycerides.",
    partner_payment_url: "https://www.maxlab.co.in/"
  }
];

const AI_DRUG_ADVISORIES: Record<string, AIAdvisory> = {
  "Lipitor": {
    brand_name: "Lipitor",
    generic_name: "Atorvastatin",
    dosage: "10mg / 20mg",
    interval: "Take 1 tablet daily, preferably at the same time in the evening.",
    meal_pairing: "Can be taken with or without food. Consistency is key.",
    precautions: "Report any unexplained muscle pain or weakness immediately. Avoid drinking excessive alcohol."
  },
  "Advil": {
    brand_name: "Advil",
    generic_name: "Ibuprofen",
    dosage: "200mg",
    interval: "Take 1 tablet every 4 to 6 hours as needed for pain. Max 6 tablets in 24 hours.",
    meal_pairing: "Take with food, milk, or immediately after a meal to prevent gastric stomach upset.",
    precautions: "Do not use for more than 10 consecutive days without doctor approval. Avoid if you have stomach ulcers."
  },
  "Glucophage": {
    brand_name: "Glucophage",
    generic_name: "Metformin",
    dosage: "500mg / 850mg",
    interval: "Take 1 tablet twice daily (usually with breakfast and dinner).",
    meal_pairing: "Must be taken during or immediately after meals to reduce stomach side effects.",
    precautions: "Monitor blood glucose levels regularly. Alert your doctor if you experience extreme fatigue."
  },
  "Synthroid": {
    brand_name: "Synthroid",
    generic_name: "Levothyroxine",
    dosage: "50mcg / 100mcg",
    interval: "Take 1 tablet daily in the morning.",
    meal_pairing: "Must be taken on an empty stomach at least 30-60 minutes before breakfast with a full glass of water.",
    precautions: "Avoid taking antacids, calcium, or iron supplements within 4 hours of Synthroid."
  },
  "Zantac": {
    brand_name: "Zantac",
    generic_name: "Ranitidine",
    dosage: "150mg",
    interval: "Take 1 tablet twice daily (morning and evening) or once at bedtime.",
    meal_pairing: "May be taken with or without food. Take 30-60 minutes before trigger meals.",
    precautions: "Avoid smoking as it decreases drug effectiveness. Do not exceed recommended dosage."
  },
  "Amoxil": {
    brand_name: "Amoxil",
    generic_name: "Amoxicillin",
    dosage: "250mg / 500mg",
    interval: "Take 1 tablet every 8 or 12 hours as prescribed.",
    meal_pairing: "May be taken with food to reduce gastrointestinal irritation.",
    precautions: "Complete the entire course prescribed by your physician even if symptoms clear up early. Watch for allergic rash."
  },
  "Zoloft": {
    brand_name: "Zoloft",
    generic_name: "Sertraline",
    dosage: "50mg",
    interval: "Take 1 tablet daily at the same time (morning or evening).",
    meal_pairing: "Take with or without food, but keep administration consistent.",
    precautions: "Do not stop taking abruptly. May cause drowsiness; avoid alcohol consumption during treatment."
  },
  "Plavix": {
    brand_name: "Plavix",
    generic_name: "Clopidogrel",
    dosage: "75mg",
    interval: "Take 1 tablet daily.",
    meal_pairing: "Can be taken with or without food.",
    precautions: "High risk of bleeding. Notify surgeons and dentists about Plavix use before any surgical procedures."
  },
  "Singulair": {
    brand_name: "Singulair",
    generic_name: "Montelukast",
    dosage: "10mg",
    interval: "Take 1 tablet daily in the evening.",
    meal_pairing: "Take with or without food.",
    precautions: "For asthma prevention and allergy relief. Report any sudden mood or behavioral shifts to your physician."
  },
  "Nexium": {
    brand_name: "Nexium",
    generic_name: "Esomeprazole",
    dosage: "20mg / 40mg",
    interval: "Take 1 tablet daily in the morning.",
    meal_pairing: "Take on an empty stomach at least one hour before breakfast.",
    precautions: "Swallow tablets whole; do not crush or chew. Long-term use should be clinically monitored."
  }
};

export default function DiagnosticsAndAlerts() {
  const [history, setHistory] = useState<MedicalHistory | null>(null);
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isAlertActive, setIsAlertActive] = useState<boolean>(false);

  const STATE_DISTRICT_MAP: Record<string, string[]> = {
    "West Bengal": ["Kolkata", "North 24 Parganas", "Howrah"],
    "Jharkhand": ["Ranchi", "Giridih", "East Singhbhum", "Dhanbad"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli"]
  };

  const [stateFilter, setStateFilter] = useState<string>("West Bengal");
  const [districtFilter, setDistrictFilter] = useState<string>("Kolkata");

  const handleStateChange = (stateName: string) => {
    setStateFilter(stateName);
    const districts = STATE_DISTRICT_MAP[stateName] || [];
    if (districts.length > 0) {
      setDistrictFilter(districts[0]);
    } else {
      setDistrictFilter("");
    }
  };

  useEffect(() => {
    if (stateFilter && districtFilter) {
      toast.success(`Showing nearest lab partners in ${districtFilter}, ${stateFilter}`, { icon: "📍" });
    }
  }, [districtFilter, stateFilter]);

  // AI Scanner camera states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // AI Scanner OCR states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [matchedAdvisory, setMatchedAdvisory] = useState<AIAdvisory | null>(null);
  
  // Dropdown manual override backup
  const [selectedManualDrug, setSelectedManualDrug] = useState<string>("");

  // Initialize data hooks
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true);

        // Query medical history
        const { data: historyData, error: hError } = await supabase
          .from("medical_history")
          .select("*")
          .single();

        if (hError) throw hError;

        // Query diagnostic tests
        const { data: testData, error: tError } = await supabase
          .from("diagnostic_tests")
          .select("*");

        if (tError) throw tError;

        if (historyData) {
          setHistory(historyData);
          evaluateAlert(historyData);
        } else {
          setHistory(MOCK_HISTORY);
          evaluateAlert(MOCK_HISTORY);
        }

        if (testData && testData.length > 0) {
          setTests(testData);
        } else {
          setTests(MOCK_DIAGNOSTIC_TESTS);
        }
      } catch (err: any) {
        console.warn("Supabase fetch failed. Falling back to diagnostic sandbox data.", err.message);
        setHistory(MOCK_HISTORY);
        evaluateAlert(MOCK_HISTORY);
        setTests(MOCK_DIAGNOSTIC_TESTS);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  // Calendar comparison logic
  const evaluateAlert = (hist: MedicalHistory) => {
    const checkupDate = new Date(hist.next_checkup_due);
    const systemDate = new Date("2026-06-01"); // Local system clock anchor
    if (checkupDate <= systemDate) {
      setIsAlertActive(true);
    } else {
      setIsAlertActive(false);
    }
  };

  // Camera Dispatch controls
  const startScannerCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    setMatchedAdvisory(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Failed to mount camera. File picker upload active.", err.name);
      setCameraError("Camera hardware unavailable. Please use photo upload backup.");
      setCameraActive(false);
    }
  };

  const stopScannerCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const captureStripPhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraStream) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(dataUrl);
    stopScannerCamera();
    processMedicineOCR(dataUrl);
  };

  const handleStripUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      stopScannerCamera();
      processMedicineOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Process label text using Tesseract.js & clean with textParser
  const processMedicineOCR = async (imageSrc: string) => {
    setIsScanning(true);
    setOcrProgress(0);
    setStatusText("Loading medical OCR worker...");

    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const pct = Math.round(m.progress * 100);
            setOcrProgress(pct);
            setStatusText(`Reading chemical formula: ${pct}%`);
          } else {
            setStatusText("Analyzing medicine label...");
          }
        }
      });

      const { data: { text } } = await worker.recognize(imageSrc);
      await worker.terminate();

      setIsScanning(false);
      
      // Map matched brand name
      const matchedBrand = extractMedicineName(text);
      if (matchedBrand && AI_DRUG_ADVISORIES[matchedBrand]) {
        setMatchedAdvisory(AI_DRUG_ADVISORIES[matchedBrand]);
        toast.success(`Matched Medicine: ${matchedBrand}! AI consumption guide loaded.`, {
          icon: "🤖"
        });
      } else {
        toast.error("Medicine strip label not recognized. Please try another picture or select manually below.", {
          duration: 6000
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("OCR scanning failed. Please try a clearer picture.");
      setIsScanning(false);
    }
  };

  const handleManualAdvisorySelect = (brand: string) => {
    setSelectedManualDrug(brand);
    if (brand && AI_DRUG_ADVISORIES[brand]) {
      setMatchedAdvisory(AI_DRUG_ADVISORIES[brand]);
      toast.success(`AI Advisory loaded for ${brand}.`, { icon: "📋" });
    } else {
      setMatchedAdvisory(null);
    }
  };

  const resetStripScanner = () => {
    setCapturedImage(null);
    setMatchedAdvisory(null);
    setSelectedManualDrug("");
    startScannerCamera();
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleStripUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1. PROACTIVE LAB RECORD ALERTS */}
      {isAlertActive && history && (
        <div className="bg-gradient-to-r from-rose-50 to-red-50 border-2 border-red-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 animate-fade-in">
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-red-500"></div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 animate-bounce">
              <AlertCircle className="w-6.5 h-6.5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 tracking-tight uppercase flex items-center gap-1.5">
                Action Required
                <span className="text-[10px] bg-red-500 text-white rounded-full px-2 py-0.5 font-bold tracking-widest normal-case animate-pulse shrink-0">
                  Overdue
                </span>
              </h2>
              <p className="text-xs font-semibold text-slate-600 mt-1.5 leading-relaxed">
                Your routine full-body checkup schedule is pending. Ensure peak wellness by scheduling with nearby labs.
              </p>
              <div className="flex gap-4 mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Last Checkup: {history.last_checkup_date}</span>
                <span className="text-red-500">Scheduled Due: {history.next_checkup_due}</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => document.getElementById("marketplace-grid")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full md:w-auto px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shrink-0 border-0 flex items-center justify-center gap-1.5 shadow-md shadow-red-500/10 text-xs uppercase tracking-wider"
          >
            <Clock className="h-4 w-4 text-white" />
            Book Diagnostics
          </Button>
        </div>
      )}

      {/* Grid container: Left: Marketplace, Right: AI Strip Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: LAB MARKETPLACE */}
        <div id="marketplace-grid" className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#0B5FA5] animate-pulse" />
              Home Sample Diagnostics Marketplace
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#0B5FA5] bg-blue-50 border border-blue-100 rounded px-2.5 py-1">
              Phlebotomist Visit Included
            </span>
          </div>

          {/* State and District Dropdown Selection Row */}
          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-150 flex flex-col gap-3">
            <span className="text-[11px] font-black text-[#0B5FA5] uppercase tracking-wider flex items-center gap-1">
              <span>📍</span> Find our nearest available partners at your location
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* State Filter select */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Select State
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold outline-none focus:border-[#0B5FA5] transition-all cursor-pointer font-bold"
                >
                  <option value="West Bengal">West Bengal</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              {/* District Filter select */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Select District
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold outline-none focus:border-[#0B5FA5] transition-all cursor-pointer font-bold"
                >
                  {(STATE_DISTRICT_MAP[stateFilter] || []).map((dst) => (
                    <option key={dst} value={dst}>{dst}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isLoadingData ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="border border-slate-100 shadow-md bg-white animate-pulse">
                  <div className="p-6 h-28 bg-slate-50/50 rounded-2xl"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.map((test) => {
                const discount = Math.round(((test.original_price - test.price) / test.original_price) * 100);
                return (
                  <Card key={test.id} className="group border border-slate-150 shadow-md hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 bg-white flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 group-hover:bg-[#0B5FA5] transition-colors" />
                    
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          {test.provider}
                        </span>
                        <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          <TrendingDown className="h-3 w-3 text-emerald-500" />
                          Save {discount}%
                        </span>
                      </div>
                      <CardTitle className="text-sm font-extrabold text-slate-800 tracking-tight mt-2.5 leading-snug group-hover:text-[#0B5FA5] transition-colors">
                        {test.name}
                      </CardTitle>
                      <CardDescription className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                        {test.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 border-t border-slate-50 mt-auto">
                      <Button
                        onClick={() => window.open(test.partner_payment_url, "_blank")}
                        className="w-full mt-4 py-4.5 bg-slate-50 hover:bg-[#0B5FA5] text-slate-700 hover:text-white border border-slate-200 hover:border-[#0B5FA5] text-xs font-bold rounded-xl flex items-center justify-center gap-1 group/btn shadow-none transition-all duration-300"
                      >
                        Book via Partner
                        <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI MEDICINE STRIP SCANNER & GUIDE */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            AI Medicine Scanner & Guide
          </h3>

          <Card className="border border-slate-150 shadow-xl bg-white overflow-hidden rounded-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400"></div>
            
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Pill className="h-4.5 w-4.5 text-amber-500" />
                Dose & Safety Analyzer
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Snap/upload medicine stripes to parse ingredients and view clinical meal pairings.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              
              {/* Media Stream Frame */}
              <div className="relative aspect-[4/3] w-full rounded-2xl bg-slate-950 border border-slate-900 overflow-hidden shadow-inner flex flex-col items-center justify-center mb-5">
                
                {/* OCR Loading Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
                    <div className="relative mb-5">
                      <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse"></div>
                      <Loader2 className="h-10 w-10 text-amber-500 animate-spin relative z-10" />
                    </div>
                    <h4 className="text-sm font-bold mb-2 flex items-center gap-1.5 justify-center">
                      <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                      Scanning Active Formula
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
                      {statusText}
                    </p>
                    <div className="w-40 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Snap Preview */}
                {capturedImage && !isScanning && (
                  <div className="absolute inset-0 z-20 bg-slate-900 flex items-center justify-center">
                    <img
                      src={capturedImage}
                      alt="Captured strip label"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Active camera feed */}
                {cameraActive && !capturedImage && (
                  <div className="absolute inset-0 w-full h-full z-10">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Framing HUD HUD */}
                    <div className="absolute inset-0 border-[20px] border-slate-950/60 pointer-events-none flex items-center justify-center">
                      <div className="relative w-full h-full max-w-[90%] max-h-[70%] border-2 border-dashed border-amber-400/80 rounded-lg shadow-[0_0_0_999px_rgba(0,0,0,0.25)]">
                        {/* Laser line guides */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-amber-400 -mt-0.5 -ml-0.5 rounded-tl"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-amber-400 -mt-0.5 -mr-0.5 rounded-tr"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-amber-400 -mb-0.5 -ml-0.5 rounded-bl"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-amber-400 -mb-0.5 -mr-0.5 rounded-br"></div>
                        
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#FBBF24] animate-[labelScan_2s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Closed Camera placeholder HUD */}
                {!cameraActive && !capturedImage && !isScanning && (
                  <div className="p-6 text-center text-slate-500 z-10 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-400">
                      <Pill className="h-6 w-6" />
                    </div>
                    {cameraError ? (
                      <>
                        <h4 className="text-xs font-bold text-slate-400 mb-1">{cameraError}</h4>
                        <p className="text-[10px] text-slate-500 max-w-xs mx-auto mb-3">Please upload a picture from your device gallery.</p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-xs font-bold text-slate-400 mb-1">Camera Inactive</h4>
                        <p className="text-[10px] text-slate-500 max-w-xs mx-auto mb-3">Start camera or upload a picture to execute chemical analyses.</p>
                      </>
                    )}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startScannerCamera}
                        className="border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white"
                      >
                        <Camera className="mr-1.5 h-3.5 w-3.5" />
                        Start Camera
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white"
                      >
                        <Image className="mr-1.5 h-3.5 w-3.5" />
                        Upload Strip
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {cameraActive && !capturedImage && (
                <div className="flex gap-3">
                  <Button
                    onClick={captureStripPhoto}
                    className="flex-1 py-5 bg-gradient-to-r from-amber-400 to-amber-500 hover:shadow-lg hover:shadow-amber-500/10 text-white font-extrabold rounded-xl border-0 flex items-center justify-center gap-1.5"
                  >
                    <Camera className="h-4.5 w-4.5" />
                    Capture Photo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={stopScannerCamera}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Reset/Retake when image captured */}
              {capturedImage && !isScanning && (
                <Button
                  onClick={resetStripScanner}
                  variant="outline"
                  className="w-full py-5 border-slate-250 text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="h-4 w-4" />
                  Scan Another Label
                </Button>
              )}

              {/* AI Advisory Panel */}
              {matchedAdvisory && (
                <div className="mt-6 border border-amber-200/60 rounded-2xl p-5 bg-amber-50/20 shadow-md animate-fade-in">
                  <div className="flex items-center gap-2 border-b border-amber-200/40 pb-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Sparkles className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-700 tracking-wider">
                        Matched: {matchedAdvisory.brand_name}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Generic Formulation: {matchedAdvisory.generic_name} ({matchedAdvisory.dosage})
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        Consumption Interval
                      </span>
                      <p className="text-slate-700 font-semibold leading-relaxed">
                        {matchedAdvisory.interval}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 border-t border-amber-200/20 pt-3">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-slate-400" />
                        Meal Pairing Requirement
                      </span>
                      <p className="text-emerald-700 font-extrabold leading-relaxed">
                        {matchedAdvisory.meal_pairing}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 border-t border-amber-200/20 pt-3">
                      <span className="text-rose-500 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-rose-500" />
                        Clinical Warning Precautions
                      </span>
                      <p className="text-rose-700 font-bold leading-relaxed">
                        {matchedAdvisory.precautions}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Selection Fallback dropdown */}
              {!isScanning && (
                <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Or Select Drug Manually
                  </label>
                  <select
                    value={selectedManualDrug}
                    onChange={(e) => handleManualAdvisorySelect(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold outline-none focus:bg-white focus:border-amber-400 transition-all cursor-pointer"
                  >
                    <option value="">-- Choose verified medicine profile --</option>
                    {Object.keys(AI_DRUG_ADVISORIES).map((brand) => (
                      <option key={brand} value={brand}>
                        {brand} ({AI_DRUG_ADVISORIES[brand].generic_name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Keyframe scan line style */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes labelScan {
          0% { top: 5%; }
          50% { top: 95%; }
          100% { top: 5%; }
        }
      `}} />
    </div>
  );
}
