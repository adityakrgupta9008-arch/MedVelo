import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SOS from "./pages/SOS";
import SmartScan from "./pages/SmartScan";
import Hospitals from "./pages/Hospitals";
import Diagnostics from "./pages/Diagnostics";
import HospitalFinder from "./pages/HospitalFinder";
import DiagnosticsHub from "./pages/DiagnosticsHub";
import DigitalHealthVault from "./pages/DigitalHealthVault";
import AiHealthcareAssistant from "./pages/AiHealthcareAssistant";
import { AuthGuard } from "./components/AuthGuard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/sos",
    element: <AuthGuard><SOS /></AuthGuard>,
  },
  {
    path: "/scan",
    element: <AuthGuard><SmartScan /></AuthGuard>,
  },
  {
    path: "/hospitals",
    element: <AuthGuard><HospitalFinder /></AuthGuard>,
  },
  {
    path: "/diagnostics",
    element: <AuthGuard><Diagnostics /></AuthGuard>,
  },
  {
    path: "/hospitals-finder",
    element: <AuthGuard><HospitalFinder /></AuthGuard>,
  },
  {
    path: "/diagnostics-hub",
    element: <AuthGuard><DiagnosticsHub /></AuthGuard>,
  },
  {
    path: "/digital-vault",
    element: <AuthGuard><DigitalHealthVault /></AuthGuard>,
  },
  {
    path: "/records",
    element: <AuthGuard><DigitalHealthVault /></AuthGuard>,
  },
  {
    path: "/ai-assistant",
    element: <AuthGuard><AiHealthcareAssistant /></AuthGuard>,
  },
  {
    path: "/assistant",
    element: <AuthGuard><AiHealthcareAssistant /></AuthGuard>,
  },
]);
