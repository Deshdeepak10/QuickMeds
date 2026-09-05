import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Scan,
  Store,
  Bike,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Thermometer,
  KeyRound
} from "lucide-react";
import { useLocation } from "wouter";

interface TourStep {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  features: string[];
}

export function OnboardingTourModal() {
  const { isOnboardingOpen, setIsOnboardingOpen, setIsAuthModalOpen } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      title: "AI Prescription OCR Scanner",
      subtitle: "Instant Digitization of Doctor Handwriting",
      badge: "Step 1: Patient Ingestion",
      icon: Scan,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40",
      description:
        "Upload a photo or PDF of your doctor's prescription. Our AI Optical Character Recognition instantly extracts prescribed medicines, dosages, and automatically flags refrigerated items like insulin.",
      features: [
        "Instant medicine name & dosage extraction",
        "Automatic Schedule H/H1 regulatory classification",
        "Detects 2°C–8°C cold-chain requirements"
      ]
    },
    {
      title: "Licensed Pharmacy Clinical Audit",
      subtitle: "Verified by Registered Pharmacists",
      badge: "Step 2: Store Fulfillment",
      icon: Store,
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/40",
      description:
        "Your prescription is routed to the nearest licensed pharmacy hub within 3.5 km. A registered pharmacist verifies doctor credentials, checks drug-drug interactions, and packs medicines with tamper-evident seals.",
      features: [
        "Pharmacist digital signature on compliance ledger",
        "Eutectic gel pack packaging for cold storage",
        "Unique 4-digit Store Pickup OTP generation"
      ]
    },
    {
      title: "Sub-15 Minute Rapid EV Dispatch",
      subtitle: "Hyperlocal Insulated Logistics",
      badge: "Step 3: Courier Transit",
      icon: Bike,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/40",
      description:
        "Express EV couriers receive instant dispatch alerts. Equipped with calibrated smart cold-storage boxes, riders travel directly from store to your doorstep with live GPS telemetry.",
      features: [
        "10–15 minute average delivery timeframe",
        "Live temperature sensor readout (4.2°C logged)",
        "Real-time turn-by-turn map tracking"
      ]
    },
    {
      title: "Dual-OTP Custody Handshake",
      subtitle: "Zero Medicine Diversion or Tampering",
      badge: "Step 4: Doorstep Handover",
      icon: ShieldCheck,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/40",
      description:
        "Riders must verify the Store Pickup OTP (8514) to collect the order, and must enter your secret Doorstep Delivery PIN (4829) upon delivery to ensure only you receive your prescribed medication.",
      features: [
        "Store Pickup OTP eliminates courier confusion",
        "Doorstep PIN prevents unauthorized package handover",
        "Instant courier payout settlement upon delivery"
      ]
    }
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOnboardingOpen(false);
      setLocation("/app");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
      <DialogContent className="max-w-xl w-[95vw] p-0 overflow-hidden bg-white text-slate-900 border-slate-200 shadow-2xl">
        {/* Top Visual Hero Banner */}
        <div className="p-7 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-4">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
              {current.badge}
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              {currentStep + 1} of {steps.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${current.color} border flex items-center justify-center shrink-0 shadow-lg`}>
              <StepIcon className="w-7 h-7" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-white tracking-tight">
                {current.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-0.5">
                {current.subtitle}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {current.description}
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key System Safeguards</span>
            <ul className="space-y-1.5">
              {current.features.map((feat, idx) => (
                <li key={idx} className="text-xs text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stepper Dots & Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? "w-6 bg-emerald-600"
                      : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="text-xs border-slate-300 text-slate-700 h-9 px-3"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-9 px-4 shadow-md"
              >
                {currentStep === steps.length - 1 ? "Start Ordering Now" : "Next Step"}
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
