import React from "react";
import { Users, Clock, Building2, Store } from "lucide-react";

const stats = [
  {
    value: "50,000+",
    label: "Patients Served",
    icon: <Users className="w-6 h-6 text-blue-200" />
  },
  {
    value: "5 Min",
    label: "Emergency Response",
    icon: <Clock className="w-6 h-6 text-red-200" />
  },
  {
    value: "500+",
    label: "Partner Hospitals",
    icon: <Building2 className="w-6 h-6 text-blue-200" />
  },
  {
    value: "1000+",
    label: "Pharmacies",
    icon: <Store className="w-6 h-6 text-blue-200" />
  }
];

export function Stats() {
  return (
    <section className="py-20 bg-[#0B5FA5] relative overflow-hidden">
      {/* Background abstract */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <h4 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {stat.value}
              </h4>
              <p className="text-blue-100 font-medium tracking-wide uppercase text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
