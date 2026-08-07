import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Navigation, Bike, Building2, Home, Thermometer, ShieldCheck, Play, Pause, RotateCcw, Zap, Signal } from "lucide-react";

interface LiveTrackingMapProps {
  pharmacyName?: string;
  patientAddress?: string;
  riderName?: string;
  orderStage?: number;
  riderProgress?: number;
  coldTemp?: number;
}

export function LiveTrackingMap({
  pharmacyName = "Apollo Express Pharmacy (Indiranagar)",
  patientAddress = "Flat 402, Green Glen Layout, Indiranagar",
  riderName = "Vikram Singh (Courier #R-4402)",
  orderStage = 4,
  riderProgress = 60,
  coldTemp = 3.8
}: LiveTrackingMapProps) {
  const [progress, setProgress] = useState(riderProgress);
  const [isLiveMoving, setIsLiveMoving] = useState(true);
  const [currentTemp, setCurrentTemp] = useState(coldTemp);
  const [riderSpeed, setRiderSpeed] = useState(24);

  // Sync external progress
  useEffect(() => {
    setProgress(riderProgress);
  }, [riderProgress]);

  // Simulate smooth GPS movement & temperature updates
  useEffect(() => {
    if (!isLiveMoving) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 1 : 15));
      setCurrentTemp((prev) => +(3.6 + Math.random() * 0.8).toFixed(1));
      setRiderSpeed((prev) => Math.floor(22 + Math.random() * 6));
    }, 1200);
    return () => clearInterval(interval);
  }, [isLiveMoving]);

  // Calculate SVG marker coordinates along a curved road path
  const pathX = 100 + (progress / 100) * 600;
  const pathY = 220 - Math.sin((progress / 100) * Math.PI * 2) * 40;

  return (
    <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative">
      {/* Top Map Status Bar */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 animate-pulse">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">Live GPS Delivery Tracking</h4>
              <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase">
                <Signal className="w-3 h-3 mr-1 animate-pulse" /> Active Satellite Link
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Rider: <strong className="text-slate-200">{riderName}</strong></p>
          </div>
        </div>

        {/* Cold Chain Telemetry Gauge */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
          <Thermometer className="w-4 h-4 text-cyan-400 animate-bounce" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Cold Storage Temp</div>
            <div className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1">
              {currentTemp}°C <span className="text-[9px] text-emerald-400 font-normal">(Safe: 2°C–8°C)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Visualizer Canvas */}
      <div className="relative w-full h-[360px] bg-slate-950 overflow-hidden">
        {/* Grid lines map background styling */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
        
        {/* Animated Polyline Route Canvas */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Road Path Line */}
          <path
            d="M 100 220 C 250 140, 450 300, 700 220"
            fill="none"
            stroke="#334155"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 100 220 C 250 140, 450 300, 700 220"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="8 6"
            className="animate-[dash_20s_linear_infinite]"
          />
        </svg>

        {/* 1. Pharmacy Pickup Hub Pin (Start: X=100, Y=220) */}
        <div className="absolute top-[180px] left-[60px] flex flex-col items-center z-10">
          <div className="bg-emerald-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white shadow-emerald-500/30 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="mt-1 bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
            📍 Pickup: {pharmacyName.split(" ")[0]} Hub
          </div>
        </div>

        {/* 2. Destination Patient Home Pin (End: X=700, Y=220) */}
        <div className="absolute top-[180px] right-[60px] flex flex-col items-center z-10">
          <div className="bg-indigo-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white shadow-indigo-500/30 flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div className="mt-1 bg-slate-900/90 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
            🏠 Destination: Patient Home
          </div>
        </div>

        {/* 3. Live Moving Rider Pin */}
        <div
          className="absolute z-20 transition-all duration-700 ease-out flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pathX}px`, top: `${pathY}px` }}
        >
          {/* Temperature Telemetry Floating Badge above rider */}
          <div className="mb-1 bg-cyan-950 border border-cyan-400 text-cyan-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
            <Thermometer className="w-3 h-3 text-cyan-400" /> {currentTemp}°C Cold Box
          </div>

          {/* Rider Icon */}
          <div className="relative">
            <div className="w-11 h-11 bg-gradient-to-tr from-cyan-600 to-emerald-500 rounded-full p-0.5 shadow-xl border-2 border-white flex items-center justify-center text-white">
              <Bike className="w-6 h-6 animate-bounce" />
            </div>
            {/* Pulsing GPS ring */}
            <span className="absolute -inset-1 rounded-full bg-cyan-400/40 animate-ping pointer-events-none" />
          </div>

          <div className="mt-1 bg-slate-950/90 border border-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
            🏍️ {riderSpeed} km/h
          </div>
        </div>
      </div>

      {/* Bottom Route Telemetry Info Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-500 text-[10px] font-semibold uppercase block">Distance Remaining</span>
          <span className="text-slate-100 font-bold text-sm font-mono">{((100 - progress) * 0.03).toFixed(1)} km</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] font-semibold uppercase block">Estimated Delivery</span>
          <span className="text-emerald-400 font-bold text-sm font-mono">~{Math.max(2, Math.ceil((100 - progress) * 0.15))} mins</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] font-semibold uppercase block">Current Speed</span>
          <span className="text-cyan-300 font-bold text-sm font-mono">{riderSpeed} km/h</span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsLiveMoving(!isLiveMoving)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-8"
          >
            {isLiveMoving ? <Pause className="w-3.5 h-3.5 mr-1 text-amber-400" /> : <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" />}
            {isLiveMoving ? "Pause" : "Live"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setProgress(10)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-8"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
