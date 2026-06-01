import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/Card";
import { Ambulance, Pill, Stethoscope, FileText, Bot } from "lucide-react";

const features = [
  {
    icon: <Ambulance className="w-8 h-8 text-[#E31E24]" />,
    title: "Emergency SOS Network",
    description: "One-tap emergency response with live GPS tracking and priority hospital routing."
  },
  {
    icon: <Pill className="w-8 h-8 text-[#0B5FA5]" />,
    title: "Generic Medicine Finder",
    description: "Compare and find high-quality generic alternatives to save on medical bills."
  },
  {
    icon: <Stethoscope className="w-8 h-8 text-[#2C8ED6]" />,
    title: "Home Diagnostics",
    description: "Book lab tests at home with certified phlebotomists and fast digital reports."
  },
  {
    icon: <FileText className="w-8 h-8 text-indigo-500" />,
    title: "Digital Health Records",
    description: "Secure, centralized storage for all your prescriptions, reports, and history."
  },
  {
    icon: <Bot className="w-8 h-8 text-teal-500" />,
    title: "AI Healthcare Assistant",
    description: "Smart symptom checker and 24/7 AI support for general medical queries."
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
            Comprehensive Healthcare, <br />
            <span className="text-[#0B5FA5]">Simplified.</span>
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need for your family's health, integrated into one seamless experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-slate-100 hover:border-[#2C8ED6]/30 bg-white">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed flex-1 mb-4">
                  {feature.description}
                </p>
                {feature.title === "Generic Medicine Finder" && (
                  <Link 
                    to="/scan" 
                    className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#0B5FA5] hover:text-[#2C8ED6] transition-colors group/link"
                  >
                    Try Smart Scan ⚡️
                    <span className="group-hover/link:translate-x-1.5 transition-transform inline-block">→</span>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
