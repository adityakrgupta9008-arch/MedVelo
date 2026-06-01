import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./utils/auth";
import { AuthModal } from "../components/AuthModal";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <AuthModal />
      <Toaster />
    </AuthProvider>
  );
}
