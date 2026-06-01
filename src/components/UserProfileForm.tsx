import React, { useState, useEffect } from "react";
import { useAuth } from "../app/utils/auth";
import { supabase } from "../supabase";
import { 
  User, 
  Phone, 
  Calendar, 
  Activity, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  AlertCircle,
  FileText,
  Loader2,
  Lock
} from "lucide-react";
import { Button } from "../app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../app/components/ui/card";
import { toast } from "sonner";

export function UserProfileForm() {
  const { user, profile, refreshProfile, isMockMode } = useAuth();
  
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [gender, setGender] = useState<string>("Male");
  const [bloodGroup, setBloodGroup] = useState<string>("O-Positive");
  const [abhaId, setAbhaId] = useState<string>("");
  const [emergencyName, setEmergencyName] = useState<string>("");
  const [emergencyPhone, setEmergencyPhone] = useState<string>("");
  
  // Chronic illness selections
  const [illnesses, setIllnesses] = useState<Record<string, boolean>>({
    Diabetes: false,
    Hypertension: false,
    Thyroid: false,
    Asthma: false,
    Allergies: false
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [detectedCoords, setDetectedCoords] = useState<{lat: number, lng: number} | null>(null);

  // Sync inputs with profile data if partially loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setDob(profile.dob || "");
      setGender(profile.gender || "Male");
      setBloodGroup(profile.blood_group || "O-Positive");
      setAbhaId(profile.abha_id || "");
      setEmergencyName(profile.emergency_contact_name || "");
      setEmergencyPhone(profile.emergency_contact_phone || "");
      
      if (profile.chronic_illnesses) {
        const illMap = { ...illnesses };
        profile.chronic_illnesses.forEach((ill) => {
          if (illMap[ill] !== undefined) {
            illMap[ill] = true;
          }
        });
        setIllnesses(illMap);
      }
    }
  }, [profile]);

  // Request browser Geolocation telemetry coordinates
  const triggerGPSCapture = (): Promise<{lat: number, lng: number} | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setDetectedCoords(coords);
          setGpsLoading(false);
          resolve(coords);
        },
        (err) => {
          console.warn("GPS tracking access restricted by browser:", err.message);
          setGpsLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const handleCheckboxChange = (illnessKey: string) => {
    setIllnesses(prev => ({
      ...prev,
      [illnessKey]: !prev[illnessKey]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName || !phone || !dob || !abhaId || !emergencyName || !emergencyPhone) {
      toast.error("Please fill in all mandatory onboarding fields.");
      return;
    }

    if (abhaId.replace(/\s/g, "").length !== 14) {
      toast.error("Your ABHA ID must be exactly 14 numeric digits.");
      return;
    }

    setIsSaving(true);
    
    // Capture GPS coordinate tracking
    const position = await triggerGPSCapture();

    const payload = {
      full_name: fullName,
      phone,
      dob,
      gender,
      blood_group: bloodGroup,
      abha_id: abhaId.replace(/\s/g, ""),
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
      chronic_illnesses: Object.keys(illnesses).filter(k => illnesses[k]),
      last_known_latitude: position?.lat ?? profile?.last_known_latitude ?? null,
      last_known_longitude: position?.lng ?? profile?.last_known_longitude ?? null,
      onboarding_complete: true
    };

    try {
      if (isMockMode) {
        // 1. Sandboxed Auth Profile Update Fallback
        const mockProfileKey = `medvelo_mock_profile_${user.id}`;
        localStorage.setItem(mockProfileKey, JSON.stringify({
          id: user.id,
          ...payload
        }));
        
        await refreshProfile();
        toast.success("Health profile onboarding completed (Sandbox Mode)!", {
          icon: "🤖"
        });
      } else {
        // 2. Real Supabase Cloud Profile Transaction
        const { error } = await supabase
          .from("user_profiles")
          .update(payload)
          .eq("id", user.id);

        if (error) throw error;
        
        await refreshProfile();
        toast.success("Health profile onboarding successfully completed!", {
          icon: "🏥"
        });
      }
    } catch (err: any) {
      console.error("Profile onboarding transaction failed:", err);
      toast.error(err.message || "Failed to commit profile updates.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-[#0B5FA5]/35 shadow-xl bg-white rounded-3xl overflow-hidden max-w-2xl mx-auto relative">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
      
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B5FA5] flex items-center justify-center animate-pulse shrink-0 border border-blue-100">
          <Heart className="h-6.5 w-6.5 text-[#0B5FA5]" />
        </div>
        <div>
          <CardTitle className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
            Complete Onboarding Questionnaire
            <span className="text-[9px] bg-[#0B5FA5] text-white rounded-full px-2 py-0.5 font-bold tracking-widest uppercase">
              Action Required
            </span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 leading-normal">
            Your patient records are incomplete. Please fill out your medical details below to secure active health features.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Geolocation telemetry notification bar */}
          <div className="flex items-center justify-between gap-3 bg-blue-50/50 rounded-2xl px-4 py-3 border border-blue-100 text-xs">
            <span className="text-[#0B5FA5] font-bold flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 animate-bounce" />
              GPS Coordinate Capture
            </span>
            <span className="text-slate-500 text-right font-medium">
              {gpsLoading ? (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Locating...
                </span>
              ) : detectedCoords ? (
                <span className="text-[10px] text-emerald-600 font-extrabold uppercase flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  Captured: {detectedCoords.lat.toFixed(4)}, {detectedCoords.lng.toFixed(4)}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Requested on Submit
                </span>
              )}
            </span>
          </div>

          {/* Form fields layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full name input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] transition-all"
                />
                <User className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
            </div>

            {/* Phone input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] transition-all"
                />
                <Phone className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
            </div>

            {/* DOB input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Date of Birth *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] transition-all"
                />
                <Calendar className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
            </div>

            {/* Gender selector dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] transition-all cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood group selection dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Blood Group *
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] transition-all cursor-pointer"
              >
                {["O-Positive", "O-Negative", "A-Positive", "A-Negative", "B-Positive", "B-Negative", "AB-Positive", "AB-Negative"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* ABHA ID (14 digits) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                ABHA ID (14-Digit Digital Health Card ID) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="91-0293-8472-1029"
                  maxLength={19} // allows spaces/hyphens
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] transition-all font-mono tracking-wider"
                />
                <FileText className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full my-1"></div>

          {/* Emergency contacts block */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Emergency Contact Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Contact Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] transition-all"
                  />
                  <User className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Contact Phone *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+1 (555) 091-2834"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] transition-all"
                  />
                  <Phone className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full my-1"></div>

          {/* Chronic Illness Clusters */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Chronic Illnesses & Allergies
            </h4>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {Object.keys(illnesses).map((illnessKey) => (
                <label 
                  key={illnessKey}
                  className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-655"
                >
                  <input
                    type="checkbox"
                    checked={illnesses[illnessKey]}
                    onChange={() => handleCheckboxChange(illnessKey)}
                    className="w-4.5 h-4.5 rounded border border-slate-300 text-[#0B5FA5] focus:ring-[#0B5FA5] cursor-pointer"
                  />
                  {illnessKey}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/10 text-white font-extrabold rounded-xl border-0 flex items-center justify-center gap-1.5 shrink-0"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Uploading Patient Telemetry...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4.5 w-4.5 text-white" />
                Confirm Bed & Appointment
              </>
            )}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
