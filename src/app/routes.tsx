import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SOS from "./pages/SOS";
import SmartScan from "./pages/SmartScan";
import Hospitals from "./pages/Hospitals";
import Diagnostics from "./pages/Diagnostics";

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
    Component: SOS,
  },
  {
    path: "/scan",
    Component: SmartScan,
  },
  {
    path: "/hospitals",
    Component: Hospitals,
  },
  {
    path: "/diagnostics",
    Component: Diagnostics,
  },
]);
