import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Bot, 
  User, 
  Send, 
  Activity, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Trash2,
  Lock,
  Heart,
  HelpCircle,
  Stethoscope,
  Info
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

const SYSTEM_INSTRUCTION = 
  "You are the senior clinical advisor bot for the MedVelo platform. Answer health questions safely, logically, and respectfully. Always reference generic drug matching logic using Indian Rupee (₹) benchmarks. At the absolute bottom of your response, always print this disclaimer in bold text: 'Disclaimer: This is an AI assessment. Please consult a certified medical practitioner for professional clinical diagnoses.'";

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

const DEFAULT_RESPONSE = 
  "Welcome to the MedVelo Clinical Assistant. Under our integrated PMBJP generic drug mapping scheme, we resolve active salts to equivalent formulations at substantial Indian Rupee (₹) discounts.\n\nPlease describe your symptoms, search queries, or drug compatibility concerns, and our clinical advisor bot will assist you immediately.\n\n**Disclaimer: This is an AI assessment. Please consult a certified medical practitioner for professional clinical diagnoses.**";

export default function AiHealthcareAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
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
    // Scroll to the bottom of message thread
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
    toast.success("Message thread cleared successfully.");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50/50">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 flex flex-col justify-center">
        <div className="container mx-auto px-4 max-w-4xl flex-1 flex flex-col gap-6">
          
          {/* Back button and page indicator */}
          <div className="flex justify-between items-center shrink-0">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0B5FA5] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#0B5FA5]/10 text-[#0B5FA5] border border-blue-100 shadow-sm animate-pulse">
              <Stethoscope className="h-3.5 w-3.5 text-[#0B5FA5]" />
              Senior Advisor Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">
            
            {/* LEFT COLUMN: GUIDELINES & CONTROLS */}
            <div className="lg:col-span-4 flex flex-col gap-6 shrink-0">
              
              {/* Core Information Card */}
              <Card className="border border-slate-100 shadow-md bg-white">
                <CardHeader className="pb-3 border-b border-slate-50">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B5FA5] flex items-center justify-center mb-3">
                    <Bot className="w-5.5 h-5.5" />
                  </div>
                  <CardTitle className="text-sm font-bold text-[#0F172A]">Clinical Advisor</CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1 leading-relaxed">
                    MedVelo platform's automated assistant for pharmaceutical parameters.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                    <p>
                      <strong>Scope of service:</strong>
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500">
                      <li>Symptom assessment guides</li>
                      <li>Active generic salt checkups</li>
                      <li>Indian Rupee (₹) price scales</li>
                      <li>PMBJP scheme matches</li>
                    </ul>
                  </div>

                  <div className="flex items-start gap-2 bg-blue-50/50 rounded-xl p-3 border border-blue-100 text-[10px] text-slate-600">
                    <Info className="h-4 w-4 text-[#0B5FA5] shrink-0 mt-0.5" />
                    <p>
                      <strong>NHA-ABDM Standards:</strong> Always verify prescriptions at Jan Aushadhi Kendra outlets before switching treatments.
                    </p>
                  </div>

                  <Button
                    onClick={clearChat}
                    variant="outline"
                    className="w-full py-4 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Active Thread
                  </Button>
                </CardContent>
              </Card>

            </div>

            {/* RIGHT COLUMN: MESSAGING BOARD */}
            <div className="lg:col-span-8 flex flex-col border border-slate-100 bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px]">
              
              {/* Chat Header */}
              <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0B5FA5]/10 text-[#0B5FA5] flex items-center justify-center relative">
                    <Bot className="w-5 h-5" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#0F172A] leading-tight">MedVelo Advisor Bot</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clinical Guidance Stream</span>
                  </div>
                </div>
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-blue-50 text-[#0B5FA5]">
                  <Lock className="h-3 w-3" />
                  Secured Endpoint
                </span>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[380px] bg-slate-50/20 space-y-4">
                {messages.map((msg, index) => {
                  const isBot = msg.role === "model";
                  return (
                    <div 
                      key={index}
                      className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        isBot ? "bg-[#0B5FA5] text-white" : "bg-emerald-500 text-white"
                      }`}>
                        {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                      </div>

                      {/* Chat text box */}
                      <div className="flex flex-col gap-1.5">
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                          isBot 
                            ? "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-none whitespace-pre-line" 
                            : "bg-[#0B5FA5] text-white rounded-tr-none"
                        }`}>
                          {msg.text}
                        </div>
                        <span className={`text-[9px] font-bold text-slate-400 ${isBot ? "self-start pl-1" : "self-end pr-1"}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-3 mr-auto max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-[#0B5FA5] text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                    <div className="bg-white text-slate-500 border border-slate-100 shadow-sm p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                
                <div ref={threadEndRef} />
              </div>

              {/* Chat Input Area */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex gap-3 shrink-0 items-center">
                <input
                  type="text"
                  placeholder="Describe symptoms, query paracetamol cost, generic equivalent rules..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isTyping}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 shadow-sm bg-white outline-none focus:border-[#2C8ED6] text-xs font-semibold disabled:opacity-60 transition-all"
                />
                
                <Button 
                  type="submit"
                  disabled={isTyping || !inputText.trim()}
                  className="py-4.5 px-5 bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6] border-0 hover:shadow-md hover:shadow-blue-500/10 text-white font-bold rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-50"
                >
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </form>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
