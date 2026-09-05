import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Building2,
  Bike,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { PhoneSignupSchema, PharmacyRegisterSchema } from "@shared/schemas";

export function AuthModal() {
  const [, setLocation] = useLocation();
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalRole,
    loginAsRole,
    registerPharmacyStore,
    registerUserWithPhone,
    setIsEmailVerifyOpen,
    setIsPasswordResetOpen,
    openLegalPolicy
  } = useAuth();

  const activeRole = authModalRole || "patient";

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
    email: "vikram.rider@arogyaswift.in",
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
      email: pharmacyData.email,
      coldChainReady: pharmacyData.coldChainVerified
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
      coldChainReady: pharmacyData.coldChainVerified,
      verificationStatus: "approved"
    });

    toast.success(`Authenticated ${pharmacyData.shopName}! Pharmacist Portal Ready & CDSCO Approved.`);
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

  const getHeaderConfig = () => {
    switch (activeRole) {
      case "pharmacy":
        return {
          gradient: "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900",
          icon: <Building2 className="w-6 h-6" />,
          title: "ArogyaSwift Pharmacy Authentication",
          description: "Licensed Pharmacy Store Partner • Pharmacist Audit Portal",
          badge: "PHARMACY LOGIN"
        };
      case "rider":
        return {
          gradient: "bg-gradient-to-r from-cyan-700 via-teal-800 to-cyan-900",
          icon: <Bike className="w-6 h-6" />,
          title: "ArogyaSwift Rider Authentication",
          description: "Express Delivery Partner • Cold-Chain Courier Portal",
          badge: "RIDER LOGIN"
        };
      case "patient":
      default:
        return {
          gradient: "bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800",
          icon: <User className="w-6 h-6" />,
          title: "ArogyaSwift Patient Authentication",
          description: "Licensed Hyperlocal Medicine Platform • Patient Access",
          badge: "PATIENT LOGIN"
        };
    }
  };

  const header = getHeaderConfig();

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
      <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl sm:rounded-3xl p-0">
        {/* Modal Top Header */}
        <div className={`${header.gradient} p-4 sm:p-6 text-white`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white shrink-0">
                {header.icon}
              </div>
              <div>
                <DialogTitle className="text-base sm:text-xl font-extrabold text-white leading-tight">
                  {header.title}
                </DialogTitle>
                <DialogDescription className="text-white/90 text-[11px] sm:text-xs mt-0.5 font-medium">
                  {header.description}
                </DialogDescription>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 uppercase text-[10px] font-bold self-start sm:self-auto shrink-0">
              {header.badge}
            </Badge>
          </div>
        </div>

        {/* Modal Content for Selected Role */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {activeRole === "patient" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  className="border-emerald-400 text-emerald-800 hover:bg-emerald-100 font-bold text-xs whitespace-nowrap shrink-0 w-full sm:w-auto"
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
            </div>
          )}

          {/* ROLE 2: INDIVIDUAL PHARMACY SHOP LOGIN FORM */}
          {activeRole === "pharmacy" && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  className="border-amber-400 text-amber-900 hover:bg-amber-100 font-bold text-xs whitespace-nowrap shrink-0 w-full sm:w-auto"
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
                    className="w-4 h-4 text-emerald-600 rounded shrink-0"
                  />
                  <label htmlFor="coldChainCheck" className="text-slate-700 font-semibold cursor-pointer leading-tight">
                    Verify CDSCO Cold Storage Unit (2°C–8°C Insulated Storage Available)
                  </label>
                </div>

                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-5 rounded-2xl shadow-md text-sm">
                  Authenticate Pharmacy Store Partner <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </div>
          )}

          {/* ROLE 3: INDIVIDUAL RIDER COURIER LOGIN FORM */}
          {activeRole === "rider" && (
            <div className="space-y-4">
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  className="border-cyan-400 text-cyan-900 hover:bg-cyan-100 font-bold text-xs whitespace-nowrap shrink-0 w-full sm:w-auto"
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
            </div>
          )}

          {/* Customer Lifecycle Quick Actions & Legal Footer */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsPasswordResetOpen(true);
                }}
                className="text-slate-500 hover:text-emerald-700 font-medium hover:underline"
              >
                Forgot password? <strong>Reset</strong>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsEmailVerifyOpen(true);
                }}
                className="text-slate-500 hover:text-emerald-700 font-medium hover:underline"
              >
                Need to verify email? <strong>Enter Code</strong>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              By authenticating, you agree to the ArogyaSwift{" "}
              <button
                type="button"
                onClick={() => openLegalPolicy("terms")}
                className="text-emerald-700 hover:underline font-semibold"
              >
                Terms of Service
              </button>
              {", "}
              <button
                type="button"
                onClick={() => openLegalPolicy("privacy")}
                className="text-emerald-700 hover:underline font-semibold"
              >
                Privacy Policy
              </button>
              {", and "}
              <button
                type="button"
                onClick={() => openLegalPolicy("shipping")}
                className="text-emerald-700 hover:underline font-semibold"
              >
                Hyperlocal Shipping SLAs
              </button>
              .
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
