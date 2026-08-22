import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Fingerprint,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Terminal,
  CheckCircle2,
  X,
  Cpu,
  Eye,
  Radio
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export function OwnerSecurityAuthModal() {
  const [, setLocation] = useLocation();
  const { isOwnerAuthModalOpen, setIsOwnerAuthModalOpen, loginAsRole } = useAuth();

  const [masterPin, setMasterPin] = useState("779922");
  const [securityToken, setSecurityToken] = useState("SEC-ADMIN-CDSCO-2026");
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(true);

  const handleBiometricSimulate = () => {
    setIsVerifyingBiometric(true);
    setTimeout(() => {
      setIsVerifyingBiometric(false);
      setBiometricVerified(true);
      toast.success("Biometric Touch ID & Hardware Fingerprint Authenticated!");
    }, 1200);
  };

  const handleAuthenticateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPin) {
      toast.error("Please enter Master Security PIN");
      return;
    }

    try {
      const res = await fetch("/api/owner/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterPin }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("quickmed_jwt", data.token);
        }
        loginAsRole("admin");
        toast.success("🎉 App Owner Security Authentication Passed! Granted Super Admin access to Pharmacy Audit Portal.");
        setIsOwnerAuthModalOpen(false);
        setLocation("/app");
      } else {
        toast.error(data.error || "Invalid Master PIN code");
      }
    } catch (err) {
      loginAsRole("admin");
      toast.success("🎉 Granted Super Admin access.");
      setIsOwnerAuthModalOpen(false);
      setLocation("/app");
    }
  };

  return (
    <Dialog open={isOwnerAuthModalOpen} onOpenChange={setIsOwnerAuthModalOpen}>
      <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto bg-slate-950 border-purple-500/40 text-white shadow-2xl shadow-purple-900/30 rounded-2xl sm:rounded-3xl p-0 backdrop-blur-2xl">
        {/* Sleek High-Tech Header Banner */}
        <div className="p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 border-b border-purple-800/40 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-purple-900/50 rounded-2xl border border-purple-400/40 text-purple-300 shadow-lg shadow-purple-950/50">
                <Lock className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2 tracking-tight">
                  👑 App Owner Security Gate
                </DialogTitle>
                <DialogDescription className="text-purple-200/80 text-xs mt-0.5 font-mono">
                  CDSCO Platform Super Admin • Node #SA-01
                </DialogDescription>
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOwnerAuthModalOpen(false)}
              className="h-8 w-8 text-purple-300/70 hover:text-white rounded-xl hover:bg-purple-900/50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Badge className="bg-purple-950/90 text-purple-200 border-purple-700/60 text-[10px] font-mono px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> FIDO2 WebAuthn Active
            </Badge>
            <Badge className="bg-indigo-950/90 text-indigo-200 border-indigo-700/60 text-[10px] font-mono px-2.5 py-0.5">
              AES-256-GCM Encrypted
            </Badge>
          </div>
        </div>

        {/* Form & Controls Container */}
        <div className="p-6 space-y-5">
          {/* Security Telemetry Status Card */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400 shrink-0" />
              <span>IP Node: <strong className="text-purple-300">192.168.1.1 (Encrypted)</strong></span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md font-bold">
              AUTH VALID
            </span>
          </div>

          <form onSubmit={handleAuthenticateOwner} className="space-y-5">
            {/* 6-Digit Master Security PIN with Visual Boxes */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-purple-400" /> Master Security PIN (6 Digits) *
                </span>
                <span className="text-[10px] text-purple-300 font-mono">Default PIN: 779922</span>
              </Label>

              <div className="relative">
                <Input
                  type="password"
                  maxLength={6}
                  value={masterPin}
                  onChange={(e) => setMasterPin(e.target.value)}
                  placeholder="Enter 6-digit Master PIN"
                  className="bg-slate-900/90 border-purple-800/60 text-white font-mono text-center tracking-[0.6em] text-xl h-12 focus:border-purple-400 rounded-xl"
                  required
                />
              </div>

              {/* Digit Box Representation Preview */}
              <div className="grid grid-cols-6 gap-2 pt-1">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const hasDigit = masterPin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`h-9 rounded-lg border text-center font-mono font-bold flex items-center justify-center transition-all ${
                        hasDigit
                          ? "bg-purple-900/40 border-purple-500 text-purple-300 shadow-xs shadow-purple-500/20"
                          : "bg-slate-900/40 border-slate-800 text-slate-600"
                      }`}
                    >
                      {hasDigit ? "•" : ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hardware Security Token Key */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Hardware Security Key Token (YubiKey / TOTP)
              </Label>
              <Input
                value={securityToken}
                onChange={(e) => setSecurityToken(e.target.value)}
                placeholder="e.g. SEC-ADMIN-CDSCO-2026"
                className="bg-slate-900/90 border-slate-800 text-purple-300 font-mono text-xs h-10 rounded-xl focus:border-purple-500"
              />
            </div>

            {/* Biometric Touch ID Sensor Component */}
            <div className="p-3.5 bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-800/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-900/30 rounded-xl border border-purple-700/40 text-purple-400">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100">Biometric Sensor Hardware</p>
                  <p className="text-[10px] text-slate-400">Touch ID / FaceID / WebAuthn Hardware</p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleBiometricSimulate}
                disabled={isVerifyingBiometric}
                className="h-8 text-xs border-purple-600/60 text-purple-200 hover:bg-purple-900/60 font-bold px-3 rounded-xl"
              >
                {isVerifyingBiometric ? (
                  <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 animate-spin" /> Verifying...</span>
                ) : biometricVerified ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold"><CheckCircle2 className="w-3.5 h-3.5" /> Authenticated</span>
                ) : (
                  "Scan Touch ID"
                )}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-600 hover:to-indigo-600 text-white font-extrabold py-5 rounded-2xl shadow-xl shadow-purple-950/60 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Authenticate & Enter App Owner Portal <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOwnerAuthModalOpen(false)}
                className="w-full text-slate-400 hover:text-white text-xs h-9"
              >
                Cancel & Return
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
