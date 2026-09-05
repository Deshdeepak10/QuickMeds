import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function EmailVerificationModal() {
  const { isEmailVerifyOpen, setIsEmailVerifyOpen, user } = useAuth();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(45);

  useEffect(() => {
    if (!isEmailVerifyOpen) {
      setCode("");
      setIsVerified(false);
      return;
    }
    setCountdown(45);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEmailVerifyOpen]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      toast.success("Email verified successfully! Your account is now fully verified.");
    }, 700);
  };

  const handleResend = () => {
    setCountdown(45);
    toast.info(`New 6-digit verification code sent to ${user?.email || "sarah.chen@example.com"}`);
  };

  return (
    <Dialog open={isEmailVerifyOpen} onOpenChange={setIsEmailVerifyOpen}>
      <DialogContent className="max-w-md w-[95vw] p-0 overflow-hidden bg-white text-slate-900 border-slate-200 shadow-2xl">
        <div className="p-6 bg-gradient-to-r from-slate-900 to-emerald-950 text-white text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-black text-white">
            Verify Your Email Address
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-300">
            We sent a secure 6-digit verification code to{" "}
            <strong className="text-emerald-300">{user?.email || "sarah.chen@example.com"}</strong>
          </DialogDescription>
        </div>

        <div className="p-6 space-y-5">
          {!isVerified ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1.5 text-center">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Enter 6-Digit Verification PIN
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="text-center font-mono text-2xl tracking-[0.5em] h-12 bg-slate-50 border-slate-300 font-black text-slate-900"
                  autoFocus
                />
              </div>

              {/* Demo Auto-Fill Shortcut */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500">Demo Code: <strong className="font-mono text-emerald-700">928415</strong></span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCode("928415")}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold h-7 px-2"
                >
                  Auto-Fill
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isVerifying || code.length < 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-xl shadow-md text-xs"
              >
                {isVerifying ? "Validating Token..." : "Verify & Activate Account"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="text-center pt-2">
                {countdown > 0 ? (
                  <span className="text-xs text-slate-400">
                    Resend code available in <strong className="text-slate-700 font-mono">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-xs text-emerald-600 hover:underline font-bold flex items-center gap-1 mx-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resend 6-Digit Code
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">Email Verified Successfully!</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                  Your identity has been authenticated. You can now place prescription orders with sub-15 min cold-chain dispatch.
                </p>
              </div>
              <Button
                onClick={() => setIsEmailVerifyOpen(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-4"
              >
                Continue to Platform
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
