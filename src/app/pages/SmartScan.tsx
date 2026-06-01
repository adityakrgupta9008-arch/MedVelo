import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Camera, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  TrendingDown, 
  ShieldCheck, 
  ShoppingCart, 
  Heart, 
  Sparkles, 
  DollarSign, 
  FileText,
  AlertCircle,
  HelpCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { MedicineScanner } from "../components/MedicineScanner";
import { supabase, USING_MOCK_DATA, Medicine, MOCK_MEDICINES } from "../utils/supabase";
import { extractMedicineName } from "../utils/textParser";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function SmartScan() {
  // Navigation / View states: 'landing' | 'scanning' | 'result'
  const [view, setView] = useState<"landing" | "scanning" | "result">("landing");
  
  // Search & database states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [matchedMedicine, setMatchedMedicine] = useState<Medicine | null>(null);
  
  // Manual type-in support
  const [manualDrugName, setManualDrugName] = useState<string>("");
  const [isSearchingDb, setIsSearchingDb] = useState<boolean>(false);
  const [scanAttempts, setScanAttempts] = useState<number>(0);

  // Focus and click outside handler refs
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Suggestions search on query update
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    
    const filtered = MOCK_MEDICINES.filter(
      (med) =>
        med.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.generic_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSuggestions(filtered);
  }, [searchQuery]);

  // Click outside suggestions list listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Process raw text parsed from OCR
  const handleScanSuccess = async (rawText: string) => {
    setIsSearchingDb(true);
    
    // 1. Clean and identify brand name using textParser
    const detectedBrandName = extractMedicineName(rawText);
    
    if (!detectedBrandName) {
      // OCR fail / no drug recognized
      setIsSearchingDb(false);
      setScanAttempts(prev => prev + 1);
      toast.error("Medicine not recognized. Please scan again or search manually.", {
        duration: 4000
      });
      // Move back to landing so they can choose manual search
      setView("landing");
      return;
    }

    try {
      // 2. Query medicines table in Supabase
      const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .eq("brand_name", detectedBrandName);

      setIsSearchingDb(false);

      if (error) throw error;

      if (data && data.length > 0) {
        // Success match
        const medicine: Medicine = data[0];
        setMatchedMedicine(medicine);
        setView("result");
        toast.success(`Found a match for ${medicine.brand_name}!`, {
          icon: "💊",
        });
      } else {
        // No match in database
        setScanAttempts(prev => prev + 1);
        toast.error("Medicine not recognized. Please scan again or search manually.", {
          duration: 4000
        });
        setView("landing");
      }
    } catch (err) {
      console.error("Database query failed:", err);
      setIsSearchingDb(false);
      toast.error("Failed to query database. Redirecting to manual input.");
      setView("landing");
    }
  };

  // Triggered when selecting a medicine from search or autocomplete
  const handleSelectMedicine = (med: Medicine) => {
    setMatchedMedicine(med);
    setView("result");
    setSearchQuery("");
    setShowSuggestions(false);
  };

  // Trigger celebration on claim savings
  const triggerCelebration = (action: string) => {
    // Fire confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    
    if (action === "cart") {
      toast.success("Affordable Generic added to your pharmacy cart!", {
        icon: "🛒",
        duration: 4000
      });
    } else {
      toast.success("Prescription profile successfully saved!", {
        icon: "💾",
        duration: 4000
      });
    }
  };

  const startScanning = () => {
    setView("scanning");
  };

  const cancelScanning = () => {
    setView("landing");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50/50">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 flex flex-col justify-center">
        {/* Dynamic header elements */}
        {view !== "scanning" && (
          <div className="container mx-auto px-4 text-center mb-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0B5FA5] mb-4 border border-blue-100 shadow-sm animate-pulse">
              <Sparkles className="h-3.5 w-3.5" />
              Smart Scan Engine Active
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] mb-3 leading-tight">
              Slash Your <span className="bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6] bg-clip-text text-transparent">Medicine Bills</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-lg mx-auto">
              Scan your prescription labels or drug bottles to find identical, high-quality generic equivalents at up to 90% savings.
            </p>
          </div>
        )}

        {/* View orchestrators */}
        <div className="container mx-auto px-4 flex-1 flex items-center justify-center">
          
          {/* VIEW 1: LANDING */}
          {view === "landing" && (
            <div className="w-full max-w-xl flex flex-col gap-6">
              
              {/* Option Cards container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Camera Card */}
                <Card 
                  onClick={startScanning}
                  className="group cursor-pointer border border-slate-100 shadow-md hover:shadow-xl hover:border-[#2C8ED6]/40 hover:-translate-y-1 transition-all duration-300 bg-white"
                >
                  <CardHeader className="pb-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0B5FA5] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-[#0B5FA5] group-hover:text-white transition-all duration-300">
                      <Camera className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-base font-bold text-[#0F172A]">Smart Scanner</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Hold prescription up to camera to read bottle label instantly.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Manual Search Card */}
                <Card 
                  onClick={() => {
                    setShowSuggestions(true);
                    setTimeout(() => document.getElementById("manual-search-input")?.focus(), 50);
                  }}
                  className="group cursor-pointer border border-slate-100 shadow-md hover:shadow-xl hover:border-[#2C8ED6]/40 hover:-translate-y-1 transition-all duration-300 bg-white"
                >
                  <CardHeader className="pb-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Search className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-base font-bold text-[#0F172A]">Type Manually</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Search our database by typing brand or chemical names.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Interactive Search Field */}
              <div ref={searchContainerRef} className="relative w-full">
                <div className="relative">
                  <input
                    id="manual-search-input"
                    type="text"
                    placeholder="Enter medicine name (e.g. Advil, Lipitor, Zoloft)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 shadow-sm bg-white outline-none focus:border-[#2C8ED6] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all"
                  />
                  <Search className="absolute left-4 top-4.5 text-slate-400 w-5 h-5" />
                </div>

                {/* Autocomplete Dropdown List */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      Suggested Medicines
                    </div>
                    {suggestions.map((med) => (
                      <button
                        key={med.id}
                        onClick={() => handleSelectMedicine(med)}
                        className="w-full text-left px-4 py-3.5 hover:bg-slate-50 border-b border-slate-50 last:border-b-0 flex items-center justify-between text-sm transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-[#0F172A]">{med.brand_name}</span>
                          <span className="text-xs text-slate-400">Generic: {med.generic_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-[#0B5FA5]">
                            Save {Math.round(med.savings_percentage)}%
                          </span>
                          <span className="text-slate-400 text-xs font-medium">{med.dosage}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No suggestions helper */}
                {showSuggestions && searchQuery.trim().length > 0 && suggestions.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white rounded-2xl border border-slate-100 shadow-xl p-4 text-center text-slate-500 text-xs">
                    No matching medicines found in database. Try typing "Advil", "Lipitor", or "Zoloft".
                  </div>
                )}
              </div>

              {/* Database indicator */}
              <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-medium uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                {USING_MOCK_DATA ? "Simulated Sandboxed Medicines Engine Active" : "Connected Live to Supabase Medicines Database"}
              </div>

            </div>
          )}

          {/* VIEW 2: CAMERA SCANNING */}
          {view === "scanning" && (
            <MedicineScanner 
              onScanSuccess={handleScanSuccess} 
              onCancel={cancelScanning} 
            />
          )}

          {/* VIEW 3: PRICE COMPARISON DASHBOARD */}
          {view === "result" && matchedMedicine && (
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: BRAND VS GENERIC CARDS */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* 1. Comparison Dual Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Retail Brand Card (Red/Rose Color scheme) */}
                  <Card className="border-0 shadow-lg overflow-hidden bg-white relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#E31E24]"></div>
                    <CardHeader className="pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#E31E24]">
                        Expensive Retail Brand
                      </span>
                      <CardTitle className="text-2xl font-black text-[#0F172A] mt-1">
                        {matchedMedicine.brand_name}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Prescribed retail version
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline text-slate-800 font-black text-3xl mb-4">
                        <span className="text-lg font-bold mr-0.5">$</span>
                        {matchedMedicine.brand_price.toFixed(2)}
                        <span className="text-xs font-normal text-slate-400 ml-1">/ refill</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider border-t border-slate-100 pt-3">
                        Dosage: {matchedMedicine.dosage}
                      </div>
                    </CardContent>
                  </Card>

                  {/* High Quality Generic Card (Teal/Emerald Color scheme) */}
                  <Card className="border border-emerald-100 shadow-xl overflow-hidden bg-gradient-to-b from-white to-emerald-50/20 relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
                    <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center rotate-12">
                      <Sparkles className="h-6 w-6 text-emerald-600 opacity-60 mt-4 mr-4 animate-pulse" />
                    </div>
                    <CardHeader className="pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Equivalent Generic
                      </span>
                      <CardTitle className="text-2xl font-black text-[#0F172A] mt-1">
                        {matchedMedicine.generic_name}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        FDA-approved equivalent active ingredient
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline text-emerald-600 font-black text-3xl mb-4">
                        <span className="text-lg font-bold mr-0.5">$</span>
                        {matchedMedicine.generic_price.toFixed(2)}
                        <span className="text-xs font-normal text-emerald-400 ml-1">/ refill</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider border-t border-emerald-100 pt-3">
                        Strength: {matchedMedicine.dosage}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 2. Medicine Detail Descriptions */}
                <Card className="border border-slate-100 shadow-md bg-white">
                  <CardHeader className="py-4 bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-blue-500" />
                      Drug Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 text-slate-600 leading-relaxed text-sm">
                    <p className="mb-3 font-semibold text-slate-800">
                      Indications & Therapeutic Action:
                    </p>
                    <p className="text-slate-500 text-xs">
                      {matchedMedicine.description}
                    </p>
                    <div className="mt-4 flex items-start gap-2 bg-blue-50/50 rounded-xl p-3 border border-blue-100 text-xs text-slate-600">
                      <ShieldCheck className="h-4.5 w-4.5 text-[#0B5FA5] shrink-0 mt-0.5" />
                      <p>
                        <strong>FDA equivalence rating:</strong> Generics contain the identical active chemical structures as original formulations and go through rigorous bioequivalence checkups.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT COLUMN: SAVINGS METRICS & CHARTS */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Cost Savings Dashboard and Visual Chart */}
                <Card className="border border-slate-100 shadow-xl bg-white overflow-hidden">
                  
                  {/* Top savings header */}
                  <div className="bg-[#0B5FA5] text-white p-6 relative overflow-hidden flex items-center justify-between">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                        Estimated Savings
                      </span>
                      <h3 className="text-3xl font-black mt-1">
                        {matchedMedicine.savings_percentage.toFixed(0)}% OFF
                      </h3>
                      <p className="text-xs opacity-90 mt-1">
                        Save ${(matchedMedicine.brand_price - matchedMedicine.generic_price).toFixed(2)} per prescription
                      </p>
                    </div>
                    <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <TrendingDown className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <CardContent className="p-6">
                    
                    {/* Comparative Vertical Bar Chart using pure Tailwind */}
                    <div className="mb-8">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                        Refill Cost Comparison
                      </h4>
                      <div className="grid grid-cols-2 gap-8 h-48 items-end relative border-b border-slate-100 pb-3">
                        
                        {/* Brand bar */}
                        <div className="flex flex-col items-center group">
                          <span className="text-sm font-black text-[#E31E24] mb-2 group-hover:scale-105 transition-transform">
                            ${matchedMedicine.brand_price.toFixed(2)}
                          </span>
                          <div 
                            className="w-16 bg-gradient-to-t from-red-500/80 to-[#E31E24] rounded-t-xl group-hover:opacity-90 transition-opacity" 
                            style={{ height: "120px" }} // Max height scale
                          />
                          <span className="text-xs font-bold text-slate-500 mt-3 uppercase tracking-wider">
                            Brand
                          </span>
                        </div>

                        {/* Generic bar */}
                        <div className="flex flex-col items-center group">
                          <span className="text-sm font-black text-emerald-600 mb-2 group-hover:scale-105 transition-transform">
                            ${matchedMedicine.generic_price.toFixed(2)}
                          </span>
                          <div 
                            className="w-16 bg-gradient-to-t from-emerald-400 to-emerald-600 rounded-t-xl group-hover:opacity-90 transition-opacity shadow-[0_4px_16px_rgba(16,185,129,0.2)]" 
                            style={{ height: `${(matchedMedicine.generic_price / matchedMedicine.brand_price) * 120}px` }} 
                          />
                          <span className="text-xs font-bold text-emerald-600 mt-3 uppercase tracking-wider">
                            Generic
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cost over time projections */}
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                        <span className="text-slate-500">Savings Per Refill</span>
                        <span className="font-bold text-[#0F172A]">${(matchedMedicine.brand_price - matchedMedicine.generic_price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                        <span className="text-slate-500 font-semibold text-slate-600">Annual Savings (12 Refills)</span>
                        <span className="font-extrabold text-emerald-600 text-base">
                          ${((matchedMedicine.brand_price - matchedMedicine.generic_price) * 12).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => triggerCelebration("cart")}
                        className="py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 border-0"
                      >
                        <ShoppingCart className="h-4.5 w-4.5" />
                        Add Generic to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => triggerCelebration("profile")}
                        className="py-5 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-center gap-2"
                      >
                        <Heart className="h-4.5 w-4.5 text-rose-500" />
                        Save to Health Profile
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setMatchedMedicine(null);
                          setView("landing");
                        }}
                        className="text-xs text-slate-400 hover:text-slate-600 py-2 hover:bg-transparent"
                      >
                        Scan / Search Another Medicine
                      </Button>
                    </div>

                  </CardContent>
                </Card>

              </div>
              
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
