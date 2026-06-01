import React from "react";
import { Link } from "react-router-dom";

export default function SOS() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-xl w-full p-8 rounded-lg shadow text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">SOS Activated</h1>
        <p className="mb-6">Emergency services have been notified. This is a demo placeholder.</p>
        <Link to="/" className="text-sm text-blue-600 underline">Return home</Link>
      </div>
    </div>
  );
}
