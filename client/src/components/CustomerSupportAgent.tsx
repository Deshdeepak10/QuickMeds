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
  { code: "en", label: "English", nativeLabel: "English", flag: "en" },
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
    "How do I upload a doctor's prescription?",
    "Is insulin stored within the 2°C–8°C cold chain?",
    "How much can I save on generic medicines?",
  ],
  hi: [
    "मेरी दवा डिलीवरी कहाँ पहुँची?",
    "डॉक्टर का पर्चा कैसे अपलोड करें?",
    "क्या इंसुलिन 2°C-8°C कोल्ड-चेन में सुरक्षित है?",
    "जेनेरिक दवाइयों पर कितनी बचत होगी?",
  ],
  hinglish: [
    "Mera medicine order track karo",
    "Prescription photo upload kaise karein?",
    "Insulin cold-chain temperature status check karo",
    "Generic substitutes price comparison dikhao",
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
    "Track my standard 3-hour delivery order",
    "How do I upload a doctor's prescription?",
    "Is insulin stored within the 2°C–8°C cold chain?",
    "Emergency Express: direct pharmacy hotline & surcharge",
  ],
  pharmacy: [
    "How do I register my pharmacy store?",
    "What documents are required for verification?",
    "Drug license and GSTIN upload guidelines",
    "Emergency store hotline setup",
  ],
  rider: [
    "How do I verify the delivery OTP with the patient?",
    "Smart cold-box temperature sensor instructions",
    "Delivery route tips for Ghaziabad",
    "What if the patient is unavailable at drop-off?",
  ],
  admin: [
    "How do I approve pending pharmacy licenses?",
    "How to inspect GSTIN and Aadhaar KYC documents",
    "CDSCO digital verification seal rules",
    "Handling rejected pharmacy applications",
  ],
};

const WELCOME_MESSAGES: Record<SupportedLanguage, string> = {
  "en": "👋 Hi there! I'm Lavanya, your ArogyaSwift assistant. How can I help you today?",
  
  "hi": "👋 नमस्ते! मैं लावण्या हूँ, आपकी ArogyaSwift असिस्टेंट। आज मैं आपकी क्या मदद कर सकती हूँ?",
  
  "hinglish": "👋 Hi! Main Lavanya hoon, aapki ArogyaSwift assistant. Aaj main aapki kya help kar sakti hoon?",
  
  "bn": "👋 হ্যালো! আমি লাবণ্য, আপনার ArogyaSwift অ্যাসিস্ট্যান্ট। আজ আপনাকে কীভাবে সাহায্য করতে পারি?",
  
  "ta": "👋 வணக்கம்! நான் லாவண்யா, உங்கள் ArogyaSwift உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவட்டும்?",
  
  "te": "👋 హలో అండి! నేను లావణ్యని, మీ ArogyaSwift అసిస్టెంట్‌ని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
  
  "mr": "👋 नमस्कार! मी लावण्या, तुमची ArogyaSwift असिस्टंट. आज मी तुम्हाला कशी मदत करू शकते?",
  
  "gu": "👋 નમસ્તે! હું લાવણ્યા છું, તમારી ArogyaSwift અસિસ્ટન્ટ. આજે હું તમારી શું મદદ કરી શકું?"
};

export function CustomerSupportAgent() {
  const {
    user,
    setIsPharmacyRegisterModalOpen,
    setIsOwnerAuthModalOpen,
    isAiSupportOpen,
    setIsAiSupportOpen,
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isAiSupportOpen) {
      setIsOpen(true);
    }
  }, [isAiSupportOpen]);

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
          provider: "arogyaswift-ai-engine",
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
          provider: "arogyaswift-ai-engine",
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

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load and cache high quality browser voices on mount
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setAvailableVoices(v);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Format raw text into natural, human-flowing speech (strips markdown/emojis, expands medical acronyms)
  const formatTextForNaturalSpeech = (rawText: string): string => {
    let text = rawText;

    // Remove markdown links: [text](url) -> text
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

    // Remove code blocks and inline code
    text = text.replace(/```[\s\S]*?```/g, "");
    text = text.replace(/`([^`]+)`/g, "$1");

    // Remove markdown formatting
    text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
    text = text.replace(/(\*|_)(.*?)\1/g, "$2");
    text = text.replace(/~~(.*?)~~/g, "$1");

    // Remove headers and bullet points
    text = text.replace(/^\s*[#*•\-+]\s+/gm, "");

    // Strip emojis so the voice synthesizer does not read them robotically
    text = text.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    );

    // Expand technical abbreviations into natural conversational words
    text = text.replace(/2°C[–-]8°C/gi, "2 to 8 degrees Celsius");
    text = text.replace(/~?30[–-]45m(?:ins?)?/gi, "30 to 45 minutes");
    text = text.replace(/10[–-]30m(?:ins?)?/gi, "10 to 30 minutes");
    text = text.replace(/3\s*Hours?\s*Minimum/gi, "minimum of 3 hours");
    text = text.replace(/\bAI\s+OCR\b/gi, "A.I. O.C.R.");
    text = text.replace(/\bOTP\b/gi, "O.T.P.");
    text = text.replace(/\bCDSCO\b/gi, "C.D.S.C.O.");
    text = text.replace(/\bGSTIN\b/gi, "G.S.T.I.N.");
    text = text.replace(/\bRx\b/gi, "prescription");
    text = text.replace(/\bETA\b/gi, "estimated delivery time");
    text = text.replace(/₹\s*(\d+)/g, "$1 rupees");

    // Clean up whitespace & punctuation for natural breathing pauses
    text = text.replace(/\s+/g, " ");
    text = text.replace(/([.?!])\s*/g, "$1 ");
    return text.trim();
  };

  // Select the most natural human voice available for the active language
  const getHumanVoice = (lang: SupportedLanguage, voicesList: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!voicesList || voicesList.length === 0) return null;

    const langPrefixMap: Record<SupportedLanguage, string[]> = {
      en: ["en-IN", "en-GB", "en-US", "en"],
      hi: ["hi-IN", "hi", "en-IN"],
      hinglish: ["hi-IN", "en-IN", "hi", "en"],
      bn: ["bn-IN", "bn-BD", "bn", "en-IN"],
      ta: ["ta-IN", "ta", "en-IN"],
      te: ["te-IN", "te", "en-IN"],
      mr: ["mr-IN", "mr", "en-IN"],
      gu: ["gu-IN", "gu", "en-IN"],
    };

    const targetPrefixes = langPrefixMap[lang] || ["en-IN", "en"];
    const naturalKeywords = [
      "natural",
      "neural",
      "google",
      "online",
      "enhanced",
      "premium",
      "jenny",
      "neerja",
      "swara",
      "madhur",
      "aria",
      "sonia",
      "samantha",
      "karen",
      "daniel",
    ];

    // Priority 1: High-fidelity natural/neural voice matching target language
    for (const prefix of targetPrefixes) {
      const match = voicesList.find(
        (v) =>
          v.lang.toLowerCase().replace("_", "-").startsWith(prefix.toLowerCase()) &&
          naturalKeywords.some((kw) => v.name.toLowerCase().includes(kw))
      );
      if (match) return match;
    }

    // Priority 2: Any matching language voice
    for (const prefix of targetPrefixes) {
      const match = voicesList.find((v) =>
        v.lang.toLowerCase().replace("_", "-").startsWith(prefix.toLowerCase())
      );
      if (match) return match;
    }

    // Priority 3: Any natural/neural voice in English or Hindi
    const anyNatural = voicesList.find(
      (v) =>
        (v.lang.startsWith("en") || v.lang.startsWith("hi")) &&
        naturalKeywords.some((kw) => v.name.toLowerCase().includes(kw))
    );
    if (anyNatural) return anyNatural;

    return voicesList[0] || null;
  };

  // Speech Synthesis with Natural Human Voice and Prosody
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
    const spokenText = formatTextForNaturalSpeech(text);
    if (!spokenText) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    const voiceList = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    const bestVoice = getHumanVoice(language, voiceList);

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
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
    }

    // Human conversational pace and pitch
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Intelligent query resolution engine (guarantees accurate solutions even if offline)
  const solveUserQuery = (query: string, lang: SupportedLanguage, role?: string): { reply: string; actionSuggestion?: string } => {
    const lower = query.toLowerCase();

    // 1. Emergency
    if (lower.includes("emergency") || lower.includes("heart") || lower.includes("chest") || lower.includes("unconscious") || lower.includes("ambulance")) {
      if (lang === "hi") {
        return {
          reply: "🚨 **महत्वपूर्ण चिकित्सा चेतावनी**: यदि यह एक गंभीर आपात स्थिति है, तो कृपया तुरंत **112** पर कॉल करें।",
          actionSuggestion: "Call 112 Emergency",
        };
      }
      if (lang === "hinglish") {
        return {
          reply: "🚨 **URGENT MEDICAL WARNING**: Agar yeh aapatkalin emergency hai, toh bina der kiye turant **112** par call karein. ArogyaSwift hospital emergency services ka replacement nahi hai.",
          actionSuggestion: "Call 112 Emergency",
        };
      }
      return {
        reply: "🚨 **CRITICAL MEDICAL DISCLAIMER**: If this is a life-threatening medical emergency, please dial **112** or contact emergency ambulance services immediately.",
        actionSuggestion: "Call 112 Emergency",
      };
    }

    // 2. Prescription upload
    if (lower.includes("prescription") || lower.includes("upload") || lower.includes("parcha") || lower.includes("rx") || lower.includes("doctor")) {
      if (lang === "hi") {
        return {
          reply: "📋 आप अपने डॉक्टर का पर्चा (Photo या PDF) सीधे ArogyaSwift पर अपलोड कर सकते हैं। हमारी AI OCR तकनीक दवा और खुराक को पहचानती है, जिसे लाइसेंस प्राप्त फार्मासिस्ट द्वारा CDSCO नियमों के तहत सत्यापित किया जाता है।",
          actionSuggestion: "Upload Prescription",
        };
      }
      if (lang === "hinglish") {
        return {
          reply: "📋 Doctor ka prescription upload karna bahut aasan hai! Aap photo ya PDF file upload kar sakte hain ya Live Camera Scanner use kar sakte hain. Hamare CDSCO-licensed pharmacist ise verify karte hain.",
          actionSuggestion: "Upload Prescription",
        };
      }
      return {
        reply: "📋 You can upload your doctor's prescription directly as a photo, PDF, or using the Live Camera Scanner. Our AI OCR extracts prescribed medications and dosages, which are immediately verified by a CDSCO-certified licensed pharmacist before fulfillment.",
        actionSuggestion: "Upload Prescription",
      };
    }

    // 3. Track order / delivery time
    if (lower.includes("track") || lower.includes("delivery") || lower.includes("order") || lower.includes("time") || lower.includes("where") || lower.includes("kahan") || lower.includes("eta")) {
      if (lang === "hi") {
        return {
          reply: "⏱️ ArogyaSwift का मानक डिलीवरी समय **न्यूनतम 3 घंटे** है। यदि आपको तत्काल आवश्यकता है, तो आप **Emergency Express (~30–45 मिनट)** चुन सकते हैं। तापमान 2°C–8°C कोल्ड-चेन में लगातार ट्रैक होता है।",
          actionSuggestion: "Track Order",
        };
      }
      if (lang === "hinglish") {
        return {
          reply: "⏱️ ArogyaSwift standard delivery **minimum 3 hours** leti hai. Urgent medicine ke liye aap **Emergency Express (~30–45 mins)** select kar sakte hain. Aap Live Tracking Map par rider ki live location aur 2°C–8°C cold-chain temperature dekh sakte hain!",
          actionSuggestion: "Track Order",
        };
      }
      return {
        reply: "⏱️ ArogyaSwift standard delivery takes a **minimum of 3 hours**. For urgent needs, you can select **🚨 Emergency Express (~30–45 mins)** with direct pharmacy hotline priority dispatch. Live GPS telemetry and 2°C–8°C temperature are tracked in real time.",
        actionSuggestion: "Track Order",
      };
    }

    // 4. Insulin / Cold Chain
    if (lower.includes("cold") || lower.includes("insulin") || lower.includes("temperature") || lower.includes("degree") || lower.includes("chain")) {
      if (lang === "hi") {
        return {
          reply: "❄️ हाँ! इंसुलिन और संवेदनशील दवाएं स्मार्ट IoT 2°C–8°C इंसुलेटेड कोल्ड-बॉक्स में रखी जाती हैं। राइडर और ग्राहक दोनों डिलीवरी के दौरान लाइव तापमान देख सकते हैं।",
          actionSuggestion: "View Cold-Chain Status",
        };
      }
      if (lang === "hinglish") {
        return {
          reply: "❄️ Haan bilkul! Insulin aur sensitive medicines ko smart IoT insulated cold-boxes mein 2°C–8°C safe zone mein rakha jaata hai. Delivery ke waqt live temperature telemetry monitor hoti hai.",
          actionSuggestion: "View Cold-Chain Status",
        };
      }
      return {
        reply: "❄️ Yes! All insulin and temperature-sensitive biologicals are strictly transported inside smart IoT insulated cold-boxes maintained within the 2°C–8°C zone, with real-time digital temperature telemetry from the pharmacy hub to your doorstep.",
        actionSuggestion: "View Cold-Chain Status",
      };
    }

    // 5. Generic substitutes / savings
    if (lower.includes("generic") || lower.includes("saving") || lower.includes("discount") || lower.includes("price") || lower.includes("substitute") || lower.includes("bachat")) {
      if (lang === "hi") {
        return {
          reply: "💡 ArogyaSwift का स्मार्ट जेनेरिक इंजन CDSCO-स्वीकृत साल्ट-समतुल्य जेनेरिक दवाइयों की सिफारिश करता है। जेनेरिक विकल्प चुनने से आप 100% चिकित्सीय प्रभावशीलता के साथ 70% तक बचत कर सकते हैं।",
          actionSuggestion: "Compare Generic Prices",
        };
      }
      if (lang === "hinglish") {
        return {
          reply: "💡 ArogyaSwift ka Smart Generic Engine CDSCO-approved salt equivalent generic medicines suggest karta hai. Brand ki jagah generic lene par aap 70% tak paise bacha sakte hain bina quality compromise kiye!",
          actionSuggestion: "Compare Generic Prices",
        };
      }
      return {
        reply: "💡 ArogyaSwift's Smart Generic Engine recommends CDSCO-approved salt-equivalent generic medicines. Switching to high-quality generic alternatives can save you up to **70% on healthcare costs** with 100% therapeutic efficacy.",
        actionSuggestion: "Compare Generic Prices",
      };
    }

    // 6. Pharmacy register
    if (lower.includes("pharmacy") || lower.includes("register") || lower.includes("license") || lower.includes("shop") || lower.includes("store")) {
      return {
        reply: "🏥 Licensed retail pharmacies in Ghaziabad can onboard on ArogyaSwift by providing valid CDSCO Drug License (Form 20/21) and GSTIN. All applications undergo verification by the Platform App Owner before going live.",
        actionSuggestion: "Register Pharmacy Shop",
      };
    }

    // 7. General conversational reply
    if (lang === "hi") {
      return {
        reply: "नमस्ते! मैं आपकी ArogyaSwift AI सहायता एजेंट हूँ। मानक डिलीवरी न्यूनतम 3 घंटे लेती है और इमरजेंसी एक्सप्रेस 30–45 मिनट में उपलब्ध है। क्या मैं पर्चा अपलोड करने या डिलीवरी ट्रैक करने में आपकी मदद कर सकती हूँ?",
        actionSuggestion: "Track Order",
      };
    }
    if (lang === "hinglish") {
      return {
        reply: "Namaste! Main aapki ArogyaSwift AI Assistant hoon. Standard medicine delivery minimum 3 hours mein hoti hai aur urgent emergency express 30–45 minutes mein. Prescription upload, delivery tracking ya generic savings ke baare mein kuch bhi poochiye!",
        actionSuggestion: "Track Order",
      };
    }
    return {
      reply: "Hello! I am your ArogyaSwift AI Assistant, Dr. Chloe. Standard delivery takes a minimum of 3 hours, and Emergency Express is delivered within 30–45 minutes. Prescriptions are audited by CDSCO-licensed pharmacists. How may I assist you today?",
      actionSuggestion: "Track Order",
    };
  };

  // Send message to server backend with instant fallback solver
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
            location: user?.location || "Ghaziabad",
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
      console.warn("Using ArogyaSwift AI query solver:", err);
      // Instant intelligent solution fallback
      const solution = solveUserQuery(query, language, user?.role);
      const botMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: solution.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionSuggestion: solution.actionSuggestion,
        provider: "arogyaswift-ai-engine",
      };
      setMessages((prev) => [...prev, botMessage]);
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
        provider: "arogyaswift-ai-engine",
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
      {/* Round Floating AI Assistant Trigger Button - Featuring Cartoon Girl Avatar */}
      {!isOpen && (
        <Button
          size="icon"
          onClick={() => setIsOpen(true)}
          title="ArogyaSwift 24/7 AI Assistant (Dr. Chloe)"
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full p-0 shadow-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white flex items-center justify-center border-2 border-emerald-300 transition-all duration-300 transform hover:scale-110 active:scale-95 group overflow-hidden"
        >
          <div className="relative w-full h-full p-1 flex items-center justify-center">
            <img
              src="/cartoon_girl_avatar.jpg"
              alt="ArogyaSwift AI Assistant Dr. Chloe"
              className="w-full h-full object-cover rounded-full shadow-inner"
            />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-sm"></span>
            </span>
          </div>
        </Button>
      )}


      {/* Floating Chat Drawer Container */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-background/95 backdrop-blur-md border border-primary/20 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header with Cartoon Girl Avatar */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white p-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-300/80 shadow-md flex-shrink-0 bg-white/20">
                <img
                  src="/cartoon_girl_avatar.jpg"
                  alt="Dr. Chloe AI Assistant"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight text-white">Dr. Chloe • ArogyaSwift AI</h3>
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
                onClick={() => {
                  setIsOpen(false);
                  setIsAiSupportOpen(false);
                }}
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
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/40 flex-shrink-0 mt-0.5 shadow-xs bg-emerald-50">
                    <img
                      src="/cartoon_girl_avatar.jpg"
                      alt="Dr. Chloe"
                      className="w-full h-full object-cover"
                    />
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
                      <div>
                        {speakingMessageId === msg.id ? (
                          <button
                            onClick={() => speakMessage(msg.id, msg.text)}
                            className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                            title="Pause natural voice"
                          >
                            <span className="flex gap-0.5 items-end h-2.5">
                              <span className="w-0.5 h-2.5 bg-emerald-600 animate-pulse"></span>
                              <span className="w-0.5 h-1.5 bg-emerald-600 animate-pulse delay-75"></span>
                              <span className="w-0.5 h-3 bg-emerald-600 animate-pulse delay-150"></span>
                            </span>
                            <span>Speaking...</span>
                            <VolumeX className="w-3 h-3 ml-0.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => speakMessage(msg.id, msg.text)}
                            className="hover:text-emerald-600 text-muted-foreground/70 transition-colors p-0.5 flex items-center gap-1"
                            title="Listen with natural human voice"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span className="text-[9px] font-medium">Voice</span>
                          </button>
                        )}
                      </div>
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
                <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/40 flex-shrink-0 animate-pulse bg-emerald-50">
                  <img
                    src="/cartoon_girl_avatar.jpg"
                    alt="Dr. Chloe"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-muted/80 border border-border/60 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping delay-300"></span>
                  <span className="text-[11px] text-muted-foreground ml-1 font-medium">Dr. Chloe is typing...</span>
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
                  : "Ask ArogyaSwift AI help..."
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
