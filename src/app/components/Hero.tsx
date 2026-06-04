import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { AlertTriangle, Clock, MapPin, Pill, FileText, HeartPulse, Activity } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();

  const handleSOS = () => {
    navigate('/sos');
  }

  const handleDownload = () => {
    const el = document.getElementById('app');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-[#F8FAFC]">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-gradient-to-br from-[#2C8ED6]/20 to-[#0B5FA5]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-[#E31E24]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B5FA5] text-sm font-semibold mb-6">
                <HeartPulse className="w-4 h-4" />
                <span>Speeding Medical Solutions</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-[#0F172A] leading-[1.1] tracking-tight mb-6">
                Healthcare at <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6]">
                  Maximum Velocity
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                Instant emergency assistance, affordable generic medicines, digital prescriptions, home diagnostics, and AI-powered healthcare solutions—all in one platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleSOS} size="lg" className="gap-2 shadow-lg shadow-red-500/20 bg-red-600 hover:bg-red-700 text-white border-0 cursor-pointer">
                  <AlertTriangle className="w-5 h-5" />
                  🚑 Book Ambulance (SOS)
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Dashboard Mockup */}
          <div className="relative h-[600px] w-full lg:w-[120%] lg:-mr-[20%]">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="absolute inset-0"
            >
              <div className="relative w-full h-full rounded-3xl bg-white/40 border border-white/60 shadow-2xl backdrop-blur-3xl p-6 overflow-hidden">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-[#F1F5F9] opacity-50 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:20px_20px]" />
                
                <div className="relative z-10 h-full flex flex-col gap-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#E31E24] animate-pulse">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
                        <p className="text-sm font-bold text-[#0F172A]">Active Emergency</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ETA</p>
                      <p className="text-lg font-bold text-[#E31E24] flex items-center gap-1">
                        <Clock className="w-4 h-4" /> 04:23
                      </p>
                    </div>
                  </div>

                  {/* Main Grid */}
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    {/* Live Tracking Card */}
                    <Card className="col-span-2 row-span-2 bg-white/80 border-slate-100">
                      <CardContent className="p-4 h-full flex flex-col">
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#0B5FA5]" />
                          Ambulance Tracking
                        </h3>
                        <div className="flex-1 bg-slate-100 rounded-xl relative overflow-hidden">
                          <style>
                            {`
                              @keyframes dash {
                                to { stroke-dashoffset: -100; }
                              }
                            `}
                          </style>
                          {/* Fake Route Line */}
                          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                            <path 
                              d="M 20 120 Q 80 20 150 80 T 280 40" 
                              fill="none" 
                              stroke="#0B5FA5" 
                              strokeWidth="4" 
                              strokeDasharray="6 6"
                              style={{ animation: 'dash 20s linear infinite' }}
                            />
                            <circle cx="280" cy="40" r="6" fill="#0B5FA5" />
                            <circle cx="20" cy="120" r="8" fill="#E31E24" className="animate-ping" />
                          </svg>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Prescription Card */}
                    <Card className="bg-white/80 border-slate-100">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#2C8ED6]" />
                          Latest Rx
                        </h3>
                        <div className="space-y-2">
                          <div className="h-2 w-3/4 bg-slate-200 rounded-full" />
                          <div className="h-2 w-1/2 bg-slate-200 rounded-full" />
                          <div className="h-2 w-5/6 bg-slate-200 rounded-full" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Medicine Card */}
                    <Card className="bg-[#0B5FA5] text-white border-transparent">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-1 flex items-center gap-2 text-blue-100">
                          <Pill className="w-4 h-4" />
                          Generic Alt Found
                        </h3>
                        <p className="text-2xl font-bold mb-1">Save 65%</p>
                        <p className="text-xs text-blue-200">on Paracetamol 500mg</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
