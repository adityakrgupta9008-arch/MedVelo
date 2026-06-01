import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/Button";
import logoImg from "../../imports/Gemini_Generated_Image_jbsyfyjbsyfyjbsy.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Navbar() {
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
          <Link to="#features" className="hover:text-[#0B5FA5] transition-colors">Features</Link>
          <Link to="#services" className="hover:text-[#0B5FA5] transition-colors">Services</Link>
          <Link to="#hospitals" className="hover:text-[#0B5FA5] transition-colors">Hospitals</Link>
          <Link to="#app" className="hover:text-[#0B5FA5] transition-colors">Mobile App</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="primary">
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
