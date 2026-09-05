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
  Layers,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Play,
  Store,
  Bike,
  PackageCheck,
  Zap
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
  const {
    user,
    setIsAuthModalOpen,
    setAuthModalRole,
    setIsOwnerAuthModalOpen,
    registeredPharmacies,
    approvePharmacyStore,
    rejectPharmacyStore,
    setIsPharmacyRegisterModalOpen,
    logout,
    orders,
    currentOrder,
    setCurrentOrder,
    createOrder,
    updateOrderStatus,
    verifyPickupOtp,
    verifyDeliveryOtp,
    resetDemoOrder,
    quickSwitchRole,
    setIsDemoModalOpen,
    openLegalPolicy,
    openHelpCenter,
    setIsCookiePreferencesOpen,
    setIsOnboardingOpen,
    setIsHelpCenterOpen,
    setIsAccountSettingsOpen,
  } = useAuth();
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

  // ArogyaSwift Cart System State
  interface CartItem {
    id: string;
    name: string;
    genericName: string;
    price: number;
    quantity: number;
    requiresColdChain?: boolean;
  }

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "m1",
      name: "Lantus Solostar Pen (Insulin Glargine 100 IU/ml)",
      genericName: "Insulin Glargine Disposable Pen 100 IU",
      price: 890,
      quantity: 1,
      requiresColdChain: true,
    },
    {
      id: "m2",
      name: "Janumet 50mg/500mg (Sitagliptin + Metformin)",
      genericName: "Sitagliptin + Metformin Hydrochloride 50mg/500mg",
      price: 650,
      quantity: 1,
      requiresColdChain: false,
    }
  ]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const addToCart = (med: { id: string; name: string; genericName: string; price: number; requiresColdChain?: boolean }) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === med.id);
      if (existing) {
        toast.success(`Updated quantity for "${med.name}" in cart!`);
        return prev.map((item) =>
          item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`🛒 Added "${med.name}" to cart!`);
      return [
        ...prev,
        {
          id: med.id,
          name: med.name,
          genericName: med.genericName,
          price: med.price,
          quantity: 1,
          requiresColdChain: med.requiresColdChain,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info("Removed item from cart");
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

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

  // Map currentOrder status to orderStage and riderProgress for real-time multi-portal sync
  useEffect(() => {
    if (!currentOrder) return;
    const st = currentOrder.status;
    if (st === "placed") {
      setOrderStage(1);
      setRiderProgress(15);
      setIsPharmacyPickedUp(false);
      setIsDelivered(false);
    } else if (st === "confirmed_preparing") {
      setOrderStage(2);
      setRiderProgress(25);
      setIsPharmacyPickedUp(false);
      setIsDelivered(false);
    } else if (st === "ready_to_dispatch" || st === "searching_rider") {
      setOrderStage(2);
      setRiderProgress(35);
      setIsPharmacyPickedUp(false);
      setIsDelivered(false);
    } else if (st === "rider_assigned" || st === "at_pharmacy") {
      setOrderStage(3);
      setRiderProgress(50);
      setIsPharmacyPickedUp(false);
      setIsDelivered(false);
    } else if (st === "picked_up" || st === "out_for_delivery") {
      setOrderStage(4);
      setRiderProgress(75);
      setIsPharmacyPickedUp(true);
      setIsDelivered(false);
    } else if (st === "delivered") {
      setOrderStage(5);
      setRiderProgress(100);
      setIsPharmacyPickedUp(true);
      setIsDelivered(true);
    }
  }, [currentOrder?.status]);

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

  const handleVerifyPharmacyOtp = async () => {
    const orderId = currentOrder?.id || "AS-7821";
    const res = await verifyPickupOtp(orderId, enteredPharmacyOtp || "8514");
    if (res.success) {
      setIsPharmacyPickedUp(true);
      setOrderStage(4);
      setRiderProgress(75);
      setEnteredPharmacyOtp("");
      toast.success(res.message || "🎉 Store Pickup OTP Verified! Package handed over to Rider Vikram Singh.");
    } else {
      toast.error(res.error || "Invalid Pharmacy Pickup OTP! Enter 8514");
    }
  };

  const handleVerifyOtp = async () => {
    const orderId = currentOrder?.id || "AS-7821";
    const res = await verifyDeliveryOtp(orderId, enteredOtp || "4829");
    if (res.success) {
      setIsDelivered(true);
      setOrderStage(5);
      setRiderProgress(100);
      setEnteredOtp("");
      toast.success(res.message || "🎉 Customer Delivery OTP Verified! Doorstep delivery complete.");
    } else {
      toast.error(res.error || "Invalid Customer OTP! Enter 4829");
    }
  };

  const handlePlaceOrder = async () => {
    const itemsToOrder = scannedData?.meds.map((m) => ({
      id: m.id,
      name: useGenerics[m.id] ? m.genericName : m.name,
      genericName: m.genericName,
      price: useGenerics[m.id] ? m.genericPrice : m.price,
      quantity: m.quantity || 1,
      requiresColdChain: m.coldChain,
      dosage: m.dosage,
    })) || [
      {
        id: "m1",
        name: "Lantus Solostar Pen (Insulin Glargine 100 IU/ml)",
        price: 890,
        quantity: 1,
        requiresColdChain: true,
      },
      {
        id: "m2",
        name: "Janumet 50mg/500mg (Sitagliptin + Metformin)",
        price: 650,
        quantity: 1,
        requiresColdChain: false,
      },
    ];

    const total = calculateSubtotal() + 35 + (isEmergencyExpress ? 150 : 0);

    const newOrder = await createOrder({
      patientId: user.id || "u-patient-101",
      patientName: user.name || "Sarah Chen",
      patientPhone: user.phone || "+91 98765 43210",
      patientAddress: user.location || "Flat 402, Shipra Sun City, Indirapuram, Ghaziabad",
      pharmacyId: selectedPharmacy.id,
      pharmacyName: selectedPharmacy.name,
      pharmacyAddress: "Kavi Nagar Main Rd, Ghaziabad",
      pharmacyPhone: selectedPharmacy.phone || "+91 98765 43210",
      items: itemsToOrder,
      totalAmount: total,
      deliveryFee: 35,
      isEmergency: isEmergencyExpress,
    });

    if (newOrder) {
      toast.success(
        `🎉 Order #${newOrder.id} placed! Transmitted to ${selectedPharmacy.name}. Store is reviewing prescription.`
      );
    }
    setActiveTab("delivery");
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
                  ArogyaSwift <span className="text-emerald-600">Medicine Delivery</span>
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

            {/* Cart Option - Only visible for Patient role */}
            {user.role === "patient" && (
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-500/40 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-xs"
                onClick={() => setIsCartModalOpen(true)}
              >
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cart</span>
                <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-0.5">
                  {cartCount}
                </Badge>
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => setIsDemoModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-extrabold text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-md animate-pulse hover:animate-none"
              title="Open 3-Portal Live Order-to-Delivery Simulation"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">⚡ Live Demo Simulator</span>
              <span className="sm:hidden">⚡ Demo</span>
            </Button>

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

      {/* Quick Multi-Role Switcher & Active Order Pipeline Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-2 border-b border-slate-800 text-xs shadow-inner">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Quick Portal Switch:
            </span>
            <button
              type="button"
              onClick={() => quickSwitchRole("patient")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                user.role === "patient"
                  ? "bg-emerald-500 text-slate-950 shadow-xs"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>👩‍💼</span> Patient View
            </button>
            <button
              type="button"
              onClick={() => quickSwitchRole("pharmacy")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                user.role === "pharmacy"
                  ? "bg-emerald-500 text-slate-950 shadow-xs"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>🏥</span> Pharmacy View
            </button>
            <button
              type="button"
              onClick={() => quickSwitchRole("rider")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                user.role === "rider"
                  ? "bg-cyan-400 text-slate-950 shadow-xs"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>🏍️</span> Rider View
            </button>
            <button
              type="button"
              onClick={() => quickSwitchRole("admin")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                user.role === "admin"
                  ? "bg-purple-400 text-slate-950 shadow-xs"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>👑</span> Admin
            </button>
          </div>

          {/* Live Order Status Indicator & Demo Trigger */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentOrder && (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-xl text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="font-mono font-bold text-slate-300">Order #{currentOrder.id}:</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold uppercase">
                  {currentOrder.status.replace(/_/g, " ")}
                </Badge>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOnboardingOpen(true)}
              className="h-7 px-2.5 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold rounded-xl"
            >
              ⚡ How It Works
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={openHelpCenter}
              className="h-7 px-2.5 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold rounded-xl"
            >
              Help & FAQs
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAccountSettingsOpen(true)}
              className="h-7 px-2.5 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold rounded-xl"
            >
              Settings
            </Button>

            <Button
              size="sm"
              onClick={() => setIsDemoModalOpen(true)}
              className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" /> Auto Demo
            </Button>
          </div>
        </div>
      </div>

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
                  <TabsTrigger value="purchases" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">5. Purchase History</TabsTrigger>
                </>
              )}
              {user.role === "pharmacy" && (
                <>
                  <TabsTrigger value="verification" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">1. Rx Audit</TabsTrigger>
                  <TabsTrigger value="dispatch" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">2. Sourcing</TabsTrigger>
                  <TabsTrigger value="delivery" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">3. Dispatch</TabsTrigger>
                  <TabsTrigger value="customer-orders" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">4. Customer Orders</TabsTrigger>
                </>
              )}
              {user.role === "rider" && (
                <>
                  <TabsTrigger value="delivery" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">1. Active Delivery</TabsTrigger>
                  <TabsTrigger value="rider-history" className="shrink-0 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">2. Delivery History</TabsTrigger>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <TabsTrigger value="admin" className="shrink-0 whitespace-nowrap data-[state=active]:bg-purple-700 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">👑 App Owner Portal</TabsTrigger>
                  <TabsTrigger value="customer-orders" className="shrink-0 whitespace-nowrap data-[state=active]:bg-purple-700 data-[state=active]:text-white font-extrabold text-xs md:text-sm px-3 py-2">All Customers & Orders</TabsTrigger>
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
                            const cartItem = cartItems.find((item) => item.id === med.id);
                            return (
                              <div key={med.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
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
                                    <span className="text-lg font-bold text-slate-900 block">₹{med.price}</span>
                                    <span className="text-xs text-slate-500">Qty: {med.quantity}</span>
                                  </div>
                                </div>

                                {med.warnings && (
                                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                                    <span>{med.warnings.join(" | ")}</span>
                                  </div>
                                )}

                                {/* Add to Cart Action */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                                  <span className="text-slate-600 font-medium">Hyperlocal Express Stock Available</span>
                                  {cartItem ? (
                                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-xl">
                                      <span className="text-emerald-800 font-bold text-xs flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Added ({cartItem.quantity})
                                      </span>
                                      <div className="flex items-center gap-1 ml-1">
                                        <button
                                          type="button"
                                          onClick={() => updateCartQuantity(med.id, -1)}
                                          className="w-5 h-5 bg-white border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-xs"
                                        >
                                          -
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => updateCartQuantity(med.id, 1)}
                                          className="w-5 h-5 bg-white border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-xs"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => addToCart(med)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                                    >
                                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Summary Footer */}
                        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-xs text-slate-600 block">Cart Total ({cartCount} items)</span>
                            <span className="text-2xl font-bold text-emerald-700">₹{cartTotal}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="lg"
                              variant="outline"
                              onClick={() => setIsCartModalOpen(true)}
                              className="border-emerald-500/50 text-emerald-800 bg-white hover:bg-emerald-50 font-bold shadow-xs text-xs px-4"
                            >
                              <ShoppingCart className="w-4 h-4 mr-1 text-emerald-600" /> View Cart
                            </Button>
                            <Button
                              size="lg"
                              className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-md text-xs px-5"
                              onClick={() => setActiveTab("dispatch")}
                            >
                              Select Pharmacy Hub <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
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
              {/* Store Incoming Orders & Dispatch Pipeline Card */}
              {currentOrder && (
                <Card className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50 to-white shadow-lg overflow-hidden">
                  <div className="bg-emerald-700 text-white px-5 py-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                      <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                        <Store className="w-4 h-4 text-emerald-200" /> Active Store Incoming Order Pipeline
                      </h3>
                      <Badge className="bg-emerald-900/60 text-emerald-200 border-none font-mono text-xs">
                        #{currentOrder.id}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white text-emerald-800 font-extrabold text-xs px-2.5 py-0.5">
                        {currentOrder.status.replace(/_/g, " ")}
                      </Badge>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsDemoModalOpen(true)}
                        className="bg-emerald-100 text-emerald-800 hover:bg-white text-xs h-7 font-bold"
                      >
                        ⚡ Live Demo Simulator
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <div className="grid md:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Customer / Patient</span>
                        <div className="font-bold text-slate-800 text-sm">{currentOrder.patient_name}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{currentOrder.patient_phone}</div>
                        <div className="text-slate-500 text-[11px] truncate mt-0.5">{currentOrder.patient_address}</div>
                      </div>

                      <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fulfillment Store</span>
                        <div className="font-bold text-slate-800 text-sm">{currentOrder.pharmacy_name}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{currentOrder.pharmacy_phone}</div>
                        <div className="text-slate-500 text-[11px] truncate mt-0.5">{currentOrder.pharmacy_address}</div>
                      </div>

                      <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Assigned Delivery Partner</span>
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-emerald-600" />
                          {currentOrder.rider_name || "Searching for nearby rider..."}
                        </div>
                        <div className="text-slate-600 text-[11px] mt-0.5">Vehicle: {currentOrder.rider_vehicle || "EV Cargo Bike"}</div>
                        <div className="text-emerald-700 font-semibold text-[11px] mt-0.5">
                          {currentOrder.rider_phone ? `Phone: ${currentOrder.rider_phone}` : "Broadcast active to 5 riders"}
                        </div>
                      </div>
                    </div>

                    {/* Items & Cold Chain Requirements */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Prescribed Medicines Ordered</span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentOrder.items?.map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-slate-50 border-slate-300 font-medium py-1 px-2.5">
                              {item.name} × {item.quantity}
                              {item.requiresColdChain && (
                                <span className="ml-1 text-[10px] text-cyan-600 font-bold">❄️ 2-8°C</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Billable</div>
                        <div className="text-base font-black text-slate-900">₹{currentOrder.total_amount}</div>
                      </div>
                    </div>

                    {/* Pharmacy Action Bar based on Status */}
                    <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                          <ShieldCheck className="w-4 h-4" /> Store Workflow Control
                        </div>
                        <p className="text-xs text-slate-300">
                          {currentOrder.status === "placed" && "New order received! Review prescription and confirm fulfillment."}
                          {currentOrder.status === "confirmed_preparing" && "Order accepted. Pack with tamper-evident seal and mark ready."}
                          {(currentOrder.status === "ready_to_dispatch" || currentOrder.status === "searching_rider" || currentOrder.status === "rider_assigned" || currentOrder.status === "at_pharmacy") && "Awaiting rider arrival. Verify the 4-digit pickup code below when handing over package."}
                          {(currentOrder.status === "picked_up" || currentOrder.status === "out_for_delivery") && "Package handed over to rider. In transit to patient doorstep."}
                          {currentOrder.status === "delivered" && "Order completed and delivered to Sarah Chen."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-end">
                        {currentOrder.status === "placed" && (
                          <Button
                            onClick={() => updateOrderStatus(currentOrder.id, "confirmed_preparing")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs h-9 px-4 shadow-md"
                          >
                            <Check className="w-4 h-4 mr-1" /> Confirm & Start Packing
                          </Button>
                        )}

                        {currentOrder.status === "confirmed_preparing" && (
                          <Button
                            onClick={() => updateOrderStatus(currentOrder.id, "ready_to_dispatch")}
                            className="bg-teal-400 hover:bg-teal-500 text-slate-950 font-extrabold text-xs h-9 px-4 shadow-md"
                          >
                            <PackageCheck className="w-4 h-4 mr-1" /> Mark Ready for Dispatch
                          </Button>
                        )}

                        {(currentOrder.status === "ready_to_dispatch" || currentOrder.status === "searching_rider" || currentOrder.status === "rider_assigned" || currentOrder.status === "at_pharmacy") && (
                          <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 rounded-lg px-3 py-1.5">
                            <span className="text-[11px] text-amber-300 font-bold uppercase">Store Pickup OTP:</span>
                            <span className="font-mono text-base font-black text-amber-200 tracking-wider">
                              {currentOrder.pickup_otp || "8514"}
                            </span>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("delivery")}
                          className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white text-xs h-9"
                        >
                          <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Track in Delivery Portal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                        onClick={handlePlaceOrder}
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
                      {/* 6-Stage Progress Stepper for Everyone */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                            Live Sequence Status
                          </span>
                          <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                            {currentOrder?.status?.replace(/_/g, " ").toUpperCase() || "ORDER PLACED"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-center font-bold text-[10px]">
                          <div className={`p-1.5 rounded-lg border ${
                            orderStage >= 1 ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-white text-slate-400 border-slate-200"
                          }`}>
                            1. Placed
                          </div>
                          <div className={`p-1.5 rounded-lg border ${
                            orderStage >= 2 ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-white text-slate-400 border-slate-200"
                          }`}>
                            2. Confirmed
                          </div>
                          <div className={`p-1.5 rounded-lg border ${
                            orderStage >= 2 && (currentOrder?.status === "ready_to_dispatch" || currentOrder?.status === "searching_rider" || orderStage >= 3) ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-white text-slate-400 border-slate-200"
                          }`}>
                            3. Ready
                          </div>
                          <div className={`p-1.5 rounded-lg border ${
                            orderStage >= 3 ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-white text-slate-400 border-slate-200"
                          }`}>
                            4. Rider
                          </div>
                          <div className={`p-1.5 rounded-lg border ${
                            orderStage >= 4 ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-white text-slate-400 border-slate-200"
                          }`}>
                            5. Dispatched
                          </div>
                          <div className={`p-1.5 rounded-lg border ${
                            orderStage >= 5 ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-white text-slate-400 border-slate-200"
                          }`}>
                            6. Delivered
                          </div>
                        </div>
                      </div>

                      {/* PHARMACY VIEW: Store Confirm, Dispatch & Store Pickup OTP (8514) */}
                      {user.role === "pharmacy" && (
                        <div className="space-y-3">
                          {/* Store Actions Based on Order Status */}
                          {(!currentOrder || currentOrder.status === "placed") && (
                            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                                <span>New Incoming Order from Sarah Chen!</span>
                              </div>
                              <p className="text-[11px] text-slate-600">
                                Patient ordered Lantus Solostar Pen & Janumet. Doctor Rx valid. Confirm to start cold-pack packaging.
                              </p>
                              <Button
                                onClick={async () => {
                                  if (!currentOrder) return;
                                  await updateOrderStatus(currentOrder.id, "confirmed_preparing");
                                  toast.success("Pharmacy confirmed order! Packaging started.");
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                              >
                                Confirm Order & Start Packing 📦
                              </Button>
                            </div>
                          )}

                          {currentOrder?.status === "confirmed_preparing" && (
                            <div className="p-3.5 bg-cyan-50 border border-cyan-300 rounded-2xl space-y-2">
                              <div className="flex items-center gap-2 text-cyan-900 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                                <span>Medicines Packed with Insulated Gel Kit</span>
                              </div>
                              <p className="text-[11px] text-slate-600">
                                Cold-chain seal attached. Mark ready for dispatch to broadcast request to nearby riders.
                              </p>
                              <Button
                                onClick={async () => {
                                  if (!currentOrder) return;
                                  await updateOrderStatus(currentOrder.id, "ready_to_dispatch");
                                  toast.success("Order marked ready for dispatch! Searching for delivery riders.");
                                }}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm"
                              >
                                Mark Ready for Dispatch 🚀
                              </Button>
                            </div>
                          )}

                          {(currentOrder?.status === "ready_to_dispatch" || currentOrder?.status === "searching_rider") && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                                <span>Searching express delivery partner within 2.5 km...</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => quickSwitchRole("rider")}
                                className="h-6 text-[10px] border-blue-300 text-blue-800 hover:bg-blue-100"
                              >
                                Switch to Rider View ➔
                              </Button>
                            </div>
                          )}

                          {currentOrder?.status === "rider_assigned" && (
                            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-indigo-600 animate-bounce" />
                                <span>Rider Vikram Singh assigned & heading to store.</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => quickSwitchRole("rider")}
                                className="h-6 text-[10px] border-indigo-300 text-indigo-800 hover:bg-indigo-100"
                              >
                                Switch to Rider ➔
                              </Button>
                            </div>
                          )}

                          {/* Pharmacy Store Pickup OTP Display Card */}
                          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center space-y-2">
                            <span className="text-xs text-emerald-800 font-extrabold block uppercase tracking-wider">
                              Pharmacy Store Pickup OTP
                            </span>
                            <span className="text-4xl font-mono font-extrabold text-emerald-700 tracking-widest block">
                              {currentOrder?.pickup_otp || "8514"}
                            </span>
                            <p className="text-xs text-slate-600 pt-1 font-medium">
                              Express rider <strong>Vikram Singh</strong> will ask for this code ({currentOrder?.pickup_otp || "8514"}) to verify package handover from your store.
                            </p>
                          </div>

                          {isPharmacyPickedUp ? (
                            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              <span>✓ Package handed over to Rider Vikram Singh! Store pickup verified.</span>
                            </div>
                          ) : (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium flex items-center justify-between gap-2">
                              <span>Waiting for Rider pickup OTP verification (Code: {currentOrder?.pickup_otp || "8514"})...</span>
                              <Button
                                size="sm"
                                onClick={handleVerifyPharmacyOtp}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-7 px-3"
                              >
                                Verify Pickup OTP ✓
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PATIENT VIEW: Customer Doorstep Delivery OTP (4829) */}
                      {user.role === "patient" && (
                        <div className="space-y-3">
                          {/* Live Status Messaging */}
                          {(!currentOrder || currentOrder.status === "placed") && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                              <Clock className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                              <span>Order transmitted to {selectedPharmacy.name}. Store is reviewing your prescription.</span>
                            </div>
                          )}

                          {currentOrder?.status === "confirmed_preparing" && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Store confirmed your order! Pharmacist is packing your medicines with cold storage kit.</span>
                            </div>
                          )}

                          {(currentOrder?.status === "ready_to_dispatch" || currentOrder?.status === "searching_rider") && (
                            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-900 text-xs flex items-center gap-2">
                              <Zap className="w-4 h-4 text-cyan-600 animate-bounce shrink-0" />
                              <span>Medicines packed! Searching for nearby express delivery rider...</span>
                            </div>
                          )}

                          {(currentOrder?.status === "rider_assigned" || currentOrder?.status === "at_pharmacy") && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center gap-2">
                              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                              <span>Delivery partner Vikram Singh assigned! Heading to {selectedPharmacy.name} for pickup.</span>
                            </div>
                          )}

                          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center space-y-2">
                            <span className="text-xs text-amber-800 font-extrabold block uppercase tracking-wider">Your Customer Delivery PIN / OTP</span>
                            <span className="text-4xl font-mono font-extrabold text-amber-700 tracking-widest block">
                              {currentOrder?.delivery_otp || "4829"}
                            </span>
                            <p className="text-xs text-slate-600 pt-1 font-medium">
                              Give this code ({currentOrder?.delivery_otp || "4829"}) to rider <strong>Vikram Singh</strong> when receiving your medicine box at doorstep.
                            </p>
                          </div>

                          {isDelivered && (
                            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-3">
                              <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-600" />
                              <div>
                                <span className="font-bold block">Order successfully delivered & verified!</span>
                                <span className="text-slate-600 text-[11px]">OTP verified. Cold-chain verified at 4.2°C.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* RIDER VIEW & ADMIN: Dual Verification & Incoming Request Form */}
                      {(user.role === "rider" || user.role === "admin") && (
                        <div className="space-y-4">
                          {/* Incoming Dispatch Request Card if order is ready to dispatch */}
                          {(currentOrder?.status === "ready_to_dispatch" || currentOrder?.status === "searching_rider") && (
                            <div className="p-4 bg-gradient-to-r from-cyan-900 to-slate-900 text-white rounded-2xl shadow-lg border border-cyan-500/40 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs flex items-center gap-1.5 text-cyan-300">
                                  <Zap className="w-4 h-4 text-amber-400 animate-bounce" /> New Delivery Request Available!
                                </span>
                                <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px]">
                                  Payout: ₹65
                                </Badge>
                              </div>
                              <div className="space-y-1 text-xs text-slate-300">
                                <p>Pickup: <strong className="text-white">{currentOrder.pharmacy_name || "Apollo Pharmacy Hub"}</strong> (0.8 km)</p>
                                <p>Drop: <strong className="text-white">{currentOrder.patient_name || "Sarah Chen"}</strong> (2.4 km)</p>
                                <p className="text-cyan-300 text-[11px] font-mono">Cold-Chain Insulated Kit Required (2°C–8°C)</p>
                              </div>
                              <Button
                                onClick={async () => {
                                  if (!currentOrder) return;
                                  await updateOrderStatus(currentOrder.id, "rider_assigned", {
                                    riderId: "u-rider-303",
                                    riderName: "Vikram Singh",
                                    riderPhone: "+91 98765 99887",
                                    riderVehicle: "EV Scooter (UP-14-EV-7721)",
                                  });
                                  toast.success("Delivery request accepted! Heading to store for pickup.");
                                }}
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs h-9 shadow-md"
                              >
                                Accept Delivery Order 🏍️
                              </Button>
                            </div>
                          )}

                          {/* Step 1: Store Pickup OTP (8514) */}
                          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900">Step 1: Pharmacy Store Pickup Verification</span>
                              {isPharmacyPickedUp ? (
                                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">✓ Picked Up</Badge>
                              ) : (
                                <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 text-[10px] font-bold">Pending Pickup</Badge>
                              )}
                            </div>

                            {!isPharmacyPickedUp ? (
                              <div className="space-y-2 pt-1">
                                <p className="text-[11px] text-slate-600">
                                  Ask on-duty pharmacist for the 4-digit Store Pickup OTP (Code: {currentOrder?.pickup_otp || "8514"}):
                                </p>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder={`Enter Store OTP (${currentOrder?.pickup_otp || "8514"})`}
                                    value={enteredPharmacyOtp}
                                    onChange={(e) => setEnteredPharmacyOtp(e.target.value)}
                                    maxLength={4}
                                    className="bg-white border-slate-300 font-mono text-sm font-bold text-slate-900"
                                  />
                                  <Button
                                    onClick={handleVerifyPharmacyOtp}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 shrink-0"
                                  >
                                    Verify Pickup ✓
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-emerald-700 font-medium">✓ Pharmacy Pickup OTP verified at Apollo Hub. Cold chain box secured.</p>
                            )}
                          </div>

                          {/* Step 2: Customer Delivery OTP (4829) */}
                          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
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
                              <div className="space-y-2 pt-1">
                                <p className="text-[11px] text-slate-600">
                                  Ask patient Sarah Chen for the 4-digit Delivery PIN (PIN: {currentOrder?.delivery_otp || "4829"}):
                                </p>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder={`Enter Patient PIN (${currentOrder?.delivery_otp || "4829"})`}
                                    value={enteredOtp}
                                    onChange={(e) => setEnteredOtp(e.target.value)}
                                    maxLength={4}
                                    className="bg-white border-slate-300 font-mono text-sm font-bold text-slate-900"
                                  />
                                  <Button
                                    onClick={handleVerifyOtp}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 shrink-0"
                                  >
                                    Verify & Handover ✓
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between">
                                <span>✓ Customer Delivery OTP verified. Handover complete.</span>
                                <span className="font-bold text-emerald-700">+₹65 Credited</span>
                              </div>
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

            {/* TAB CONTENT 5: PURCHASE HISTORY (PATIENT) */}
            <TabsContent value="purchases" className="mt-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500 text-white font-bold text-xs uppercase px-2.5 py-0.5">
                      Patient Invoices & Records
                    </Badge>
                    <span className="text-xs text-emerald-300 font-mono">CDSCO Compliant</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">Your Previous Medicine Purchases</h3>
                  <p className="text-xs text-emerald-100/80 max-w-xl">
                    Review past prescriptions, download GST-compliant medical invoices, inspect 2°C–8°C cold-chain audit logs, and re-order with 1 click.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
                    <span className="text-xs text-emerald-200 block font-bold">Total Orders</span>
                    <span className="text-xl font-black font-mono">3 Orders</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
                    <span className="text-xs text-emerald-200 block font-bold">Generic Savings</span>
                    <span className="text-xl font-black font-mono text-emerald-300">₹925 Saved</span>
                  </div>
                </div>
              </div>

              {/* Purchase History Order Cards */}
              <div className="space-y-4">
                {[
                  {
                    id: "QM-7821",
                    date: "Yesterday, 02:45 PM",
                    pharmacy: "Apollo Express Pharmacy (Raj Nagar Hub)",
                    pharmacyAddress: "Shop 12, RDC Market, Raj Nagar, Ghaziabad",
                    items: [
                      { name: "Lantus Solostar 100IU/ml Insulin Pen", qty: 2, price: 1100, cold: true },
                      { name: "Janumet 50mg/500mg Tablet (Metformin)", qty: 1, price: 440, cold: false },
                    ],
                    total: 1540,
                    status: "Delivered",
                    tempLog: "3.6°C (Verified 2°C–8°C Compliant)",
                    otpVerified: "4829",
                    rxId: "RX-DELHI-9921",
                  },
                  {
                    id: "QM-6410",
                    date: "28 Aug 2026, 11:15 AM",
                    pharmacy: "MedPlus Super Pharmacy (Indirapuram Hub)",
                    pharmacyAddress: "Plot 44, Kala Patthar Rd, Indirapuram, Ghaziabad",
                    items: [
                      { name: "Augmentin 625 Duo (Amoxicillin + Clavulanic)", qty: 1, price: 235, cold: false },
                      { name: "Dolo 650mg Paracetamol", qty: 2, price: 150, cold: false },
                    ],
                    total: 385,
                    status: "Delivered",
                    tempLog: "Ambient Safe Room Temp",
                    otpVerified: "7712",
                    rxId: "RX-UP-4402",
                  },
                  {
                    id: "QM-5102",
                    date: "14 Aug 2026, 06:30 PM",
                    pharmacy: "Apollo Express Pharmacy (Raj Nagar Hub)",
                    pharmacyAddress: "Shop 12, RDC Market, Raj Nagar, Ghaziabad",
                    items: [
                      { name: "Human Mixtard 30/70 100IU/ml Cartridge", qty: 1, price: 620, cold: true },
                      { name: "Amaryl 2mg (Glimepiride)", qty: 1, price: 300, cold: false },
                    ],
                    total: 920,
                    status: "Delivered",
                    tempLog: "4.1°C (Verified 2°C–8°C Compliant)",
                    otpVerified: "9103",
                    rxId: "RX-UP-1892",
                  },
                ].map((order) => (
                  <Card key={order.id} className="bg-white border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {order.id}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{order.date}</span>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                            ✓ {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Total Paid:</span>
                          <span className="font-mono font-black text-base text-slate-900">₹{order.total}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="text-xs text-slate-600 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <strong className="text-slate-800">{order.pharmacy}</strong>
                            <span className="text-slate-400">• {order.pharmacyAddress}</span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <Pill className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="font-bold text-slate-800">{item.name}</span>
                                  <span className="text-slate-500 font-medium">× {item.qty}</span>
                                  {item.cold && (
                                    <Badge variant="outline" className="text-[9px] border-cyan-300 text-cyan-800 bg-cyan-50 py-0">
                                      ❄️ 2°C–8°C
                                    </Badge>
                                  )}
                                </div>
                                <span className="font-mono font-bold text-slate-700">₹{item.price}</span>
                              </div>
                            ))}
                          </div>

                          {/* Cold Chain & OTP telemetry stamp */}
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 font-medium">
                              <Thermometer className="w-3 h-3 text-cyan-600" /> {order.tempLog}
                            </span>
                            <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> OTP {order.otpVerified} Verified
                            </span>
                            <span className="text-slate-400">Rx ID: {order.rxId}</span>
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div className="flex sm:flex-col gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => {
                              order.items.forEach((it) => {
                                addToCart({
                                  id: `reorder-${it.name.toLowerCase().replace(/\s+/g, "-")}`,
                                  name: it.name,
                                  genericName: "Prescribed Formula",
                                  price: it.price / it.qty,
                                  requiresColdChain: it.cold,
                                });
                              });
                              setIsCartModalOpen(true);
                              toast.success(`Items from order ${order.id} re-added to Cart!`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" /> 1-Click Re-Order
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast.success(`Official GST Tax Invoice for ${order.id} downloaded!`);
                            }}
                            className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" /> Download Invoice
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* TAB CONTENT: DELIVERY HISTORY (RIDER) */}
            <TabsContent value="rider-history" className="mt-8 space-y-6">
              <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-500 text-slate-950 font-bold text-xs uppercase px-2.5 py-0.5">
                      Courier Dispatch Log
                    </Badge>
                    <span className="text-xs text-cyan-300 font-mono">EV Cold-Box Fleet</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mt-1">Completed Delivery Runs</h3>
                  <p className="text-xs text-cyan-100/80 max-w-xl">
                    Historical log of completed hyperlocal deliveries across Ghaziabad, cold-chain compliance certificates, and rider earnings.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 text-center">
                    <span className="text-[10px] text-cyan-200 block font-bold uppercase">Trips Done</span>
                    <span className="text-lg font-black font-mono">48</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 text-center">
                    <span className="text-[10px] text-cyan-200 block font-bold uppercase">Total Payout</span>
                    <span className="text-lg font-black font-mono text-emerald-300">₹3,840</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 text-center">
                    <span className="text-[10px] text-cyan-200 block font-bold uppercase">Avg Time</span>
                    <span className="text-lg font-black font-mono">26m</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 text-center">
                    <span className="text-[10px] text-cyan-200 block font-bold uppercase">Cold Chain</span>
                    <span className="text-lg font-black font-mono text-cyan-300">100%</span>
                  </div>
                </div>
              </div>

              {/* Rider Shift Trips Table */}
              <Card className="bg-white border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-emerald-600" /> Delivery Trip Archive
                    </CardTitle>
                    <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-xs">
                      Ghaziabad Operational Zone
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {[
                    {
                      tripId: "DL-9821",
                      customer: "Sarah Chen",
                      address: "Flat 402, Shipra Sun City, Indirapuram",
                      medicines: "Lantus Solostar Pen & Janumet",
                      distance: "4.2 km",
                      duration: "24 mins",
                      payout: 85,
                      otp: "4829",
                      tempAvg: "3.6°C",
                      completedAt: "Yesterday, 03:09 PM",
                    },
                    {
                      tripId: "DL-9750",
                      customer: "Amit Verma",
                      address: "Tower B, Raj Nagar Extension, Ghaziabad",
                      medicines: "Cardiac Support Care Kit",
                      distance: "6.8 km",
                      duration: "31 mins",
                      payout: 95,
                      otp: "6192",
                      tempAvg: "Ambient (24°C)",
                      completedAt: "Yesterday, 12:42 PM",
                    },
                    {
                      tripId: "DL-9620",
                      customer: "Neha Sharma",
                      address: "Sector 4, Vasundhara, Ghaziabad",
                      medicines: "Insulin Glargine & Sterile Syringes",
                      distance: "5.1 km",
                      duration: "28 mins",
                      payout: 90,
                      otp: "8831",
                      tempAvg: "4.1°C",
                      completedAt: "28 Aug 2026, 05:20 PM",
                    },
                    {
                      tripId: "DL-9410",
                      customer: "Rajesh Khanna",
                      address: "Block C, Kavi Nagar, Ghaziabad",
                      medicines: "Augmentin Duo & Multivitamins",
                      distance: "3.4 km",
                      duration: "21 mins",
                      payout: 80,
                      otp: "2201",
                      tempAvg: "Ambient",
                      completedAt: "28 Aug 2026, 01:10 PM",
                    },
                  ].map((trip) => (
                    <div key={trip.tripId} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-emerald-300 transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                            #{trip.tripId}
                          </span>
                          <strong className="text-slate-900 text-sm">{trip.customer}</strong>
                          <span className="text-xs text-slate-500">• {trip.address}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{trip.medicines}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                          <span>⏱️ {trip.duration} ({trip.distance})</span>
                          <span className="font-mono text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                            ❄️ {trip.tempAvg}
                          </span>
                          <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            ✓ OTP {trip.otp}
                          </span>
                          <span className="text-slate-400">{trip.completedAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-0 border-slate-200">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase block font-bold">Rider Payout</span>
                          <span className="font-mono font-black text-emerald-700 text-base">₹{trip.payout}</span>
                        </div>
                        <Badge className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1">
                          Completed ✓
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTENT: CUSTOMER ORDERS DIRECTORY (PHARMACY & ADMIN) */}
            <TabsContent value="customer-orders" className="mt-8 space-y-6">
              <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-950 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500 text-white font-bold text-xs uppercase px-2.5 py-0.5">
                      Customer Directory & Order History
                    </Badge>
                    <span className="text-xs text-emerald-300 font-mono">Store Fulfillment CRM</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mt-1">Prescription Customer Records</h3>
                  <p className="text-xs text-emerald-100/80 max-w-xl">
                    Full registry of patients, verified prescription documents, order fulfillment statuses, and courier handover audit trails.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
                    <span className="text-xs text-emerald-200 block font-bold">Active Customers</span>
                    <span className="text-xl font-black font-mono">4 Patients</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
                    <span className="text-xs text-emerald-200 block font-bold">Rx Fulfillments</span>
                    <span className="text-xl font-black font-mono text-emerald-300">12 Orders</span>
                  </div>
                </div>
              </div>

              {/* Customer Records Table */}
              <Card className="bg-white border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" /> Patient Order Fulfillment Roster
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Licensed retail pharmacies must retain digital order records under CDSCO Schedule H regulations.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {[
                    {
                      name: "Sarah Chen",
                      phone: "+91 98765 43210",
                      email: "sarah.chen@arogyaswift.in",
                      address: "Flat 402, Shipra Sun City, Indirapuram, Ghaziabad",
                      orderId: "QM-7821",
                      totalAmount: 1540,
                      medicines: "Lantus Solostar 100IU/ml Pen, Janumet 50/500mg",
                      rxVerified: "CDSCO Verified #UP-7721",
                      status: "Delivered",
                      deliveryRider: "Ramesh K. (KA-01-EV-9821)",
                      date: "02 Sep 2026",
                    },
                    {
                      name: "Amit Verma",
                      phone: "+91 98765 22334",
                      email: "amit.verma@gmail.com",
                      address: "Tower B, Raj Nagar Extension, Ghaziabad",
                      orderId: "QM-9750",
                      totalAmount: 680,
                      medicines: "Ecosprin 75mg, Atorva 20mg, Sorbitrate 5mg",
                      rxVerified: "CDSCO Verified #UP-4491",
                      status: "Delivered",
                      deliveryRider: "Suresh P. (KA-01-EV-4412)",
                      date: "01 Sep 2026",
                    },
                    {
                      name: "Neha Sharma",
                      phone: "+91 98765 33445",
                      email: "neha.sharma@outlook.com",
                      address: "Sector 4, Vasundhara, Ghaziabad",
                      orderId: "QM-9620",
                      totalAmount: 920,
                      medicines: "Insulin Glargine 100IU Cartridge, BD Syringes",
                      rxVerified: "CDSCO Verified #UP-8812",
                      status: "Delivered",
                      deliveryRider: "Ramesh K. (KA-01-EV-9821)",
                      date: "28 Aug 2026",
                    },
                    {
                      name: "Rajesh Khanna",
                      phone: "+91 98765 99112",
                      email: "rajesh.khanna@yahoo.com",
                      address: "Block C, Kavi Nagar, Ghaziabad",
                      orderId: "QM-6410",
                      totalAmount: 385,
                      medicines: "Augmentin 625 Duo, Dolo 650mg Paracetamol",
                      rxVerified: "CDSCO Verified #UP-1102",
                      status: "Delivered",
                      deliveryRider: "Vikram S. (KA-01-EV-7721)",
                      date: "28 Aug 2026",
                    },
                  ].map((cust, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 hover:border-emerald-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center border border-emerald-300">
                            {cust.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{cust.name}</h4>
                            <p className="text-xs text-slate-500">{cust.phone} • {cust.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Order:</span>
                          <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">{cust.orderId}</span>
                          <Badge className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5">
                            {cust.status} ✓
                          </Badge>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Delivery Address</span>
                          <p className="text-slate-800 font-medium">{cust.address}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Dispensed Medicines</span>
                          <p className="text-slate-800 font-semibold">{cust.medicines}</p>
                          <span className="text-emerald-700 font-bold block">Paid: ₹{cust.totalAmount}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Fulfillment Audit</span>
                          <p className="text-slate-700 font-mono">{cust.rxVerified}</p>
                          <p className="text-slate-500 text-[11px]">Courier: {cust.deliveryRider}</p>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/60">
                        <span className="text-slate-500 text-[11px]">Fulfilled on: {cust.date}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast.success(`Opening CDSCO Rx File for ${cust.name}`);
                              setIsPreviewModalOpen(true);
                            }}
                            className="h-7 text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                          >
                            <Eye className="w-3 h-3 mr-1" /> View Prescription
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => toast.info(`Printing CDSCO Pharmacy Dispense Slip for ${cust.orderId}`)}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          >
                            <Printer className="w-3 h-3 mr-1" /> Print Slip
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
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

      {/* AROGYASWIFT SHOPPING CART MODAL */}
      <Dialog open={isCartModalOpen} onOpenChange={setIsCartModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white text-slate-900 border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-md shadow-emerald-600/20">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    Your Prescription Cart
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 text-xs">
                    {cartCount} item(s) selected for hyperlocal pharmacy dispatch
                  </DialogDescription>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold px-3 py-1 text-xs">
                {cartCount} Items
              </Badge>
            </div>
          </DialogHeader>

          {cartItems.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Your Cart is Empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Scan a prescription or browse medicines to add items to your cart.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-3">
              {/* Itemized Cart List */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-bold text-slate-900 text-sm">{item.name}</h5>
                        {item.requiresColdChain && (
                          <Badge variant="outline" className="border-cyan-300 text-cyan-800 bg-cyan-50 text-[10px] shrink-0 font-semibold">
                            ❄️ 2°C–8°C Cold Storage
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{item.genericName}</p>
                      <span className="text-xs font-extrabold text-emerald-700 block">₹{item.price} per unit</span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center justify-center text-xs transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono font-extrabold text-sm text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center justify-center text-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-mono font-extrabold text-slate-900 text-base min-w-[70px] text-right">
                        ₹{item.price * item.quantity}
                      </span>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cold-Chain Compliance Banner */}
              {cartItems.some((i) => i.requiresColdChain) && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-900 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Includes insulated cold-storage items (2°C–8°C). ArogyaSwift temperature telemetry active.</span>
                </div>
              )}

              {/* Cart Pricing Breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Cart Items Subtotal ({cartCount} units)</span>
                  <span className="font-mono font-bold text-slate-900">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Hyperlocal Express Courier Fee</span>
                  <span className="text-emerald-700 font-bold">FREE ✓</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                  <span>Total Amount Payable</span>
                  <span className="text-xl font-mono text-emerald-700">₹{cartTotal}</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setIsCartModalOpen(false);
                  setActiveTab("dispatch");
                  toast.success("Proceeding to Hyperlocal Pharmacy Hub Dispatch!");
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Pharmacy Sourcing</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comprehensive Legal, Compliance & Support Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 pt-12 pb-8 text-xs mt-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
            {/* Col 1: Brand */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600 rounded-lg text-white">
                  <Pill className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-white tracking-tight">ArogyaSwift</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px]">
                  Licensed Network
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Hyperlocal cold-chain pharmaceutical delivery network. 10–15 minute express dispatch with 2-step OTP chain of custody and CDSCO Schedule H compliance.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span>CDSCO Compliant</span> • <span>DPDP Act 2023</span> • <span>Drugs & Cosmetics Act 1940</span>
              </div>
            </div>

            {/* Col 2: Legal & Governance */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-200 text-xs uppercase tracking-wider block">Legal & Governance</span>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button onClick={() => openLegalPolicy("privacy")} className="hover:text-emerald-400 text-left transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("terms")} className="hover:text-emerald-400 text-left transition-colors">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("dpa")} className="hover:text-emerald-400 text-left transition-colors">
                    Data Processing Agreement (DPA)
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("acceptable-use")} className="hover:text-emerald-400 text-left transition-colors">
                    Acceptable Use Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("disclaimer")} className="hover:text-emerald-400 text-left transition-colors">
                    Medical Disclaimer
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("accessibility")} className="hover:text-emerald-400 text-left transition-colors">
                    Accessibility Statement
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Logistics & SLAs */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-200 text-xs uppercase tracking-wider block">Logistics & SLAs</span>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button onClick={() => openLegalPolicy("shipping")} className="hover:text-emerald-400 text-left transition-colors">
                    Shipping & Delivery Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("refund")} className="hover:text-emerald-400 text-left transition-colors">
                    100% Refund Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("cancellation")} className="hover:text-emerald-400 text-left transition-colors">
                    Cancellation Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("return-exchange")} className="hover:text-emerald-400 text-left transition-colors">
                    Return & Exchange Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("customer-lifecycle")} className="hover:text-emerald-400 text-left transition-colors">
                    Customer Lifecycle Guide
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Security & Support */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-200 text-xs uppercase tracking-wider block">Security & Help</span>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button onClick={() => openLegalPolicy("security")} className="hover:text-emerald-400 text-left transition-colors">
                    Security Policy & Architecture
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("responsible-disclosure")} className="hover:text-emerald-400 text-left transition-colors">
                    Responsible Disclosure
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("cookie")} className="hover:text-emerald-400 text-left transition-colors">
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsCookiePreferencesOpen(true)} className="hover:text-emerald-400 text-left transition-colors font-semibold text-emerald-400">
                    ⚙️ Cookie Preferences
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalPolicy("community-guidelines")} className="hover:text-emerald-400 text-left transition-colors">
                    Community Guidelines
                  </button>
                </li>
                <li>
                  <button onClick={openHelpCenter} className="hover:text-emerald-400 text-left transition-colors font-semibold text-emerald-300">
                    Help Center & FAQs
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Sub-Footer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              © 2026 ArogyaSwift Healthcare Technologies Inc. All rights reserved. Registered under Drugs and Cosmetics Act.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAccountSettingsOpen(true)}
                className="text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Account Settings
              </button>
              •
              <button
                type="button"
                onClick={openHelpCenter}
                className="text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Support Center
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



