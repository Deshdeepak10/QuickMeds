import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { LEGAL_POLICIES, PolicyItem } from "@/data/legalPolicies";
import {
  ShieldCheck,
  Search,
  Printer,
  Calendar,
  ExternalLink,
  Maximize2,
  ChevronRight,
} from "lucide-react";

export function LegalCenterModal() {
  const [, setLocation] = useLocation();
  const {
    isLegalModalOpen,
    setIsLegalModalOpen,
    legalModalTab,
    setLegalModalTab,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return LEGAL_POLICIES;
    const q = searchQuery.toLowerCase();
    return LEGAL_POLICIES.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activePolicy = LEGAL_POLICIES.find((p) => p.id === legalModalTab) || LEGAL_POLICIES[0];

  const handlePrint = () => {
    window.print();
  };

  const handleOpenFullScreen = () => {
    setIsLegalModalOpen(false);
    setLocation(`/legal/${activePolicy.id}`);
  };

  return (
    <Dialog open={isLegalModalOpen} onOpenChange={setIsLegalModalOpen}>
      <DialogContent className="max-w-6xl w-[96vw] max-h-[95vh] p-0 overflow-hidden bg-white text-slate-900 border-slate-200 shadow-2xl flex flex-col rounded-3xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <DialogTitle className="text-lg font-black tracking-tight text-white">
                Legal, Compliance & Policy Hub
              </DialogTitle>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                v2.4 Active
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-300 mt-0.5">
              Official regulatory documents, customer rights, logistics SLAs, and security standards.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenFullScreen}
              className="border-emerald-500/50 bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8.5 px-3 rounded-xl font-bold gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Open on Dedicated Full Screen Page</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 text-xs h-8.5 px-3 rounded-xl"
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> Print Policy
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <Input
            placeholder="Search policies (e.g. refund, cold-chain, prescription, cookies, OTP)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs h-8.5 rounded-xl"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="text-xs h-8 px-2 text-slate-500"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Content Body: Sidebar + Main Viewer */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[60vh]">
          {/* Left Navigation Sidebar */}
          <div className="md:col-span-4 lg:col-span-3 border-r border-slate-200 bg-slate-50/70 p-3 overflow-y-auto max-h-[60vh] md:max-h-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-2 mb-2">
              Policies ({filteredPolicies.length})
            </span>
            <div className="space-y-1">
              {filteredPolicies.map((p) => {
                const Icon = p.icon;
                const isActive = p.id === activePolicy.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setLegalModalTab(p.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                      isActive
                        ? "bg-emerald-600 text-white font-bold shadow-sm"
                        : "text-slate-700 hover:bg-slate-200/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-emerald-600"}`} />
                      <span className="truncate">{p.title}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase px-1.5 py-0 border-none shrink-0 ${
                        isActive
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {p.category}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Document Viewer */}
          <div className="md:col-span-8 lg:col-span-9 p-6 sm:p-8 overflow-y-auto max-h-[60vh] md:max-h-none flex flex-col justify-between">
            <div>
              {/* Document Header */}
              <div className="border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <activePolicy.icon className="w-5 h-5 text-emerald-600" />
                    {activePolicy.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                      {activePolicy.category} Policy
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleOpenFullScreen}
                      className="text-xs text-emerald-700 hover:bg-emerald-50 h-7 px-2 gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Full Page
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">{activePolicy.summary}</p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Last Revised: {activePolicy.lastUpdated}
                  </span>
                  <span>Jurisdiction: Republic of India</span>
                </div>
              </div>

              {/* Document Body */}
              <div className="prose prose-slate max-w-none text-xs leading-relaxed">
                {activePolicy.content}
              </div>
            </div>

            {/* Document Footer */}
            <div className="border-t border-slate-100 pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
              <span>Have legal questions? Email <strong className="text-slate-700">legal@arogyaswift.in</strong></span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenFullScreen}
                  className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 h-8"
                >
                  <Maximize2 className="w-3.5 h-3.5 mr-1" /> View on Full Screen Page
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLegalModalOpen(false)}
                  className="text-xs text-slate-600 hover:bg-slate-100 h-8"
                >
                  Close Hub
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
