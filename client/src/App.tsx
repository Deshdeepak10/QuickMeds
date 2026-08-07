import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { PharmacyRegisterModal } from "./components/PharmacyRegisterModal";
import { PhoneSignupModal } from "./components/PhoneSignupModal";
import MedicineDelivery from "./pages/MedicineDelivery";
import MedicineMVP from "./pages/MedicineMVP";
import LoginHome from "./pages/LoginHome";
import QuickLaunch from "./pages/QuickLaunch";
import Resources from "./pages/Resources";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={LoginHome} />
      <Route path={"/login"} component={LoginHome} />
      <Route path={"/app"} component={MedicineMVP} />
      <Route path={"/medicine-mvp"} component={MedicineMVP} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={LoginHome} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AuthModal />
            <PharmacyRegisterModal />
            <PhoneSignupModal />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
