import React from "react";
import EmergencySOS from "../../components/EmergencySOS";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function SOS() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50/50">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              Emergency <span className="text-red-650">SOS Dispatch</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-2">
              Book real-time high-priority ambulance routing and life support systems.
            </p>
          </div>
          <EmergencySOS />
        </div>
      </main>
      <Footer />
    </div>
  );
}
