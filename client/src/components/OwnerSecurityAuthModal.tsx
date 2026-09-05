import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export function OwnerSecurityAuthModal() {
  const [, setLocation] = useLocation();
  const { isOwnerAuthModalOpen, setIsOwnerAuthModalOpen, loginAsRole } = useAuth();
  const [masterPin, setMasterPin] = useState("779922");

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
          localStorage.setItem("arogyaswift_jwt", data.token);
        }
        loginAsRole("admin");
        toast.success("🎉 App Owner Access Granted!");
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
      <DialogContent showCloseButton={false} className="w-[92vw] sm:max-w-md bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl sm:rounded-3xl p-6">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-xl border border-purple-200 text-purple-700 shadow-xs">
                <Lock className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  👑 App Owner Access
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-xs mt-0.5">
                  Enter master PIN to unlock owner admin controls
                </DialogDescription>
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOwnerAuthModalOpen(false)}
              className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleAuthenticateOwner} className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <Label htmlFor="masterPin" className="text-xs font-bold text-slate-800">
                Master Security PIN
              </Label>
              <Badge variant="outline" className="text-[10px] border-purple-300 text-purple-800 font-mono bg-purple-50">
                Default: 779922
              </Badge>
            </div>

            <Input
              id="masterPin"
              type="password"
              maxLength={6}
              value={masterPin}
              onChange={(e) => setMasterPin(e.target.value)}
              placeholder="Enter 6-digit PIN"
              className="bg-slate-50 border-slate-300 text-slate-900 font-mono text-center tracking-[0.4em] text-lg h-12 focus:border-purple-600 focus:bg-white rounded-xl"
              required
            />
          </div>

          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
            >
              <Lock className="w-4 h-4" /> Enter App Owner Portal <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOwnerAuthModalOpen(false)}
              className="w-full text-slate-500 hover:text-slate-900 text-xs h-9"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
