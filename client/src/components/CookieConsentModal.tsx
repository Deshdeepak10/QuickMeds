import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Cookie, ShieldCheck, Check, Settings, X } from "lucide-react";
import { toast } from "sonner";

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "arogyaswift_cookie_preferences_v1";

export function CookieConsentModal() {
  const {
    isCookiePreferencesOpen,
    setIsCookiePreferencesOpen,
    openLegalPolicy
  } = useAuth();

  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
        setShowBanner(false);
      } else {
        // Show banner after brief delay
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    setPreferences(prefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
    setShowBanner(false);
    setIsCookiePreferencesOpen(false);
    toast.success("Cookie preferences saved successfully!");
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  return (
    <>
      {/* 1. BOTTOM FLOATING COOKIE BANNER (First-time visitors) */}
      {showBanner && !isCookiePreferencesOpen && (
        <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 animate-in slide-in-from-bottom duration-300">
          <div className="p-4 md:p-5 bg-slate-950/95 backdrop-blur-md text-white border border-slate-800 rounded-2xl shadow-2xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">We Value Your Health Data Privacy</h4>
                  <span className="text-[10px] text-slate-400">DPDP Act 2023 & DISHA Compliant</span>
                </div>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              We use essential cookies to maintain secure sessions, route prescription deliveries within our 3.5 km radius, and monitor real-time cold-chain temperature telemetry (2°C–8°C).
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <button
                onClick={() => openLegalPolicy("cookie")}
                className="text-[11px] text-emerald-400 hover:underline font-semibold"
              >
                Read Cookie Policy
              </button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCookiePreferencesOpen(true)}
                  className="h-8 text-xs border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                >
                  <Settings className="w-3.5 h-3.5 mr-1" /> Customize
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERACTIVE PREFERENCES CONFIGURATION MODAL */}
      <Dialog open={isCookiePreferencesOpen} onOpenChange={setIsCookiePreferencesOpen}>
        <DialogContent className="max-w-lg w-[95vw] p-0 overflow-hidden bg-white text-slate-900 border-slate-200 shadow-2xl">
          <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">
                  Cookie & Telemetry Preferences
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300">
                  Control how your session, telemetry, and analytics data are handled.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Essential */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Strictly Necessary & Security Cookies</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px]">
                  Always Active
                </Badge>
              </div>
              <p className="text-xs text-slate-600">
                Required for core website operations, authentication tokens, pharmacy prescription audit signatures, and CSRF protection. Cannot be turned off.
              </p>
            </div>

            {/* Functional */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Functional & Preference Cookies</span>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-600">
                Remembers your selected pharmacy store, saved delivery addresses, preferred language, and high-contrast accessibility mode.
              </p>
            </div>

            {/* Analytics & Cold Chain Telemetry */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Cold-Chain Telemetry & Analytics</span>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-600">
                Aggregates delivery speed performance, rider GPS routing accuracy, and cold-box temperature sensor metrics to detect logistics bottlenecks.
              </p>
            </div>

            {/* Personalized Refills */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Chronic Medication Refill Reminders</span>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-600">
                Calculates remaining dosage days for chronic medications (e.g. daily metformin or insulin) and sends timely refill reminders.
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRejectNonEssential}
              className="text-xs border-slate-300 text-slate-700 w-full sm:w-auto"
            >
              Reject Non-Essential
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Accept All
              </Button>
              <Button
                size="sm"
                onClick={() => savePreferences(preferences)}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Save Preferences
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
