import React, { useState, useMemo, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import {
  LEGAL_POLICIES,
  POLICY_CATEGORIES,
  PolicyItem,
  getPolicyById,
} from "@/data/legalPolicies";
import { LegalPolicyId, useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Search,
  Printer,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Share2,
  Calendar,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  Sparkles,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function LegalPage() {
  const [matchWithParam, paramsWithParam] = useRoute("/legal/:policyId");
  const [, setLocation] = useLocation();
  const { setLegalModalTab } = useAuth();

  // Determine active policy from URL param or query string
  const activePolicyIdFromUrl = useMemo(() => {
    if (matchWithParam && paramsWithParam?.policyId) {
      return paramsWithParam.policyId as LegalPolicyId;
    }
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("policy");
      if (q) return q as LegalPolicyId;
    }
    return "privacy";
  }, [matchWithParam, paramsWithParam]);

  const [activePolicyId, setActivePolicyId] = useState<LegalPolicyId>(activePolicyIdFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state if URL changes
  useEffect(() => {
    if (activePolicyIdFromUrl) {
      setActivePolicyId(activePolicyIdFromUrl);
      setLegalModalTab(activePolicyIdFromUrl);
    }
  }, [activePolicyIdFromUrl, setLegalModalTab]);

  // Track fullscreen state
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

  const handleSelectPolicy = (id: LegalPolicyId) => {
    setActivePolicyId(id);
    setLegalModalTab(id);
    setLocation(`/legal/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activePolicy: PolicyItem = useMemo(() => {
    return LEGAL_POLICIES.find((p) => p.id === activePolicyId) || LEGAL_POLICIES[0];
  }, [activePolicyId]);

  // Filter policies based on search and category
  const filteredPolicies = useMemo(() => {
    return LEGAL_POLICIES.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  // Find index for next/prev navigation
  const currentIndex = LEGAL_POLICIES.findIndex((p) => p.id === activePolicy.id);
  const prevPolicy = currentIndex > 0 ? LEGAL_POLICIES[currentIndex - 1] : null;
  const nextPolicy = currentIndex < LEGAL_POLICIES.length - 1 ? LEGAL_POLICIES[currentIndex + 1] : null;

  const handleShareLink = () => {
    const url = window.location.origin + `/legal/${activePolicy.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      toast.success(`Copied direct link to ${activePolicy.title}`);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const ActiveIcon = activePolicy.icon;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header Bar */}
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                ArogyaSwift <span className="text-emerald-400 font-semibold text-xs sm:text-sm">Legal & Compliance Hub</span>
              </span>
              <span className="text-[10px] text-slate-400 block hidden md:block">
                Statutory Policies, DPDP Act 2023, DISHA & CDSCO Regulatory Framework
              </span>
            </div>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLink}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs h-8.5 px-3 rounded-xl gap-1.5"
            title="Copy shareable policy URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden md:inline">{copiedLink ? "Link Copied!" : "Share Policy"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs h-8.5 px-3 rounded-xl gap-1.5"
            title="Print this policy document"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Print Document</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-white text-xs h-8.5 px-3 rounded-xl gap-1.5 font-bold"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fullscreen Mode</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Full-Screen Layout: Left Sidebar + Right Document Viewer */}
      <div className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Policy Directory */}
        <aside className="w-full lg:w-96 xl:w-[420px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/80 flex flex-col overflow-hidden">
          {/* Search Box */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search policies (e.g., refund, cold-chain, privacy)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 bg-slate-950 border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 h-9 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {POLICY_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20"
                        : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
              <span>All Official Policies</span>
              <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-mono text-[10px]">
                {filteredPolicies.length} of {LEGAL_POLICIES.length} Available
              </span>
            </div>
          </div>

          {/* Policy List Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[40vh] lg:max-h-[calc(100vh-145px)]">
            {filteredPolicies.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                <p className="text-xs">No policies matched "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-2 text-xs text-emerald-400 hover:underline font-semibold"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              filteredPolicies.map((p) => {
                const Icon = p.icon;
                const isActive = p.id === activePolicy.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPolicy(p.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 relative group ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-600/30 via-emerald-700/20 to-slate-900 border border-emerald-500/50 text-white shadow-lg shadow-emerald-950/50"
                        : "text-slate-300 hover:bg-slate-800/60 border border-transparent"
                    }`}
                  >
                    {/* Active Accent Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-emerald-400 rounded-r-full" />
                    )}

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30"
                          : "bg-slate-800 text-emerald-400 group-hover:bg-slate-700"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-bold truncate ${isActive ? "text-emerald-300" : "text-slate-200"}`}>
                          {p.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase px-1.5 py-0 border-none shrink-0 ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {p.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 leading-normal">
                        {p.summary}
                      </p>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 mt-2.5 transition-transform ${isActive ? "text-emerald-400 translate-x-0.5" : "text-slate-600 opacity-0 group-hover:opacity-100"}`} />
                  </button>
                );
              })
            )}
          </nav>
        </aside>

        {/* Right Main Document Viewer: Full Screen Reading Experience */}
        <main className="flex-1 overflow-y-auto bg-slate-950 px-4 sm:px-10 lg:px-14 py-8 lg:py-10 max-w-5xl mx-auto w-full">
          {/* Document Header Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5 font-bold">
                {activePolicy.category} Policy
              </Badge>
              {activePolicy.badgeText && (
                <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs px-2.5 py-0.5">
                  {activePolicy.badgeText}
                </Badge>
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Last Revised: {activePolicy.lastUpdated}
              </span>
            </div>

            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-lg shadow-emerald-900/50">
                <ActiveIcon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
                  {activePolicy.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                  {activePolicy.summary}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Legally Binding in India
                </span>
                <span>Jurisdiction: Republic of India</span>
                <span className="hidden sm:inline">•</span>
                <span>Governed under DPDP Act 2023 & DISHA Guidelines</span>
              </div>
            </div>
          </div>

          {/* Document Content Box (Light reading surface with crystal-clear high contrast typography) */}
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200">
            {activePolicy.content}
          </div>

          {/* Policy Pagination Navigation */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevPolicy ? (
              <button
                onClick={() => handleSelectPolicy(prevPolicy.id)}
                className="text-left p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all group flex items-center gap-3"
              >
                <ChevronLeft className="w-5 h-5 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Previous Policy</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {prevPolicy.title}
                  </span>
                </div>
              </button>
            ) : <div />}

            {nextPolicy ? (
              <button
                onClick={() => handleSelectPolicy(nextPolicy.id)}
                className="text-right p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all group flex items-center justify-end gap-3"
              >
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Next Policy</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {nextPolicy.title}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : <div />}
          </div>

          {/* Legal & Grievance Redressal Officer Contact Card */}
          <div className="mt-8 p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-sm font-bold text-white">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Statutory Compliance & Grievance Redressal Desk</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              In accordance with the <em>Information Technology Act, 2000</em> and the <em>Digital Personal Data Protection Act, 2023</em>, for any questions, concerns, or rights requests regarding these policies, please reach our designated officers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Legal Counsel</span>
                <a href="mailto:legal@arogyaswift.in" className="text-emerald-400 hover:underline font-mono text-xs flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> legal@arogyaswift.in
                </a>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Data Protection Officer</span>
                <a href="mailto:dpo@arogyaswift.in" className="text-emerald-400 hover:underline font-mono text-xs flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> dpo@arogyaswift.in
                </a>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Grievance Helpline</span>
                <span className="text-slate-200 font-mono text-xs flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-400" /> 1800-AROGYA-LAW
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2">
              <span>ArogyaSwift Healthcare Technologies Inc. • Registered at Ghaziabad, Uttar Pradesh, India</span>
              <span className="font-semibold text-slate-400">Version 2.4 Active Deployment</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
