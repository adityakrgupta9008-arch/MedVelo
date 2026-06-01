import React from "react";
import { Link } from "react-router";
import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import logoImg from "../../imports/Gemini_Generated_Image_jbsyfyjbsyfyjbsy.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 inline-flex">
              <div className="h-8 flex items-center justify-center rounded bg-white p-1 overflow-hidden">
                <ImageWithFallback src={logoImg} alt="MedVelo" className="h-6 w-auto object-contain" />
              </div>
              <span className="text-xl font-bold text-white">MedVelo</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
              Speeding medical solutions. We are building the future of healthcare infrastructure, making it more accessible, affordable, and faster than ever before.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-[#0B5FA5] hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-[#0B5FA5] hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-[#0B5FA5] hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-[#0B5FA5] hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Services</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Emergency SOS</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Medicine Finder</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Home Diagnostics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Digital Prescriptions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hospitals Network</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} MedVelo. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Healthcare at Maximum Velocity</p>
        </div>
      </div>
    </footer>
  );
}
