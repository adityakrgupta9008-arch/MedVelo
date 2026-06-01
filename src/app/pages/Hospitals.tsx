import React from "react";
import HospitalDirectory from "../../components/HospitalDirectory";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function Hospitals() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50/50">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Main header block */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0B5FA5] mb-4 border border-blue-100 shadow-sm animate-pulse">
              Partner Networks Active
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] mb-3 leading-tight">
              Hospital <span className="bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6] bg-clip-text text-transparent">Directory</span>
            </h1>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Locate verified clinics, instantly check real-time vacant bed capacity, and secure instant appointment windows with on-duty physicians.
            </p>
          </div>
          
          <HospitalDirectory />
        </div>
      </main>
      <Footer />
    </div>
  );
}
