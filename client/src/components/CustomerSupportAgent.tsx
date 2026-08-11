import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Globe,
  RefreshCw,
  ShieldAlert,
  FileText,
  Truck,
  TrendingDown,
  PhoneCall,
  CheckCircle2,
  User,
  ChevronDown,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type SupportedLanguage = "en" | "hi" | "hinglish" | "bn" | "ta" | "te" | "mr" | "gu";

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳" },
  { code: "hinglish", label: "Hinglish", nativeLabel: "Hinglish", flag: "🗣️" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇧🇩" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", flag: "🇮🇳" },
];

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  actionSuggestion?: string;
  provider?: string;
}

const QUICK_PROMPTS: Record<SupportedLanguage, string[]> = {
  en: [
    "Track my express delivery order",
    "How to upload doctor prescription?",
    "Is insulin kept in 2°C-8°C cold chain?",
    "How much can I save on generic drugs?",
  ],
  hi: [
    "मेरी डिलीवरी कहाँ पहुँची?",
    "डॉक्टर का पर्चा कैसे अपलोड करें?",
    "क्या इंसुलिन 2°C-8°C कोल्ड-चेन में है?",
    "जेनेरिक दवाइयों पर कितनी बचत होगी?",
  ],
  hinglish: [
    "Mera medicine order track karo",
    "Prescription photo upload kaise karein?",
    "Insulin cold chain temperature status",
    "Generic substitutes price comparison",
  ],
  bn: [
    "আমার ওষুধ ডেলিভারি কোথায় আছে?",
    "প্রেসক্রিপশন কিভাবে আপলোড করব?",
    "ইনসুলিন কি ২°সে-৮°সে তাপমাত্রায় থাকে?",
    "জেনেরিক ওষুধে কত সঞ্চয় হবে?",
  ],
  ta: [
    "என் மருந்து டெலிவரி எங்கே இருக்கிறது?",
    "மருத்துவர் சீட்டை எவ்வாறு பதிவேற்றுவது?",
    "இன்சுலின் 2°C-8°C குளிர் சங்கிலியில் உள்ளதா?",
    "ஜெனெரிக் மருந்துகளில் எவ்வளவு சேமிக்கலாம்?",
  ],
  te: [
    "నా మందుల డెలివరీ ఎక్కడ ఉంది?",
    "డాక్టర్ ప్రిస్క్రిప్షన్ ఎలా అప్‌లోడ్ చేయాలి?",
    "ఇన్సులిన్ 2°C-8°C కోల్డ్ చైన్‌లో ఉందా?",
    "జెనెరిక్ మందులపై ఎంత ఆదా అవుతుంది?",
  ],
  mr: [
    "माझी औषध डिलिव्हरी कुठे आहे?",
    "प्रिस्क्रिप्शन फोटो कसा अपलोड करावा?",
    "इन्सुलिन २°C-८°C कोल्ड चेनमध्ये आहे का?",
    "जेनेरिक औषधांवर किती बचत होईल?",
  ],
  gu: [
    "મારો ઓર્ડર ક્યાં પહોંચ્યો?",
    "ડૉક્ટરનું પ્રિસ્ક્રિપ્શન કેવી રીતે અપલોડ કરવું?",
    "શું ઇન્સ્યુલિન 2°C-8°C કોલ્ડ ચેઇનમાં રહે છે?",
    "જેનેરિક દવાઓ પર કેટલી બચત થશે?",
  ],
};


const ROLE_SPECIFIC_PROMPTS: Record<string, string[]> = {
  patient: [
    "Track my express delivery order",
    "How to upload doctor prescription?",
    "Is insulin kept in 2°C-8°C cold chain?",
    "How much can I save on generic drugs?",
  ],
  pharmacy: [
    "How to register my pharmacy shop?",
    "What documents are needed for verification?",
    "Drug license & GSTIN upload rules",
    "How to manage cold-box stock dispatch?",
  ],
  rider: [
    "How to verify delivery OTP with patient?",
    "Smart cold-box temperature sensor guide",
    "Ghaziabad express delivery route tips",
    "What if patient is unavailable at dropoff?",
  ],
  admin: [
    "How to approve pending pharmacy licenses?",
    "Inspecting GSTIN & Aadhaar KYC documents",
    "CDSCO digital verification seal rules",
    "Handling rejected pharmacy applications",
  ],
};


const WELCOME_MESSAGES: Record<SupportedLanguage, string> = {
  en: "👋 Hello! I am your QuickMed Multilingual AI Assistant. How can I help you with 10-30 min medicine delivery, cold-chain safety, or prescription uploads today?",
  hi: "👋 नमस्ते! मैं आपका QuickMed AI सहायता एजेंट हूँ। 10-30 मिनट दवा डिलीवरी, 2°C-8°C कोल्ड-चेन, या पर्चा अपलोड में आपकी क्या मदद कर सकता हूँ?",
  hinglish: "👋 Namaste! Main aapka QuickMed AI Assistant hoon. Medicine delivery tracking, prescription upload, ya cold-chain security se related koi bhi question poochiye!",
  bn: "👋 নমস্কার! আমি আপনার QuickMed AI সহকারী। ওষুধ ডেলিভারি বা কোল্ড-চেইন সুরক্ষা নিয়ে যেকোনো প্রশ্ন জিজ্ঞাসা করুন।",
  ta: "👋 வணக்கம்! நான் உங்கள் QuickMed AI உதவியாளர். மருந்து விநியோகம் மற்றும் குளிர் சங்கிலி பாதுகாப்பு தொடர்பான கேள்விகளைக் கேளுங்கள்.",
  te: "👋 నమస్కారం! నేను మీ QuickMed AI అసిస్టెంట్‌ని. మందుల డెలివరీ మరియు కోల్డ్ చైన్ భద్రత గురించి నన్ను అడగండి.",
  mr: "👋 नमस्कार! मी तुमचा QuickMed AI सहाय्यक आहे. औषध वितरण आणि प्रिस्क्रिप्शन अपलोडबद्दल काहीही विचारा.",
  gu: "👋 નમસ્તે! હું તમારો QuickMed AI અસિસ્ટન્ટ છું. દવા ડિલિવરી અથવા પ્રિસ્ક્રિપ્શન અપલોડ માટે મને પૂછો.",
};

export function CustomerSupportAgent() {
  const { user, setIsPharmacyRegisterModalOpen, setIsOwnerAuthModalOpen } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize welcome message per language
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "agent",
          text: WELCOME_MESSAGES[language],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          provider: "quickmed-ai-engine",
        },
      ]);
    }
  }, []);

  // Update initial welcome message when language switches if history is just the welcome message
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (messages.length === 1 && messages[0].id.startsWith("welcome")) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: "agent",
          text: WELCOME_MESSAGES[newLang],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          provider: "quickmed-ai-engine",
        },
      ]);
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // Speech Recognition Setup
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Set recognition language
    const langCodeMap: Record<SupportedLanguage, string> = {
      en: "en-IN",
      hi: "hi-IN",
      hinglish: "hi-IN",
      bn: "bn-IN",
      ta: "ta-IN",
      te: "te-IN",
      mr: "mr-IN",
      gu: "gu-IN",
    };
    recognition.lang = langCodeMap[language] || "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      toast.info(`Listening in ${LANGUAGES.find((l) => l.code === language)?.label}... Speak now.`);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (err: any) => {
      console.error("Speech recognition error:", err);
      setIsListening(false);
      toast.error("Voice input error. Please try again or type.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Speech Synthesis (Text-to-Speech)
  const speakMessage = (id: string, text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported on this device.");
      return;
    }

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`🚨⚡❄️📋💡👋]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const langCodeMap: Record<SupportedLanguage, string> = {
      en: "en-IN",
      hi: "hi-IN",
      hinglish: "hi-IN",
      bn: "bn-IN",
      ta: "ta-IN",
      te: "te-IN",
      mr: "mr-IN",
      gu: "gu-IN",
    };
    utterance.lang = langCodeMap[language] || "en-US";
    utterance.rate = 0.95;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Send message to server backend
  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch("/api/chat/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          language,
          context: {
            role: user?.role || "patient",
            userLocation: user?.location || "Ghaziabad",
          },
          conversationHistory: history,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        const botMessage: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: "agent",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionSuggestion: data.actionSuggestion,
          provider: data.provider,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || "Failed to get AI response");
      }
    } catch (err) {
      console.error("Chat API call failed:", err);
      const errorMessage: ChatMessage = {
        id: `agent-err-${Date.now()}`,
        sender: "agent",
        text: "I am having temporary network trouble reaching the AI server. QuickMed delivery services are running normally. You can dial emergency 112 if required.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "agent",
        text: WELCOME_MESSAGES[language],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: "quickmed-ai-engine",
      },
    ]);
    toast.success("Chat conversation cleared.");
  };

  const handleActionClick = (actionName?: string) => {
    if (!actionName) return;
    if (actionName === "Call 112 Emergency") {
      window.location.href = "tel:112";
      toast.error("Connecting to Emergency Services 112...");
    } else if (actionName === "Track Order" || actionName === "Track Delivery Shift") {
      toast.info("Navigating to Live Tracking Map...");
      const elem = document.getElementById("live-tracking") || document.getElementById("delivery-map");
      if (elem) elem.scrollIntoView({ behavior: "smooth" });
    } else if (actionName === "Upload Prescription") {
      toast.info("Opening Prescription Upload Scanner...");
      const elem = document.getElementById("prescription-upload") || document.getElementById("rx-scanner");
      if (elem) elem.scrollIntoView({ behavior: "smooth" });
    } else if (actionName === "Register Pharmacy Shop") {
      toast.info("Opening Pharmacy Partner Registration Modal...");
      setIsPharmacyRegisterModalOpen(true);
    } else if (actionName === "App Owner Security Gate") {
      toast.info("Opening App Owner High Security Gate...");
      setIsOwnerAuthModalOpen(true);
    } else if (actionName === "View Cold-Chain Status") {
      toast.info("Showing Cold Storage 2°C-8°C Telemetry Monitor...");
      const elem = document.getElementById("cold-chain-monitor");
      if (elem) elem.scrollIntoView({ behavior: "smooth" });
    } else {
      toast.info(`Action triggered: ${actionName}`);
    }
  };

  return (
    <>
      {/* Round Floating AI Assistant Trigger Button */}
      {!isOpen && (
        <Button
          size="icon"
          onClick={() => setIsOpen(true)}
          title="QuickMed 24/7 AI Multilingual Assistant for Patients, Pharmacies, Riders & Owners"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full p-0 shadow-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white flex items-center justify-center border-2 border-emerald-300/40 transition-all duration-300 transform hover:scale-110 active:scale-95"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-7 h-7 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-200 border border-emerald-600"></span>
            </span>
          </div>
        </Button>
      )}


      {/* Floating Chat Drawer Container */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-background/95 backdrop-blur-md border border-primary/20 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white p-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                <Bot className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight text-white">QuickMed AI Agent</h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-300/40 text-emerald-200 bg-emerald-900/50">
                    Online
                  </Badge>
                </div>
                <p className="text-[11px] text-emerald-200/90 flex items-center gap-1 mt-0.5">
                  <ShieldAlert className="w-3 h-3 text-amber-300" /> 10-30m Ghaziabad Express Help
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                title="Clear Chat"
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Multilingual Openable Container Header */}
          <div className="relative bg-muted/80 px-3.5 py-2 border-b border-border/50 flex items-center justify-between text-xs z-20">
            <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Language:</span>
            </div>

            <button
              type="button"
              onClick={() => setIsLanguageMenuOpen((prev) => !prev)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-background border border-border/80 hover:border-emerald-500/50 text-foreground transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>{LANGUAGES.find((l) => l.code === language)?.flag}</span>
              <span>{LANGUAGES.find((l) => l.code === language)?.label} ({LANGUAGES.find((l) => l.code === language)?.nativeLabel})</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isLanguageMenuOpen ? "rotate-180 text-emerald-600" : ""}`} />
            </button>

            {/* Openable Language Grid Container Dropdown */}
            {isLanguageMenuOpen && (
              <div className="absolute top-full right-3 left-3 mt-1.5 p-3 bg-background/95 backdrop-blur-xl border border-emerald-500/40 rounded-xl shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" /> Select AI Assistant Language
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLanguageMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          handleLanguageChange(lang.code);
                          setIsLanguageMenuOpen(false);
                          toast.success(`AI Assistant set to ${lang.label} (${lang.nativeLabel})`);
                        }}
                        className={`p-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-600 text-white font-bold shadow-xs"
                            : "bg-muted/50 hover:bg-muted text-foreground border border-border/40"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{lang.flag}</span>
                          <div className="flex flex-col text-left leading-tight">
                            <span>{lang.nativeLabel}</span>
                            <span className={`text-[10px] ${isSelected ? "text-emerald-100" : "text-muted-foreground"}`}>{lang.label}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>


          {/* Messages Scroll Area */}
          <ScrollArea ref={scrollRef} className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 my-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "agent" && (
                  <div className="w-7 h-7 rounded-full bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-none"
                      : "bg-muted/80 border border-border/60 text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line font-normal">{msg.text}</p>

                  {/* Action Suggestion Pill */}
                  {msg.actionSuggestion && (
                    <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleActionClick(msg.actionSuggestion)}
                        className="h-7 text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 w-full justify-center gap-1.5"
                      >
                        {msg.actionSuggestion === "Upload Prescription" && <FileText className="w-3 h-3" />}
                        {msg.actionSuggestion === "Track Order" && <Truck className="w-3 h-3" />}
                        {msg.actionSuggestion === "Compare Generic Prices" && <TrendingDown className="w-3 h-3" />}
                        {msg.actionSuggestion === "Call 112 Emergency" && <PhoneCall className="w-3 h-3 text-red-500" />}
                        <span>{msg.actionSuggestion}</span>
                      </Button>
                    </div>
                  )}

                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground/70">
                    <span>{msg.timestamp}</span>
                    {msg.sender === "agent" && (
                      <button
                        onClick={() => speakMessage(msg.id, msg.text)}
                        className="ml-2 hover:text-emerald-600 transition-colors p-0.5"
                        title="Listen to message audio"
                      >
                        {speakingMessageId === msg.id ? (
                          <VolumeX className="w-3 h-3 text-emerald-600 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-semibold">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 my-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                </div>
                <div className="bg-muted/80 border border-border/60 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping delay-300"></span>
                  <span className="text-[11px] text-muted-foreground ml-1 font-medium">QuickMed AI typing...</span>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Quick Prompts Chips tailored for active user role */}
          <div className="px-3 py-1.5 bg-muted/40 border-t border-border/40 overflow-x-auto flex gap-1.5 scrollbar-none">
            {(user?.role && ROLE_SPECIFIC_PROMPTS[user.role]
              ? ROLE_SPECIFIC_PROMPTS[user.role]
              : QUICK_PROMPTS[language]
            ).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-background border border-border hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-foreground transition-all whitespace-nowrap flex-shrink-0"
              >
                💡 {prompt}
              </button>
            ))}
          </div>


          {/* Input Box & Actions */}
          <div className="p-3 bg-background border-t border-border flex items-center gap-2">
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={toggleSpeechRecognition}
              title={isListening ? "Stop Voice Input" : "Speak Message"}
              className="h-9 w-9 flex-shrink-0 rounded-xl"
            >
              {isListening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </Button>

            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={
                language === "hi"
                  ? "सवाल पूछें (उदा. पर्चा कैसे अपलोड करें)..."
                  : language === "hinglish"
                  ? "Type your question here..."
                  : "Ask QuickMed AI help..."
              }
              disabled={isLoading}
              className="h-9 text-xs rounded-xl focus-visible:ring-emerald-500"
            />

            <Button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="h-9 w-9 p-0 flex-shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
