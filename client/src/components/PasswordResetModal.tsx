import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { KeyRound, ArrowRight, Lock, CheckCircle2, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";

export function PasswordResetModal() {
  const { isPasswordResetOpen, setIsPasswordResetOpen, setIsAuthModalOpen } = useAuth();
  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [email, setEmail] = useState("sarah.chen@example.com");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid account email address");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("reset");
      toast.info(`Password reset token sent to ${email} (Demo token: 618294)`);
    }, 600);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit reset code");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
      toast.success("Password has been reset successfully!");
    }, 700);
  };

  const handleFinish = () => {
    setIsPasswordResetOpen(false);
    setStep("request");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setIsAuthModalOpen(true);
  };

  return (
    <Dialog open={isPasswordResetOpen} onOpenChange={setIsPasswordResetOpen}>
      <DialogContent className="max-w-md w-[95vw] p-0 overflow-hidden bg-white text-slate-900 border-slate-200 shadow-2xl">
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-black text-white">
            {step === "request" && "Forgot Password?"}
            {step === "reset" && "Set New Password"}
            {step === "success" && "Password Reset Complete"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-300">
            {step === "request" && "Enter your registered email to receive a secure recovery code."}
            {step === "reset" && "Enter the 6-digit code sent to your email and create a new password."}
            {step === "success" && "Your account password has been updated securely."}
          </DialogDescription>
        </div>

        <div className="p-6">
          {step === "request" && (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Account Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah.chen@example.com"
                    className="pl-9 bg-slate-50 border-slate-300 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-xl shadow-md text-xs"
              >
                {isLoading ? "Sending Recovery Code..." : "Send Password Reset Code"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordResetOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Remember your password? <strong>Sign In</strong>
                </button>
              </div>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700">6-Digit Reset Code</Label>
                  <button
                    type="button"
                    onClick={() => setResetCode("618294")}
                    className="text-[10px] text-emerald-600 font-bold hover:underline"
                  >
                    Auto-Fill Demo (618294)
                  </button>
                </div>
                <Input
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="618294"
                  maxLength={6}
                  className="text-center font-mono text-xl tracking-widest bg-slate-50 border-slate-300 text-slate-900 font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">New Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="pl-9 bg-slate-50 border-slate-300 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="pl-9 bg-slate-50 border-slate-300 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-xl shadow-md text-xs"
              >
                {isLoading ? "Updating Password..." : "Save & Update Password"}
              </Button>
            </form>
          )}

          {step === "success" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">Your Password Has Been Updated</h4>
                <p className="text-xs text-slate-600 mt-1">
                  You can now log in to your ArogyaSwift account using your new credentials.
                </p>
              </div>
              <Button
                onClick={handleFinish}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-4"
              >
                Return to Sign In
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
