import React from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Get Started</h1>
        <p className="mb-6">Signup placeholder. Hook up your registration flow here.</p>
        <Link to="/" className="text-sm text-blue-600 underline">Return home</Link>
      </div>
    </div>
  );
}
