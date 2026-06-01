import React from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How fast does the emergency ambulance arrive?",
    a: "Our average response time is under 5 minutes in metro areas. Our AI routing system automatically dispatches the nearest available ambulance to your exact GPS location."
  },
  {
    q: "Can I use MedVelo to find cheaper medicines?",
    a: "Yes! Simply scan your prescription and our system will instantly show you FDA-approved generic alternatives that can save you up to 80% on medical bills."
  },
  {
    q: "Are my health records secure?",
    a: "Absolutely. MedVelo uses bank-level encryption (AES-256) to secure your data. Only you and your authorized healthcare providers can access your medical history."
  },
  {
    q: "How do I book a home diagnostic test?",
    a: "Navigate to the Diagnostics tab in the app, select your required tests, choose a time slot, and a certified phlebotomist will arrive at your home for sample collection."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600">Everything you need to know about the MedVelo platform.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 transition-colors"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left font-semibold text-slate-800"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  {faq.q}
                  <ChevronDown className={"w-5 h-5 text-slate-400 transition-transform " + (isOpen ? "rotate-180" : "")} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
