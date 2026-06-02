import React from "react";
import { Button } from "./ui/button";
import { CheckCircle2, Download } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function AppShowcase() {
  return (
    <section id="app" className="py-24 bg-[#F8FAFC] overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2C8ED6]/20 to-[#E31E24]/10 blur-3xl rounded-full" />
            <div className="relative z-10 w-full max-w-[400px] mx-auto bg-white rounded-[3rem] p-3 shadow-2xl border-8 border-slate-900 aspect-[9/19] overflow-hidden">
              {/* Fake Mobile App Header */}
              <div className="absolute top-0 inset-x-0 h-7 bg-slate-900 rounded-b-3xl z-20" />
              
              <div className="h-full w-full rounded-[2rem] overflow-hidden bg-slate-50 flex flex-col relative">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwaW4lMjBoYW5kJTIwYXBwJTIwbW9kZXJufGVufDF8fHx8MTc4MDI4NTkyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="App Mockup"
                  className="w-full h-full object-cover opacity-20 absolute inset-0"
                />
                <div className="relative z-10 p-6 pt-12 h-full flex flex-col">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Hello, Jane</h3>
                  
                  {/* Mockup Elements */}
                  <div className="bg-[#E31E24] text-white rounded-2xl p-5 mb-4 shadow-lg flex items-center justify-between">
                    <div>
                      <p className="font-bold">Emergency SOS</p>
                      <p className="text-xs opacity-80 mt-1">Tap for immediate help</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                      <span className="font-bold text-xl">!</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-blue-100 mb-2" />
                      <p className="text-xs font-semibold">Medicine</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-purple-100 mb-2" />
                      <p className="text-xs font-semibold">Reports</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Upcoming Appointment</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div>
                        <p className="font-bold text-sm text-slate-800">Dr. Smith</p>
                        <p className="text-xs text-slate-500">Cardiology • Today, 2:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] mb-6 leading-tight">
              Your Entire Healthcare <br/>
              Ecosystem in <span className="text-[#0B5FA5]">One App</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Download the MedVelo app to get instant access to our emergency network, order generic medicines, and manage all your family's health records securely from your pocket.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                "Instant SOS activation with live GPS tracking",
                "Scan prescriptions to find generic alternatives",
                "Book diagnostic tests with home sample collection",
                "Secure vault for all medical records and reports"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#2C8ED6] shrink-0" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-black hover:bg-slate-800 text-white gap-2"
                onClick={() => window.open('https://www.apple.com/app-store/', '_blank')}
              >
                <Download className="w-5 h-5" />
                App Store
              </Button>
              <Button
                size="lg"
                className="bg-black hover:bg-slate-800 text-white gap-2"
                onClick={() => window.open('https://play.google.com/store', '_blank')}
              >
                <Download className="w-5 h-5" />
                Google Play
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
