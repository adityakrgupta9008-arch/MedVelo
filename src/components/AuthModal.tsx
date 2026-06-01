import React, { useState } from "react";
import { useAuth } from "../app/utils/auth";
import { supabase } from "../supabase";
import { X, Mail, Lock, User, ShieldAlert, Sparkles, Loader2 } from "lucide-react";
import { Button } from "../app/components/ui/button";
import { toast } from "sonner";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, isMockMode } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !fullName)) {
      toast.error("Please fill in all active input fields.");
      return;
    }

    setIsSubmitting(true);

    if (isMockMode) {
      // 1. Sandboxed Auth Engine Fallback (Instant Browser Session Mock)
      setTimeout(() => {
        const mockUserId = `mock-usr-${Math.random().toString(36).substring(2, 9)}`;
        const mockSession = {
          user: {
            id: mockUserId,
            email: email,
            user_metadata: { full_name: isSignUp ? fullName : "Sandboxed Patient" }
          },
          access_token: "mock-jwt-web-token-12345"
        };
        
        // Write mock auth session
        localStorage.setItem("medvelo_mock_session", JSON.stringify(mockSession));
        
        // Write mock onboarding profile row
        const mockProfile = {
          id: mockUserId,
          full_name: isSignUp ? fullName : "Sandboxed Patient",
          onboarding_complete: false
        };
        localStorage.setItem(`medvelo_mock_profile_${mockUserId}`, JSON.stringify(mockProfile));

        toast.success(
          isSignUp 
            ? "Account created successfully (Sandbox Mode)!" 
            : "Welcome back! Logged in successfully (Sandbox Mode)!", 
          { icon: "🤖" }
        );
        
        setIsSubmitting(false);
        closeAuthModal();
        
        // Reload to sync state
        window.location.reload();
      }, 700);
      return;
    }

    // 2. Real Supabase Live Auth Integration
    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        
        if (error) throw error;
        
        toast.success("Account registered successfully! Welcome to MedVelo.", {
          description: data.session ? "Logged in." : "Please check your email to confirm registration."
        });
        
        if (data.session) {
          closeAuthModal();
        } else {
          setIsSignUp(false); // Move to login
        }
      } else {
        // Log In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        toast.success("Logged in successfully! Welcome back to MedVelo.", {
          icon: "🔐"
        });
        closeAuthModal();
      }
    } catch (err: any) {
      console.error("Authentication action failed:", err);
      toast.error(err.message || "Failed to authenticate. Please review credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white/95 border border-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top visual accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6]"></div>

        {/* Header control */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B5FA5] flex items-center justify-center font-black">
              M
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0F172A] tracking-tight">MedVelo Gateway</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {isMockMode ? "Sandbox Authentication Mode" : "Supabase Cloud Secure Gate"}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Main form body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Tab selector */}
          <div className="flex bg-slate-100 rounded-xl p-1 justify-between gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                !isSignUp
                  ? "bg-white text-[#0B5FA5] shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                isSignUp
                  ? "bg-white text-[#0B5FA5] shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="text-center px-4">
            <h4 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-1 justify-center">
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
              {isSignUp ? "Join MedVelo Network" : "Welcome Back"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {isSignUp 
                ? "Register a profile to unlock live diagnostics, medical folders, and generic scanner records."
                : "Sign in to access your active SOS ambulances, medical history folders, and physician appointments."}
            </p>
          </div>

          {/* Form inputs */}
          <div className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
                  <User className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="patient@medvelo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
                <Mail className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
                <Lock className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5.5 bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6] hover:shadow-lg hover:shadow-blue-500/10 text-white font-extrabold rounded-xl border-0 flex items-center justify-center gap-1.5 shrink-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                {isSignUp ? "Registering account..." : "Authenticating..."}
              </>
            ) : (
              isSignUp ? "Register & Onboard" : "Log In Securely"
            )}
          </Button>

          {isMockMode && (
            <div className="flex items-center justify-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] font-bold text-amber-700 leading-normal">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Simulated Sandboxed Credentials Active. Any email and password combination will grant instant login access.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
