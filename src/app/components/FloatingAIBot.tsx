import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  User, 
  Send, 
  Trash2, 
  X, 
  Sparkles, 
  MessageSquare, 
  Info, 
  Clock 
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../utils/auth";

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

const DEFAULT_RESPONSE = 
  "Welcome to the MedVelo Clinical Assistant. Under our integrated PMBJP generic drug mapping scheme, we resolve active salts to equivalent formulations at substantial Indian Rupee (₹) discounts.\n\nPlease describe your symptoms, search queries, or drug compatibility concerns, and our clinical advisor bot will assist you immediately.\n\n**Disclaimer: This is an AI assessment. Please consult a certified medical practitioner for professional clinical diagnoses.**";

const MOCK_BOT_RESPONSES: { keywords: string[]; text: string }[] = [
  {
    keywords: ["fever", "paracetamol", "crocin", "temp", "feverish"],
    text: "For managing mild fever, **Paracetamol** is the primary active ingredient widely recommended. \n\n* **Retail Brand (Crocin 650mg)**: Typically costs around **₹30.00** per pack of 15.\n* **Government Jan Aushadhi Generic Alternative**: Typically costs only **₹10.00** (a savings of **₹20.00** per pack).\n\nEnsure adequate hydration and rest. \n\n**Disclaimer: This is an AI assessment. Please consult a certified medical practitioner for professional clinical diagnoses.**"
  },
  {
    keywords: ["bp", "blood pressure", "hypertension", "betaloc", "atenolol"],
    text: "Hypertension requires systematic clinical monitoring. Under our generic drug matching algorithms:\n\n* **Retail Brand (Betaloc 50mg)**: Typically costs around **₹120.00** per pack.\n* **PMBJP Jan Aushadhi Generic equivalent (Metoprolol/Atenolol)**: Available at just **₹32.00** (saving over **70%** under the government scheme).\n\nNever self-medicate or alter cardiovascular prescriptions without doctor guidance. \n\n**Disclaimer: This is an AI assessment. Please consult a certified medical practitioner for professional clinical diagnoses.**"
  },
  {
    keywords: ["cholesterol", "lipitor", "atorvastatin", "heart"],
    text: "For lipid management, Atorvastatin is the gold-standard active salt:\n\n* **Retail Brand (Lipitor 10mg)**: Costs around **₹240.00** per pack.\n* **PMBJP Jan Aushadhi Generic Atorvastatin**: Costs only **₹68.00** in Indian Rupees (₹) at NABL aggregate centers.\n\nCombine pharmacotherapy with a low saturated-fat diet and regular physical activity.\n\n**Disclaimer: This is an AI assessment. Please consult a certified medical practitioner for professional clinical diagnoses.**"
  }
];

export function FloatingAIBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hasNewMessages, setHasNewMessages] = useState<boolean>(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Seed initial greeting message
    setMessages([
      {
        role: "model",
        text: "Greetings. I am the senior clinical advisor bot for the MedVelo platform. How may I assist you with your symptoms, prescription parameters, or generic drug matching inquiries today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessages(false);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Return null immediately for unauthenticated public traffic to protect API credits
  if (!user) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const isRealKey = geminiKey && geminiKey !== "your_actual_copied_gemini_api_key";

    if (isRealKey) {
      try {
        const contextualPrompt = `You are MedVelo's automated AI Healthcare Assistant. 
Address the following symptom query completely: "${userMessage.text}".
You must follow these scope protocols:
1. Provide a clear symptom assessment guide for issues like cough, cold, fever, or body pain.
2. Perform an active generic chemical salt analysis.
3. Detail cost tracking in Indian Rupee (₹) price scales.
4. Match alternative choices available under the PMBJP generic scheme.

End response with: "**Disclaimer: I am an AI advisor, not a doctor. Please consult a registered medical professional for official clinical diagnosis.**"`;

        const payload = {
          contents: [{
            role: "user",
            parts: [{ text: contextualPrompt }]
          }]
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const aiResponseText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        if (aiResponseText.trim().length > 0) {
          const modelMessage: Message = {
            role: "model",
            text: aiResponseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, modelMessage]);
          setIsTyping(false);
          if (!isOpen) {
            setHasNewMessages(true);
          }
          return;
        }
      } catch (error) {
        console.warn("Gemini chat fetch failed, launching local sandbox fallback assistant:", error);
      }
    }

    // Local sandboxed fallback response logic based on keywords
    setTimeout(() => {
      const lowerQuery = userMessage.text.toLowerCase();
      let matchedResponse = DEFAULT_RESPONSE;

      for (const item of MOCK_BOT_RESPONSES) {
        if (item.keywords.some(kw => lowerQuery.includes(kw))) {
          matchedResponse = item.text;
          break;
        }
      }

      const fallbackModelMessage: Message = {
        role: "model",
        text: matchedResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, fallbackModelMessage]);
      setIsTyping(false);
      if (!isOpen) {
        setHasNewMessages(true);
      }
    }, 1200);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "model",
        text: "Chat cleared. I am ready to advise you safely on prescription parameters or generic Rupee (₹) alternatives.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    toast.success("Chat history cleared.");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      
      {/* Floating Chat Window container */}
      <div 
        className={`mb-4 w-[340px] sm:w-[380px] h-[480px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-10 pointer-events-none"
        }`}
      >
        {/* Chat Header */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center relative">
              <Bot className="w-4.5 h-4.5" />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900"></span>
            </div>
            <div>
              <h4 className="text-xs font-black leading-tight flex items-center gap-1">
                MedVelo Assistant
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </h4>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AI Clinical Advisor</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearChat}
              title="Clear Thread"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors outline-none cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors outline-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NHA Disclaimer Alert bar */}
        <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 text-[9px] text-slate-600 flex items-start gap-1.5 shrink-0">
          <Info className="h-3.5 w-3.5 text-[#0B5FA5] shrink-0 mt-0.5" />
          <p className="leading-tight font-medium">
            AI symptom guides. Always check generic salts at Jan Aushadhi Kendra centers.
          </p>
        </div>

        {/* Messages Body section */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 space-y-3">
          {messages.map((msg, index) => {
            const isBot = msg.role === "model";
            return (
              <div 
                key={index}
                className={`flex gap-2 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white ${
                  isBot ? "bg-[#0B5FA5]" : "bg-emerald-500"
                }`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="flex flex-col gap-1">
                  <div className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                    isBot 
                      ? "bg-white text-slate-700 border border-slate-100 rounded-tl-none whitespace-pre-line" 
                      : "bg-[#0B5FA5] text-white rounded-tr-none"
                  }`}>
                    {msg.text}
                  </div>
                  <span className={`text-[8px] font-bold text-slate-400 ${isBot ? "self-start pl-0.5" : "self-end pr-0.5"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2 mr-auto max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-[#0B5FA5] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-white text-slate-500 border border-slate-100 shadow-sm p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Messaging footer input form */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex gap-2 shrink-0 items-center">
          <input
            type="text"
            placeholder="Type symptoms or drug names (fever, bp)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm bg-white outline-none focus:border-[#2C8ED6] text-xs font-semibold disabled:opacity-60 transition-all"
          />
          <button 
            type="submit"
            disabled={isTyping || !inputText.trim()}
            className="py-3 px-3.5 bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6] border-0 hover:shadow-md hover:shadow-blue-500/10 text-white font-bold rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Floating Toggle Button */}
      <div className="relative group">
        {/* Glow pulsing ring overlay */}
        <span className="absolute -inset-0.5 bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6] rounded-full blur opacity-45 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></span>
        
        {/* New message notification dot */}
        {hasNewMessages && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full z-10 animate-bounce flex items-center justify-center text-[8px] font-black text-white">
            1
          </span>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Clinical Assistant"
          className="relative w-14 h-14 bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6] rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer outline-none border-0 text-white"
        >
          {isOpen ? <X className="w-6 h-6 text-white" /> : "🤖"}
        </button>
      </div>

    </div>
  );
}
