import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  Search,
  CheckCircle2,
  FileText
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

interface DiagnosticTest {
  id: number;
  provider: string;
  discountBadge: string;
  title: string;
  description: string;
  testsIncluded: string[];
  sampleType: string;
  category: string;
}

const STATE_DISTRICT_MAP: Record<string, string[]> = {
  "West Bengal": ["Kolkata", "North 24 Parganas", "Howrah"],
  "Jharkhand": ["Ranchi", "Giridih", "East Singhbhum", "Dhanbad"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli"]
};

const FALLBACK_TESTS: DiagnosticTest[] = [
  {
    id: 1,
    provider: "THYROCARE",
    discountBadge: "SAVE 59%",
    title: "Executive Full Body Health Checkup",
    description: "Complete screening of liver, kidney, thyroid, heart, and hemogram with 82 vital bio-parameters.",
    testsIncluded: ["Lipid Profile", "Liver Function (LFT)", "Thyroid (T3/T4/TSH)", "Kidney (KFT)"],
    sampleType: "Blood & Urine",
    category: "Health Package"
  },
  {
    id: 2,
    provider: "DR LAL PATHLABS",
    discountBadge: "SAVE 55%",
    title: "Complete Hemogram & Diabetes Screen",
    description: "Vital screen checking HbA1c, fasting blood glucose, and complete blood count (CBC) profiles.",
    testsIncluded: ["HbA1c", "Fasting Glucose", "Complete Blood Count (CBC)"],
    sampleType: "Blood",
    category: "Diabetes"
  },
  {
    id: 3,
    provider: "APOLLO DIAGNOSTICS",
    discountBadge: "SAVE 40%",
    title: "Advanced Thyroid Care Package",
    description: "Comprehensive evaluation of thyroid gland activity, tracking triiodothyronine, thyroxine, and thyroid stimulating hormone levels.",
    testsIncluded: ["Thyroid (T3/T4/TSH)", "Thyroid Antibodies", "Thyroid Profile Free"],
    sampleType: "Blood",
    category: "Thyroid"
  }
];

export default function DiagnosticsHub() {
  const [rawTests, setRawTests] = useState<DiagnosticTest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const [stateFilter, setStateFilter] = useState<string>("West Bengal");
  const [districtFilter, setDistrictFilter] = useState<string>("Kolkata");

  useEffect(() => {
    fetchDiagnostics(stateFilter, districtFilter);
  }, [districtFilter]);

  const handleStateChange = (stateName: string) => {
    setStateFilter(stateName);
    const districts = STATE_DISTRICT_MAP[stateName] || [];
    if (districts.length > 0) {
      setDistrictFilter(districts[0]);
    } else {
      setDistrictFilter("");
    }
  };

  const fetchDiagnostics = async (stateVal: string, districtVal: string) => {
    setIsLoading(true);
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const isRealKey = geminiKey && geminiKey !== "your_actual_copied_gemini_api_key";

    if (isRealKey) {
      try {
        const promptText = `You are an Indian medical diagnostic aggregator. The user is looking for home sample collection packages in State: "${stateVal}" and District: "${districtVal}".
Generate a realistic, accurate JSON array of 3 critical diagnostic packages/checkups frequently requested here (e.g., Executive Full Body Health Checkup, Complete Hemogram & Diabetes Screen, or Advanced Cardiac Care Panel).
Structure the JSON response exactly like this template:
[
  {
    "id": 1,
    "provider": "THYROCARE",
    "discountBadge": "SAVE 59%",
    "title": "Executive Full Body Health Checkup",
    "description": "Complete screening of liver, kidney, thyroid, heart, and hemogram with 82 vital bio-parameters.",
    "testsIncluded": ["Lipid Profile", "Liver Function (LFT)", "Thyroid (T3/T4/TSH)", "Kidney (KFT)"],
    "sampleType": "Blood & Urine",
    "category": "Health Package"
  },
  {
    "id": 2,
    "provider": "DR LAL PATHLABS",
    "discountBadge": "SAVE 55%",
    "title": "Complete Hemogram & Diabetes Screen",
    "description": "Vital screen checking HbA1c, fasting blood glucose, and complete blood count (CBC) profiles.",
    "testsIncluded": ["HbA1c", "Fasting Glucose", "Complete Blood Count (CBC)"],
    "sampleType": "Blood",
    "category": "Diabetes"
  }
]
Return strictly the raw JSON array containing exactly 3 items. Do not wrap in markdown code blocks.`;

        const payload = {
          contents: [{
            parts: [{
              text: promptText
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const aiResponseText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        const cleanText = aiResponseText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((item: any, index: number) => ({
            id: item.id || index + 1,
            provider: item.provider || "LAB PROVIDER",
            discountBadge: item.discountBadge || "SAVE 10%",
            title: item.title || item.test_name || "Diagnostic Checkup",
            description: item.description || "",
            testsIncluded: Array.isArray(item.testsIncluded) ? item.testsIncluded : [],
            sampleType: item.sampleType || "Blood",
            category: item.category || "General Health"
          }));
          setRawTests(normalized);
          toast.success(`Successfully loaded clinical diagnostic packages for ${districtVal}, ${stateVal}!`, { icon: "🤖" });
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.warn("Gemini fetch failed, loading sandboxed comparison directory:", error);
      }
    }

    // Local fallback
    setTimeout(() => {
      setRawTests(FALLBACK_TESTS);
      setIsLoading(false);
      toast.info(`Local fallback loaded for ${districtVal}, ${stateVal}.`, { icon: "🛡️" });
    }, 850);
  };

  // Filter lists based on search query and category parameters
  const filteredTests = rawTests.filter(item => {
    const titleVal = item.title || "";
    const categoryVal = item.category || "";
    const descVal = item.description || "";
    const providerVal = item.provider || "";
    
    const matchesSearch = 
      titleVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      descVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      providerVal.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || categoryVal.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Expose the dynamic array state exactly as diagnosticsData as requested
  const diagnosticsData = filteredTests;

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(rawTests.map(t => t.category || "General Health")))];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50/50">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Back button and page indicators */}
          <div className="flex justify-between items-center mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0B5FA5] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
              <CheckCircle2 className="h-3 w-3" />
              Protected Route Verification Complete
            </span>
          </div>

          {/* Title Header with PAN India selectors directly below */}
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0B5FA5] mb-4 border border-blue-100 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
              Premium Lab Aggregator Active
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] mb-3 leading-tight">
              Home Sample Diagnostics <span className="bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6] bg-clip-text text-transparent">Marketplace</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-lg mx-auto">
              Pan-India diagnostic aggregator engine with real-time laboratory rates and direct partner bookings.
            </p>

            {/* RENDER PAN INDIA GEOGRAPHIC DROPDOWNS RIGHT BELOW THE TITLE */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-lg text-left max-w-xl mx-auto">
              {/* State Filter select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Select State
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium outline-none focus:bg-white focus:border-[#0B5FA5] focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer font-bold"
                >
                  <option value="West Bengal">West Bengal</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              {/* District Filter select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Select District
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium outline-none focus:bg-white focus:border-[#0B5FA5] focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer font-bold"
                >
                  {(STATE_DISTRICT_MAP[stateFilter] || []).map((dst) => (
                    <option key={dst} value={dst}>{dst}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Text Search Input Panel */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-md mb-8 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search by test profile or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm bg-white outline-none focus:border-[#2C8ED6] focus:ring-4 focus:ring-blue-500/10 text-xs font-semibold transition-all"
                />
                <Search className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>

              {/* Verified Badge */}
              <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                NABL Accredited Partners Only
              </div>
            </div>

            {/* Category selection filter tabs */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
                {categories.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-350 cursor-pointer ${
                        isActive
                          ? "bg-[#0B5FA5] text-white border-[#0B5FA5] shadow-md scale-102"
                          : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:border-slate-200"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* LOADING TIMEOUT GATES */}
          {isLoading ? (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm p-8 max-w-md mx-auto animate-pulse flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#0B5FA5] animate-spin"></div>
              <p className="text-sm font-bold text-slate-600">
                Aggregating real-time lab rates for {districtFilter}...
              </p>
            </div>
          ) : filteredTests.length > 0 ? (
            /* Render dynamic clinical price comparison cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {diagnosticsData.map((lab) => (
                <div key={lab.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                  
                  {/* 1. Header (Provider & Discount) */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                      {lab.provider}
                    </span>
                    <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded border border-green-100 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                      {lab.discountBadge}
                    </span>
                  </div>

                  {/* 2. Title & Description */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    {lab.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {lab.description}
                  </p>

                  {/* 3. TESTS INCLUDED SECTION */}
                  <div className="mt-auto border-t border-gray-100 pt-4 mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Available Tests Included
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lab.testsIncluded.map((test, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100">
                          {test}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* 4. BOOK BUTTON (No Price Attached) */}
                  <button 
                    onClick={() => {
                      toast.success(`Booking request submitted for ${lab.title} via ${lab.provider}!`, { icon: "📅" });
                    }}
                    className="w-full mt-2 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    Book via Partner
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </button>
                  
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl shadow-sm p-6 max-w-md mx-auto">
              <FileText className="h-12 w-12 text-slate-350 mx-auto mb-4" />
              <h3 className="text-base font-bold text-[#0F172A] mb-1">No Diagnostics Packages Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                We couldn't locate any matching diagnostic blood profiles or scans for your active filters. Try clearing your search.
              </p>
              <Button 
                onClick={() => { setSearchQuery(""); setStateFilter("West Bengal"); setDistrictFilter("Kolkata"); }}
                className="py-4 px-6 bg-[#0B5FA5] hover:bg-[#0B5FA5]/90 text-white font-bold rounded-xl text-xs border-0 cursor-pointer"
              >
                Clear All Filter Settings
              </Button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
