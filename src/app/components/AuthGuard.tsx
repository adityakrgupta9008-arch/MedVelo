import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/auth";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#0B5FA5] animate-spin"></div>
          <span className="text-slate-500 font-semibold text-sm animate-pulse">
            Loading Secure Session...
          </span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
