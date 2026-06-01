import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { 
  Building2, 
  MapPin, 
  BedDouble, 
  DollarSign, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  Star, 
  ShieldAlert, 
  Users, 
  Sparkles,
  Search,
  Activity,
  Heart
} from "lucide-react";
import { Button } from "../app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../app/components/ui/card";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export interface Hospital {
  id: string;
  name: string;
  type: string; // Government, Private, On Call Support
  state: string;
  district: string;
  beds_available: number;
  ambulance_cost: number;
  created_at?: string;
}

export interface Doctor {
  id: string;
  hospital_id: string;
  name: string;
  specialization: string;
  time_slots: string[];
  rating: number;
  created_at?: string;
}

// Pre-seeded high-fidelity mock database for immediate offline sandbox testing
const MOCK_HOSPITALS: Hospital[] = [
  { id: "h1", name: "Los Angeles County General", type: "Government", state: "California", district: "Los Angeles", beds_available: 85, ambulance_cost: 180.00 },
  { id: "h2", name: "Cedars-Sinai Medical Center", type: "Private", state: "California", district: "Los Angeles", beds_available: 12, ambulance_cost: 350.00 },
  { id: "h3", name: "LA Trauma Dispatch Hub", type: "On Call Support", state: "California", district: "Los Angeles", beds_available: 0, ambulance_cost: 120.00 },
  { id: "h4", name: "SF Memorial Hospital", type: "Government", state: "California", district: "San Francisco", beds_available: 45, ambulance_cost: 200.00 },
  { id: "h5", name: "UCSF Medical Center", type: "Private", state: "California", district: "San Francisco", beds_available: 8, ambulance_cost: 380.00 },
  { id: "h6", name: "Bellevue Hospital", type: "Government", state: "New York", district: "Manhattan", beds_available: 95, ambulance_cost: 150.00 },
  { id: "h7", name: "Mount Sinai Hospital", type: "Private", state: "New York", district: "Manhattan", beds_available: 14, ambulance_cost: 340.00 },
  { id: "h8", name: "Manhattan Emergency Support", type: "On Call Support", state: "New York", district: "Manhattan", beds_available: 0, ambulance_cost: 110.00 },
  { id: "h9", name: "Brooklyn Hospital Center", type: "Government", state: "New York", district: "Brooklyn", beds_available: 3, ambulance_cost: 160.00 },
  { id: "h10", name: "New York-Presbyterian Brooklyn", type: "Private", state: "New York", district: "Brooklyn", beds_available: 22, ambulance_cost: 290.00 },
  { id: "h11", name: "Houston Methodist Hospital", type: "Private", state: "Texas", district: "Houston", beds_available: 18, ambulance_cost: 320.00 },
  { id: "h12", name: "Harris County Hospital", type: "Government", state: "Texas", district: "Houston", beds_available: 60, ambulance_cost: 140.00 },
  { id: "h13", name: "Dell Seton Medical Center", type: "Government", state: "Texas", district: "Austin", beds_available: 4, ambulance_cost: 180.00 },
  { id: "h14", name: "St. David's Medical Center", type: "Private", state: "Texas", district: "Austin", beds_available: 35, ambulance_cost: 280.00 }
];

const MOCK_DOCTORS: Doctor[] = [
  // Los Angeles County General (h1)
  { id: "d1", hospital_id: "h1", name: "Dr. Elizabeth Blackwell", specialization: "Cardiology", time_slots: ["09:00 AM", "11:30 AM", "02:00 PM"], rating: 4.88 },
  { id: "d2", hospital_id: "h1", name: "Dr. Gregory House", specialization: "Diagnostic Medicine", time_slots: ["10:00 AM", "01:15 PM", "03:45 PM"], rating: 4.95 },
  // Cedars-Sinai (h2)
  { id: "d3", hospital_id: "h2", name: "Dr. Sanjay Gupta", specialization: "Neurosurgery", time_slots: ["08:30 AM", "11:00 AM", "04:00 PM"], rating: 4.98 },
  // Bellevue Hospital (h6)
  { id: "d4", hospital_id: "h6", name: "Dr. Virginia Apgar", specialization: "Pediatrics", time_slots: ["09:15 AM", "10:45 AM", "02:30 PM"], rating: 4.91 },
  { id: "d5", hospital_id: "h6", name: "Dr. Jonas Salk", specialization: "Immunology", time_slots: ["11:00 AM", "01:00 PM", "03:00 PM"], rating: 4.96 },
  // Mount Sinai Hospital (h7)
  { id: "d6", hospital_id: "h7", name: "Dr. Alexander Fleming", specialization: "General Medicine", time_slots: ["09:00 AM", "10:30 AM", "01:30 PM", "04:30 PM"], rating: 4.89 },
  // SF Memorial (h4)
  { id: "d7", hospital_id: "h4", name: "Dr. Helen Brooke", specialization: "Pediatrics", time_slots: ["10:30 AM", "02:45 PM"], rating: 4.85 },
  // UCSF Medical Center (h5)
  { id: "d8", hospital_id: "h5", name: "Dr. Daniel Hale", specialization: "Cardiovascular Surgery", time_slots: ["08:00 AM", "01:00 PM"], rating: 4.99 },
  // Houston Methodist (h11)
  { id: "d9", hospital_id: "h11", name: "Dr. Charles Drew", specialization: "Hematology", time_slots: ["09:30 AM", "11:45 AM", "03:15 PM"], rating: 4.94 }
];

const STATE_DISTRICT_MAP: Record<string, string[]> = {
  "California": ["Los Angeles", "San Francisco"],
  "New York": ["Manhattan", "Brooklyn"],
  "Texas": ["Houston", "Austin"]
};

export default function HospitalDirectory() {
  // Cascading Filter states
  const [activeTier, setActiveTier] = useState<string>("Government"); // 'Government' | 'Private' | 'On Call Support'
  const [selectedState, setSelectedState] = useState<string>("California");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Los Angeles");
  
  // Database datasets
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Interaction states
  const [expandedHospitalId, setExpandedHospitalId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Sync state & district cascading selections
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const districts = STATE_DISTRICT_MAP[stateName] || [];
    if (districts.length > 0) {
      setSelectedDistrict(districts[0]);
    } else {
      setSelectedDistrict("");
    }
    setExpandedHospitalId(null);
    setSelectedDoctorId(null);
    setSelectedTimeSlot(null);
  };

  // 1. Fetch Hospitals & Doctors using active Supabase with sandboxed fallbacks
  useEffect(() => {
    async function loadDirectoryData() {
      try {
        setIsLoading(true);
        
        // Fetch hospitals
        const { data: hospitalData, error: hError } = await supabase
          .from("hospitals")
          .select("*");
          
        if (hError) throw hError;

        // Fetch doctors
        const { data: doctorData, error: dError } = await supabase
          .from("doctors")
          .select("*");

        if (dError) throw dError;

        if (hospitalData && hospitalData.length > 0) {
          setHospitals(hospitalData);
        } else {
          setHospitals(MOCK_HOSPITALS);
        }

        if (doctorData && doctorData.length > 0) {
          setDoctors(doctorData);
        } else {
          setDoctors(MOCK_DOCTORS);
        }
      } catch (err: any) {
        console.warn("Supabase fetch failed. Falling back to pre-seeded local sandbox database.", err.message);
        setHospitals(MOCK_HOSPITALS);
        setDoctors(MOCK_DOCTORS);
      } finally {
        setIsLoading(false);
      }
    }
    loadDirectoryData();
  }, []);

  // Filter hospital listings based on current filters
  const filteredHospitals = hospitals.filter((h) => {
    return (
      h.type === activeTier &&
      h.state === selectedState &&
      h.district === selectedDistrict
    );
  });

  // Get physicians for the active expanded hospital
  const getDoctorsForActiveHospital = (hospitalId: string): Doctor[] => {
    const list = doctors.filter((d) => d.hospital_id === hospitalId);
    if (list.length > 0) return list;
    
    // Dynamic physician generators so that every hospital card has doctors in sandbox
    return [
      {
        id: `gen-d1-${hospitalId}`,
        hospital_id: hospitalId,
        name: `Dr. Robert Liston`,
        specialization: "General Physician",
        time_slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:30 PM"],
        rating: 4.82
      },
      {
        id: `gen-d2-${hospitalId}`,
        hospital_id: hospitalId,
        name: `Dr. Elizabeth Garrett`,
        specialization: "Emergency Specialist",
        time_slots: ["10:30 AM", "01:00 PM", "03:45 PM"],
        rating: 4.89
      }
    ];
  };

  const handleToggleExpand = (hospitalId: string) => {
    if (expandedHospitalId === hospitalId) {
      setExpandedHospitalId(null);
      setSelectedDoctorId(null);
      setSelectedTimeSlot(null);
    } else {
      setExpandedHospitalId(hospitalId);
      setSelectedDoctorId(null);
      setSelectedTimeSlot(null);
    }
  };

  // Perform Appointment Reservation Booking
  const handleConfirmBooking = (hospital: Hospital) => {
    if (!selectedDoctorId) {
      toast.error("Please choose a medical professional first.");
      return;
    }
    if (!selectedTimeSlot) {
      toast.error("Please choose a convenient time slot first.");
      return;
    }

    const doctorList = getDoctorsForActiveHospital(hospital.id);
    const doctor = doctorList.find((d) => d.id === selectedDoctorId);
    
    if (!doctor) return;

    // Fire Confetti booking celebration!
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast.success(`Booking Confirmed at ${hospital.name}!`, {
      description: `Appointment reserved with ${doctor.name} (${doctor.specialization}) for tomorrow at ${selectedTimeSlot}.`,
      icon: "📅",
      duration: 6000
    });

    // Reset interaction states
    setExpandedHospitalId(null);
    setSelectedDoctorId(null);
    setSelectedTimeSlot(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* 1. CASCADING FILTER INTERFACE */}
      <Card className="border border-slate-150 shadow-lg bg-white overflow-hidden rounded-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#0B5FA5]"></div>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Search className="h-4.5 w-4.5 text-[#0B5FA5]" />
            Search Health Care Facilities
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Select a tier category and cascading geographic selectors to display verified clinics.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Header selectors */}
          <div className="flex bg-slate-100 rounded-xl p-1 justify-between gap-1 w-full border border-slate-200">
            {["Government", "Private", "On Call Support"].map((tier) => {
              const isActive = activeTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => {
                    setActiveTier(tier);
                    setExpandedHospitalId(null);
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-white text-[#0B5FA5] shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>

          {/* Cascading dropdown selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Select State
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium outline-none focus:bg-white focus:border-[#0B5FA5] focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
              >
                {Object.keys(STATE_DISTRICT_MAP).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Select District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setExpandedHospitalId(null);
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
        </CardContent>
      </Card>

      {/* 2. LISTINGS GRID */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2].map((i) => (
            <Card key={i} className="border border-slate-100 shadow-md bg-white animate-pulse">
              <div className="p-6 h-28 bg-slate-50/50 rounded-2xl"></div>
            </Card>
          ))}
        </div>
      ) : filteredHospitals.length === 0 ? (
        <Card className="border border-slate-150 shadow-md bg-white py-12 px-6 text-center text-slate-400 rounded-2xl flex flex-col items-center">
          <Building2 className="h-10 w-10 text-slate-350 mb-3" />
          <h4 className="text-sm font-bold text-slate-600 mb-1">No Hospitals Found</h4>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            No partner {activeTier.toLowerCase()} clinics are listed in {selectedDistrict}, {selectedState} yet. Try toggling active parameters or select other states.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredHospitals.map((hospital) => {
            const isExpanded = expandedHospitalId === hospital.id;
            const beds = hospital.beds_available;
            
            // Available beds color indicator
            const isCritical = beds <= 5;
            const isHigh = beds > 20;
            
            return (
              <Card 
                key={hospital.id}
                className={`border overflow-hidden transition-all duration-300 bg-white ${
                  isExpanded 
                    ? "border-[#0B5FA5] shadow-xl" 
                    : "border-slate-150 shadow-md hover:shadow-lg"
                }`}
              >
                {/* Main Card visual bar */}
                <div className={`h-1 w-full ${
                  isExpanded 
                    ? "bg-[#0B5FA5]" 
                    : activeTier === "Government" 
                      ? "bg-slate-300" 
                      : "bg-slate-200"
                }`} />

                {/* Primary Card body */}
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Name and location info */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B5FA5] flex items-center justify-center shrink-0 border border-blue-100">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base font-black text-slate-800 tracking-tight">
                            {hospital.name}
                          </h3>
                          <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0">
                            <CheckCircle className="h-3 w-3 text-blue-500 fill-white" />
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {hospital.district}, {hospital.state}
                        </p>
                      </div>
                    </div>

                    {/* Center: Dynamic Bed Beacon & Ambulance cost tags */}
                    <div className="flex items-center gap-4 flex-wrap">
                      
                      {/* Bed availability beacon */}
                      {hospital.type !== "On Call Support" ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                          isCritical
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : isHigh
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            isCritical
                              ? "bg-rose-500 animate-ping"
                              : isHigh
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-amber-500"
                          }`} />
                          <BedDouble className="h-3.5 w-3.5 text-current shrink-0" />
                          {beds} Beds Free
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold bg-blue-50 text-blue-600 border-blue-100">
                          <Activity className="h-3.5 w-3.5 text-blue-500 animate-pulse shrink-0" />
                          On Call - Dispatch Active
                        </div>
                      )}

                      {/* Ambulance Cost Indicator */}
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-250 bg-slate-50 text-xs font-bold text-slate-600">
                        <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        ${hospital.ambulance_cost.toFixed(0)} Access Cost
                      </div>

                      {/* Action trigger button */}
                      <Button
                        onClick={() => handleToggleExpand(hospital.id)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all shrink-0 ${
                          isExpanded 
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700" 
                            : "bg-[#0B5FA5] hover:bg-[#0B5FA5]/95 text-white"
                        }`}
                      >
                        {isExpanded ? "Hide Details" : "View Doctors"}
                        <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </Button>
                    </div>
                  </div>

                  {/* 3. DOCTOR & TIME SLOT SELECTION SUB-PANEL */}
                  {isExpanded && (
                    <div className="mt-6 border-t border-slate-150 pt-5 flex flex-col gap-5">
                      
                      <div className="flex items-center justify-between gap-3 bg-slate-50/50 rounded-xl px-4 py-3 border border-slate-100">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Users className="h-4.5 w-4.5 text-[#0B5FA5]" />
                          On-Duty Medical Professionals
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Select slot & confirm
                        </span>
                      </div>

                      {/* Doctors grid list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getDoctorsForActiveHospital(hospital.id).map((doctor) => {
                          const isDoctorSelected = selectedDoctorId === doctor.id;
                          
                          return (
                            <div 
                              key={doctor.id}
                              onClick={() => {
                                setSelectedDoctorId(doctor.id);
                                setSelectedTimeSlot(null); // Reset slot
                              }}
                              className={`border rounded-2xl p-4 flex flex-col gap-3 transition-all cursor-pointer ${
                                isDoctorSelected
                                  ? "border-[#0B5FA5] bg-blue-50/10 shadow-sm"
                                  : "border-slate-150 bg-white hover:border-slate-350"
                              }`}
                            >
                              {/* Doctor top bio */}
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs ${
                                    isDoctorSelected 
                                      ? "bg-[#0B5FA5] border-[#0B5FA5] text-white" 
                                      : "bg-slate-50 border-slate-200 text-slate-500"
                                  }`}>
                                    {doctor.name.split(" ")[1]?.charAt(0) || "D"}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-extrabold text-slate-800">{doctor.name}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold">{doctor.specialization}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-[10px] text-amber-500 font-bold">
                                  <Star className="h-3 w-3 fill-amber-400 shrink-0" />
                                  {doctor.rating.toFixed(2)}
                                </div>
                              </div>

                              {/* Interactive clickable time-slots */}
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {doctor.time_slots.map((slot) => {
                                  const isSlotSelected = isDoctorSelected && selectedTimeSlot === slot;
                                  return (
                                    <button
                                      key={slot}
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent card select trigger
                                        setSelectedDoctorId(doctor.id);
                                        setSelectedTimeSlot(slot);
                                      }}
                                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                                        isSlotSelected
                                          ? "bg-[#0B5FA5] border-[#0B5FA5] text-white shadow-sm"
                                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                                      }`}
                                    >
                                      {slot}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 4. BED & SLOT BOOKING ACTION */}
                      <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-100 pt-4 gap-4 mt-2">
                        <p className="text-slate-500 text-[10px] max-w-md leading-relaxed text-center md:text-left">
                          * Bed reservation holds for 4 hours from appointment window. Estimated ambulance access rates are calculated from your active coordinate radius.
                        </p>
                        
                        <Button
                          onClick={() => handleConfirmBooking(hospital)}
                          disabled={!selectedDoctorId || !selectedTimeSlot}
                          className="w-full md:w-auto px-8 py-5.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/10 text-white font-extrabold rounded-xl border-0 flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <Sparkles className="h-4.5 w-4.5 text-white" />
                          Confirm Bed & Appointment
                        </Button>
                      </div>

                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
