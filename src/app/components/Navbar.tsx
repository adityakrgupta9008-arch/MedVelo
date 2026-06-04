import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import logoImg from "../../imports/Gemini_Generated_Image_jbsyfyjbsyfyjbsy.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "../utils/auth";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { user, profile, openAuthModal, logOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 flex items-center justify-center">
            <ImageWithFallback
              src={logoImg}
              alt="MedVelo Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <span className="text-xl font-bold text-[#0F172A]">MedVelo</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#0F172A]">
          <Link to="/" className="hover:text-[#0B5FA5] transition-colors">Home</Link>
          <Link to="/scan" className="hover:text-[#0B5FA5] transition-colors">Smart Scan 💊</Link>
          <Link to="/hospitals" className="hover:text-[#0B5FA5] transition-colors">Hospitals 🏥</Link>
          <Link to="/diagnostics" className="hover:text-[#0B5FA5] transition-colors">Diagnostics 🧪</Link>
          <Link to="/records" className="hover:text-[#0B5FA5] transition-colors">Digital Vault 🔒</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all font-bold text-xs text-slate-800 outline-none cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#0B5FA5] text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "P"}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline-block">
                  {profile?.full_name || "Patient"}
                </span>
                {!profile?.onboarding_complete && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse border border-white shadow-sm shrink-0" />
                )}
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-55 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-50 flex flex-col gap-0.5">
                    <span className="font-black text-xs text-slate-800 truncate">
                      {profile?.full_name || "Patient"}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {user.email}
                    </span>
                  </div>
                  
                  <div className="pt-2 flex flex-col">
                    {!profile?.onboarding_complete ? (
                      <button 
                        onClick={() => {
                          setDropdownOpen(false);
                          const el = document.getElementById("onboarding-section");
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth" });
                            toast.info("Please fill out your health onboarding form.");
                          } else {
                            toast.info("Please go to the homepage to complete onboarding details.");
                          }
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-amber-600 hover:bg-amber-50/50 font-bold transition-all flex items-center gap-2 outline-none cursor-pointer"
                      >
                        <span>⚠️ Complete Onboarding</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2 text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 tracking-wider uppercase border-b border-slate-50/80">
                        ✓ Onboarding Active
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        logOut();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50/50 font-bold transition-all outline-none cursor-pointer mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={openAuthModal} variant="ghost" className="hidden md:inline-flex text-slate-700 font-semibold cursor-pointer">
                Login
              </Button>
              <Link to="/assistant">
                <Button variant="default" className="py-5 px-6 font-bold bg-[#0B5FA5] hover:bg-[#0B5FA5]/95 text-white border-0 rounded-xl cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-[#0B5FA5] transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer Menu Container */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-6 flex flex-col gap-4 shadow-lg">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-800 hover:text-[#0B5FA5] transition-all"
          >
            Home
          </Link>
          <Link 
            to="/scan" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-800 hover:text-[#0B5FA5] transition-all"
          >
            Smart Scan 💊
          </Link>
          <Link 
            to="/hospitals" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-800 hover:text-[#0B5FA5] transition-all"
          >
            Hospitals 🏥
          </Link>
          <Link 
            to="/diagnostics" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-800 hover:text-[#0B5FA5] transition-all"
          >
            Diagnostics 🧪
          </Link>
          <Link 
            to="/records" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-800 hover:text-[#0B5FA5] transition-all"
          >
            Digital Vault 🔒
          </Link>
          {!user && (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Button 
                onClick={() => { setMobileMenuOpen(false); openAuthModal(); }} 
                variant="ghost" 
                className="w-full text-slate-700 font-semibold cursor-pointer justify-start px-0"
              >
                Login
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
