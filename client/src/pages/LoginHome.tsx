import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  ShieldCheck,
  ArrowRight,
  Lock,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function LoginHome() {
  const [, setLocation] = useLocation();
  const {
    setAuthModalRole,
    setIsAuthModalOpen,
    setIsOwnerAuthModalOpen,
    setIsPharmacyRegisterModalOpen,
    setIsPhoneSignupModalOpen,
    setPhoneSignupRole,
    setIsDemoModalOpen,
    openLegalPolicy,
    openHelpCenter,
    setIsCookiePreferencesOpen,
    setIsOnboardingOpen,
    setIsHelpCenterOpen,
    setIsAccountSettingsOpen
  } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 py-3.5">
        <div className="container mx-auto px-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/20">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                ArogyaSwift <span className="text-emerald-600">Quick Delivery</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Hyperlocal Cold-Chain Medicine Network</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOnboardingOpen(true)}
              className="text-xs h-8 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
            >
              ⚡ How It Works
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openHelpCenter}
              className="text-xs h-8 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
            >
              Help & FAQs
            </Button>
            <Button
              size="sm"
              onClick={() => setIsDemoModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs h-8 shadow-sm"
            >
              ⚡ Live Demo Simulator
            </Button>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="py-8 sm:py-12 flex-1 flex items-center">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-3">
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 px-3 py-1 text-xs uppercase font-bold tracking-wider">
              Select Login Role
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome to ArogyaSwift <span className="text-emerald-600">Medicine Platform</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Choose your role below to enter the live interactive portal tailored for Patients, Licensed Pharmacy Partners, or Express Delivery Riders.
            </p>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="grid md:grid-cols-3 gap-8">
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

              <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-2">
                <Button
                  onClick={() => {
                    setAuthModalRole("patient");
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 shadow-sm"
                >
                  Sign In as Patient <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhoneSignupRole("patient");
                    setIsPhoneSignupModalOpen(true);
                  }}
                  className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100 font-bold py-4 text-xs"
                >
                  📱 Sign Up Patient with Phone
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
                <Button
                  onClick={() => {
                    setAuthModalRole("pharmacy");
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 shadow-sm"
                >
                  Sign In as Pharmacy Store <ArrowRight className="w-4 h-4 ml-1" />
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

              <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-2">
                <Button
                  onClick={() => {
                    setAuthModalRole("rider");
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-5 shadow-sm"
                >
                  Sign In as Rider Courier <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhoneSignupRole("rider");
                    setIsPhoneSignupModalOpen(true);
                  }}
                  className="w-full border-cyan-300 text-cyan-700 hover:bg-cyan-100 font-bold py-4 text-xs"
                >
                  📱 Sign Up Rider with Phone
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Comprehensive Legal, Compliance & Support Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 pt-12 pb-8 text-xs">
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
                Next-generation hyperlocal pharmaceutical rapid fulfillment network. Sub-15 minute delivery of prescription medicines, cold-chain biologics (2°C–8°C), and dual-OTP custody verification.
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

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsOwnerAuthModalOpen(true)}
                className="text-[11px] text-slate-400 hover:text-purple-400 font-mono flex items-center gap-1 transition-colors"
                title="Restricted Platform Owner Portal Access"
              >
                <Lock className="w-3 h-3 text-slate-400" /> Platform Owner Gate
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
