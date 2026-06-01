import React from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Partners } from "../components/Partners";
import { Features } from "../components/Features";
import { Stats } from "../components/Stats";
import { AppShowcase } from "../components/AppShowcase";
import { FAQ } from "../components/FAQ";
import { Footer } from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-white">
      <Navbar />
      <main>
        <Hero />
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
