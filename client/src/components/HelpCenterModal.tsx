import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
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
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface FAQItem {
  question: string;
  answer: string;
  category: "Prescriptions" | "Delivery & Cold-Chain" | "Dual-OTP" | "Refunds" | "Partners";
}

export function HelpCenterModal() {
  const { isHelpCenterOpen, setIsHelpCenterOpen } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [isTicketSubmitted, setIsTicketSubmitted] = useState(false);

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
      question: "What is the 2-step OTP security verification process?",
      answer: "To eliminate package theft and medicine diversion, our platform enforces two OTP checkpoints: (1) The courier must verify the 4-digit Store Pickup OTP (8514) with the pharmacist before collecting the order. (2) You must provide your 4-digit Customer Delivery PIN (4829) to the courier at your doorstep to receive the medicines.",
    },
    {
      category: "Dual-OTP",
      question: "What if I don't receive my doorstep delivery PIN?",
      answer: "Your secret 4-digit Delivery PIN is prominently displayed inside your live tracking dashboard and is also dispatched via instant SMS / WhatsApp as soon as your order is marked 'Out for Delivery'.",
    },
    {
      category: "Refunds",
      question: "What is your refund policy if the temperature seal is broken?",
      answer: "Under our 100% Cold-Chain Integrity Guarantee, if your package arrives with a broken tamper seal or temperature logger exceeding 8°C, refuse the order at your doorstep. We will issue an immediate 100% refund to your original payment method or dispatch a fresh replacement free of charge.",
    },
    {
      category: "Partners",
      question: "How can retail pharmacies and EV couriers join ArogyaSwift?",
      answer: "Pharmacies with valid state drug licenses and GSTIN can register via the Pharmacy Portal. Delivery couriers with two-wheelers and valid driving licenses can sign up through the Rider Portal with instant KYC verification.",
    },
  ];

  const categories = ["All", "Prescriptions", "Delivery & Cold-Chain", "Dual-OTP", "Refunds", "Partners"];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCat = activeCategory === "All" || faq.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast.error("Please provide both subject and description");
      return;
    }

    const ticketId = `#TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    setIsTicketSubmitted(true);
    toast.success(`Support Ticket ${ticketId} created! Our clinical support team will reply within 15 minutes.`);
  };

  const handleOpenLiveChat = () => {
    setIsHelpCenterOpen(false);
    // Find the live chat trigger button in the page and trigger it
    const chatBtn = document.querySelector('button[aria-label="Open Live AI Support Chat"]') as HTMLButtonElement | null;
    if (chatBtn) {
      chatBtn.click();
    } else {
      toast.info("AI Live Support Chat is available in the bottom-right corner!");
    }
  };

  return (
    <Dialog open={isHelpCenterOpen} onOpenChange={setIsHelpCenterOpen}>
      <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden bg-white text-slate-900 border-slate-200 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <DialogTitle className="text-base font-bold text-white">
                Help Center & Support Desk
              </DialogTitle>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                24/7 Priority Desk
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-300 mt-0.5">
              Instant answers for prescriptions, sub-15 min dispatch, cold-chain integrity, and refunds.
            </DialogDescription>
          </div>

          <Button
            size="sm"
            onClick={handleOpenLiveChat}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs h-8 shadow-sm self-start sm:self-auto"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Start Live AI Chat
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <Input
            placeholder="Search FAQs (e.g. insulin temperature, pickup OTP, refund timeline, Schedule H)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs h-9"
          />
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* FAQs List */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Frequently Asked Questions ({filteredFaqs.length})
            </span>

            {filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50/50 hover:bg-slate-50"
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="w-full text-left p-3.5 flex items-center justify-between gap-3 text-xs font-bold text-slate-900"
                  >
                    <span>{faq.question}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100/80 pt-2.5 bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Contact & Escalation Grid */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Direct Contact & Escalations
            </span>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 block">24/7 Toll-Free Helpline</span>
                <span className="text-emerald-700 font-mono font-bold block">1800-276-492</span>
                <span className="text-[10px] text-slate-400">Immediate clinical escalation</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <Mail className="w-4 h-4 text-cyan-600" />
                <span className="font-bold text-slate-900 block">Email Support</span>
                <span className="text-cyan-700 font-mono font-semibold block">support@arogyaswift.in</span>
                <span className="text-[10px] text-slate-400">&lt; 15 min response time</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-900 block">Pharmacist Escalations</span>
                <span className="text-purple-700 font-mono font-semibold block">clinical@arogyaswift.in</span>
                <span className="text-[10px] text-slate-400">Schedule H dosage queries</span>
              </div>
            </div>
          </div>

          {/* Submit a Support Ticket */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-900 text-xs">Submit an Urgent Support Ticket</span>
            </div>

            {!isTicketSubmitted ? (
              <form onSubmit={handleSubmitTicket} className="space-y-3">
                <Input
                  placeholder="Subject (e.g. Order delivery delay or cold-box seal inquiry)"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="bg-white border-slate-200 text-xs h-8"
                  required
                />
                <textarea
                  placeholder="Describe your issue with order ID if applicable..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-8">
                  Create Support Ticket
                </Button>
              </form>
            ) : (
              <div className="p-3 bg-emerald-100/60 border border-emerald-300 rounded-xl text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Ticket registered! We have notified our lead support executive and licensed pharmacist.</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
