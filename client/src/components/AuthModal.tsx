import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole, PRESET_USERS } from "@/contexts/AuthContext";
import {
  User,
  Building2,
  Bike,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Smartphone,
  CheckCircle2,
  Lock,
  Thermometer,
  FileText,
  MapPin,
  Phone,
  Mail,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { AuthCustomLoginSchema, PhoneSignupSchema, PharmacyRegisterSchema } from "@shared/schemas";

export function AuthModal() {
  const [, setLocation] = useLocation();
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginAsRole,
    loginWithCustom,
    registerPharmacyStore,
    registerUserWithPhone
  } = useAuth();

  const [activeRole, setActiveRole] = useState<UserRole>("patient");

  // 1. Patient Login Form State
  const [patientData, setPatientData] = useState({
    name: "Sarah Chen",
    phone: "9876543210",
    email: "sarah.chen@example.com",
    address: "Shipra Sun City, Indirapuram, Ghaziabad",
    otp: "7392"
  });

  // 2. Pharmacy Login Form State
  const [pharmacyData, setPharmacyData] = useState({
    ownerName: "Pharm. Priya Nair",
    shopName: "Apollo Express Pharmacy (Raj Nagar, Ghaziabad)",
    licenseNo: "UP-2021-00921",
    category: "Cold-Chain Certified Retail",
    address: "Kavi Nagar Main Rd, Ghaziabad",
    phone: "9876511223",
    email: "hub.ghaziabad@apollopharmacy.in",
    password: "••••••••",
    coldChainVerified: true
  });

  // 3. Rider Login Form State
  const [riderData, setRiderData] = useState({
    name: "Vikram Singh",
    phone: "9876599887",
    email: "vikram.rider@quickmed.in",
    vehicleType: "EV Scooter (Cold Storage Box)",
    vehicleNo: "UP-14-EV-8821",
    location: "Ghaziabad Central Zone",
    passcode: "••••••••",
    equipmentVerified: true
  });

  // Handle Patient Sign In
  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = PhoneSignupSchema.safeParse({
      name: patientData.name,
      phone: patientData.phone,
      email: patientData.email,
      role: "patient",
      locationPin: patientData.address
    });

    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "Invalid Patient Details");
      return;
    }

    registerUserWithPhone({
      name: result.data.name,
      phone: result.data.phone,
      role: "patient",
      email: result.data.email,
      location: result.data.locationPin
    });

    toast.success(`Welcome ${patientData.name}! Signed in to Patient Account`);
    setIsAuthModalOpen(false);
    setLocation("/app");
  };

  // Handle Pharmacy Sign In & Authentication
  const handlePharmacySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = PharmacyRegisterSchema.safeParse({
      ownerName: pharmacyData.ownerName,
      shopName: pharmacyData.shopName,
      licenseNo: pharmacyData.licenseNo,
      category: pharmacyData.category,
      address: pharmacyData.address,
      phone: pharmacyData.phone,
      email: pharmacyData.email
    });

    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "Invalid Pharmacy Credentials");
      return;
    }

    registerPharmacyStore({
      ownerName: result.data.ownerName,
      shopName: result.data.shopName,
      licenseNo: result.data.licenseNo,
      category: result.data.category,
      address: result.data.address,
      phone: result.data.phone,
      email: result.data.email,
      coldChainReady: pharmacyData.coldChainVerified
    });

    toast.success(`Authenticated ${pharmacyData.shopName}! Pharmacist Portal Ready.`);
    setIsAuthModalOpen(false);
    setLocation("/app");
  };

  // Handle Rider Sign In
  const handleRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = PhoneSignupSchema.safeParse({
      name: riderData.name,
      phone: riderData.phone,
      email: riderData.email,
      role: "rider",
      vehicleType: riderData.vehicleType,
      locationPin: riderData.location
    });

    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "Invalid Rider Credentials");
      return;
    }

    registerUserWithPhone({
      name: result.data.name,
      phone: result.data.phone,
      role: "rider",
      email: result.data.email,
      vehicleType: result.data.vehicleType,
      location: result.data.locationPin
    });

    toast.success(`Rider Shift Started for ${riderData.name} (${riderData.vehicleNo})!`);
    setIsAuthModalOpen(false);
    setLocation("/app");
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
      <DialogContent className="sm:max-w-xl bg-white border-slate-200 text-slate-900 shadow-2xl rounded-3xl p-0 overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-white">
                  QuickMed Role Authentication
                </DialogTitle>
                <DialogDescription className="text-white/90 text-xs mt-0.5 font-medium">
                  Licensed Hyperlocal Medicine Platform • Ghaziabad Hub
                </DialogDescription>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 uppercase text-[10px] font-bold">
              {activeRole} Login
            </Badge>
          </div>
        </div>

        {/* Individual Role Login Tabs */}
        <div className="p-6 space-y-6">
          <Tabs value={activeRole} onValueChange={(val) => setActiveRole(val as UserRole)} className="w-full">
            <TabsList className="grid grid-cols-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <TabsTrigger
                value="patient"
                className="rounded-xl font-extrabold text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                <User className="w-4 h-4" /> Patient Login
              </TabsTrigger>
              <TabsTrigger
                value="pharmacy"
                className="rounded-xl font-extrabold text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-4 h-4" /> Pharmacy Login
              </TabsTrigger>
              <TabsTrigger
                value="rider"
                className="rounded-xl font-extrabold text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                <Bike className="w-4 h-4" /> Rider Login
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: INDIVIDUAL PATIENT LOGIN FORM */}
            <TabsContent value="patient" className="mt-6 space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-900 flex items-center gap-1.5">
                    👩‍💼 Patient / Healthcare Consumer Account
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">Order prescription medicines, upload Rx, and track live cold-chain delivery.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    loginAsRole("patient");
                    toast.success("Signed in with demo patient account!");
                    setIsAuthModalOpen(false);
                    setLocation("/app");
                  }}
                  className="border-emerald-400 text-emerald-800 hover:bg-emerald-100 font-bold text-xs whitespace-nowrap"
                >
                  Quick Demo Sign In
                </Button>
              </div>

              <form onSubmit={handlePatientSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Patient Full Name</Label>
                    <Input
                      value={patientData.name}
                      onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                      placeholder="e.g. Sarah Chen"
                      className="bg-slate-50 border-slate-300 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Mobile Phone Number (+91)</Label>
                    <Input
                      value={patientData.phone}
                      onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                      placeholder="10 digit mobile"
                      className="bg-slate-50 border-slate-300 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                    <Input
                      type="email"
                      value={patientData.email}
                      onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                      placeholder="patient@example.com"
                      className="bg-slate-50 border-slate-300 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Login Security OTP</Label>
                    <Input
                      value={patientData.otp}
                      onChange={(e) => setPatientData({ ...patientData, otp: e.target.value })}
                      placeholder="4-digit OTP"
                      className="bg-slate-50 border-slate-300 text-sm font-mono font-extrabold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Delivery Address in Ghaziabad</Label>
                  <Input
                    value={patientData.address}
                    onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                    placeholder="Sector, Colony, Ghaziabad"
                    className="bg-slate-50 border-slate-300 text-sm"
                  />
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-5 rounded-2xl shadow-md text-sm">
                  Sign In to Patient Portal <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </TabsContent>

            {/* TAB 2: INDIVIDUAL PHARMACY SHOP LOGIN & ONBOARDING FORM */}
            <TabsContent value="pharmacy" className="mt-6 space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-amber-900 flex items-center gap-1.5">
                    🏥 Licensed Pharmacy Store Partner
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">Audit e-Prescriptions, verify dosages, and dispatch cold-chain stock.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    loginAsRole("pharmacy");
                    toast.success("Signed in with demo pharmacy account!");
                    setIsAuthModalOpen(false);
                    setLocation("/app");
                  }}
                  className="border-amber-400 text-amber-900 hover:bg-amber-100 font-bold text-xs whitespace-nowrap"
                >
                  Quick Demo Sign In
                </Button>
              </div>

              <form onSubmit={handlePharmacySubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Pharmacist Owner Name</Label>
                    <Input
                      value={pharmacyData.ownerName}
                      onChange={(e) => setPharmacyData({ ...pharmacyData, ownerName: e.target.value })}
                      placeholder="e.g. Pharm. Priya Nair"
                      className="bg-slate-50 border-slate-300 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">CDSCO Drug License No.</Label>
                    <Input
                      value={pharmacyData.licenseNo}
                      onChange={(e) => setPharmacyData({ ...pharmacyData, licenseNo: e.target.value })}
                      placeholder="e.g. UP-2021-00921"
                      className="bg-slate-50 border-slate-300 text-sm font-mono font-bold text-amber-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Pharmacy Shop Title</Label>
                    <Input
                      value={pharmacyData.shopName}
                      onChange={(e) => setPharmacyData({ ...pharmacyData, shopName: e.target.value })}
                      placeholder="e.g. Apollo Pharmacy Ghaziabad"
                      className="bg-slate-50 border-slate-300 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Store Contact Phone</Label>
                    <Input
                      value={pharmacyData.phone}
                      onChange={(e) => setPharmacyData({ ...pharmacyData, phone: e.target.value })}
                      placeholder="10 digit phone"
                      className="bg-slate-50 border-slate-300 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Store Address in Ghaziabad</Label>
                  <Input
                    value={pharmacyData.address}
                    onChange={(e) => setPharmacyData({ ...pharmacyData, address: e.target.value })}
                    placeholder="Main Road, Raj Nagar / Kavi Nagar, Ghaziabad"
                    className="bg-slate-50 border-slate-300 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <input
                    type="checkbox"
                    id="coldChainCheck"
                    checked={pharmacyData.coldChainVerified}
                    onChange={(e) => setPharmacyData({ ...pharmacyData, coldChainVerified: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="coldChainCheck" className="text-slate-700 font-semibold cursor-pointer">
                    Verify CDSCO Cold Storage Unit (2°C–8°C Insulated Storage Available)
                  </label>
                </div>

                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-5 rounded-2xl shadow-md text-sm">
                  Authenticate Pharmacy Store Partner <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </TabsContent>

            {/* TAB 3: INDIVIDUAL RIDER COURIER LOGIN & ONBOARDING FORM */}
            <TabsContent value="rider" className="mt-6 space-y-4">
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-cyan-900 flex items-center gap-1.5">
                    🏍️ Express Delivery Rider Courier Partner
                  </h4>
                  <p className="text-xs text-cyan-700 mt-0.5">Pickup express orders, monitor cold-box temperature, and verify delivery OTP.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    loginAsRole("rider");
                    toast.success("Signed in with demo rider account!");
                    setIsAuthModalOpen(false);
                    setLocation("/app");
                  }}
                  className="border-cyan-400 text-cyan-900 hover:bg-cyan-100 font-bold text-xs whitespace-nowrap"
                >
                  Quick Demo Sign In
                </Button>
              </div>

              <form onSubmit={handleRiderSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Rider Full Name</Label>
                    <Input
                      value={riderData.name}
                      onChange={(e) => setRiderData({ ...riderData, name: e.target.value })}
                      placeholder="e.g. Vikram Singh"
                      className="bg-slate-50 border-slate-300 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Rider Mobile Phone</Label>
                    <Input
                      value={riderData.phone}
                      onChange={(e) => setRiderData({ ...riderData, phone: e.target.value })}
                      placeholder="10 digit phone"
                      className="bg-slate-50 border-slate-300 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Assigned Vehicle Type</Label>
                    <Input
                      value={riderData.vehicleType}
                      onChange={(e) => setRiderData({ ...riderData, vehicleType: e.target.value })}
                      placeholder="e.g. EV Scooter (Cold Storage Box)"
                      className="bg-slate-50 border-slate-300 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Vehicle Registration No.</Label>
                    <Input
                      value={riderData.vehicleNo}
                      onChange={(e) => setRiderData({ ...riderData, vehicleNo: e.target.value })}
                      placeholder="e.g. UP-14-EV-8821"
                      className="bg-slate-50 border-slate-300 text-sm font-mono font-bold text-cyan-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Assigned Ghaziabad Delivery Zone</Label>
                  <Input
                    value={riderData.location}
                    onChange={(e) => setRiderData({ ...riderData, location: e.target.value })}
                    placeholder="e.g. Indirapuram / Raj Nagar / Vaishali, Ghaziabad"
                    className="bg-slate-50 border-slate-300 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <input
                    type="checkbox"
                    id="equipmentCheck"
                    checked={riderData.equipmentVerified}
                    onChange={(e) => setRiderData({ ...riderData, equipmentVerified: e.target.checked })}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <label htmlFor="equipmentCheck" className="text-slate-700 font-semibold cursor-pointer">
                    Verify Insulated Smart Cold-Storage Box Equipped & Calibrated
                  </label>
                </div>

                <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold py-5 rounded-2xl shadow-md text-sm">
                  Start Rider Shift & Enter Courier Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
