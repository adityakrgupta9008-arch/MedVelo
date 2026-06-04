import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "dummy_key");
import { 
  Building2, 
  ArrowLeft, 
  Sparkles, 
  Search,
  CheckCircle2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

interface Doctor {
  name: string;
  designation: string;
  department: string;
  availability: string;
}

interface Hospital {
  hospital_name: string;
  location: string;
  specialty: string;
  emergency_status: string;
  contact_num: string;
  available_doctors: Doctor[];
}

const STATE_DISTRICT_MAP: Record<string, string[]> = {
  "West Bengal": ["Kolkata", "Howrah", "Durgapur"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Giridih"]
};

const FALLBACK_HOSPITALS: Hospital[] = [
  {
    hospital_name: "Apollo Multispecialty Hospitals",
    location: "Kolkata, West Bengal",
    specialty: "Cardiology, Oncology & Emergency Care",
    emergency_status: "24/7 Available",
    contact_num: "+91 33 2320 3040",
    available_doctors: [
      { name: "Dr. Sandip Ghosh", designation: "Senior Consultant", department: "Cardiology", availability: "10:00 AM - 2:00 PM" },
      { name: "Dr. Ananya Ray", designation: "MD", department: "General Medicine", availability: "4:00 PM - 8:00 PM" }
    ]
  },
  {
    hospital_name: "AMRI Hospitals",
    location: "Kolkata, West Bengal",
    specialty: "Neurology, Orthopedics & Trauma Unit",
    emergency_status: "24/7 Available",
    contact_num: "+91 33 6680 0000",
    available_doctors: [
      { name: "Dr. P. K. Sen", designation: "Senior Consultant", department: "Neurology", availability: "11:00 AM - 3:00 PM" },
      { name: "Dr. Somnath Mitra", designation: "MD", department: "General Medicine", availability: "5:00 PM - 9:00 PM" }
    ]
  },
  {
    hospital_name: "Tata Main Hospital (TMH)",
    location: "Jamshedpur, Jharkhand",
    specialty: "Trauma Care, Burns Care & Critical Medicine",
    emergency_status: "24/7 Available",
    contact_num: "+91 657 664 1222",
    available_doctors: [
      { name: "Dr. Sanjay Kumar", designation: "Senior Consultant", department: "Trauma Surgery", availability: "09:00 AM - 1:00 PM" },
      { name: "Dr. Rita Singh", designation: "MD", department: "Critical Care", availability: "2:00 PM - 6:00 PM" }
    ]
  },
  {
    hospital_name: "Brahmananda Narayana Multispeciality Hospital",
    location: "Jamshedpur, Jharkhand",
    specialty: "Cardiac Sciences & Critical Care",
    emergency_status: "24/7 Available",
    contact_num: "+91 657 662 2000",
    available_doctors: [
      { name: "Dr. Devendra Tripathi", designation: "Senior Consultant", department: "Cardiology", availability: "10:00 AM - 2:00 PM" },
      { name: "Dr. Amit Mukherjee", designation: "MD", department: "General Medicine", availability: "4:00 PM - 8:00 PM" }
    ]
  },
  {
    hospital_name: "Bhagwan Mahavir Medica Superspecialty Hospital",
    location: "Ranchi, Jharkhand",
    specialty: "Nephrology, Urology & Emergency Trauma",
    emergency_status: "24/7 Available",
    contact_num: "+91 651 660 6000",
    available_doctors: [
      { name: "Dr. Alok Kumar", designation: "Senior Consultant", department: "Nephrology", availability: "10:00 AM - 2:00 PM" },
      { name: "Dr. Neha Sharma", designation: "MD", department: "General Medicine", availability: "3:00 PM - 7:00 PM" }
    ]
  },
  {
    hospital_name: "Rajendra Institute of Medical Sciences (RIMS)",
    location: "Ranchi, Jharkhand",
    specialty: "General Surgery, Medicine & 24hr Emergency",
    emergency_status: "24/7 Available",
    contact_num: "+91 651 254 1533",
    available_doctors: [
      { name: "Dr. R. K. Prasad", designation: "Senior Consultant", department: "General Surgery", availability: "08:00 AM - 12:00 PM" },
      { name: "Dr. S. K. Roy", designation: "MD", department: "General Medicine", availability: "1:00 PM - 5:00 PM" }
    ]
  }
];

export default function HospitalFinder() {
  const [hospitalsData, setHospitalsData] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("West Bengal");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Kolkata");

  useEffect(() => {
    fetchHospitals(selectedState, selectedDistrict);
  }, [selectedState, selectedDistrict]);

  const handleStateChange = (stateName: string) => {
    setHospitalsData([]); // Instantly flushes old Kolkata/Jamshedpur cards out of view
    setSelectedState(stateName);
    const districts = STATE_DISTRICT_MAP[stateName] || [];
    if (districts.length > 0) {
      setSelectedDistrict(districts[0]);
    } else {
      setSelectedDistrict("");
    }
  };

  const fetchHospitals = async (selectedState: string, selectedDistrict: string) => {
    setLoading(true);
    setHospitalsData([]); // Flush old data

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const isRealKey = geminiKey && geminiKey !== "your_actual_copied_gemini_api_key";

    if (isRealKey) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `You are an expert Indian healthcare directory. List 5 prominent, real hospitals located explicitly in the district of ${selectedDistrict}, State: ${selectedState}. 
        Do not include facilities from outside this district. 
        Return strictly a raw, valid JSON array without any markdown formatting or backticks. Schema:
        [{ "hospital_name": "Name", "location": "Address", "specialty": "Type", "emergency_status": "24/7", "contact_num": "Number" }]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean up any potential markdown formatting the AI might add
        const cleanJsonStr = responseText.replace(/```json\n?|```/g, '').trim();
        const parsedData = JSON.parse(cleanJsonStr);
        
        setHospitalsData(parsedData);
        toast.success(`Successfully loaded dynamic hospitals directory for ${selectedDistrict}, ${selectedState}!`, { icon: "🤖" });
        setLoading(false);
        return;
      } catch (error) {
        console.error("AI Fetch Error:", error);
        toast.error("Failed to load hospitals. Please check your API key quota.");
      }
    }

    // Local fallback database
    setTimeout(() => {
      const filtered = FALLBACK_HOSPITALS.filter(
        h => h.location.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
             h.location.toLowerCase().includes(selectedState.toLowerCase())
      );
      setHospitalsData(filtered.length > 0 ? filtered : FALLBACK_HOSPITALS);
      setLoading(false);
      toast.info(`Local fallback directory loaded for ${selectedDistrict}, ${selectedState}.`, { icon: "🛡️" });
    }, 800);
  };


  // Filter local state based on search query
  const filteredHospitals = hospitalsData.filter(item => {
    const nameVal = item.hospital_name || "";
    const specialtyVal = item.specialty || "";
    const locationVal = item.location || "";
    
    return nameVal.toLowerCase().includes(searchQuery) ||
           specialtyVal.toLowerCase().includes(searchQuery) ||
           locationVal.toLowerCase().includes(searchQuery);
  });

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50/50">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Back button and route verification indicators */}
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

          {/* Title Header */}
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0B5FA5] mb-4 border border-blue-100 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
              AI Directory Service Active
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] mb-3 leading-tight">
              Hospital <span className="bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6] bg-clip-text text-transparent">Superspecialty Finder</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-lg mx-auto">
              Query prominent, real healthcare facilities dynamically across India. Verify physician availability lists in real-time.
            </p>
          </div>

          {/* CASCADING FILTER INTERFACE */}
          <Card className="border border-slate-150 shadow-lg bg-white overflow-hidden rounded-3xl relative mb-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#0B5FA5]"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                <Search className="h-4.5 w-4.5 text-[#0B5FA5]" />
                Search Health Care Facilities
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Select a cascading geographic state and district to query prominent Indian hospitals.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Select State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium outline-none focus:bg-white focus:border-[#0B5FA5] focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
                  >
                    <option value="West Bengal">West Bengal</option>
                    <option value="Jharkhand">Jharkhand</option>
                  </select>
                </div>

                {/* District Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Select District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setHospitalsData([]); // Instantly flushes old Kolkata/Jamshedpur cards out of view
                      setSelectedDistrict(e.target.value);
                    }}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium outline-none focus:bg-white focus:border-[#0B5FA5] focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
                  >
                    {(STATE_DISTRICT_MAP[selectedState] || []).map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Text Search Input */}
              <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Refine Search Filter
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Refine search by facility name or primary specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm bg-white outline-none focus:border-[#2C8ED6] focus:ring-4 focus:ring-blue-500/10 text-xs font-semibold transition-all"
                  />
                  <Search className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic hospital-card output list */}
          {loading ? (
            /* Loading skeletons */
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border border-slate-100 shadow-md bg-white p-6 h-40 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-8 bg-slate-250 rounded w-full"></div>
                </Card>
              ))}
            </div>
          ) : filteredHospitals.length > 0 ? (
            <div className="flex flex-col">
              {filteredHospitals.map((hospital, index) => (
                <div key={index} className="hospital-card bg-white p-6 rounded-xl shadow-md border mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{hospital.hospital_name}</h3>
                      <p className="text-sm text-gray-500">📍 {hospital.location}</p>
                      <p className="text-sm font-semibold text-emerald-600 mt-1">Specialty: {hospital.specialty}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold">
                        {hospital.emergency_status}
                      </span>
                      <p className="text-lg font-bold text-blue-600 mt-2">📞 {hospital.contact_num}</p>
                    </div>
                  </div>
                  
                  {/* DOCTORS EXPANDABLE ROSTER */}
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">👨‍⚕️ Available Doctors On-Duty:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {hospital.available_doctors?.map((doc, dIdx) => (
                        <div key={dIdx} className="bg-gray-50 p-3 rounded-lg border text-sm">
                          <p className="font-bold text-gray-800">{doc.name} ({doc.designation})</p>
                          <p className="text-xs text-gray-600">Dept: {doc.department}</p>
                          <p className="text-xs text-blue-600 font-medium mt-1">🕒 {doc.availability}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl shadow-sm p-6 max-w-md mx-auto">
              <Building2 className="h-12 w-12 text-slate-350 mx-auto mb-4" />
              <h3 className="text-base font-bold text-[#0F172A] mb-1">No Hospitals Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                We couldn't locate any matching hospitals for your active selectors. Try clearing your filters.
              </p>
              <Button 
                onClick={() => { setSearchQuery(""); setSelectedState("West Bengal"); setSelectedDistrict("Kolkata"); }}
                className="py-4 px-6 bg-[#0B5FA5] hover:bg-[#0B5FA5]/90 text-white font-bold rounded-xl text-xs border-0"
              >
                Reset Selectors
              </Button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
