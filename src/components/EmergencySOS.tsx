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
  created_at?: string;
}

// Pre-seeded high-fidelity mock database for immediate offline sandbox testing
const LOCAL_AMBULANCES: Ambulance[] = [
  {
    id: "a1",
    type: "Basic Life Support (BLS)",
    driver_name: "Marcus Vance",
    driver_phone: "+1 (555) 911-0021",
    price: 150.00,
    rating: 4.92,
    availability: true,
    eta_minutes: 5,
    vehicle_plate: "MED-BLS01",
  },
  {
    id: "a2",
    type: "Advanced Life Support (ALS)",
    driver_name: "Sarah Sterling",
    driver_phone: "+1 (555) 911-0044",
    price: 280.00,
    rating: 4.97,
    availability: true,
    eta_minutes: 3,
    vehicle_plate: "MED-ALS02",
  },
  {
    id: "a3",
    type: "Cardiac ICU Ambulance",
    driver_name: "Dr. David Chen",
    driver_phone: "+1 (555) 911-0099",
    price: 450.00,
    rating: 4.99,
    availability: true,
    eta_minutes: 4,
    vehicle_plate: "MED-CCU03",
  },
  {
    id: "a4",
    type: "Neonatal/Pediatric ICU",
    driver_name: "Elena Rostova",
    driver_phone: "+1 (555) 911-0077",
    price: 350.00,
    rating: 4.88,
    availability: false,
    eta_minutes: 7,
    vehicle_plate: "MED-NICU04",
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
          setVehicles(data);
          // Auto select first available vehicle
          const firstAvail = data.find((v: Ambulance) => v.availability);
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vehicles.map((v) => {
                  const isSelected = selectedVehicle?.id === v.id;
                  
                  return (
                    <Card
                      key={v.id}
                      onClick={() => v.availability && setSelectedVehicle(v)}
                      className={`group cursor-pointer border overflow-hidden transition-all duration-300 ${
                        !v.availability 
                          ? "opacity-60 bg-slate-100/50 cursor-not-allowed border-slate-100" 
                          : isSelected 
                            ? "border-red-500 ring-4 ring-red-500/10 shadow-lg bg-gradient-to-b from-white to-red-50/5" 
                            : "border-slate-150 shadow-md hover:shadow-xl hover:border-red-500/30 bg-white"
                      }`}
                    >
                      {/* Vehicle photo placeholder / Stylized Ambulance Vector */}
                      <div className="relative aspect-[16/9] w-full bg-slate-900 flex items-center justify-center overflow-hidden border-b border-slate-100">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-650 to-rose-750 opacity-90"></div>
                        
                        {/* Custom vehicle illustration vector */}
                        <div className="relative z-10 text-center flex flex-col items-center">
                          <div className={`p-4 rounded-full bg-white/10 text-white mb-2 transition-transform duration-300 group-hover:scale-110 ${isSelected ? "animate-bounce" : ""}`}>
                            <AmbulanceIcon className="h-8 w-8" />
                          </div>
                          <span className="text-[10px] tracking-widest font-black uppercase text-white/80">
                            {v.vehicle_plate}
                          </span>
                        </div>

                        {/* Status beacon overlay */}
                        <div className="absolute top-3 right-3 z-20">
                          {v.availability ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold bg-slate-800/80 text-slate-400 border border-slate-700 backdrop-blur-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                              Offline
                            </span>
                          )}
                        </div>

                        {/* ETA overlay */}
                        <div className="absolute bottom-3 left-3 z-20">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-black/60 text-xs font-bold text-white backdrop-blur-sm">
                            <Clock className="h-3 w-3 text-red-400" />
                            {v.eta_minutes} Min ETA
                          </span>
                        </div>
                      </div>

                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-black text-slate-800 flex items-center justify-between">
                          {v.type}
                          <span className="text-red-600 font-extrabold text-base">
                            ${v.price.toFixed(0)}
                          </span>
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Equipped medical transport
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-4 pt-2 border-t border-slate-50 flex items-center justify-between">
                        {/* Driver Profile */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <Users className="h-4 w-4 text-slate-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{v.driver_name}</span>
                            <span className="text-[10px] text-slate-400">Driver & Tech</span>
                          </div>
                        </div>
                        
                        {/* Driver rating stars */}
                        <div className="flex items-center gap-0.5 bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs text-amber-500 font-bold shrink-0">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {v.rating.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
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
