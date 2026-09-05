import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Zap,
  Thermometer,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function LiveOrderDemoModal() {
  const {
    isDemoModalOpen,
    setIsDemoModalOpen,
    currentOrder,
    updateOrderStatus,
    verifyPickupOtp,
    verifyDeliveryOtp,
    resetDemoOrder,
    quickSwitchRole,
  } = useAuth();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [pickupInput, setPickupInput] = useState("");
  const [deliveryInput, setDeliveryInput] = useState("");

  const currentStatus = currentOrder?.status || "placed";

  const STAGES = [
    {
      key: "placed",
      stepNum: 1,
      name: "1. Patient Orders Medicine",
      desc: "Patient Sarah Chen places order for Lantus Solostar & Janumet with Apollo Pharmacy.",
      activeRole: "patient",
    },
    {
      key: "confirmed_preparing",
      stepNum: 2,
      name: "2. Pharmacy Store Confirms & Packs",
      desc: "Apollo Pharmacy accepts incoming order, verifies prescription & packs cold-chain medicines.",
      activeRole: "pharmacy",
    },
    {
      key: "ready_to_dispatch",
      stepNum: 3,
      name: "3. Ready for Dispatch (Search Rider)",
      desc: "Store marks package ready. Hyperlocal routing engine searches for express delivery partner.",
      activeRole: "pharmacy",
    },
    {
      key: "rider_assigned",
      stepNum: 4,
      name: "4. Delivery Rider Accepts Order",
      desc: "Rider Vikram Singh accepts dispatch request and navigates to Apollo Pharmacy Hub.",
      activeRole: "rider",
    },
    {
      key: "out_for_delivery",
      stepNum: 5,
      name: "5. Store Pickup OTP Verified",
      desc: "Rider inputs Store Pickup OTP (8514). Pharmacist releases package. Out for delivery!",
      activeRole: "rider",
    },
    {
      key: "delivered",
      stepNum: 6,
      name: "6. Customer Delivery OTP Verified",
      desc: "Rider arrives at Sarah's doorstep, takes Customer OTP (4829). Order delivered successfully!",
      activeRole: "patient",
    },
  ];

  const currentStageIndex = STAGES.findIndex((s) => s.key === currentStatus);
  const activeStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  // Auto-advance demo when playing
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      const delay = playbackSpeed === 1 ? 5000 : 2500;
      timer = setTimeout(async () => {
        if (!currentOrder) return;
        if (currentStatus === "placed") {
          await updateOrderStatus(currentOrder.id, "confirmed_preparing");
          toast.info("🏥 Pharmacy Store confirmed order! Preparing medicine package.");
        } else if (currentStatus === "confirmed_preparing") {
          await updateOrderStatus(currentOrder.id, "ready_to_dispatch");
          toast.info("📦 Store marked ready to dispatch! Searching for nearby rider...");
        } else if (currentStatus === "ready_to_dispatch" || currentStatus === "searching_rider") {
          await updateOrderStatus(currentOrder.id, "rider_assigned", {
            riderId: "u-rider-303",
            riderName: "Vikram Singh",
            riderPhone: "+91 98765 99887",
            riderVehicle: "EV Scooter (UP-14-EV-7721)",
          });
          toast.info("🏍️ Rider Vikram Singh accepted delivery request!");
        } else if (currentStatus === "rider_assigned" || currentStatus === "at_pharmacy") {
          await verifyPickupOtp(currentOrder.id, "8514");
          toast.success("🔐 Store Pickup OTP (8514) verified! Out for delivery.");
        } else if (currentStatus === "picked_up" || currentStatus === "out_for_delivery") {
          await verifyDeliveryOtp(currentOrder.id, "4829");
          toast.success("🎉 Customer Delivery OTP (4829) verified! Doorstep delivery complete.");
          setIsPlaying(false);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStatus, currentOrder, playbackSpeed]);

  const handleStepForward = async () => {
    if (!currentOrder) return;
    if (currentStatus === "placed") {
      await updateOrderStatus(currentOrder.id, "confirmed_preparing");
    } else if (currentStatus === "confirmed_preparing") {
      await updateOrderStatus(currentOrder.id, "ready_to_dispatch");
    } else if (currentStatus === "ready_to_dispatch" || currentStatus === "searching_rider") {
      await updateOrderStatus(currentOrder.id, "rider_assigned", {
        riderId: "u-rider-303",
        riderName: "Vikram Singh",
        riderPhone: "+91 98765 99887",
        riderVehicle: "EV Scooter (UP-14-EV-7721)",
      });
    } else if (currentStatus === "rider_assigned" || currentStatus === "at_pharmacy") {
      await verifyPickupOtp(currentOrder.id, "8514");
    } else if (currentStatus === "picked_up" || currentStatus === "out_for_delivery") {
      await verifyDeliveryOtp(currentOrder.id, "4829");
    }
  };

  const handleStepBack = async () => {
    if (!currentOrder) return;
    if (currentStatus === "delivered") {
      await updateOrderStatus(currentOrder.id, "out_for_delivery");
    } else if (currentStatus === "out_for_delivery" || currentStatus === "picked_up") {
      await updateOrderStatus(currentOrder.id, "rider_assigned");
    } else if (currentStatus === "rider_assigned" || currentStatus === "at_pharmacy") {
      await updateOrderStatus(currentOrder.id, "ready_to_dispatch");
    } else if (currentStatus === "ready_to_dispatch") {
      await updateOrderStatus(currentOrder.id, "confirmed_preparing");
    } else if (currentStatus === "confirmed_preparing") {
      await updateOrderStatus(currentOrder.id, "placed");
    }
  };

  const handleManualPickup = async () => {
    if (!currentOrder) return;
    const res = await verifyPickupOtp(currentOrder.id, pickupInput || "8514");
    if (res.success) {
      toast.success(res.message);
      setPickupInput("");
    } else {
      toast.error(res.error);
    }
  };

  const handleManualDelivery = async () => {
    if (!currentOrder) return;
    const res = await verifyDeliveryOtp(currentOrder.id, deliveryInput || "4829");
    if (res.success) {
      toast.success(res.message);
      setDeliveryInput("");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
      <DialogContent className="max-w-6xl w-[96vw] max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-900 text-slate-100 border-slate-700 shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500 text-slate-950 font-black text-xs uppercase px-2 py-0.5 tracking-wider">
                  <Zap className="w-3 h-3 mr-1 fill-current" /> Live Multi-Portal Showcase
                </Badge>
                <span className="text-xs text-slate-400 font-mono">Order #{currentOrder?.id || "AS-7821"}</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                Order-to-Delivery Real-Time Sequence
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Watch how Patient, Pharmacy Store, and Delivery Partner synchronize seamlessly with 2-step OTP verification.
              </DialogDescription>
            </div>

            {/* Playback Controls Toolbar */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 p-1.5 rounded-2xl">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleStepBack}
                disabled={activeStageIndex === 0 || isPlaying}
                title="Previous Stage"
                className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`h-8 px-3 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                  isPlaying
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                    : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" /> Pause Demo
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Run Auto Demo
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleStepForward}
                disabled={activeStageIndex >= STAGES.length - 1 || isPlaying}
                title="Next Stage"
                className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
                title="Playback Speed"
                className="h-8 px-2 text-xs font-mono font-bold text-emerald-400 hover:bg-slate-700"
              >
                {playbackSpeed}x
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  setIsPlaying(false);
                  await resetDemoOrder();
                  toast.info("Demo order reset to starting stage.");
                }}
                title="Reset Demo Order"
                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="pt-4">
            <div className="grid grid-cols-6 gap-1.5">
              {STAGES.map((stage, idx) => {
                const isPast = idx < activeStageIndex;
                const isCurrent = idx === activeStageIndex;
                return (
                  <div
                    key={stage.key}
                    className={`rounded-lg p-2 text-center transition-all cursor-pointer border ${
                      isCurrent
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40"
                        : isPast
                        ? "bg-slate-800/80 border-slate-700 text-slate-300"
                        : "bg-slate-900/60 border-slate-800/60 text-slate-600"
                    }`}
                    onClick={async () => {
                      setIsPlaying(false);
                      if (!currentOrder) return;
                      await updateOrderStatus(currentOrder.id, stage.key as any);
                    }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isPast ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold">{stage.stepNum}</span>
                      )}
                      <span className="text-[10px] font-bold truncate hidden md:inline">
                        {stage.name.split(" ")[1]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-slate-300 flex items-center justify-between">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active Stage: {STAGES[activeStageIndex]?.name}
              </span>
              <span className="text-[11px] text-slate-400">
                {STAGES[activeStageIndex]?.desc}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* 3-Column Split View: Patient | Pharmacy | Rider */}
        <div className="grid lg:grid-cols-3 gap-4 pt-2">
          {/* COLUMN 1: PATIENT PORTAL SCREEN */}
          <div className={`p-4 rounded-2xl border transition-all ${
            activeStageIndex === 0 || activeStageIndex === 5
              ? "bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
              : "bg-slate-800/40 border-slate-700/60 opacity-90"
          }`}>
            <div className="flex items-center justify-between border-b border-slate-700 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">👩‍💼</span>
                <div>
                  <h4 className="font-bold text-sm text-white">Patient Portal</h4>
                  <p className="text-[10px] text-slate-400">Sarah Chen • Indirapuram</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  quickSwitchRole("patient");
                  setIsDemoModalOpen(false);
                }}
                className="h-6 text-[10px] px-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20"
              >
                Switch View ➔
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Patient Order Items */}
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase font-bold">
                  <span>Prescription Items</span>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[9px] px-1 py-0">
                    <Thermometer className="w-2.5 h-2.5 mr-0.5" /> 2°C - 8°C Cold Chain
                  </Badge>
                </div>
                <div className="text-[11px] font-medium text-slate-200">
                  • Lantus Solostar 100IU/ml Pen (Qty: 1)
                </div>
                <div className="text-[11px] font-medium text-slate-200">
                  • Janumet 50/500mg Tablets (Qty: 60)
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400">
                  <span>Total: ₹1,575</span>
                  <span className="text-emerald-400 font-bold">Paid Online ✓</span>
                </div>
              </div>

              {/* Patient Delivery Status Card */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Live Order Tracker
                </span>

                {currentStatus === "placed" && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                    <span>Transmitted to Apollo Pharmacy. Awaiting store confirmation.</span>
                  </div>
                )}

                {currentStatus === "confirmed_preparing" && (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pharmacy accepted order! Medicines being packed with ice gel kit.</span>
                  </div>
                )}

                {(currentStatus === "ready_to_dispatch" || currentStatus === "searching_rider") && (
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-300 text-[11px] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400 animate-bounce shrink-0" />
                    <span>Searching nearest delivery rider within 2.5 km...</span>
                  </div>
                )}

                {(currentStatus === "rider_assigned" || currentStatus === "at_pharmacy") && (
                  <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-[11px] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Rider Vikram Singh assigned. Arriving at pharmacy for pickup.</span>
                  </div>
                )}

                {(currentStatus === "out_for_delivery" || currentStatus === "picked_up") && (
                  <div className="space-y-2">
                    <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-400 animate-bounce shrink-0" />
                      <span>Rider Vikram Singh is en route with your cold-chain box!</span>
                    </div>

                    {/* Customer Delivery OTP Highlight */}
                    <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-center space-y-1">
                      <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">
                        Your Doorstep Delivery OTP
                      </span>
                      <span className="text-3xl font-mono font-black text-amber-400 tracking-widest block">
                        4829
                      </span>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Give this 4-digit code to rider upon doorstep delivery to verify package receipt.
                      </p>
                    </div>
                  </div>
                )}

                {currentStatus === "delivered" && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-center space-y-1 text-emerald-300">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                    <span className="font-bold text-xs block">Order Delivered Successfully!</span>
                    <p className="text-[10px] text-slate-300">
                      OTP 4829 verified. Medicines received safely at 4.2°C.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: PHARMACY STORE PORTAL SCREEN */}
          <div className={`p-4 rounded-2xl border transition-all ${
            activeStageIndex === 1 || activeStageIndex === 2
              ? "bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
              : "bg-slate-800/40 border-slate-700/60 opacity-90"
          }`}>
            <div className="flex items-center justify-between border-b border-slate-700 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏥</span>
                <div>
                  <h4 className="font-bold text-sm text-white">Pharmacy Hub Portal</h4>
                  <p className="text-[10px] text-slate-400">Apollo Express • Raj Nagar</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  quickSwitchRole("pharmacy");
                  setIsDemoModalOpen(false);
                }}
                className="h-6 text-[10px] px-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20"
              >
                Switch View ➔
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Incoming Order Card */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">Order #{currentOrder?.id || "AS-7821"}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                    {currentStatus.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <p>Patient: <strong className="text-white">Sarah Chen</strong></p>
                  <p>Prescription: <span className="text-emerald-400 font-mono text-[10px]">Valid CDSCO Rx #UP-7721 ✓</span></p>
                  <p>Handling: <span className="text-cyan-300">Insulated Gel Pack Required</span></p>
                </div>

                {/* Actions based on stage */}
                {currentStatus === "placed" && (
                  <Button
                    onClick={async () => {
                      if (!currentOrder) return;
                      await updateOrderStatus(currentOrder.id, "confirmed_preparing");
                      toast.success("Pharmacy confirmed order! Packing started.");
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8"
                  >
                    Confirm & Start Packing 📦
                  </Button>
                )}

                {currentStatus === "confirmed_preparing" && (
                  <Button
                    onClick={async () => {
                      if (!currentOrder) return;
                      await updateOrderStatus(currentOrder.id, "ready_to_dispatch");
                      toast.success("Marked ready to dispatch! Broadcasted to riders.");
                    }}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs h-8"
                  >
                    Mark Ready for Dispatch 🚀
                  </Button>
                )}

                {/* Pharmacy Store Pickup OTP Display */}
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Store Handover Pickup OTP
                  </span>
                  <span className="text-2xl font-mono font-black text-emerald-400 tracking-widest block">
                    8514
                  </span>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Pharmacist must verify this OTP with Rider Vikram Singh before handing over the medicine package.
                  </p>
                </div>

                {activeStageIndex >= 4 && (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Store Pickup verified (8514). Package handed over to rider.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 3: RIDER DELIVERY PORTAL SCREEN */}
          <div className={`p-4 rounded-2xl border transition-all ${
            activeStageIndex === 3 || activeStageIndex === 4
              ? "bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30"
              : "bg-slate-800/40 border-slate-700/60 opacity-90"
          }`}>
            <div className="flex items-center justify-between border-b border-slate-700 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏍️</span>
                <div>
                  <h4 className="font-bold text-sm text-white">Delivery Partner Portal</h4>
                  <p className="text-[10px] text-slate-400">Vikram Singh • EV Scooter</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  quickSwitchRole("rider");
                  setIsDemoModalOpen(false);
                }}
                className="h-6 text-[10px] px-2 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20"
              >
                Switch View ➔
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Delivery Request / Active Order Card */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Delivery Task #AS-7821</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                    Payout: ₹65
                  </Badge>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Pickup: <strong>Apollo Pharmacy (0.8 km)</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Drop: <strong>Sarah Chen, Indirapuram (2.4 km)</strong></span>
                  </p>
                  <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 pt-0.5">
                    <Thermometer className="w-3 h-3" /> Cold Box Temp: 4.1°C (Safe 2°C-8°C)
                  </p>
                </div>

                {/* Rider Action 1: Accept Dispatch */}
                {(currentStatus === "ready_to_dispatch" || currentStatus === "searching_rider") && (
                  <Button
                    onClick={async () => {
                      if (!currentOrder) return;
                      await updateOrderStatus(currentOrder.id, "rider_assigned", {
                        riderId: "u-rider-303",
                        riderName: "Vikram Singh",
                        riderPhone: "+91 98765 99887",
                        riderVehicle: "EV Scooter (UP-14-EV-7721)",
                      });
                      toast.success("Accepted delivery order! Heading to Apollo Pharmacy Hub.");
                    }}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs h-8"
                  >
                    Accept Delivery Request ⚡
                  </Button>
                )}

                {/* Rider Step 1: Verify Store Pickup OTP (8514) */}
                {(currentStatus === "rider_assigned" || currentStatus === "at_pharmacy") && (
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">
                      Step 1: Store Pickup OTP Verification
                    </span>
                    <p className="text-[10px] text-slate-400">Ask pharmacist for 4-digit code (8514):</p>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Code: 8514"
                        value={pickupInput}
                        onChange={(e) => setPickupInput(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 text-xs font-mono text-white w-28 h-7 text-center font-bold"
                        maxLength={4}
                      />
                      <Button
                        size="sm"
                        onClick={handleManualPickup}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-7 px-3 flex-1"
                      >
                        Verify Pickup ✓
                      </Button>
                    </div>
                  </div>
                )}

                {/* Rider Step 2: Verify Customer Delivery OTP (4829) */}
                {(currentStatus === "out_for_delivery" || currentStatus === "picked_up") && (
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                      Step 2: Customer Delivery OTP Verification
                    </span>
                    <p className="text-[10px] text-slate-400">Ask patient Sarah for 4-digit PIN (4829):</p>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="PIN: 4829"
                        value={deliveryInput}
                        onChange={(e) => setDeliveryInput(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 text-xs font-mono text-white w-28 h-7 text-center font-bold"
                        maxLength={4}
                      />
                      <Button
                        size="sm"
                        onClick={handleManualDelivery}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-7 px-3 flex-1"
                      >
                        Verify & Handover ✓
                      </Button>
                    </div>
                  </div>
                )}

                {currentStatus === "delivered" && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-1 text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                    <span className="font-bold text-xs block">Fulfillment Complete!</span>
                    <p className="text-[10px] text-slate-400">+₹65 added to Vikram Singh's wallet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-2 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            2-Step OTP Authentication ensures zero wrong handovers & cold-chain compliance.
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Jump main portal role:</span>
            <button
              onClick={() => {
                quickSwitchRole("patient");
                setIsDemoModalOpen(false);
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              👩‍💼 Patient
            </button>
            <button
              onClick={() => {
                quickSwitchRole("pharmacy");
                setIsDemoModalOpen(false);
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              🏥 Pharmacy
            </button>
            <button
              onClick={() => {
                quickSwitchRole("rider");
                setIsDemoModalOpen(false);
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              🏍️ Rider
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
