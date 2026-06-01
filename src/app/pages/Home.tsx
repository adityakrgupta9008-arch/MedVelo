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
      </main>
      <Footer />
    </div>
  );
}
