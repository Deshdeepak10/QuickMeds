import React, { useState, useMemo, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Search,
  MessageSquare,
  PhoneCall,
  Mail,
  ChevronDown,
  ChevronUp,
  FileText,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Ticket,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ArrowLeft,
  AlertTriangle,
  Send,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface FAQItem {
  question: string;
  answer: string;
  category: "Prescriptions" | "Delivery & Cold-Chain" | "Dual-OTP" | "Refunds" | "Partners";
}

export default function HelpPage() {
  const [, setLocation] = useLocation();
  const { setIsAiSupportOpen } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState<"urgent" | "normal">("normal");
  const [isTicketSubmitted, setIsTicketSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error("Unable to enter fullscreen mode: " + err.message);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const faqs: FAQItem[] = [
    {
      category: "Prescriptions",
      question: "How does the AI Prescription OCR Scanner work?",
      answer: "When you upload a photo or PDF of your doctor's prescription, our AI Optical Character Recognition instantly detects medicine names, dosage strengths, and frequency. It automatically tags temperature-sensitive drugs (e.g. Lantus Insulin) for cold-chain packaging and flags Schedule H medicines for mandatory pharmacist digital signing.",
    },
    {
      category: "Prescriptions",
      question: "Can I order Schedule H or Schedule H1 drugs without a doctor prescription?",
      answer: "No. Under the Drugs and Cosmetics Act of India, Schedule H and H1 medications strictly require a valid prescription from a Registered Medical Practitioner. Orders cannot be dispatched until a registered pharmacist audits and digitally signs the prescription.",
    },
    {
      category: "Delivery & Cold-Chain",
      question: "How do you achieve 10 to 15 minute medicine delivery?",
      answer: "ArogyaSwift partners with neighborhood licensed retail pharmacy hubs within an optimized 3.5 km radius. When your order is placed, dedicated EV couriers stationed near the hub receive an instant dispatch broadcast, ensuring rapid packaging and immediate transit.",
    },
    {
      category: "Delivery & Cold-Chain",
      question: "How is cold-chain maintained for insulin and vaccines during delivery?",
      answer: "All temperature-sensitive items are packed in vacuum-insulated containers with certified eutectic gel packs maintaining 2°C to 8°C. Delivery riders carry smart cold boxes equipped with temperature telemetry sensors that log real-time thermal readings directly to your live tracking screen.",
    },
    {
      category: "Dual-OTP",
      question: "What is the 2-Step OTP Security Protocol?",
      answer: "ArogyaSwift uses a dual-handshake custody model: (1) Rider enters the Store Pickup OTP (e.g. 8514) at the pharmacy before collecting the medicine. (2) Rider must enter the recipient's private Customer Delivery PIN (e.g. 4829) at your doorstep to confirm the drop. This guarantees tamper-free medicine custody.",
    },
    {
      category: "Refunds",
      question: "What happens if a cold-chain medicine exceeds 8°C during transit?",
      answer: "We offer an unconditional 100% money-back guarantee or immediate free replacement dispatch if the cold box temperature exceeds 8°C, or if the tamper-evident security tape is sliced prior to delivery.",
    },
    {
      category: "Partners",
      question: "How can a retail pharmacy register to become an ArogyaSwift fulfillment hub?",
      answer: "Pharmacy owners can click 'Partner Store Gate' on the home screen and submit their Drug License number, GSTIN, and store address. Our compliance desk completes verification within 24 hours.",
    },
  ];

  const categories = ["All", "Prescriptions", "Delivery & Cold-Chain", "Dual-OTP", "Refunds", "Partners"];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast.error("Please fill in both subject and description.");
      return;
    }
    setIsTicketSubmitted(true);
    toast.success("Support ticket #AS-" + Math.floor(100000 + Math.random() * 900000) + " generated. Our support pharmacist will contact you shortly.");
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/")}
            className="border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all text-xs font-semibold gap-1.5 h-9 px-3 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Platform</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="h-6 w-px bg-slate-700 hidden sm:block" />

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black shadow-md shadow-emerald-900/40 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                ArogyaSwift <span className="text-emerald-400 font-semibold text-xs sm:text-sm">Help & FAQ Center</span>
              </span>
              <span className="text-[10px] text-slate-400 block hidden md:block">
                24/7 Patient Support, FAQs, Clinical Assistance & Priority Ticketing
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAiSupportOpen(true);
            }}
            className="border-emerald-500/50 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-800 hover:text-white text-xs h-8.5 px-3 rounded-xl gap-1.5 font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chat with AI Support</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs h-8.5 px-3 rounded-xl gap-1.5 font-bold"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Emergency Alert Notice */}
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300 font-bold block mb-0.5">Medical Emergency Notice:</strong>
            ArogyaSwift provides rapid medicine delivery. For acute life-threatening situations (severe trauma, chest pain, stroke, unconsciousness), dial <strong>112</strong> or <strong>108</strong> immediately for an ambulance.
          </div>
        </div>

        {/* Hero Banner with Search */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Fast Answers & 24/7 Assistance
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Find answers on prescription OCR digitization, cold-chain temperature telemetry, 2-step OTP verification, and urgent refunds.
          </p>

          <div className="max-w-2xl mx-auto relative pt-2">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Type your question (e.g., how to upload prescription, delivery OTP, refund)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10 py-6 bg-slate-950 border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* FAQs Accordion */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Frequently Asked Questions ({filteredFaqs.length})
            </h2>
            <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
              Updated Live
            </Badge>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <div
                  key={index}
                  className="border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 text-sm font-bold text-slate-100 hover:text-emerald-400 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>{faq.question}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className="bg-slate-800 text-slate-400 border-none text-[10px]">
                        {faq.category}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-900/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Ticket Submission Box */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 text-base font-bold text-white">
            <Ticket className="w-5 h-5 text-emerald-400" />
            <span>Generate a Priority Support Ticket</span>
          </div>
          <p className="text-xs text-slate-400">
            Can't find your answer? Submit an urgent ticket directly to our Clinical Support Desk. A verified pharmacist or operations lead will respond within 15 minutes.
          </p>

          {isTicketSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-emerald-300">Ticket Dispatched Successfully!</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Our support desk has received your ticket. We will send updates via SMS to your registered phone number.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsTicketSubmitted(false);
                  setTicketSubject("");
                  setTicketDescription("");
                }}
                className="mt-2 border-emerald-600 text-emerald-300 text-xs"
              >
                Submit Another Inquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Issue Subject</label>
                <Input
                  placeholder="e.g., Temperature read 9°C on delivery, Prescription rejected..."
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-xs text-slate-100 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Detailed Description</label>
                <textarea
                  rows={4}
                  placeholder="Please provide order ID or describe what occurred..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Priority:</span>
                  <button
                    type="button"
                    onClick={() => setTicketPriority("normal")}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                      ticketPriority === "normal"
                        ? "bg-slate-800 border-slate-600 text-white"
                        : "border-slate-800 text-slate-500"
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketPriority("urgent")}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                      ticketPriority === "urgent"
                        ? "bg-rose-950 border-rose-700 text-rose-300"
                        : "border-slate-800 text-slate-500"
                    }`}
                  >
                    Urgent (Cold-Chain / Medicine Issue)
                  </button>
                </div>

                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 rounded-xl gap-2 shadow-lg shadow-emerald-900/40"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Support Ticket
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Contact Helpline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-center">
            <PhoneCall className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <span className="text-xs font-bold text-white block">Toll-Free Patient Care</span>
            <span className="text-xs font-mono text-emerald-400 block font-bold">1800-AROGYA (276-492)</span>
            <span className="text-[10px] text-slate-500 block">Available 24/7 across India</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-center">
            <Mail className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <span className="text-xs font-bold text-white block">Email Support</span>
            <a href="mailto:support@arogyaswift.in" className="text-xs font-mono text-emerald-400 block font-bold hover:underline">
              support@arogyaswift.in
            </a>
            <span className="text-[10px] text-slate-500 block">Typical response &lt; 15 mins</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-center">
            <Building2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <span className="text-xs font-bold text-white block">Legal & Compliance Hub</span>
            <Link href="/legal" className="text-xs text-emerald-400 hover:underline block font-bold">
              View Legal & Policy Documents →
            </Link>
            <span className="text-[10px] text-slate-500 block">16 statutory regulations</span>
          </div>
        </div>
      </main>
    </div>
  );
}
