import React from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Partners } from "../components/Partners";
import { Features } from "../components/Features";
import { Stats } from "../components/Stats";
import { AppShowcase } from "../components/AppShowcase";
import { FAQ } from "../components/FAQ";
import { Footer } from "../components/Footer";
import { useAuth } from "../utils/auth";
import { UserProfileForm } from "../../components/UserProfileForm";
import founderImg from "../../WhatsApp Image 2026-05-22 at 16.00.34.jpeg";

export default function Home() {
  const { user, profile } = useAuth();
  const showOnboarding = user && (!profile || !profile.onboarding_complete);

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-white">
      <Navbar />
      <main>
        <Hero />
        
        {/* Interactive Onboarding Questionnaire Section */}
        {showOnboarding && (
          <section id="onboarding-section" className="py-16 bg-slate-50 border-y border-slate-100 animate-fade-in scroll-mt-24">
            <div className="container mx-auto px-4">
              <UserProfileForm />
            </div>
          </section>
        )}

        <Partners />
        <Features />
        <Stats />
        <AppShowcase />
        <FAQ />

        {/* Meet Our Founder & Our Vision Section */}
        <section className="py-24 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white relative overflow-hidden">
          {/* Emerald & Navy abstract gradients */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20 uppercase tracking-widest">
                <span>Our Genesis</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Meet Our Founder & <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  Our Vision
                </span>
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 max-w-5xl mx-auto">
              {/* LEFT COLUMN: Profile Visual Frame */}
              <div className="flex-shrink-0 flex items-center justify-center">
                <div className="relative group">
                  {/* Decorative glowing background behind image */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#0B5FA5] opacity-25 blur group-hover:opacity-50 transition duration-300" />
                  <img
                    src={founderImg}
                    alt="Aditya Gupta"
                    className="relative w-72 h-96 object-cover rounded-2xl shadow-xl border-4 border-white transform transition duration-300 hover:scale-105 cursor-pointer"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: Vision Framing Context */}
              <div className="flex-1 space-y-6 max-w-xl text-center lg:text-left">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-1">
                    Aditya Gupta
                  </h3>
                  <p className="text-sm font-semibold text-emerald-400 tracking-wide uppercase">
                    Founder, MedVelo
                  </p>
                </div>

                <div className="relative border-l-4 border-emerald-500 pl-4 py-2 bg-white/5 rounded-r-xl pr-4">
                  <p className="text-slate-300 text-sm font-medium italic leading-relaxed">
                    "B.Tech Computer Science & Business Systems student, revolutionary health-tech pioneer."
                  </p>
                </div>

                <p className="text-slate-300 text-base leading-relaxed font-normal">
                  Driven by a profound vision to revolutionize the global healthcare industry, Aditya designed MedVelo to democratize medical transparency across India. By blending state-of-the-art multimodal AI engines with dynamic real-time public health data registries, MedVelo seamlessly bridges the critical gap between complex handwritten prescriptions, affordable generic chemical salt matching, and local hospital infrastructure networks.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
