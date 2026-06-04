import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Navigation, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Volume2,
  XCircle,
  Share2,
  Star,
  Activity,
  Ambulance as AmbulanceIcon
} from "lucide-react";
import { Button } from "../app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../app/components/ui/card";
import { toast } from "sonner";

// Import local assets for ambulances
import blsImg from "../ambulances/bls.png";
import alsImg from "../ambulances/als.png";
import cardiacImg from "../ambulances/cardiac.png";
import nicuImg from "../ambulances/nicu.png";

export interface Ambulance {
  id: string;
  type: string;
  driver_name: string;
  driver_phone: string;
  price: number;
  rating: number;
  availability: boolean;
  eta_minutes: number;
  vehicle_plate: string;
  image: string;
  description: string;
  created_at?: string;
}

// Pre-seeded high-fidelity mock database for immediate offline sandbox testing
const LOCAL_AMBULANCES: Ambulance[] = [
  {
    id: "MED-BLS01",
    type: "Basic Life Support (BLS)",
    driver_name: "Marcus Vance",
    driver_phone: "+1 (555) 911-0021",
    price: 150.00,
    rating: 4.92,
    availability: true,
    eta_minutes: 5,
    vehicle_plate: "MED-BLS01",
    image: blsImg,
    description: "Standard transport with oxygen, stretcher, basic first aid, and a trained EMT for stable patients."
  },
  {
    id: "MED-ALS02",
    type: "Advanced Life Support (ALS)",
    driver_name: "Sarah Sterling",
    driver_phone: "+1 (555) 911-0044",
    price: 280.00,
    rating: 4.97,
    availability: true,
    eta_minutes: 3,
    vehicle_plate: "MED-ALS02",
    image: alsImg,
    description: "Mobile ICU unit equipped with ventilators, ECG monitors, and advanced life-saving medications."
  },
  {
    id: "MED-CCU03",
    type: "Cardiac ICU Ambulance",
    driver_name: "Dr. David Chen",
    driver_phone: "+1 (555) 911-0099",
    price: 450.00,
    rating: 4.99,
    availability: true,
    eta_minutes: 4,
    vehicle_plate: "MED-CCU03",
    image: cardiacImg,
    description: "Specialized cardiac care unit featuring defibrillators, continuous heart monitoring, and trained cardiac staff."
  },
  {
    id: "MED-NICU04",
    type: "Neonatal/Pediatric ICU",
    driver_name: "Elena Rostova",
    driver_phone: "+1 (555) 911-0077",
    price: 350.00,
    rating: 4.88,
    availability: false,
    eta_minutes: 7,
    vehicle_plate: "MED-NICU04",
    image: nicuImg,
    description: "Climate-controlled incubator transport with pediatric ventilators and specialized neonatal care equipment."
  }
];

export default function EmergencySOS() {
  const [vehicles, setVehicles] = useState<Ambulance[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Ambulance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Booking active states
  const [isBooked, setIsBooked] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);
  const [dispatchStage, setDispatchStage] = useState<string>("Transmitting Coordinates");
  const [ambulanceProgress, setAmbulanceProgress] = useState<number>(0); // 0 to 100

  // 1. Cloud query hook with automated local sandbox recovery
  useEffect(() => {
    async function getAmbulances() {
      try {
        setIsLoading(true);
        // Fetch from cloud public.ambulances table
        const { data, error } = await supabase
          .from("ambulances")
          .select("*")
          .order("price", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Ambulance[] = data.map((v: any) => ({
            id: v.id || v.vehicle_plate,
            type: v.type,
            driver_name: v.driver_name || v.driver || "Marcus Vance",
            driver_phone: v.driver_phone || "+1 (555) 911-0021",
            price: Number(v.price || 150),
            rating: Number(v.rating || 4.9),
            availability: v.availability !== undefined ? v.availability : !v.isOffline,
            eta_minutes: Number(v.eta_minutes || (v.eta ? parseInt(v.eta) : 5)),
            vehicle_plate: v.vehicle_plate || v.id,
            image: v.image || (v.type.toLowerCase().includes("bls") ? blsImg : v.type.toLowerCase().includes("als") ? alsImg : v.type.toLowerCase().includes("cardiac") ? cardiacImg : nicuImg),
            description: v.description || (
              v.type.toLowerCase().includes("bls") 
                ? "Standard transport with oxygen, stretcher, basic first aid, and a trained EMT for stable patients."
                : v.type.toLowerCase().includes("als")
                  ? "Mobile ICU unit equipped with ventilators, ECG monitors, and advanced life-saving medications."
                  : v.type.toLowerCase().includes("cardiac")
                    ? "Specialized cardiac care unit featuring defibrillators, continuous heart monitoring, and trained cardiac staff."
                    : "Climate-controlled incubator transport with pediatric ventilators and specialized neonatal care equipment."
            )
          }));
          setVehicles(mapped);
          // Auto select first available vehicle
          const firstAvail = mapped.find((v: Ambulance) => v.availability);
          if (firstAvail) setSelectedVehicle(firstAvail);
        } else {
          // Table returned empty list, fall back to sandbox
          setVehicles(LOCAL_AMBULANCES);
          setSelectedVehicle(LOCAL_AMBULANCES[1]); // Default ALS
        }
      } catch (err: any) {
        console.warn("Ambulances table fetch failed. Utilizing sandboxed local DB.", err.message);
        setVehicles(LOCAL_AMBULANCES);
        setSelectedVehicle(LOCAL_AMBULANCES[1]); // Default ALS
      } finally {
        setIsLoading(false);
      }
    }
    getAmbulances();
  }, []);

  // 2. Dispatch tracker timer & animation controls
  useEffect(() => {
    if (!isBooked || countdownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        const next = prev - 1;
        
        // Calculate SVG animation progress percentage
        if (selectedVehicle) {
          const totalSec = selectedVehicle.eta_minutes * 60;
          const elapsed = totalSec - next;
          const pct = Math.min((elapsed / totalSec) * 100, 100);
          setAmbulanceProgress(pct);
        }

        // Dynamically update dispatch status based on time left
        if (next > 180) {
          setDispatchStage("Navigating Metropolitan Transit Grid");
        } else if (next > 120) {
          setDispatchStage("Dispatching Paramedics (Priority Sirens Active)");
        } else if (next > 60) {
          setDispatchStage("Traffic Congestion Cleared / Advancing Rapidly");
        } else if (next > 15) {
          setDispatchStage("Approaching Emergency Coordinates");
        } else if (next > 0) {
          setDispatchStage("Arriving Now / Please Stand By");
        } else {
          setDispatchStage("Emergency Responders Arrived");
          clearInterval(interval);
          toast.success("Emergency responders have arrived at your coordinates!", {
            icon: "🚨",
            duration: 10000,
          });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBooked, countdownSeconds, selectedVehicle]);

  // Activate booking dispatch state
  const handleConfirmBooking = () => {
    if (!selectedVehicle) {
      toast.error("Please select a transport vehicle first.");
      return;
    }
    
    if (!selectedVehicle.availability) {
      toast.error("This ambulance is currently offline. Please choose an active tier.");
      return;
    }

    setIsBooked(true);
    setCountdownSeconds(selectedVehicle.eta_minutes * 60);
    setAmbulanceProgress(0);
    setDispatchStage("Transmitting Coordinates to Rescue Command...");

    toast.success(`SOS DISPATCHED: ${selectedVehicle.type} is en-route!`, {
      icon: "🚨",
      duration: 5000,
    });
  };

  // Format second counts to MM:SS
  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const handleCancelBooking = () => {
    if (window.confirm("Are you sure you want to cancel this emergency request?")) {
      setIsBooked(false);
      setCountdownSeconds(0);
      toast.error("Emergency dispatch request canceled.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Visual background alert glow */}
      {isBooked && (
        <div className="absolute inset-0 bg-red-500/5 animate-[pulse_3s_infinite] pointer-events-none z-0" />
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Activity className="h-10 w-10 text-red-500 animate-spin mb-4" />
          <p className="text-sm font-semibold tracking-wider uppercase">Loading emergency systems...</p>
        </div>
      ) : (
        <div className="relative z-10">
          
          {/* VIEW 1: ACTIVE AMBULANCE SELECTION GRID */}
          {!isBooked ? (
            <div className="flex flex-col gap-6">
              
              {/* Header card with glowing red border */}
              <div className="bg-white border-2 border-red-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-b from-red-600 to-rose-500"></div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center animate-pulse">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Active Emergency Dispatch Center</h2>
                    <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
                      Select a fully-certified vehicle tier below. Confirm booking to instantly transmit your live GPS coordinates to paramedics.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 shrink-0">
                  <Activity className="h-4.5 w-4.5 text-red-600 animate-pulse" />
                  <span className="text-xs font-black uppercase text-red-600 tracking-wider">
                    GPS Coordinates Active
                  </span>
                </div>
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {vehicles.map((amb) => {
                  const isSelected = selectedVehicle?.id === amb.id;
                  
                  return (
                    <div 
                      key={amb.id} 
                      onClick={() => !amb.isOffline && setSelectedVehicle(amb)}
                      className={`rounded-xl shadow-md overflow-hidden bg-white border cursor-pointer transition-all duration-300 flex flex-col h-full ${
                        amb.isOffline 
                          ? 'opacity-60 grayscale bg-slate-100/50 cursor-not-allowed border-slate-200' 
                          : isSelected 
                            ? 'border-red-500 ring-4 ring-red-500/10 shadow-lg bg-gradient-to-b from-white to-red-50/5' 
                            : 'border-gray-100 hover:shadow-lg hover:border-red-500/30 transition-shadow'
                      }`}
                    >
                      {/* 1. NEW IMAGE HEADER */}
                      <div className="relative h-40 w-full bg-gray-150 flex items-center justify-center overflow-hidden">
                        {/* Fallback Vector background shown if image is missing/fails */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-650 to-rose-750 opacity-90 flex items-center justify-center">
                          <div className="text-center flex flex-col items-center">
                            <div className={`p-4 rounded-full bg-white/10 text-white mb-2 ${isSelected ? "animate-bounce" : ""}`}>
                              <AmbulanceIcon className="h-8 w-8" />
                            </div>
                          </div>
                        </div>

                        {amb.image ? (
                          <img 
                            src={amb.image} 
                            alt={amb.type} 
                            className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-500 hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        
                        {/* ETA Badge Overlay */}
                        <div className="absolute top-3 left-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 z-20">
                          <span>⏱️</span> {amb.eta} ETA
                        </div>

                        {/* Offline Badge Overlay */}
                        {amb.isOffline && (
                          <div className="absolute top-3 right-3 bg-gray-500/90 text-white text-xs font-bold px-2 py-1 rounded z-20">
                            ● Offline
                          </div>
                        )}
                      </div>

                      {/* 2. CARD DETAILS */}
                      <div className="p-5 flex flex-col h-[calc(100%-10rem)] flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            {amb.type}
                          </h3>
                        </div>
                        
                        {/* Descriptive Text */}
                        <p className="text-sm text-gray-500 mb-4 flex-grow">{amb.description}</p>

                        {/* 3. DRIVER INFO (Rating Removed) */}
                        <div className="flex items-center border-t border-gray-100 pt-4 mt-auto">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                              {/* Default Avatar Icon */}
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{amb.driver}</p>
                              <p className="text-xs text-gray-500">Assigned Driver & Tech</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Confirm Dispatch Bar */}
              <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-700 tracking-wider">SOS Emergency Active Response</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Confirming booking will deploy sirens. Cancellation is subject to review by emergency operators.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleConfirmBooking}
                  disabled={!selectedVehicle}
                  className="w-full md:w-auto px-10 py-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold rounded-xl shadow-lg shadow-red-500/20 text-sm tracking-wide shrink-0 border-0 flex items-center justify-center gap-2 group transition-all"
                >
                  <Volume2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Confirm Booking / Activate SOS
                </Button>
              </div>

            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
              {/* VIEW 2: UBER-STYLE LIVE ROUTE TRACKING SCREEN */}
              
              <Card className="border-2 border-red-500/30 shadow-2xl bg-white overflow-hidden">
                <CardHeader className="bg-red-600 text-white p-6 relative overflow-hidden flex flex-row items-center justify-between gap-6">
                  {/* Glowing alert effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-600" />
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 animate-pulse">
                      <ShieldAlert className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-200">
                        EMERGENCY SERVICE EN-ROUTE
                      </span>
                      <CardTitle className="text-xl font-black mt-0.5">
                        {selectedVehicle?.type} Dispatched
                      </CardTitle>
                    </div>
                  </div>

                  {/* Dynamic Countdown Dial */}
                  <div className="relative z-10 text-right bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 backdrop-blur-md flex items-center gap-2.5">
                    <Clock className="h-4.5 w-4.5 text-red-200" />
                    <div>
                      <div className="text-[10px] text-red-200 font-semibold uppercase tracking-wider">Arrival ETA</div>
                      <div className="text-lg font-black font-mono leading-none mt-0.5">
                        {countdownSeconds > 0 ? formatTime(countdownSeconds) : "ARRIVED"}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  
                  {/* Uber-style custom SVG map tracking container */}
                  <div className="relative w-full aspect-[21/9] bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-900 flex items-center justify-center">
                    
                    {/* Simulated visual grid gridlines (City streets layout) */}
                    <svg className="absolute inset-0 w-full h-full text-slate-900/60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Stylized custom streets layout */}
                      <path d="M 0 60 L 800 60" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" />
                      <path d="M 120 0 L 120 300" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" />
                      <path d="M 680 0 L 680 300" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" />
                      <path d="M 0 190 L 800 190" stroke="#1E293B" strokeWidth="16" strokeLinecap="round" />
                      
                      {/* Active glowing animated route path from dispatch point to destination */}
                      {/* Dispatch starts at bottom-left (120, 190) and drives along horizontal to patient at top-right (680, 60) */}
                      <path 
                        d="M 120 190 L 680 190 L 680 60" 
                        stroke="rgba(239, 68, 68, 0.2)" 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                      
                      {/* Glowing dash line animation that flows along the path */}
                      <path 
                        d="M 120 190 L 680 190 L 680 60" 
                        stroke="#EF4444" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeDasharray="10 6"
                        className="animate-[routeFlow_1.5s_linear_infinite]"
                      />
                    </svg>

                    {/* Patient Position pin graphic */}
                    {/* Positioned at top-right street joint (680, 60) */}
                    <div className="absolute top-[60px] left-[680px] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                      <div className="absolute w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 animate-ping" />
                      <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow-lg">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <span className="mt-1 bg-red-950/90 text-white border border-red-800 text-[8px] font-bold px-2 py-0.5 rounded backdrop-blur-sm uppercase tracking-wider">
                        My SOS Location
                      </span>
                    </div>

                    {/* Ambulance tracking position indicator */}
                    {/* Moves programmatically from (120, 190) to (680, 60) based on progress pct */}
                    {(() => {
                      // Total travel segments:
                      // Segment 1 (horizontal): from X=120 to X=680 at Y=190
                      // Segment 2 (vertical): from Y=190 to Y=60 at X=680
                      // Total path distance = 560 (horizontal) + 130 (vertical) = 690 pixels
                      // Calculate active coordinates along this polyline
                      const totalDist = 690;
                      const activeDist = (ambulanceProgress / 100) * totalDist;
                      
                      let x = 120;
                      let y = 190;
                      
                      if (activeDist <= 560) {
                        x = 120 + activeDist;
                        y = 190;
                      } else {
                        x = 680;
                        y = 190 - (activeDist - 560);
                      }
                      
                      return (
                        <div 
                          className="absolute z-35 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                          style={{ left: `${x}px`, top: `${y}px` }}
                        >
                          <div className="absolute w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 animate-ping" />
                          <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg text-white">
                            <Navigation className="h-4 w-4 fill-white rotate-90" />
                          </div>
                          <span className="mt-1 bg-emerald-950/90 text-white border border-emerald-800 text-[8px] font-bold px-2 py-0.5 rounded backdrop-blur-sm uppercase tracking-wider">
                            Ambulance
                          </span>
                        </div>
                      );
                    })()}

                    {/* Outer Map compass overlay */}
                    <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 text-[9px] font-semibold text-slate-400 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md uppercase tracking-widest">
                      <Navigation className="h-3 w-3 fill-slate-400" />
                      Live Route Feed
                    </div>

                  </div>

                  {/* Dispatch progress feed alerts */}
                  <div className="mt-6 flex flex-col gap-4 border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 text-sm">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Activity className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                        Status Update:
                      </span>
                      <span className="font-extrabold text-[#0F172A] flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                        {dispatchStage}
                      </span>
                    </div>

                    {/* Driver details card */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center border border-slate-300">
                          <Users className="h-6 w-6 text-slate-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">
                            {selectedVehicle?.driver_name}
                          </h4>
                          <p className="text-xs text-slate-400">
                            Emergency Tech • {selectedVehicle?.vehicle_plate}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 sm:flex-none border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                        >
                          <a href={`tel:${selectedVehicle?.driver_phone}`} className="flex items-center gap-2 py-4">
                            <Phone className="h-4 w-4" />
                            Call Driver
                          </a>
                        </Button>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("SOS Tracking Link copied to clipboard! Share it with loved ones.");
                          }}
                          variant="outline"
                          className="flex-1 sm:flex-none border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                        >
                          <Share2 className="h-4 w-4" />
                          Share ETA
                        </Button>
                      </div>
                    </div>

                  </div>

                  {/* Terminate SOS dispatcher button */}
                  <div className="mt-8 border-t border-slate-100 pt-6 flex justify-center">
                    <Button
                      onClick={handleCancelBooking}
                      variant="ghost"
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 py-3 px-6 rounded-xl flex items-center gap-2 transition-all font-semibold"
                    >
                      <XCircle className="h-4.5 w-4.5" />
                      Cancel Emergency Dispatch
                    </Button>
                  </div>

                </CardContent>
              </Card>

            </div>
          )}

        </div>
      )}

      {/* Styled route tracking keyframe inject */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes routeFlow {
          from { stroke-dashoffset: 32; }
          to { stroke-dashoffset: 0; }
        }
      `}} />
    </div>
  );
}
