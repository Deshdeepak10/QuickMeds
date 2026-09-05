import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { OwnerSecurityAuthModal } from "./components/OwnerSecurityAuthModal";
import { PharmacyRegisterModal } from "./components/PharmacyRegisterModal";
import { PhoneSignupModal } from "./components/PhoneSignupModal";
import { CustomerSupportAgent } from "./components/CustomerSupportAgent";
import { LiveOrderDemoModal } from "./components/LiveOrderDemoModal";
import { LegalCenterModal } from "./components/LegalCenterModal";
import { CookieConsentModal } from "./components/CookieConsentModal";
import { EmailVerificationModal } from "./components/EmailVerificationModal";
import { PasswordResetModal } from "./components/PasswordResetModal";
import { OnboardingTourModal } from "./components/OnboardingTourModal";
import { AccountSettingsModal } from "./components/AccountSettingsModal";
import { HelpCenterModal } from "./components/HelpCenterModal";
import { ProtectedRoute } from "./components/ProtectedRoute";
import MedicineMVP from "./pages/MedicineMVP";
import LoginHome from "./pages/LoginHome";
import LegalPage from "./pages/LegalPage";
import HelpPage from "./pages/HelpPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginHome} />
      <Route path="/login" component={LoginHome} />
      <Route path="/legal" component={LegalPage} />
      <Route path="/legal/:policyId" component={LegalPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/faqs" component={HelpPage} />
      <Route path="/app">
        <ProtectedRoute component={MedicineMVP} />
      </Route>
      <Route path="/medicine-mvp">
        <ProtectedRoute component={MedicineMVP} />
      </Route>
      <Route path="/404" component={NotFound} />
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
            <OwnerSecurityAuthModal />
            <PharmacyRegisterModal />
            <PhoneSignupModal />
            <CustomerSupportAgent />
            <LiveOrderDemoModal />
            <LegalCenterModal />
            <CookieConsentModal />
            <EmailVerificationModal />
            <PasswordResetModal />
            <OnboardingTourModal />
            <AccountSettingsModal />
            <HelpCenterModal />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}


export default App;

