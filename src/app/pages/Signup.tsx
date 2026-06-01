import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";
import { supabase } from "../../supabase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Mail, Lock, User, Sparkles, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const { isMockMode } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill in all inputs.");
      return;
    }
    setIsSubmitting(true);

    if (isMockMode) {
      // Sandboxed Signup
      setTimeout(() => {
        const mockUserId = `mock-usr-${Math.random().toString(36).substring(2, 9)}`;
        const mockSession = {
          user: {
            id: mockUserId,
            email: email,
            user_metadata: { full_name: fullName }
          },
          access_token: "mock-jwt-web-token-12345"
        };
        localStorage.setItem("medvelo_mock_session", JSON.stringify(mockSession));
        
        const mockProfile = {
          id: mockUserId,
          full_name: fullName,
          onboarding_complete: false
        };
        localStorage.setItem(`medvelo_mock_profile_${mockUserId}`, JSON.stringify(mockProfile));

        toast.success("Account created successfully (Sandbox Mode)!", { icon: "🤖" });
        setIsSubmitting(false);
        navigate("/");
        // Trigger page sync reload
        setTimeout(() => window.location.reload(), 100);
      }, 700);
      return;
    }

    // Real Supabase Cloud Signup
    try {
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
      
      toast.success("Account registered successfully!", {
        description: data.session ? "Logged in." : "Please check your inbox for an activation link."
      });
      
      if (data.session) {
        navigate("/");
      } else {
        navigate("/login"); // Send to login if confirmation needed
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to register.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 pt-20">
      <Card className="w-full max-w-md border border-slate-200 shadow-xl bg-white rounded-3xl overflow-hidden relative">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6]"></div>
        <CardHeader className="text-center pb-4 pt-6 bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-1.5 justify-center">
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
            Create Account
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Join MedVelo to secure emergency dispatches and checkup directories.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] transition-all"
                />
                <User className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="patient@medvelo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] transition-all"
                />
                <Mail className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#0B5FA5] transition-all"
                />
                <Lock className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5.5 bg-gradient-to-r from-[#0B5FA5] to-[#2C8ED6] text-white font-extrabold rounded-xl border-0 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" /> Creating account...
                </>
              ) : "Register & Onboard"}
            </Button>

            {isMockMode && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] font-bold text-amber-700 leading-normal">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-amber-600" />
                <span>Sandbox Mode: Any email and password will grant access.</span>
              </div>
            )}

            <div className="text-center text-xs mt-2 text-slate-400 font-semibold">
              Already have an account? <Link to="/login" className="text-[#0B5FA5] hover:underline">Log in</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
