import React from "react";

const partners = [
  "City General Hospital",
  "Metro Healthcare",
  "St. Jude Medical",
  "Apollo Clinic",
  "Global Health Center"
];

export function Partners() {
  return (
    <section id="hospitals" className="py-12 border-y border-slate-100 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
          Trusted by 500+ Partner Hospitals
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {partners.map((partner, i) => (
            <div key={i} className="text-xl md:text-2xl font-bold text-slate-400 whitespace-nowrap">
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
