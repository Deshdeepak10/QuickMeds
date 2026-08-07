import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, UserRole, PRESET_USERS } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pill,
  User,
  Building2,
  Bike,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Thermometer,
  FileText,
  KeyRound,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function LoginHome() {
  const [, setLocation] = useLocation();
  const { loginAsRole, loginWithCustom, setIsPharmacyRegisterModalOpen } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRoleSelect = (role: UserRole) => {
    loginAsRole(role);
    toast.success(`Welcome back! Logged in as ${role.toUpperCase()}`);
    setLocation("/app");
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      toast.error("Please enter your name and email / license ID");
      return;
    }
    loginWithCustom(customName, selectedRole, customEmail);
    toast.success(`Signed in as ${customName} (${selectedRole.toUpperCase()})`);
    setLocation("/app");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/20">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                QuickMed <span className="text-emerald-600">Portal Access</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Licensed Hyperlocal Pharmacy Platform</p>
            </div>
          </div>

          <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 px-3 py-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Secure Multi-Role Portal
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 flex-1 flex items-center">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 px-3 py-1 text-xs uppercase font-bold tracking-wider">
              Select Login Role
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome to QuickMed <span className="text-emerald-600">Medicine Platform</span>
            </h2>
            <p className="text-base text-slate-600">
              Choose your role below to enter the live interactive portal tailored for Patients, Licensed Pharmacy Partners, or Express Delivery Riders.
            </p>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Card 1: Patient */}
            <Card className="bg-white border-slate-200 hover:border-emerald-500 transition-all shadow-md hover:shadow-xl rounded-2xl flex flex-col justify-between overflow-hidden group">
              <div className="p-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                  👩‍💼
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">Patient / Customer</h3>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">User Portal</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">For patients ordering prescription & healthcare products.</p>
                </div>

                <ul className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Upload & AI OCR scan prescriptions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Save costs with generic alternatives</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Live temperature tracking & OTP handover</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Daily dosage cabinet & reminders</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-3">
                  Demo User: <strong className="text-slate-900">{PRESET_USERS.patient.name}</strong> ({PRESET_USERS.patient.badge})
                </div>
                <Button
                  onClick={() => handleRoleSelect("patient")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 shadow-sm"
                >
                  Enter as Patient <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>

            {/* Card 2: Pharmacy Shop */}
            <Card className="bg-white border-slate-200 hover:border-emerald-500 transition-all shadow-md hover:shadow-xl rounded-2xl flex flex-col justify-between overflow-hidden group">
              <div className="p-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                  🏥
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">Pharmacy Shop</h3>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">Licensed Store</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">For pharmacists & retail store managers.</p>
                </div>

                <ul className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Audit incoming e-Prescriptions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Clinical drug interaction checks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Digital pharmacist approval stamp (#0x9F82)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Inventory stock matching & dispatch</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-2">
                <div className="text-xs text-slate-500 mb-2">
                  Demo Store: <strong className="text-slate-900">{PRESET_USERS.pharmacy.name}</strong>
                </div>
                <Button
                  onClick={() => handleRoleSelect("pharmacy")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 shadow-sm"
                >
                  Enter as Pharmacy Store <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPharmacyRegisterModalOpen(true)}
                  className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100 font-bold py-4 text-xs"
                >
                  + Register New Pharmacy Shop
                </Button>
              </div>
            </Card>

            {/* Card 3: Rider Courier */}
            <Card className="bg-white border-slate-200 hover:border-emerald-500 transition-all shadow-md hover:shadow-xl rounded-2xl flex flex-col justify-between overflow-hidden group">
              <div className="p-6 space-y-4">
                <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600 text-2xl group-hover:bg-cyan-600 group-hover:text-white transition-colors shadow-xs">
                  🏍️
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">Delivery Rider</h3>
                    <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 text-[10px]">Express Courier</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">For delivery partners handling cold-chain packages.</p>
                </div>

                <ul className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <span>Pharmacy hub pickup navigation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <span>Real-time 2°C–8°C cold-chain telemetry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <span>Route progress & distance updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <span>Secure 4-digit PIN delivery verification</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-3">
                  Demo Rider: <strong className="text-slate-900">{PRESET_USERS.rider.name}</strong> ({PRESET_USERS.rider.badge})
                </div>
                <Button
                  onClick={() => handleRoleSelect("rider")}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-5 shadow-sm"
                >
                  Enter as Rider Courier <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Custom Credentials Form Card */}
          <Card className="bg-white border-slate-200 max-w-xl mx-auto shadow-lg rounded-2xl p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" /> Account Sign In with Credentials
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Log in with your existing account email or registered store/rider ID.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("patient")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      selectedRole === "patient" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("pharmacy")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      selectedRole === "pharmacy" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Pharmacy
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("rider")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      selectedRole === "rider" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Rider
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name / Store Name</label>
                    <Input
                      placeholder="e.g. Sarah Chen"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Email / License ID</label>
                    <Input
                      type="email"
                      placeholder="e.g. sarah@example.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                  />
                </div>

                <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold py-5">
                  Sign In to {selectedRole.toUpperCase()} Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="container mx-auto px-4">
          QuickMed Licensed Medicine Delivery Platform • Compliant with Drugs and Cosmetics Act & Telemedicine Guidelines
        </div>
      </footer>
    </div>
  );
}
