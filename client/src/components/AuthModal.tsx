import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, UserRole, PRESET_USERS } from "@/contexts/AuthContext";
import { User, Building2, Bike, ShieldCheck, ArrowRight, KeyRound } from "lucide-react";
import { toast } from "sonner";

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginAsRole, loginWithCustom, user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      toast.error("Please fill in your name and email");
      return;
    }
    loginWithCustom(customName, selectedRole, customEmail);
    toast.success(`Signed in as ${customName} (${selectedRole.toUpperCase()})`);
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Multi-Role Access Portal
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-600 text-xs">
            Sign in or switch roles to experience QuickMed as a Patient, Licensed Pharmacy Store, or Courier Rider.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedRole} onValueChange={(val) => setSelectedRole(val as UserRole)} className="w-full mt-4">
          <TabsList className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <TabsTrigger value="patient" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs py-2">
              <User className="w-3.5 h-3.5 mr-1.5" /> Patient
            </TabsTrigger>
            <TabsTrigger value="pharmacy" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs py-2">
              <Building2 className="w-3.5 h-3.5 mr-1.5" /> Pharmacy
            </TabsTrigger>
            <TabsTrigger value="rider" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs py-2">
              <Bike className="w-3.5 h-3.5 mr-1.5" /> Rider
            </TabsTrigger>
          </TabsList>

          {/* Quick Demo Switcher Card */}
          <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{PRESET_USERS[selectedRole].avatar}</span>
                <span className="font-bold text-slate-900 text-sm">{PRESET_USERS[selectedRole].name}</span>
                <Badge className="bg-emerald-600 text-white text-[10px] uppercase">{selectedRole}</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">{PRESET_USERS[selectedRole].badge} • {PRESET_USERS[selectedRole].location}</p>
            </div>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={() => {
                loginAsRole(selectedRole);
                toast.success(`Switched to ${selectedRole.toUpperCase()} mode!`);
              }}
            >
              1-Click Demo Login <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {/* Custom Credentials Form */}
          <form onSubmit={handleCustomLogin} className="mt-6 space-y-4 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Custom Account Credentials
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name / Store Title</label>
                <Input
                  placeholder={selectedRole === "pharmacy" ? "e.g. MedPlus Koramangala Hub" : "e.g. Dr. Alex Morgan"}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address or License ID</label>
                <Input
                  type="email"
                  placeholder="e.g. user@quickmed.in"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password / Security PIN</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold py-5 text-sm">
              Sign In as {selectedRole.toUpperCase()}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
