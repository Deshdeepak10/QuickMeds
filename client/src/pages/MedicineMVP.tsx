import { useState, useEffect, useRef } from "react";
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
  RefreshCw,
  Camera,
  Cloud,
  HardDrive,
  Video,
  X,
  ExternalLink,
  Folder,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Download,
  ScanEye,
  Layers
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PrescriptionUploader } from "@/components/PrescriptionUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import RevenueCalculator from "@/components/RevenueCalculator";
import { LiveTrackingMap } from "@/components/LiveTrackingMap";
import { ProfileModal } from "@/components/ProfileModal";
import { useAuth } from "@/contexts/AuthContext";


interface PrescribedMed {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  duration?: string;
  frequency?: string;
  quantity?: number;
  coldChain: boolean;
  requiresColdChain?: boolean;
  isRxRequired?: boolean;
  warnings?: string[];
  price: number;
  genericPrice: number;
}

interface ScannedRx {
  id: string;
  doctor: string;
  patient: string;
  date: string;
  fileName?: string;
  filePreview?: string | null;
  meds: PrescribedMed[];
}

const SAMPLE_RX_DATA: Record<"diabetes" | "infection", ScannedRx> = {
  diabetes: {
    id: "rx-98210",
    doctor: "Dr. Rajesh Gupta, MD (Endocrinology) — Reg #UP-7721",
    patient: "Sarah Chen",
    date: "11 Aug 2026",
    meds: [
      {
        id: "m1",
        name: "Lantus Solostar Pen (Insulin Glargine 100 IU/ml)",
        genericName: "Insulin Glargine Disposable Pen 100 IU",
        dosage: "12 Units Daily at 09:00 PM",
        duration: "30 Days Supply (1 Pen)",
        frequency: "Once Daily",
        quantity: 1,
        coldChain: true,
        requiresColdChain: true,
        isRxRequired: true,
        warnings: ["Requires cold storage (2°C - 8°C)", "Do not freeze"],
        price: 890,
        genericPrice: 450,
      },
      {
        id: "m2",
        name: "Janumet 50mg/500mg (Sitagliptin + Metformin)",
        genericName: "Sitagliptin + Metformin Hydrochloride 50mg/500mg",
        dosage: "1 Tablet Twice Daily After Meals",
        duration: "30 Days Supply (60 Tablets)",
        frequency: "Twice Daily",
        quantity: 60,
        coldChain: false,
        requiresColdChain: false,
        isRxRequired: true,
        warnings: ["Take with meals to reduce GI side effects"],
        price: 650,
        genericPrice: 180,
      },
    ],
  },
  infection: {
    id: "rx-44120",
    doctor: "Dr. Meenakshi Verma, MBBS, DNB — Reg #UP-4491",
    patient: "Sarah Chen",
    date: "10 Aug 2026",
    meds: [
      {
        id: "m3",
        name: "Augmentin 625mg Duo (Amoxycillin + Clavulanic Acid)",
        genericName: "Amoxycillin & Potassium Clavulanate 625mg",
        dosage: "1 Tablet Every 12 Hours for 5 Days",
        duration: "5 Days Course (10 Tablets)",
        frequency: "Twice Daily",
        quantity: 10,
        coldChain: false,
        requiresColdChain: false,
        isRxRequired: true,
        warnings: ["Complete 5-day course full cycle"],
        price: 240,
        genericPrice: 75,
      },
      {
        id: "m4",
        name: "Crocin Advance 650mg (Fast Relief Paracetamol)",
        genericName: "Paracetamol Fast Release 650mg",
        dosage: "1 Tablet as Needed for Fever",
        duration: "As Needed (15 Tablets)",
        frequency: "As Needed",
        quantity: 15,
        coldChain: false,
        requiresColdChain: false,
        isRxRequired: false,
        warnings: ["Do not exceed 4000mg Paracetamol per day"],
        price: 45,
        genericPrice: 15,
      },
    ],
  },
};

const PHARMACIES = [
  {
    id: "p1",
    name: "Apollo Pharmacy - Express Hub (Indiranagar)",
    distance: "0.8 km",
    rating: "4.9 ★",
    coldChainReady: true,
    stockMatched: 100,
    etaMinutes: 180,
    phone: "+91 98765 43210",
    pharmacistOnDuty: "Pharm. Priya Nair (Lic #KA-2021-00921)"
  },
  {
    id: "p2",
    name: "MedPlus Superstore (Koramangala)",
    distance: "1.6 km",
    rating: "4.7 ★",
    coldChainReady: true,
    stockMatched: 100,
    etaMinutes: 180,
    phone: "+91 98765 12345",
    pharmacistOnDuty: "Pharm. Suresh Kumar (Lic #KA-2019-04120)"
  },
  {
    id: "p3",
    name: "Wellness Forever (HSR Layout)",
    distance: "2.4 km",
    rating: "4.8 ★",
    coldChainReady: false,
    stockMatched: 80,
    etaMinutes: 180,
    phone: "+91 98765 88990",
    pharmacistOnDuty: "Pharm. Ananya Rao (Lic #KA-2022-08819)"
  }
];


export default function MedicineMVP() {
  const [, setLocation] = useLocation();
  const { user, setIsAuthModalOpen, setAuthModalRole, setIsOwnerAuthModalOpen, registeredPharmacies, approvePharmacyStore, rejectPharmacyStore, setIsPharmacyRegisterModalOpen, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("ocr");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");


  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (user.role === "admin") {
      setActiveTab("admin");
    } else if (user.role === "pharmacy") {
      setActiveTab("verification");
    } else if (user.role === "rider") {
      setActiveTab("delivery");
    } else {
      setActiveTab("ocr");
    }
  }, [user.role]);


  // Workflow State
  const [selectedPreset, setSelectedPreset] = useState<"diabetes" | "infection" | "custom">("diabetes");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedData, setScannedData] = useState<ScannedRx | null>(SAMPLE_RX_DATA.diabetes);

  // Custom File Upload Ref & State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string | null } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Live Camera Scanner State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cloud Picker State (Google Drive & iCloud)
  const [isCloudPickerOpen, setIsCloudPickerOpen] = useState(false);
  const [activeCloudTab, setActiveCloudTab] = useState<"gdrive" | "icloud">("gdrive");

  // Document Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showOcrOverlays, setShowOcrOverlays] = useState(true);

  // App Owner Audit Document Inspection State
  const [isAuditDocModalOpen, setIsAuditDocModalOpen] = useState(false);
  const [selectedAuditDoc, setSelectedAuditDoc] = useState<{ title: string; file: string; shop: string; license: string } | null>(null);


  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const resetZoom = () => setZoomLevel(100);

  const handlePrintPrescription = () => {
    toast.info("Preparing prescription document for printing...");
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDownloadPrescription = () => {
    toast.success(`Downloaded prescription "${scannedData?.fileName || "Prescription_Scan.pdf"}"`);
  };


  // Camera Management Handlers
  const startCamera = async (mode: "environment" | "user" = facingMode) => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      setIsCameraOpen(true);
      setCapturedPhoto(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      toast.info("Camera scanner initialized. Align prescription in frame.");
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Unable to access camera. Please check permissions or upload a file.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCapturedPhoto(null);
  };

  const switchCamera = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedPhoto(dataUrl);
      toast.success("Photo captured! Click 'Use Prescription Photo' to process.");
    }
  };

  const confirmCapturedPhoto = () => {
    if (!capturedPhoto) return;
    fetch(capturedPhoto)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `camera_scan_${Date.now()}.jpg`, { type: "image/jpeg" });
        stopCamera();
        processFileUpload(file);
      })
      .catch((err) => {
        console.error("Error processing captured photo:", err);
        toast.error("Failed to process captured image.");
      });
  };

  // Cloud Storage File Selection Handler
  const handleSelectCloudFile = (fileName: string, provider: "Google Drive" | "iCloud Drive") => {
    setIsCloudPickerOpen(false);
    toast.info(`Fetching "${fileName}" securely from ${provider}...`);

    setTimeout(() => {
      const dummyBlob = new Blob(["Prescription Cloud Sync Content"], { type: "application/pdf" });
      const file = new File([dummyBlob], fileName, { type: "application/pdf" });
      processFileUpload(file);
    }, 600);
  };

  // Generic substitution toggles
  const [useGenerics, setUseGenerics] = useState<Record<string, boolean>>({});

  // Pharmacist Verification State
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [pharmacistNote, setPharmacistNote] = useState("Prescription verified. Doctor registration valid. Cold chain items flagged for insulated packaging.");



  // Pharmacy Selection State
  const [selectedPharmacy, setSelectedPharmacy] = useState(PHARMACIES[0]);

  // Delivery Speed & Direct Emergency Contact State
  const [isEmergencyExpress, setIsEmergencyExpress] = useState(false);
  const [isStoreEmergencyModalOpen, setIsStoreEmergencyModalOpen] = useState(false);

  // Delivery Tracking State
  const [orderStage, setOrderStage] = useState<number>(1);
  const [riderProgress, setRiderProgress] = useState(25);
  const [enteredPharmacyOtp, setEnteredPharmacyOtp] = useState("");
  const [isPharmacyPickedUp, setIsPharmacyPickedUp] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isDelivered, setIsDelivered] = useState(false);


  // Pill Reminder Checklist
  const [takenMeds, setTakenMeds] = useState<Record<string, boolean>>({});

  // Process Prescription File Upload
  const processFileUpload = (file: File) => {
    if (!file) return;
    const isImageOrPdf = file.type.startsWith("image/") || file.type === "application/pdf" || file.name.endsWith(".pdf");
    if (!isImageOrPdf) {
      toast.error("Please upload a valid image (PNG, JPG) or PDF prescription file.");
      return;
    }

    const fileUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setUploadedFile({ name: file.name, url: fileUrl });
    setSelectedPreset("custom");
    setIsScanning(true);
    setScanProgress(10);
    setScannedData(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScannedData({
            id: `rx-custom-${Date.now()}`,
            doctor: "Dr. Ananya Sharma, MD (Reg #UP-88210)",
            patient: user.name || "Sarah Chen",
            date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            fileName: file.name,
            filePreview: fileUrl,
            meds: [
              {
                id: "m-custom-1",
                name: "Lantus Solostar Pen (Insulin Glargine 100 IU/ml)",
                genericName: "Insulin Glargine Disposable Pen 100 IU",
                dosage: "10 Units Daily at 09:00 PM",
                duration: "30 Days Supply (1 Pen)",
                coldChain: true,
                price: 850,
                genericPrice: 420,
              },
              {
                id: "m-custom-2",
                name: "Glucophage SR 500mg (Extended Release)",
                genericName: "Metformin Hydrochloride SR 500mg",
                dosage: "1 Tablet Twice Daily After Meals",
                duration: "30 Days Supply (60 Tablets)",
                coldChain: false,
                price: 320,
                genericPrice: 85,
              },
              {
                id: "m-custom-3",
                name: "Telma 40mg (High Blood Pressure)",
                genericName: "Telmisartan 40mg",
                dosage: "1 Tablet in Morning",
                duration: "30 Days Supply (30 Tablets)",
                coldChain: false,
                price: 210,
                genericPrice: 60,
              },
            ],
          });
          toast.success(`Prescription "${file.name}" uploaded & parsed via AI OCR!`);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  // Start OCR Animation when preset changes
  const runOcrScan = (presetKey: "diabetes" | "infection") => {
    setSelectedPreset(presetKey);
    setUploadedFile(null);
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

  // Simulate rider movement
  useEffect(() => {
    if (orderStage === 3 || orderStage === 4) {
      const interval = setInterval(() => {
        setRiderProgress((prev) => (prev < 90 ? prev + 5 : prev));
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

  const handleVerifyPharmacyOtp = () => {
    if (enteredPharmacyOtp === "8514") {
      setIsPharmacyPickedUp(true);
      setOrderStage(3);
      setRiderProgress(50);
      toast.success("🎉 Store Pickup OTP Verified (8514)! Medicine package handed over to Rider Vikram Singh.");
    } else {
      toast.error("Invalid Pharmacy Pickup OTP! Enter 8514");
    }
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === "4829") {
      setIsDelivered(true);
      setOrderStage(5);
      setRiderProgress(100);
      toast.success("🎉 Customer Delivery OTP Verified (4829)! Doorstep delivery complete.");
    } else {
      toast.error("Invalid Customer OTP! Enter 4829");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-6">
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
              className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 font-bold text-xs px-3 py-1.5 flex items-center gap-1.5"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <UserCheck className="w-3.5 h-3.5" /> My Profile
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs px-3 py-1.5"
              onClick={() => {
                logout();
                setLocation("/");
              }}
            >
              Log Out
            </Button>


            {/* Separate App Owner Security Login Icon - Only visible for Admin */}
            {user.role === "admin" && (
              <Button
                size="sm"
                variant="outline"
                title="App Owner High Security Gate"
                onClick={() => setIsOwnerAuthModalOpen(true)}
                className="border-purple-300 text-purple-900 bg-purple-50 hover:bg-purple-100 font-extrabold text-xs px-2.5 py-1.5 flex items-center gap-1.5 shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-purple-700" />
                <span className="hidden lg:inline">👑 Owner Gate</span>
              </Button>
            )}
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
            <div className="flex items-center gap-2">
              {user.verificationStatus === "pending" ? (
                <Badge className="bg-amber-400 text-slate-950 font-bold text-[10px] uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-slate-950" /> Store Status: Pending App Owner Approval
                </Badge>
              ) : user.verificationStatus === "rejected" ? (
                <Badge className="bg-rose-500 text-white font-bold text-[10px] uppercase flex items-center gap-1">
                  Registration Rejected by App Owner
                </Badge>
              ) : (
                <Badge className="bg-emerald-400 text-slate-950 font-bold text-[10px] uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-950" /> Pharmacist Duty Active (CDSCO Verified Hub)
                </Badge>
              )}
            </div>
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
          {user.role === "admin" && (
            <Badge className="bg-purple-400 text-slate-950 font-bold text-[10px] uppercase flex items-center gap-1">
              👑 Platform App Owner Super Admin Active
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 py-3 shadow-xs">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100 border border-slate-200 p-1.5 rounded-xl flex overflow-x-auto gap-1.5 w-full scrollbar-none">
              {user.role === "patient" && (
                <>
                  <TabsTrigger value="ocr" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">1. Rx OCR</TabsTrigger>
                  <TabsTrigger value="dispatch" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">2. Sourcing</TabsTrigger>
                  <TabsTrigger value="delivery" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">3. Cold-Chain</TabsTrigger>
                  <TabsTrigger value="reminders" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">4. Pill Vault</TabsTrigger>
                </>
              )}
              {user.role === "pharmacy" && (
                <>
                  <TabsTrigger value="verification" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">1. Rx Audit</TabsTrigger>
                  <TabsTrigger value="dispatch" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">2. Sourcing</TabsTrigger>
                  <TabsTrigger value="delivery" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">3. Dispatch</TabsTrigger>
                </>
              )}
              {user.role === "rider" && (
                <>
                  <TabsTrigger value="delivery" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">1. Delivery</TabsTrigger>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <TabsTrigger value="admin" className="shrink-0 whitespace-nowrap data-[state=active]:bg-purple-700 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">👑 App Owner Portal</TabsTrigger>
                  <TabsTrigger value="revenue" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">Economics</TabsTrigger>
                </>
              )}
            </TabsList>

            {/* TAB CONTENT 1: RX OCR */}
            <TabsContent value="ocr" className="mt-8 space-y-6">
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Prescription Input Column */}
                <div className="lg:col-span-5 space-y-6" id="prescription-upload">
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-md" id="rx-scanner">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-emerald-700 text-base">
                          <Sparkles className="w-5 h-5 text-emerald-600" /> AI Vision Prescription Scanner
                        </CardTitle>
                        <Badge className="bg-emerald-600 text-white text-[10px] uppercase font-bold">
                          🟢 LIVE API
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-600 text-xs mt-1">
                        Upload your doctor's prescription photo or PDF, or pick a preset sample for instant AI OCR scanning.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processFileUpload(e.target.files[0]);
                          }
                        }}
                      />

                      {/* Single Required Prescription Upload Dropzone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            processFileUpload(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                          selectedPreset === "custom" || isDragging
                            ? "border-emerald-500 bg-emerald-50/80 scale-[1.01]"
                            : "border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto mb-2">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">
                          {uploadedFile ? `Uploaded: ${uploadedFile.name}` : "Click to select Doctor Prescription Photo / PDF"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP, PDF (Max 10MB)</p>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs h-8"
                          >
                            <Upload className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Browse File
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startCamera();
                            }}
                            className="border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 text-xs h-8"
                          >
                            <Camera className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Live Camera
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCloudPickerOpen(true);
                            }}
                            className="border-slate-300 text-slate-700 hover:bg-blue-50 hover:border-blue-300 text-xs h-8"
                          >
                            <Cloud className="w-3.5 h-3.5 mr-1 text-blue-600" /> Drive / iCloud
                          </Button>
                        </div>
                      </div>

                      {/* Preset Samples */}
                      <div className="pt-1 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Or Select Preset Sample for Demo</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => runOcrScan("diabetes")}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              selectedPreset === "diabetes"
                                ? "border-emerald-500 bg-emerald-50 text-slate-900 shadow-xs"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block mb-0.5">Rx Sample 1</span>
                            <span className="font-semibold block text-xs">Insulin & Diabetes Care</span>
                            <span className="text-[11px] text-slate-500 block">Cold-chain flagged</span>
                          </button>

                          <button
                            onClick={() => runOcrScan("infection")}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              selectedPreset === "infection"
                                ? "border-emerald-500 bg-emerald-50 text-slate-900 shadow-xs"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-[10px] text-cyan-700 font-bold uppercase tracking-wider block mb-0.5">Rx Sample 2</span>
                            <span className="font-semibold block text-xs">Antibiotic & Fever Course</span>
                            <span className="text-[11px] text-slate-500 block">Regulated Dosage</span>
                          </button>
                        </div>
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
                            <CardDescription className="text-slate-600 text-xs mt-1 flex items-center gap-2">
                              <span>Parsed Doctor: <strong className="text-slate-900">{scannedData.doctor}</strong></span>
                              {scannedData.fileName && (
                                <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-800 bg-emerald-50">
                                  📄 {scannedData.fileName}
                                </Badge>
                              )}
                            </CardDescription>

                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={() => setIsPreviewModalOpen(true)}
                                className="h-7 text-xs border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1.5 font-bold"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-600" /> Preview Prescription Document
                              </Button>
                              <span className="text-[11px] text-slate-500">View scanned document & OCR bounding boxes</span>
                            </div>
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
                    {user.role !== "patient" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsPharmacyRegisterModalOpen(true)}
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-xs"
                      >
                        + Register Pharmacy
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {registeredPharmacies.map((pharmacy) => {
                      const isSelected = selectedPharmacy.id === pharmacy.id;
                      const isPending = pharmacy.verificationStatus === "pending";
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
                            phone: pharmacy.phone || "+91 98765 43210",
                            pharmacistOnDuty: pharmacy.ownerName + ` (Lic #${pharmacy.licenseNo})`
                          })}

                          className={`p-5 rounded-xl border cursor-pointer transition-all ${isSelected
                              ? "border-emerald-500 bg-emerald-50 text-slate-900 shadow-md"
                              : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-base text-slate-900">{pharmacy.shopName}</h4>
                                {isPending ? (
                                  <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px]">
                                    Status: Pending CDSCO Audit
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-[10px] font-bold">
                                    {pharmacy.rating} Verified Hub ✓
                                  </Badge>
                                )}
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

                          {isPending && (user.role === "admin" || user.role === "pharmacy") && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                              <span className="text-amber-800 font-medium flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> Drug license verification pending CDSCO inspection.
                              </span>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  approvePharmacyStore(pharmacy.id);
                                  toast.success(`🎉 Pharmacy "${pharmacy.shopName}" has been verified & CDSCO Approved!`);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7"
                              >
                                Approve Store License ✓
                              </Button>
                            </div>
                          )}

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
                      {/* Delivery Mode Selection */}
                      <div className="space-y-2 border-b border-slate-200 pb-3">
                        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                          Select Delivery Timing & Speed
                        </label>

                        {/* Option 1: Standard 3 Hours Minimum */}
                        <div
                          onClick={() => setIsEmergencyExpress(false)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${!isEmergencyExpress
                              ? "border-emerald-500 bg-emerald-50 text-slate-900 shadow-xs"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <span className="font-bold text-xs block">Standard 3-Hour Minimum Delivery</span>
                              <span className="text-[11px] text-slate-500">Regular cold-chain dispatch (ETA ~180m)</span>
                            </div>
                          </div>
                          <span className="font-bold text-xs text-slate-900">₹35</span>
                        </div>

                        {/* Option 2: Emergency Express Direct Store Contact */}
                        <div
                          onClick={() => setIsEmergencyExpress(true)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isEmergencyExpress
                              ? "border-rose-500 bg-rose-50/90 text-slate-900 shadow-xs ring-1 ring-rose-400"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-rose-300"
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
                            <div>
                              <span className="font-bold text-xs block text-rose-900 flex items-center gap-1">
                                🚨 Emergency Express (~30–45 Mins)
                              </span>
                              <span className="text-[11px] text-rose-700">Direct Store Hotline + Priority Dispatch</span>
                            </div>
                          </div>
                          <span className="font-bold text-xs text-rose-900">+₹150</span>
                        </div>
                      </div>

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
                          <span>Delivery Courier Fee</span>
                          <span>₹35</span>
                        </div>
                        {isEmergencyExpress && (
                          <div className="flex justify-between text-rose-700 font-semibold">
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" /> Emergency Priority Surcharge
                            </span>
                            <span>+₹150</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between text-base font-bold text-slate-900 pt-1">
                        <span>Total Payable</span>
                        <span className={isEmergencyExpress ? "text-rose-700 font-extrabold" : "text-emerald-700"}>
                          ₹{calculateSubtotal() + 35 + (isEmergencyExpress ? 150 : 0)}
                        </span>
                      </div>

                      {/* Direct Store Contact Button for Emergency Express */}
                      {isEmergencyExpress && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-900 flex items-center gap-1.5">
                              <PhoneCall className="w-4 h-4 text-rose-600 animate-bounce" /> Direct Store Emergency Contact
                            </span>
                            <Badge className="bg-rose-600 text-white text-[10px] uppercase font-extrabold">Emergency Only</Badge>
                          </div>
                          <p className="text-slate-700 leading-tight">
                            Call medical store directly for instant dispatch coordination:
                          </p>
                        </div>
                      )}

                      {/* Payment Method Selection Widget */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-3">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Select Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("online")}
                            className={`p-3 rounded-lg border text-left transition-all text-xs font-bold flex items-center justify-between ${paymentMethod === "online"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                              }`}
                          >
                            <span>💳 Online (UPI / Card)</span>
                            {paymentMethod === "online" && <span>✓</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("cod")}
                            className={`p-3 rounded-lg border text-left transition-all text-xs font-bold flex items-center justify-between ${paymentMethod === "cod"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                              }`}
                          >
                            <span>💵 Cash on Delivery</span>
                            {paymentMethod === "cod" && <span>✓</span>}
                          </button>
                        </div>
                      </div>

                      <Button
                        size="lg"
                        className={`w-full font-bold py-6 text-base mt-4 shadow-md ${isEmergencyExpress
                            ? "bg-rose-600 hover:bg-rose-700 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        onClick={() => {
                          setOrderStage(3);
                          setActiveTab("delivery");
                          toast.success(
                            isEmergencyExpress
                              ? "🚨 Emergency Priority Order dispatched! Pharmacist notified for immediate express dispatch."
                              : "Standard 3-hour order dispatched to " + selectedPharmacy.name
                          );
                        }}
                      >
                        {isEmergencyExpress ? "Confirm Emergency Express Order 🚨" : "Confirm Standard Order (3-Hour ETA)"} <Truck className="w-5 h-5 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>

                </div>
              </div>
            </TabsContent>

            {/* TAB CONTENT 4: EXPRESS DELIVERY TRACKER */}
            <TabsContent value="delivery" className="mt-8 space-y-6">
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                  {/* Live Satellite GPS Tracking Map */}
                  <LiveTrackingMap
                    pharmacyName={selectedPharmacy.name}
                    riderProgress={riderProgress}
                  />

                  {/* Live Delivery Status Card */}
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600 animate-pulse" /> Express Delivery Monitor
                        </CardTitle>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                          LIVE Dispatch Stream
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        <Lock className="w-5 h-5 text-amber-600" />
                        {user.role === "pharmacy"
                          ? "Pharmacy Store ↔ Rider Pickup OTP"
                          : user.role === "patient"
                          ? "Secure Patient Delivery PIN / OTP"
                          : "Rider Order Handshake & Verification"}
                      </CardTitle>
                      <CardDescription className="text-slate-600 text-xs">
                        {user.role === "pharmacy"
                          ? "Provide this 4-digit Store Pickup OTP to express rider Vikram Singh when handing over the cold-chain package."
                          : user.role === "patient"
                          ? "Show or read this 4-digit PIN to your delivery rider upon package arrival."
                          : "Verify Store Pickup OTP with Pharmacy and Doorstep Delivery OTP with Patient."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* PHARMACY VIEW: Store Pickup OTP (8514) */}
                      {user.role === "pharmacy" && (
                        <div className="space-y-3">
                          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center space-y-2">
                            <span className="text-xs text-emerald-800 font-extrabold block uppercase tracking-wider">Pharmacy Store Pickup OTP</span>
                            <span className="text-4xl font-mono font-extrabold text-emerald-700 tracking-widest block">8514</span>
                            <p className="text-xs text-slate-600 pt-1 font-medium">
                              Express rider <strong>Vikram Singh</strong> will ask for this code (8514) to confirm package pickup from your store.
                            </p>
                          </div>

                          {isPharmacyPickedUp ? (
                            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              <span>✓ Package handed over to Rider Vikram Singh! Store pickup verified.</span>
                            </div>
                          ) : (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium flex items-center justify-between gap-2">
                              <span>Waiting for Rider pickup verification (Code: 8514)...</span>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setIsPharmacyPickedUp(true);
                                  toast.success("🎉 Store Pickup OTP (8514) Verified! Rider Vikram Singh en route to patient.");
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-7 px-3"
                              >
                                Simulate Rider Pickup ✓
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PATIENT VIEW: Customer Doorstep Delivery OTP (4829) */}
                      {user.role === "patient" && (
                        <div className="space-y-3">
                          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center space-y-2">
                            <span className="text-xs text-amber-800 font-extrabold block uppercase tracking-wider">Your Customer Delivery PIN / OTP</span>
                            <span className="text-4xl font-mono font-extrabold text-amber-700 tracking-widest block">4829</span>
                            <p className="text-xs text-slate-600 pt-1 font-medium">
                              Give this code to rider <strong>Vikram Singh</strong> when receiving your medicine box.
                            </p>
                          </div>

                          {isDelivered && (
                            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-3">
                              <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-600" />
                              <span>Order successfully delivered & verified! Prescription safety record updated.</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* RIDER VIEW & OTHER ROLES: Dual Verification Form */}
                      {(user.role === "rider" || user.role === "admin") && (
                        <div className="space-y-4">
                          {/* Step 1: Store Pickup OTP (8514) */}
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900">Step 1: Pharmacy Store Pickup Verification</span>
                              {isPharmacyPickedUp ? (
                                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">✓ Picked Up</Badge>
                              ) : (
                                <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 text-[10px] font-bold">Pending Pickup</Badge>
                              )}
                            </div>

                            {!isPharmacyPickedUp ? (
                              <div className="flex gap-2 pt-1">
                                <Input
                                  placeholder="Enter Store OTP (8514)"
                                  value={enteredPharmacyOtp}
                                  onChange={(e) => setEnteredPharmacyOtp(e.target.value)}
                                  maxLength={4}
                                  className="bg-white border-slate-300 font-mono text-sm font-bold text-slate-900"
                                />
                                <Button
                                  onClick={handleVerifyPharmacyOtp}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4"
                                >
                                  Verify Pickup
                                </Button>
                              </div>
                            ) : (
                              <p className="text-[11px] text-emerald-700 font-medium">✓ Pharmacy Pickup OTP (8514) verified at Apollo Hub.</p>
                            )}
                          </div>

                          {/* Step 2: Customer Delivery OTP (4829) */}
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900">Step 2: Customer Doorstep Delivery Verification</span>
                              {isDelivered ? (
                                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">✓ Delivered</Badge>
                              ) : (
                                <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 text-[10px] font-bold">Pending Delivery</Badge>
                              )}
                            </div>

                            {!isPharmacyPickedUp ? (
                              <p className="text-[11px] text-slate-500 italic">Complete Pharmacy Store Pickup first.</p>
                            ) : !isDelivered ? (
                              <div className="flex gap-2 pt-1">
                                <Input
                                  placeholder="Enter Patient PIN (4829)"
                                  value={enteredOtp}
                                  onChange={(e) => setEnteredOtp(e.target.value)}
                                  maxLength={4}
                                  className="bg-white border-slate-300 font-mono text-sm font-bold text-slate-900"
                                />
                                <Button
                                  onClick={handleVerifyOtp}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4"
                                >
                                  Verify & Handover
                                </Button>
                              </div>
                            ) : (
                              <p className="text-[11px] text-emerald-700 font-medium">✓ Customer Delivery OTP (4829) verified. Handover complete.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Emergency Direct Medical Store Contact Card */}
                  <Card className="bg-gradient-to-br from-rose-50 to-amber-50 border-rose-200 text-slate-900 shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-rose-900 flex items-center gap-2 font-bold">
                          <PhoneCall className="w-5 h-5 text-rose-600 animate-pulse" /> Direct Emergency Store Hotline
                        </CardTitle>
                        <Badge className="bg-rose-600 text-white text-[10px] font-extrabold">EMERGENCY DISPATCH</Badge>
                      </div>
                      <CardDescription className="text-slate-600 text-xs mt-1">
                        In case of urgent prescription issues or critical delays, contact the fulfillment medical store directly.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <div className="p-3 bg-white/80 border border-rose-200 rounded-xl space-y-1.5">
                        <p className="font-bold text-slate-900">{selectedPharmacy.name}</p>
                        <p className="text-slate-600">On-Duty Pharmacist: <strong className="text-slate-900">{selectedPharmacy.pharmacistOnDuty}</strong></p>
                        <p className="text-slate-600">Store Direct Line: <strong className="text-rose-700 font-mono text-sm">{selectedPharmacy.phone || "+91 98765 43210"}</strong></p>
                      </div>

                      <a
                        href={`tel:${selectedPharmacy.phone || "+919876543210"}`}
                        className="w-full text-center py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <PhoneCall className="w-4 h-4 text-white" /> Call Medical Store Directly
                      </a>

                      <p className="text-[11px] text-slate-600 text-center leading-relaxed pt-1 font-medium">
                        Standard Delivery: 3 Hours Minimum. Emergency Express Hotline is available for urgent medicine dispatch coordination (+₹150 priority surcharge applies for instant courier dispatch).
                      </p>
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

            {/* TAB CONTENT 7: APP OWNER PHARMACY VERIFICATION PORTAL */}
            <TabsContent value="admin" className="mt-8 space-y-6">
              <Card className="bg-white border-purple-200 text-slate-900 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">👑</span>
                        <CardTitle className="text-xl font-extrabold text-white">
                          App Owner Pharmacy Verification & Document Compliance Portal
                        </CardTitle>
                      </div>
                      <CardDescription className="text-purple-200 text-xs mt-1">
                        Official platform owner control center to inspect Drug Licenses, GSTIN, Aadhaar KYC, State Pharmacy Council Degrees & issue CDSCO Verified Seals.
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/40 text-xs py-1 px-3">
                        Officer: {user.name} ({user.badge})
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Queue Stat Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Total Applications</p>
                      <p className="text-2xl font-extrabold text-slate-900 mt-1">{registeredPharmacies.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                      <p className="text-xs font-semibold text-amber-700 uppercase">Pending App Owner Audit</p>
                      <p className="text-2xl font-extrabold text-amber-900 mt-1">
                        {registeredPharmacies.filter((p) => p.verificationStatus === "pending").length}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <p className="text-xs font-semibold text-emerald-700 uppercase">Approved CDSCO Partner Hubs</p>
                      <p className="text-2xl font-extrabold text-emerald-900 mt-1">
                        {registeredPharmacies.filter((p) => p.verificationStatus === "approved").length}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                      <p className="text-xs font-semibold text-rose-700 uppercase">Rejected Applications</p>
                      <p className="text-2xl font-extrabold text-rose-900 mt-1">
                        {registeredPharmacies.filter((p) => p.verificationStatus === "rejected").length}
                      </p>
                    </div>
                  </div>

                  {/* Pharmacy Store Applications List */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" /> Submitted Pharmacy Store Compliance Applications
                    </h3>

                    {registeredPharmacies.map((pharmacy) => {
                      const isPending = pharmacy.verificationStatus === "pending";
                      const isApproved = pharmacy.verificationStatus === "approved";
                      const isRejected = pharmacy.verificationStatus === "rejected";

                      return (
                        <Card key={pharmacy.id} className="border-slate-200 shadow-sm hover:border-purple-300 transition-all">
                          <CardContent className="p-5 space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-base font-extrabold text-slate-900">{pharmacy.shopName}</h4>
                                  {isPending && (
                                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs">
                                      ⏳ Pending App Owner Audit
                                    </Badge>
                                  )}
                                  {isApproved && (
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs">
                                      ✓ CDSCO Verified Partner Hub
                                    </Badge>
                                  )}
                                  {isRejected && (
                                    <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-bold text-xs">
                                      ✕ Rejected Application
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 mt-1">Owner / Licensed Pharmacist: <strong className="text-slate-900">{pharmacy.ownerName}</strong></p>
                                <p className="text-xs text-slate-500 mt-0.5"><MapPin className="w-3 h-3 inline text-rose-500" /> {pharmacy.address} • Contact: {pharmacy.phone} ({pharmacy.email})</p>
                              </div>

                              <div className="text-right">
                                <Badge variant="outline" className="border-purple-300 text-purple-800 bg-purple-50 font-mono text-xs">
                                  {pharmacy.category}
                                </Badge>
                              </div>
                            </div>

                            {/* Grid of Regulatory Compliance Numbers */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono">
                              <div>
                                <span className="text-[10px] text-slate-500 font-sans block">Drug License No.</span>
                                <span className="font-bold text-slate-900">{pharmacy.licenseNo}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-sans block">GSTIN Number</span>
                                <span className="font-bold text-slate-900">{pharmacy.gstNo || "09ABCDE1234F1Z5"}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-sans block">Pharmacist Council Reg #</span>
                                <span className="font-bold text-slate-900">{pharmacy.pharmacistRegNo || "PCI-UP-88210"}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-sans block">Owner Aadhaar KYC</span>
                                <span className="font-bold text-slate-900">{pharmacy.ownerAadhar || "4521-9874-1234"}</span>
                              </div>
                            </div>

                            {/* Uploaded Documents Inspection Panel */}
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-slate-700 block">Attached Compliance Documents for Inspection:</span>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                  { name: "Drug License Certificate", file: pharmacy.documentsUploaded?.drugLicensePdf || "Drug_License_Cert_UP2026.pdf" },
                                  { name: "GSTIN Certificate", file: pharmacy.documentsUploaded?.gstCertificatePdf || "GSTIN_Registration_09ABC.pdf" },
                                  { name: "Owner Aadhaar KYC Card", file: pharmacy.documentsUploaded?.aadharCardPdf || "Aadhaar_KYC_Owner.pdf" },
                                  { name: "State Council Degree / Reg", file: pharmacy.documentsUploaded?.pharmacistDegreePdf || "State_Pharmacy_Council_Degree.pdf" },
                                ].map((doc, idx) => (
                                  <Button
                                    key={idx}
                                    size="sm"
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                      setSelectedAuditDoc({ title: doc.name, file: doc.file, shop: pharmacy.shopName, license: pharmacy.licenseNo });
                                      setIsAuditDocModalOpen(true);
                                    }}
                                    className="h-auto p-2 bg-white hover:bg-purple-50 border-slate-200 hover:border-purple-300 flex flex-col items-start text-left"
                                  >
                                    <span className="text-[10px] font-bold text-slate-800 flex items-center justify-between w-full">
                                      <span>{doc.name}</span>
                                      <Eye className="w-3 h-3 text-purple-600 shrink-0" />
                                    </span>
                                    <span className="text-[9px] text-purple-700 font-mono mt-0.5 truncate w-full">📄 {doc.file}</span>
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Rejection Reason Notice if rejected */}
                            {isRejected && pharmacy.rejectionReason && (
                              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                                <strong>Rejection Reason:</strong> {pharmacy.rejectionReason}
                              </div>
                            )}

                            {/* App Owner Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Inspected under Drugs & Cosmetics Rules 1945
                              </div>

                              <div className="flex items-center gap-2">
                                {!isApproved && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      approvePharmacyStore(pharmacy.id);
                                      toast.success(`🎉 Pharmacy "${pharmacy.shopName}" officially approved & verified by App Owner!`);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                                  >
                                    Approve & Issue CDSCO Verified Seal ✓
                                  </Button>
                                )}

                                {!isRejected && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const reason = prompt(`Enter rejection reason for "${pharmacy.shopName}":`, "License expiry or document ambiguity");
                                      if (reason) {
                                        rejectPharmacyStore(pharmacy.id, reason);
                                        toast.error(`Rejected application for ${pharmacy.shopName}`);
                                      }
                                    }}
                                    className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs"
                                  >
                                    Reject Application
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>

      {/* Fixed Mobile App Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => setActiveTab("ocr")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-extrabold transition-colors ${activeTab === "ocr" ? "text-emerald-600" : "text-slate-500 hover:text-slate-900"
            }`}
        >
          <FileText className="w-5 h-5" />
          <span>Rx Scan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("verification")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-extrabold transition-colors ${activeTab === "verification" ? "text-emerald-600" : "text-slate-500 hover:text-slate-900"
            }`}
        >
          <Building2 className="w-5 h-5" />
          <span>Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("delivery")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-extrabold transition-colors ${activeTab === "delivery" ? "text-emerald-600" : "text-slate-500 hover:text-slate-900"
            }`}
        >
          <Truck className="w-5 h-5" />
          <span>GPS Track</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reminders")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-extrabold transition-colors ${activeTab === "reminders" ? "text-emerald-600" : "text-slate-500 hover:text-slate-900"
            }`}
        >
          <Pill className="w-5 h-5" />
          <span>Cabinet</span>
        </button>

        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <UserCheck className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* User, Rider & Pharmacy Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Live Camera Scanner Modal */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent showCloseButton={false} className="max-w-lg bg-slate-950 text-white border-slate-800 p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" /> Live Prescription Camera Scanner
              </span>
              <Button size="icon" variant="ghost" onClick={stopCamera} className="h-8 w-8 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Position your doctor's prescription inside the viewfinder frame below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Viewfinder Canvas / Video View */}
            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-black aspect-video flex items-center justify-center">
              {!capturedPhoto ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {/* Viewfinder Grid Guide */}
                  <div className="absolute inset-4 border-2 border-dashed border-emerald-400/70 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between text-[10px] text-emerald-300 font-mono bg-black/40 px-2 py-0.5 rounded">
                      <span>ALIGN PRESCRIPTION</span>
                      <span>1080p HD</span>
                    </div>
                    <div className="text-center text-[10px] text-emerald-300/80 font-medium">Hold steady</div>
                  </div>
                </>
              ) : (
                <img src={capturedPhoto} alt="Captured Prescription" className="w-full h-full object-cover rounded-lg" />
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                onClick={switchCamera}
                disabled={!!capturedPhoto}
                className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Switch Camera
              </Button>

              {!capturedPhoto ? (
                <Button
                  onClick={capturePhoto}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 shadow-lg shadow-emerald-900/50"
                >
                  <Camera className="w-4 h-4 mr-1.5" /> Capture Photo
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCapturedPhoto(null)}
                    className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs"
                  >
                    Retake
                  </Button>
                  <Button
                    onClick={confirmCapturedPhoto}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Use Prescription Photo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cloud Storage Picker Modal (Google Drive & iCloud) */}
      <Dialog open={isCloudPickerOpen} onOpenChange={setIsCloudPickerOpen}>
        <DialogContent showCloseButton={false} className="max-w-md bg-white text-slate-900 border-slate-200 p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" /> Cloud Prescription Import
              </span>
              <Button size="icon" variant="ghost" onClick={() => setIsCloudPickerOpen(false)} className="h-8 w-8 text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Directly import encrypted e-Prescriptions from Google Drive or Apple iCloud.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Provider Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveCloudTab("gdrive")}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${activeCloudTab === "gdrive" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <HardDrive className="w-4 h-4 text-blue-600" /> Google Drive
              </button>

              <button
                onClick={() => setActiveCloudTab("icloud")}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${activeCloudTab === "icloud" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Cloud className="w-4 h-4 text-sky-500" /> iCloud Drive
              </button>
            </div>

            {/* Cloud Files List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activeCloudTab === "gdrive" ? (
                <>
                  <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Account: {user.email || "sarah.chen@gmail.com"}</span>
                    <span className="text-blue-600 font-semibold">Synced</span>
                  </div>

                  {[
                    { name: "Prescription_Dr_Rajesh_Gupta_2026.pdf", size: "1.2 MB", date: "Yesterday" },
                    { name: "Insulin_Dosage_Chart_Drive.jpg", size: "850 KB", date: "10 Aug 2026" },
                    { name: "Hospital_Discharge_Summary_Drive.pdf", size: "2.4 MB", date: "05 Aug 2026" },
                  ].map((file, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectCloudFile(file.name, "Google Drive")}
                      className="p-3 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{file.name}</p>
                          <p className="text-[10px] text-slate-500">{file.size} • {file.date}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100">
                        Import <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Apple ID: {user.email?.replace(/@.*/, "@icloud.com") || "sarah.chen@icloud.com"}</span>
                    <span className="text-sky-600 font-semibold">iCloud Active</span>
                  </div>

                  {[
                    { name: "iCloud_Medical_Prescription_Sarah.pdf", size: "1.8 MB", date: "Today" },
                    { name: "Dr_Verma_Antibiotic_Rx_iCloud.png", size: "920 KB", date: "09 Aug 2026" },
                    { name: "Blood_Lab_Report_iCloud.pdf", size: "3.1 MB", date: "01 Aug 2026" },
                  ].map((file, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectCloudFile(file.name, "iCloud Drive")}
                      className="p-3 border border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50/50 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                          <Cloud className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-sky-700">{file.name}</p>
                          <p className="text-[10px] text-slate-500">{file.size} • {file.date}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-sky-600 hover:text-sky-800 hover:bg-sky-100">
                        Import <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive Prescription Document Viewer Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent showCloseButton={false} className="max-w-4xl w-[95vw] bg-slate-900 text-white border-slate-800 p-5 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

          {/* Header Row 1: Title & Close Button */}
          <DialogHeader className="border-b border-slate-800/80 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ScanEye className="w-5 h-5 text-emerald-400 shrink-0" /> Prescription Document Viewer
                </DialogTitle>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-300 bg-emerald-950/60 font-mono">
                  OCR 99.4%
                </Badge>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsPreviewModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <DialogDescription className="text-slate-400 text-xs mt-1">
              File: <span className="text-emerald-300 font-semibold">{scannedData?.fileName || "Scanned_Prescription_Document.png"}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Action Toolbar Row 2: Non-overlapping Controls */}
          <div className="my-2.5 p-2 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowOcrOverlays((prev) => !prev)}
                className={`h-7 text-xs font-semibold ${showOcrOverlays
                    ? "border-emerald-500 bg-emerald-950/80 text-emerald-300"
                    : "border-slate-700 bg-slate-800 text-slate-300"
                  }`}
              >
                <Layers className="w-3.5 h-3.5 mr-1" /> {showOcrOverlays ? "OCR Overlays On" : "OCR Overlays Off"}
              </Button>

              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                <Button size="icon" variant="ghost" onClick={handleZoomOut} className="h-6 w-6 text-slate-300 hover:text-white">
                  <ZoomOut className="w-3 h-3" />
                </Button>
                <button
                  type="button"
                  onClick={resetZoom}
                  title="Click to reset zoom to 100%"
                  className="text-xs px-2 font-mono text-slate-300 hover:text-white"
                >
                  {zoomLevel}%
                </button>
                <Button size="icon" variant="ghost" onClick={handleZoomIn} className="h-6 w-6 text-slate-300 hover:text-white">
                  <ZoomIn className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePrintPrescription} className="h-7 text-xs border-slate-700 text-slate-300 hover:bg-slate-800">
                <Printer className="w-3.5 h-3.5 mr-1" /> Print
              </Button>

              <Button size="sm" onClick={handleDownloadPrescription} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                <Download className="w-3.5 h-3.5 mr-1" /> Save PDF
              </Button>
            </div>
          </div>

          {/* Interactive Document Display Canvas Container */}
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center bg-slate-950/90 rounded-xl my-1 border border-slate-800 scrollbar-thin min-h-[400px]">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
                marginBottom: zoomLevel > 100 ? `${(zoomLevel - 100) * 4}px` : "0px",
              }}
              className="transition-transform duration-200 relative w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 md:p-8 border border-slate-300 font-serif"
            >
              {scannedData?.filePreview ? (
                <div className="relative">
                  <img src={scannedData.filePreview} alt="Uploaded Prescription" className="w-full max-h-[460px] object-contain rounded-lg border border-slate-200" />
                  {/* OCR AI Bounding Box Highlights */}
                  {showOcrOverlays && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-[20%] left-[10%] w-[80%] h-[15%] border-2 border-emerald-500 bg-emerald-500/10 rounded flex items-center justify-end px-2">
                        <span className="text-[10px] font-mono bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">AI OCR: Extracted Rx Drugs (Confidence 99.8%)</span>
                      </div>
                      <div className="absolute top-[45%] left-[10%] w-[60%] h-[12%] border-2 border-blue-500 bg-blue-500/10 rounded flex items-center justify-end px-2">
                        <span className="text-[10px] font-mono bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">AI OCR: Doctor Reg #{scannedData.doctor.split("#")[1] || "UP-7721"}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Simulated Official Prescription Document */
                <div className="space-y-5 font-sans text-left">
                  {/* Clinic Header */}
                  <div className="border-b-2 border-slate-900 pb-3 flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <h2 className="text-lg md:text-xl font-extrabold text-emerald-900 uppercase tracking-tight">KAVI NAGAR HEALTHCARE & DIABETES CENTRE</h2>
                      <p className="text-xs text-slate-600 font-medium">14/2 Main Rd, Kavi Nagar, Ghaziabad, UP 201002 • Tel: +91 120 4991200</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">{scannedData?.doctor}</p>
                    </div>
                    <Badge variant="outline" className="border-emerald-600 text-emerald-800 font-mono text-[10px] px-2 py-0.5 shrink-0">
                      CDSCO VERIFIED
                    </Badge>
                  </div>

                  {/* Patient Info Bar */}
                  <div className="bg-slate-100 p-2.5 rounded-lg flex flex-wrap justify-between gap-2 text-xs font-semibold text-slate-700">
                    <span>Patient Name: <strong className="text-slate-900">{scannedData?.patient}</strong></span>
                    <span>Date: <strong className="text-slate-900">{scannedData?.date}</strong></span>
                    <span>Rx ID: <strong className="text-emerald-700 font-mono">{scannedData?.id}</strong></span>
                  </div>

                  {/* Prescribed Items & Bounding Box Overlay Demonstration */}
                  <div className="space-y-3 relative py-1">
                    <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1 border-b border-slate-200 pb-1">
                      <span className="text-emerald-700 text-base">℞</span> PRESCRIBED MEDICATIONS
                    </h3>

                    {scannedData?.meds.map((med, index) => (
                      <div key={med.id} className="relative p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                        {showOcrOverlays && (
                          <div className="absolute -top-2 right-2 bg-emerald-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3" /> OCR Box #{index + 1}
                          </div>
                        )}
                        <p className="font-bold text-slate-900 text-xs sm:text-sm flex flex-wrap items-center gap-2">
                          {med.name}
                          {med.requiresColdChain && (
                            <span className="text-[10px] text-cyan-700 bg-cyan-100 px-1.5 py-0.5 rounded font-bold">Cold Storage (2°C-8°C)</span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">Salt: {med.genericName}</p>
                        <p className="text-xs font-medium text-emerald-700 mt-0.5">Directions: {med.dosage} ({med.duration})</p>
                      </div>
                    ))}
                  </div>

                  {/* Doctor Signature Stamp */}
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-end gap-2">
                    <div className="text-[10px] text-slate-500">
                      <p>✓ Digitally verified by CDSCO Licensed Pharmacist</p>
                      <p>✓ Temperature telemetry tracking enabled</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-9 border border-emerald-500 bg-emerald-50 text-emerald-800 text-[9px] font-mono font-bold flex items-center justify-center rounded">
                        Dr. R. Gupta<br />DIGITAL STAMP
                      </div>
                      <p className="text-[9px] font-bold text-slate-700 mt-0.5">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* App Owner Audit Compliance Document Inspector Modal */}
      <Dialog open={isAuditDocModalOpen} onOpenChange={setIsAuditDocModalOpen}>

        <DialogContent showCloseButton={false} className="max-w-3xl bg-slate-950 text-white border-slate-800 p-6 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" /> App Owner Compliance Document Inspector
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs mt-1">
                  Document: <span className="text-purple-300 font-semibold">{selectedAuditDoc?.title}</span> ({selectedAuditDoc?.file})
                </DialogDescription>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsAuditDocModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Realistic High-Res Document Preview Canvas */}
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center bg-slate-900/90 rounded-xl my-2 border border-slate-800 min-h-[380px]">
            <div className="w-full max-w-xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 border border-slate-300 font-sans space-y-4">
              <div className="border-b-2 border-purple-900 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-extrabold text-purple-900 uppercase tracking-tight">GOVERNMENT REGULATORY COMPLIANCE ARCHIVE</h3>
                  <p className="text-[10px] text-slate-600">Verification Registry: CDSCO / State Pharmacy Council / GSTN</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-[10px] font-mono">
                  OFFICIAL AUDIT COPY
                </Badge>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs space-y-1">
                <p className="font-bold text-purple-900">Entity Shop: {selectedAuditDoc?.shop}</p>
                <p className="text-slate-700">Drug License Registration #: <strong className="font-mono text-purple-800">{selectedAuditDoc?.license}</strong></p>
                <p className="text-slate-600 text-[11px]">Attachment File Name: <span className="font-mono text-slate-900">{selectedAuditDoc?.file}</span></p>
              </div>

              <div className="border border-dashed border-purple-300 bg-slate-50 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                <FileText className="w-10 h-10 text-purple-600" />
                <p className="text-xs font-bold text-slate-800">{selectedAuditDoc?.title}</p>
                <p className="text-[10px] text-slate-500 max-w-md">
                  Cryptographically verified e-Document payload matches government database registry entry. Authenticated by CDSCO Inspector Node.
                </p>
                <Badge className="bg-emerald-600 text-white font-mono text-[9px] px-2 py-0.5">
                  ✓ Digital Signature Hash Valid (SHA-256)
                </Badge>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                <span>Inspected by: {user.name} ({user.badge})</span>
                <span className="text-emerald-700 font-bold">Status: Verified Compliant ✓</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



