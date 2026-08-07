import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Truck,
  Thermometer,
  Clock,
  Pill,
  FileText,
  Sparkles,
  ChevronRight,
  Search,
  Building2,
  UserCheck,
  Lock,
  PhoneCall,
  Check,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import RevenueCalculator from "@/components/RevenueCalculator";
import { useAuth } from "@/contexts/AuthContext";

interface PrescribedMed {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  price: number;
  genericPrice: number;
  requiresColdChain: boolean;
  isRxRequired: boolean;
  warnings?: string[];
}

const SAMPLE_RX_DATA: Record<string, { doctor: string; patient: string; meds: PrescribedMed[]; date: string }> = {
  diabetes: {
    doctor: "Dr. Sarah Jenkins, MD (Endocrinology - Reg #MD-99481)",
    patient: "Robert Chen (Age: 52)",
    date: "Today, 10:15 AM",
    meds: [
      {
        id: "m1",
        name: "Lantus SoloStar Insulin Injection",
        genericName: "Insulin Glargine 100 IU/ml",
        dosage: "10 Units at Bedtime",
        frequency: "Once Daily",
        quantity: 2,
        price: 950,
        genericPrice: 620,
        requiresColdChain: true,
        isRxRequired: true,
        warnings: ["Requires cold storage (2°C - 8°C)", "Do not freeze"]
      },
      {
        id: "m2",
        name: "Glycomet-SR 500mg",
        genericName: "Metformin Hydrochloride",
        dosage: "500mg after meal",
        frequency: "Twice Daily",
        quantity: 30,
        price: 120,
        genericPrice: 65,
        requiresColdChain: false,
        isRxRequired: true,
        warnings: ["Take with meals to reduce GI side effects"]
      }
    ]
  },
  infection: {
    doctor: "Dr. Rajesh Sharma, MBBS (General Physician - Reg #MC-44821)",
    patient: "Anita Verma (Age: 34)",
    date: "Today, 02:30 PM",
    meds: [
      {
        id: "m3",
        name: "Augmentin 625 Duo",
        genericName: "Amoxicillin + Clavulanic Acid 625mg",
        dosage: "1 Tablet every 12 hours",
        frequency: "Twice Daily for 5 days",
        quantity: 10,
        price: 210,
        genericPrice: 135,
        requiresColdChain: false,
        isRxRequired: true,
        warnings: ["Complete 5-day course full cycle", "Take with food"]
      },
      {
        id: "m4",
        name: "Dolo 650",
        genericName: "Paracetamol 650mg",
        dosage: "1 Tablet when needed for fever",
        frequency: "Max 3 times daily",
        quantity: 15,
        price: 35,
        genericPrice: 20,
        requiresColdChain: false,
        isRxRequired: false,
        warnings: ["Do not exceed 4000mg Paracetamol per day"]
      }
    ]
  }
};

const PHARMACIES = [
  {
    id: "p1",
    name: "Apollo Pharmacy - Express Hub (Indiranagar)",
    distance: "0.8 km",
    rating: "4.9 ★",
    coldChainReady: true,
    stockMatched: 100,
    etaMinutes: 18,
    pharmacistOnDuty: "Pharm. Priya Nair (Lic #KA-2021-00921)"
  },
  {
    id: "p2",
    name: "MedPlus Superstore (Koramangala)",
    distance: "1.6 km",
    rating: "4.7 ★",
    coldChainReady: true,
    stockMatched: 100,
    etaMinutes: 25,
    pharmacistOnDuty: "Pharm. Suresh Kumar (Lic #KA-2019-04120)"
  },
  {
    id: "p3",
    name: "Wellness Forever (HSR Layout)",
    distance: "2.4 km",
    rating: "4.8 ★",
    coldChainReady: false,
    stockMatched: 80,
    etaMinutes: 32,
    pharmacistOnDuty: "Pharm. Ananya Rao (Lic #KA-2022-08819)"
  }
];

export default function MedicineMVP() {
  const [, setLocation] = useLocation();
  const { user, setIsAuthModalOpen, registeredPharmacies, setIsPharmacyRegisterModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState("ocr");

  // Switch default tab based on logged in role
  useEffect(() => {
    if (user.role === "pharmacy") {
      setActiveTab("verification");
    } else if (user.role === "rider") {
      setActiveTab("delivery");
    } else {
      setActiveTab("ocr");
    }
  }, [user.role]);

  // Workflow State
  const [selectedPreset, setSelectedPreset] = useState<"diabetes" | "infection">("diabetes");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedData, setScannedData] = useState<typeof SAMPLE_RX_DATA.diabetes | null>(SAMPLE_RX_DATA.diabetes);
  
  // Generic substitution toggles
  const [useGenerics, setUseGenerics] = useState<Record<string, boolean>>({});

  // Pharmacist Verification State
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [pharmacistNote, setPharmacistNote] = useState("Prescription verified. Doctor registration valid. Cold chain items flagged for insulated packaging.");

  // Pharmacy Selection State
  const [selectedPharmacy, setSelectedPharmacy] = useState(PHARMACIES[0]);

  // Delivery Tracking State
  const [orderStage, setOrderStage] = useState<number>(1); // 1: Verified, 2: Packing, 3: Dispatch, 4: Out for Delivery, 5: Delivered
  const [riderProgress, setRiderProgress] = useState(25);
  const [coldTemp, setColdTemp] = useState(3.8); // Cold chain °C
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isDelivered, setIsDelivered] = useState(false);

  // Pill Reminder Checklist
  const [takenMeds, setTakenMeds] = useState<Record<string, boolean>>({});

  // Start OCR Animation when preset changes or manual trigger
  const runOcrScan = (presetKey: "diabetes" | "infection") => {
    setSelectedPreset(presetKey);
    setIsScanning(true);
    setScanProgress(10);
    setScannedData(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScannedData(SAMPLE_RX_DATA[presetKey]);
          toast.success("Prescription scanned & parsed successfully!");
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  // Simulate rider movement and temperature fluctuations
  useEffect(() => {
    if (orderStage === 3 || orderStage === 4) {
      const interval = setInterval(() => {
        setRiderProgress((prev) => (prev < 90 ? prev + 5 : prev));
        setColdTemp((prev) => +(3.6 + Math.random() * 0.8).toFixed(1));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [orderStage]);

  const toggleGeneric = (id: string) => {
    setUseGenerics((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.info("Updated item to generic alternative for cost savings");
  };

  const calculateSubtotal = () => {
    if (!scannedData) return 0;
    return scannedData.meds.reduce((acc, med) => {
      const price = useGenerics[med.id] ? med.genericPrice : med.price;
      return acc + price;
    }, 0);
  };

  const handleApprovePrescription = () => {
    setVerificationStatus("approved");
    toast.success("Pharmacist digital signature applied! Order unlocked for dispatch.");
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === "4829") {
      setIsDelivered(true);
      setOrderStage(5);
      setRiderProgress(100);
      toast.success("OTP verified! Package successfully handed over to patient.");
    } else {
      toast.error("Invalid OTP! Try entering 4829");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/20">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  QuickMed <span className="text-emerald-600">Medicine Delivery</span>
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">Licensed Hyperlocal Pharmacy Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Session Badge */}
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-base">{user.avatar}</span>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{user.name}</span>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">{user.role}</span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs px-3 py-1.5"
              onClick={() => setLocation("/")}
            >
              Portal Home
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs text-xs px-3 py-1.5"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Switch Role
            </Button>
          </div>
        </div>
      </header>

      {/* Role Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white py-2.5 px-4 text-xs font-medium border-b border-emerald-800">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{user.avatar}</span>
            <span>
              Logged in as <strong className="text-emerald-400 font-bold">{user.name}</strong> ({user.badge})
            </span>
          </div>
          {user.role === "pharmacy" && (
            <Badge className="bg-amber-400 text-slate-950 font-bold text-[10px] uppercase">
              Pharmacist Duty Active
            </Badge>
          )}
          {user.role === "rider" && (
            <Badge className="bg-cyan-400 text-slate-950 font-bold text-[10px] uppercase">
              Rider Dispatch Active
            </Badge>
          )}
          {user.role === "patient" && (
            <Badge className="bg-emerald-400 text-slate-950 font-bold text-[10px] uppercase">
              Patient Care Active
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 py-3 shadow-xs">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-xl grid grid-cols-2 md:grid-cols-6 gap-1">
              <TabsTrigger value="ocr" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs md:text-sm">
                1. Rx OCR & Parsing
              </TabsTrigger>
              <TabsTrigger value="verification" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs md:text-sm">
                2. Pharmacist Audit
              </TabsTrigger>
              <TabsTrigger value="dispatch" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs md:text-sm">
                3. Pharmacy Sourcing
              </TabsTrigger>
              <TabsTrigger value="delivery" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs md:text-sm">
                4. Cold-Chain Delivery
              </TabsTrigger>
              <TabsTrigger value="reminders" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs md:text-sm">
                5. Pill Vault & Safety
              </TabsTrigger>
              <TabsTrigger value="revenue" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs md:text-sm">
                6. Unit Economics
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT 1: RX OCR */}
            <TabsContent value="ocr" className="mt-8 space-y-6">
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Prescription Input Column */}
                <div className="lg:col-span-5 space-y-6">
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <Upload className="w-5 h-5" /> Select / Upload Prescription
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Simulate scanning a real medical prescription with our OCR engine.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => runOcrScan("diabetes")}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            selectedPreset === "diabetes"
                              ? "border-emerald-500 bg-emerald-50 text-slate-900 shadow-xs"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider block mb-1">Rx Sample 1</span>
                          <span className="font-semibold block text-sm">Insulin & Diabetes Care</span>
                          <span className="text-xs text-slate-500 mt-1 block">Cold-chain flagged</span>
                        </button>

                        <button
                          onClick={() => runOcrScan("infection")}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            selectedPreset === "infection"
                              ? "border-emerald-500 bg-emerald-50 text-slate-900 shadow-xs"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-xs text-cyan-700 font-bold uppercase tracking-wider block mb-1">Rx Sample 2</span>
                          <span className="font-semibold block text-sm">Antibiotic & Fever Course</span>
                          <span className="text-xs text-slate-500 mt-1 block">Regulated Dosage</span>
                        </button>
                      </div>

                      {/* Custom Upload Box */}
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-slate-50">
                        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-800">Drop prescription image or PDF here</p>
                        <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, PDF up to 10MB</p>
                        <Button size="sm" variant="outline" className="mt-4 border-slate-300 text-slate-700 hover:bg-slate-100">
                          Browse File
                        </Button>
                      </div>

                      {/* OCR Scanner Simulation View */}
                      {isScanning && (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-emerald-800 font-medium flex items-center gap-2">
                              <Sparkles className="w-4 h-4 animate-spin text-emerald-600" /> AI Optical Character Recognition...
                            </span>
                            <span className="font-mono text-emerald-700 font-bold">{scanProgress}%</span>
                          </div>
                          <Progress value={scanProgress} className="h-2 bg-emerald-200" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* OCR Output & Extracted Cart Column */}
                <div className="lg:col-span-7 space-y-6">
                  {scannedData ? (
                    <Card className="bg-white border-slate-200 text-slate-900 shadow-md">
                      <CardHeader className="border-b border-slate-100 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Extracted Prescription Metadata
                            </CardTitle>
                            <CardDescription className="text-slate-600 text-xs mt-1">
                              Parsed Doctor: <span className="text-slate-900 font-medium">{scannedData.doctor}</span>
                            </CardDescription>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            OCR Confidence: 99.4%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-6">
                        {/* Extracted Medicines List */}
                        <div className="space-y-4">
                          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500">Extracted Medications & Pricing</h4>
                          {scannedData.meds.map((med) => {
                            const isGeneric = useGenerics[med.id];
                            return (
                              <div key={med.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-bold text-slate-900 text-base">{med.name}</h5>
                                      {med.requiresColdChain && (
                                        <Badge variant="outline" className="border-cyan-300 text-cyan-800 bg-cyan-50 text-[10px]">
                                          <Thermometer className="w-3 h-3 mr-1 text-cyan-600" /> Cold Storage 2-8°C
                                        </Badge>
                                      )}
                                      {med.isRxRequired && (
                                        <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 text-[10px]">
                                          Rx Mandatory
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">Salt: {med.genericName}</p>
                                    <p className="text-xs text-emerald-700 mt-0.5 font-medium">Dosage: {med.dosage} ({med.frequency})</p>
                                  </div>

                                  <div className="text-right">
                                    <span className="text-lg font-bold text-slate-900 block">₹{isGeneric ? med.genericPrice : med.price}</span>
                                    <span className="text-xs text-slate-500">Qty: {med.quantity}</span>
                                  </div>
                                </div>

                                {med.warnings && (
                                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                                    <span>{med.warnings.join(" | ")}</span>
                                  </div>
                                )}

                                {/* Generic Switcher */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                                  <span className="text-slate-600">Save ₹{med.price - med.genericPrice} with Generic Equivalent</span>
                                  <Button
                                    size="sm"
                                    variant={isGeneric ? "default" : "outline"}
                                    onClick={() => toggleGeneric(med.id)}
                                    className={isGeneric ? "bg-emerald-600 text-white hover:bg-emerald-700 font-bold" : "border-slate-300 text-slate-700"}
                                  >
                                    {isGeneric ? "Using Generic ✓" : "Switch to Generic"}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Summary Footer */}
                        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-600 block">Est. Subtotal</span>
                            <span className="text-2xl font-bold text-emerald-700">₹{calculateSubtotal()}</span>
                          </div>
                          <Button
                            size="lg"
                            className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-md"
                            onClick={() => setActiveTab("verification")}
                          >
                            Proceed to Pharmacist Audit <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="h-64 border border-slate-200 rounded-xl bg-white flex items-center justify-center text-slate-500">
                      Select or scan a prescription to see parsed medications
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB CONTENT 2: PHARMACIST AUDIT PORTAL */}
            <TabsContent value="verification" className="mt-8 space-y-6">
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-emerald-600" /> Licensed Pharmacist Verification Portal
                          </CardTitle>
                          <CardDescription className="text-slate-600 text-xs mt-1">
                            Auditor: Pharm. Rajesh Menon (Registration #KA-2020-00812)
                          </CardDescription>
                        </div>
                        <Badge
                          className={
                            verificationStatus === "approved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }
                        >
                          Status: {verificationStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Safety Rule Checks */}
                      <div className="space-y-3">
                        <h4 className="text-xs uppercase font-bold text-slate-500">Automated Clinical Safety Audits</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-slate-700">Doctor Registration Verification</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Valid</span>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-slate-700">Drug-Drug Interaction Check</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Safe</span>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-slate-700">Maximum Daily Dosage Cap</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Within Limit</span>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-slate-700">Cold Chain Handling Required</span>
                            <span className="text-cyan-700 font-bold">Yes (Insulated Gel Pack)</span>
                          </div>
                        </div>
                      </div>

                      {/* Audit Comments Box */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">Pharmacist Inspection Note</label>
                        <Input
                          value={pharmacistNote}
                          onChange={(e) => setPharmacistNote(e.target.value)}
                          className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                        />
                      </div>

                      {/* Digital Seal */}
                      {verificationStatus === "approved" && (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold text-xl">
                            ✓
                          </div>
                          <div>
                            <h5 className="font-bold text-emerald-800 text-sm">Digitally Signed & Validated</h5>
                            <p className="text-xs text-slate-600">Audit Hash: #0x9F82A41B | Saved to immutable compliance audit log.</p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <Button
                          onClick={handleApprovePrescription}
                          className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 font-bold"
                        >
                          Approve & Sign Prescription
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setVerificationStatus("rejected");
                            toast.error("Prescription rejected by pharmacist.");
                          }}
                          className="border-slate-300 text-rose-600 hover:bg-rose-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-md">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-900">Verification Standard</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs text-slate-600">
                      <div className="flex gap-3">
                        <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>All Schedule H and H1 drugs require mandatory verification by a registered pharmacist under Drugs and Cosmetics Act.</span>
                      </div>
                      <div className="flex gap-3">
                        <PhoneCall className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                        <span>If dosing is ambiguous, the pharmacist initiates a direct call with the prescribing doctor prior to fulfillment.</span>
                      </div>
                    </CardContent>
                  </Card>

                  {verificationStatus === "approved" && (
                    <Button
                      size="lg"
                      className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-6 text-base shadow-md"
                      onClick={() => setActiveTab("dispatch")}
                    >
                      Select Dispatch Pharmacy <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB CONTENT 3: PARNER PHARMACY SOURCING */}
            <TabsContent value="dispatch" className="mt-8 space-y-6">
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-600" /> Hyperlocal Pharmacy Hub Dispatch Selection
                      </h3>
                      <p className="text-slate-600 text-xs">
                        The routing engine automatically checks inventory levels, cold storage compliance, and rider proximity.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsPharmacyRegisterModalOpen(true)}
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-xs"
                    >
                      + Register Pharmacy
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {registeredPharmacies.map((pharmacy) => {
                      const isSelected = selectedPharmacy.id === pharmacy.id;
                      return (
                        <div
                          key={pharmacy.id}
                          onClick={() => setSelectedPharmacy({
                            id: pharmacy.id,
                            name: pharmacy.shopName,
                            distance: pharmacy.distance,
                            rating: pharmacy.rating,
                            coldChainReady: pharmacy.coldChainReady,
                            stockMatched: pharmacy.stockMatched,
                            etaMinutes: pharmacy.etaMinutes,
                            pharmacistOnDuty: pharmacy.ownerName + ` (Lic #${pharmacy.licenseNo})`
                          })}
                          className={`p-5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 text-slate-900 shadow-md"
                              : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-base text-slate-900">{pharmacy.shopName}</h4>
                                <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-[10px]">
                                  {pharmacy.rating}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {pharmacy.distance} away • ETA ~{pharmacy.etaMinutes} mins
                              </p>
                              <p className="text-xs text-slate-500 mt-1">Pharmacist: {pharmacy.ownerName} (Lic #{pharmacy.licenseNo})</p>
                            </div>

                            <div className="text-right">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                                Stock Match: {pharmacy.stockMatched}%
                              </Badge>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-cyan-700 font-medium">
                              <Thermometer className="w-3.5 h-3.5" /> Cold Storage Packaging Ready
                            </span>
                            <Button size="sm" variant={isSelected ? "default" : "outline"} className={isSelected ? "bg-emerald-600 text-white font-bold" : "border-slate-300"}>
                              {isSelected ? "Selected Hub ✓" : "Select Hub"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary & Dispatch Action */}
                <div className="lg:col-span-5 space-y-6">
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-md">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-900">Dispatch Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs">
                      <div className="space-y-2 border-b border-slate-200 pb-3">
                        <div className="flex justify-between text-slate-600">
                          <span>Medicines Subtotal</span>
                          <span>₹{calculateSubtotal()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Insulated Cold-Pack Packaging</span>
                          <span className="text-emerald-600 font-bold">FREE</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Hyperlocal Express Courier</span>
                          <span>₹35</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-base font-bold text-slate-900 pt-1">
                        <span>Total Payable</span>
                        <span className="text-emerald-700">₹{calculateSubtotal() + 35}</span>
                      </div>

                      <Button
                        size="lg"
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-6 text-base mt-4 shadow-md"
                        onClick={() => {
                          setOrderStage(3);
                          setActiveTab("delivery");
                          toast.success("Order dispatched to " + selectedPharmacy.name);
                        }}
                      >
                        Confirm Order & Start Live Tracking <Truck className="w-5 h-5 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB CONTENT 4: COLD-CHAIN DELIVERY TRACKER */}
            <TabsContent value="delivery" className="mt-8 space-y-6">
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                  {/* Live Telemetry Card */}
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                          <Thermometer className="w-5 h-5 text-cyan-600 animate-pulse" /> Cold-Chain Telemetry Monitor
                        </CardTitle>
                        <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300">
                          LIVE Sensor Stream
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Insulated Box Temp</span>
                          <span className="text-4xl font-extrabold text-cyan-700 mt-1 block">{coldTemp} °C</span>
                          <span className="text-xs text-emerald-700 mt-1 block font-medium">Optimal Storage Zone (2°C - 8°C)</span>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-600">
                          <ShieldCheck className="w-8 h-8" />
                        </div>
                      </div>

                      {/* Map Visualizer Placeholder */}
                      <div className="h-64 bg-slate-100 border border-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center p-6 text-center">
                        <div className="relative z-10 space-y-3 max-w-sm">
                          <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <Truck className="w-6 h-6 animate-bounce" />
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">Rider Vikram S. is En Route</h4>
                          <p className="text-xs text-slate-600">Fulfillment Hub: {selectedPharmacy.name}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Distance Progress</span>
                              <span className="text-emerald-700 font-bold">{riderProgress}%</span>
                            </div>
                            <Progress value={riderProgress} className="h-2 bg-slate-200" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* OTP Verification & Order Status Stepper */}
                <div className="lg:col-span-5 space-y-6">
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-md">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-amber-600" /> Secure OTP Delivery Handshake
                      </CardTitle>
                      <CardDescription className="text-slate-600 text-xs">
                        Prescription orders require 4-digit PIN verification upon rider arrival.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center space-y-2">
                        <span className="text-xs text-amber-800 font-semibold block uppercase tracking-wider">Your Delivery OTP</span>
                        <span className="text-3xl font-mono font-extrabold text-amber-700 tracking-widest block">4829</span>
                        <p className="text-[11px] text-slate-500">Share this code only with your delivery agent</p>
                      </div>

                      {/* Simulate Handover */}
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-700">Simulate Rider Entry (Enter 4829)</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter 4-digit OTP"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                            maxLength={4}
                            className="bg-slate-50 border-slate-300 text-center font-mono text-lg text-slate-900"
                          />
                          <Button
                            onClick={handleVerifyOtp}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-6 shadow-sm"
                          >
                            Verify
                          </Button>
                        </div>
                      </div>

                      {isDelivered && (
                        <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-600" />
                          <span>Order successfully delivered & verified! Prescription safety record updated.</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB CONTENT 5: PILL REMINDERS & VAULT */}
            <TabsContent value="reminders" className="mt-8 space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="bg-white border-slate-200 text-slate-900 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" /> Digital Pill Cabinet & Daily Dosage Schedule
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-xs">
                      Automatically synced from your verified prescriptions to prevent missed doses.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {scannedData?.meds.map((med) => {
                      const isTaken = takenMeds[med.id];
                      return (
                        <div
                          key={med.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isTaken ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                              <Pill className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-base">{med.name}</h4>
                              <p className="text-xs text-slate-600">{med.dosage} • {med.frequency}</p>
                            </div>
                          </div>

                          <Button
                            onClick={() => {
                              setTakenMeds((prev) => ({ ...prev, [med.id]: !prev[med.id] }));
                              toast.success(isTaken ? "Marked as pending" : "Dose recorded as taken!");
                            }}
                            variant={isTaken ? "default" : "outline"}
                            className={isTaken ? "bg-emerald-600 text-white font-bold" : "border-slate-300 text-slate-700"}
                          >
                            {isTaken ? "Taken ✓" : "Mark Taken"}
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB CONTENT 6: UNIT ECONOMICS & REVENUE CALCULATOR */}
            <TabsContent value="revenue" className="mt-8 space-y-6">
              <RevenueCalculator darkTheme={false} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
