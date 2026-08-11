import { Express, Request, Response } from "express";
import {
  AuthCustomLoginSchema,
  PhoneSignupSchema,
  VerifyOtpSchema,
  PharmacyRegisterSchema,
  RevenueCalculatorSchema,
  ChatAgentMessageSchema,
} from "../shared/schemas";
import {
  authRateLimiter,
  publicRateLimiter,
  authenticatedUserRateLimiter,
} from "./middleware/rateLimiter";

/**
 * Multilingual AI Customer Help Knowledge Base & Fallback Generator
 */
function generateMultilingualResponse(message: string, language: string): { reply: string; actionSuggestion?: string } {
  const lowerMsg = message.toLowerCase();

  // Emergency medical check
  if (
    lowerMsg.includes("emergency") ||
    lowerMsg.includes("heart attack") ||
    lowerMsg.includes("chest pain") ||
    lowerMsg.includes("unconscious") ||
    lowerMsg.includes("bleeding heavy") ||
    lowerMsg.includes("ambulance") ||
    lowerMsg.includes("आपातकाल") ||
    lowerMsg.includes("एमरजेंसी")
  ) {
    if (language === "hi") {
      return {
        reply: "🚨 **महत्वपूर्ण चिकित्सा चेतावनी**: यदि यह एक गंभीर स्वास्थ्य आपात स्थिति (जैसे सीने में दर्द, बेहोशी या सांस लेने में बहुत कठिनाई) है, तो कृपया तुरंत **112** या निकटतम एम्बुलेंस सेवा को कॉल करें। QuickMed आपातकालीन अस्पताल सेवाओं का विकल्प नहीं है।",
        actionSuggestion: "Call 112 Emergency",
      };
    }
    if (language === "hinglish") {
      return {
        reply: "🚨 **URGENT MEDICAL WARNING**: Agar yeh aapatkalin emergency h (severe chest pain, breathing trouble, ya unconsciousness), toh bina der kiye immediately **112** par call karein. QuickMed hospital emergency services ka replacement nahi hai.",
        actionSuggestion: "Call 112 Emergency",
      };
    }
    return {
      reply: "🚨 **CRITICAL MEDICAL DISCLAIMER**: If this is a life-threatening medical emergency (such as chest pain, extreme breathlessness, or loss of consciousness), please dial **112** or contact your nearest emergency ambulance service immediately. QuickMed is an express pharmacy delivery platform and does not replace emergency room care.",
      actionSuggestion: "Call 112 Emergency",
    };
  }

  // Delivery / Order Tracking
  if (
    lowerMsg.includes("track") ||
    lowerMsg.includes("delivery") ||
    lowerMsg.includes("time") ||
    lowerMsg.includes("where is my order") ||
    lowerMsg.includes("eta") ||
    lowerMsg.includes("ऑर्डर") ||
    lowerMsg.includes("डिलीवरी") ||
    lowerMsg.includes("टाइम") ||
    lowerMsg.includes("kahan") ||
    lowerMsg.includes("kab aayega")
  ) {
    if (language === "hi") {
      return {
        reply: "⚡ QuickMed गाजियाबाद (इंदिरापुरम, कवि नगर, राज नगर, वैशाली) में 10 से 30 मिनट में दवाएं डिलीवर करता है! हमारे राइडर स्मार्ट कोल्ड-बॉक्स और जीपीएस से ट्रैक होते हैं। आप 'Live Tracking' सेक्शन में अपने ऑर्डर का लाइव स्टेटस और तापमान देख सकते हैं।",
        actionSuggestion: "Track Order",
      };
    }
    if (language === "hinglish") {
      return {
        reply: "⚡ QuickMed Ghaziabad (Indirapuram, Kavi Nagar, Raj Nagar, Vaishali) me 10 to 30 minutes me medicines deliver karta hai! Aap apne order ko Live Tracking Map me real-time GPS aur temperature telemetry ke sath track kar sakte hain.",
        actionSuggestion: "Track Order",
      };
    }
    if (language === "bn") {
      return {
        reply: "⚡ QuickMed গাজিয়াবাদে ১০ থেকে ৩০ মিনিটের মধ্যে এক্সপ্রেস ওষুধ সরবরাহ করে! আপনি লাইভ ট্র্যাকিং ম্যাপে রিয়েল-টাইমে আপনার রাইডারের লোকেশন দেখতে পারেন।",
        actionSuggestion: "Track Order",
      };
    }
    if (language === "ta") {
      return {
        reply: "⚡ QuickMed காஜியாபாத்தில் 10 முதல் 30 நிமிடங்களுக்குள் மருந்துகளை விநியோகம் செய்கிறது! லைவ் டிராக்கிங் வரைபடத்தில் உங்கள் ஆர்டரைக் கண்காணிக்கலாம்.",
        actionSuggestion: "Track Order",
      };
    }
    if (language === "te") {
      return {
        reply: "⚡ QuickMed ఘాజియాబాద్‌లో 10 నుండి 30 నిమిషాల్లో మందులను డెలివరీ చేస్తుంది! మీరు లైవ్ ట్రాకింగ్ మ్యాప్‌లో మీ ఆర్డర్‌ను చూడవచ్చు.",
        actionSuggestion: "Track Order",
      };
    }
    if (language === "mr") {
      return {
        reply: "⚡ QuickMed गाझियाबादमध्ये १० ते ३० मिनिटांत औषधे पोहोचवते! तुम्ही लाईव्ह ट्रॅकिंग मॅपवर तुमच्या ऑर्डरचे अपडेट पाहू शकता.",
        actionSuggestion: "Track Order",
      };
    }
    if (language === "gu") {
      return {
        reply: "⚡ QuickMed ગાઝિયાબાદમાં 10 થી 30 મિનિટમાં દવાઓ પહોંચાડે છે! તમે લાઇવ ટ્રેકિંગ દ્વારા ઓર્ડર સ્ટેટસ જોઈ શકો છો.",
        actionSuggestion: "Track Order",
      };
    }
    return {
      reply: "⚡ QuickMed promises 10-to-30 minute express delivery across Ghaziabad (Indirapuram, Kavi Nagar, Raj Nagar & Vaishali)! All delivery riders carry GPS-tracked cold boxes. You can monitor your live delivery route and real-time temperatures on the Live Tracking view.",
      actionSuggestion: "Track Order",
    };
  }

  // Cold Chain / Insulin / Vaccine storage
  if (
    lowerMsg.includes("cold") ||
    lowerMsg.includes("insulin") ||
    lowerMsg.includes("temp") ||
    lowerMsg.includes("vaccine") ||
    lowerMsg.includes("refrigerat") ||
    lowerMsg.includes("कोल्ड") ||
    lowerMsg.includes("इंसुलिन") ||
    lowerMsg.includes("तापमान")
  ) {
    if (language === "hi") {
      return {
        reply: "❄️ QuickMed का कोल्ड-चेन नेटवर्क तापमान-संवेदनशील दवाओं (जैसे इंसुलिन और टीके) को strictly **2°C से 8°C** के बीच बनाए रखता है। हमारे इंसुलेटेड स्मार्ट बॉक्स लाइव टेम्परेचर टेलीमेट्री के साथ आते हैं जिन्हें आप ऐप पर चेक कर सकते हैं।",
        actionSuggestion: "View Cold-Chain Status",
      };
    }
    if (language === "hinglish") {
      return {
        reply: "❄️ QuickMed ka cold-chain system Insulin aur biologics ko strictly **2°C to 8°C** temperature me store karta hai. Delivery rider ke smart cold-box ka live temperature aapko app par real-time dikhta hai!",
        actionSuggestion: "View Cold-Chain Status",
      };
    }
    return {
      reply: "❄️ QuickMed strictly complies with CDSCO cold-chain safety rules. All temperature-sensitive medications (like insulin, vaccines, and biologics) are stored in validated pharmacy refrigerators and dispatched in IoT smart cold boxes maintained strictly between **2°C and 8°C** with live telemetry reporting.",
      actionSuggestion: "View Cold-Chain Status",
    };
  }

  // Prescription Upload & OCR
  if (
    lowerMsg.includes("prescription") ||
    lowerMsg.includes("upload") ||
    lowerMsg.includes("rx") ||
    lowerMsg.includes("doctor") ||
    lowerMsg.includes("perchi") ||
    lowerMsg.includes("पर्चा") ||
    lowerMsg.includes("अपलोड")
  ) {
    if (language === "hi") {
      return {
        reply: "📋 आप अपने डॉक्टर का पर्चा (Prescription) आसानी से अपलोड कर सकते हैं। हमारा AI OCR तकनीक स्वतः दवाओं के नाम और खुराक को स्कैन करती है, जिसके बाद लाइसेंस प्राप्त फार्मासिस्ट (जैसे फार्मा. प्रिया नायर #0x9F82) ऑडिट करके ऑर्डर की पुष्टि करते हैं।",
        actionSuggestion: "Upload Prescription",
      };
    }
    if (language === "hinglish") {
      return {
        reply: "📋 Doctor ka prescription upload karne ke liye 'Upload Prescription' button dabaayein. Humara AI OCR system drugs aur dosage automatically scan karega, and licensed pharmacist usko double-check karke dispatch karenge.",
        actionSuggestion: "Upload Prescription",
      };
    }
    return {
      reply: "📋 You can upload a photo or PDF of your doctor's prescription directly on QuickMed. Our AI OCR technology auto-extracts prescribed drug names and dosages, which are then verified by a CDSCO-certified licensed pharmacist (#0x9F82) before dispatch.",
      actionSuggestion: "Upload Prescription",
    };
  }

  // Generic Alternatives & Savings
  if (
    lowerMsg.includes("generic") ||
    lowerMsg.includes("substitute") ||
    lowerMsg.includes("saving") ||
    lowerMsg.includes("discount") ||
    lowerMsg.includes("cheap") ||
    lowerMsg.includes("price") ||
    lowerMsg.includes("साल्ट") ||
    lowerMsg.includes("जेनेरिक") ||
    lowerMsg.includes("बचत")
  ) {
    if (language === "hi") {
      return {
        reply: "💡 QuickMed आपको ब्रांडेड दवाओं के समान साल्ट वाले जेनेरिक विकल्प प्रदान करता है, जिससे आप गुणवत्ता से समझौता किए बिना अपनी दवाओं के बिल पर **70% तक की बचत** कर सकते हैं। आप ऐप में जेनेरिक कैलकुलेटर से बचत देख सकते हैं!",
        actionSuggestion: "Compare Generic Prices",
      };
    }
    if (language === "hinglish") {
      return {
        reply: "💡 QuickMed generic salt alternatives offer karta hai jo identical therapeutic composition hote hain. Isse aap apne monthly medicine bills par **up to 70% save** kar sakte hain!",
        actionSuggestion: "Compare Generic Prices",
      };
    }
    return {
      reply: "💡 QuickMed's Smart Generic Engine suggests CDSCO-approved salt-equivalent generic medicines (e.g., Metformin HCL instead of high-cost brand equivalents). Switching to generic alternatives can save you up to **70% on healthcare costs** with 100% therapeutic efficacy.",
      actionSuggestion: "Compare Generic Prices",
    };
  }

  // Pharmacy Partner & Store Registration queries
  if (
    lowerMsg.includes("pharmacy") ||
    lowerMsg.includes("store") ||
    lowerMsg.includes("register") ||
    lowerMsg.includes("gst") ||
    lowerMsg.includes("license") ||
    lowerMsg.includes("partner")
  ) {
    return {
      reply: "🏢 **Pharmacy Store Partner Guide**: Licensed pharmacies can register on QuickMed by providing:\n1. Drug License Certificate PDF (Schedule H/H1)\n2. GSTIN Registration Number & PDF\n3. State Pharmacy Council Pharmacist Reg #\n4. Owner Aadhaar KYC Card\n\nOnce submitted, the App Owner compliance officer audits your documents and issues the CDSCO Verified Seal ✓.",
      actionSuggestion: "Register Pharmacy Shop",
    };
  }

  // Rider Courier Queries
  if (
    lowerMsg.includes("rider") ||
    lowerMsg.includes("courier") ||
    lowerMsg.includes("otp") ||
    lowerMsg.includes("cold box") ||
    lowerMsg.includes("vehicle")
  ) {
    return {
      reply: "🏍️ **Express Rider Delivery Guide**: Riders receive hyperlocal orders within a 5km radius. Ensure your Insulated Smart Cold-Storage Box is calibrated (2°C-8°C). Verify patient OTP at drop-off before handing over temperature-tracked packages.",
      actionSuggestion: "Track Delivery Shift",
    };
  }

  // App Owner Compliance Queries
  if (
    lowerMsg.includes("owner") ||
    lowerMsg.includes("admin") ||
    lowerMsg.includes("approve") ||
    lowerMsg.includes("reject") ||
    lowerMsg.includes("audit")
  ) {
    return {
      reply: "👑 **App Owner Compliance Guide**: Platform App Owners can access the high-security App Owner Portal via the footer 'Platform Owner Gate' (PIN: 779922). Inside, owners can audit Drug Licenses, GSTIN certificates, Aadhaar KYC, and approve or reject partner store applications with CDSCO digital seals.",
      actionSuggestion: "App Owner Security Gate",
    };
  }

  // General Greeting / Fallback

  if (language === "hi") {
    return {
      reply: "नमस्ते! मैं आपका QuickMed AI स्वास्थ्य सहायक हूँ। मैं आपकी 10-30 मिनट दवा डिलीवरी, पर्चा (Prescription) अपलोड, कोल्ड-चेन (2°C-8°C) अपडेट, और जेनेरिक बचत से जुड़े प्रश्नों में सहायता कर सकता हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?",
      actionSuggestion: "Explore Services",
    };
  }
  if (language === "hinglish") {
    return {
      reply: "Namaste! Main aapka QuickMed AI Health Assistant hoon. Main aapki 10-30 min medicine delivery, prescription upload, cold-chain tracking, aur generic medicines me help kar sakta hoon. Aap mujhse Hindi ya English me koi bhi sawaal pooch sakte hain!",
      actionSuggestion: "Explore Services",
    };
  }
  if (language === "bn") {
    return {
      reply: "নমস্কার! আমি আপনার QuickMed AI স্বাস্থ্য সহকারী। আমি আপনাকে ১০-৩০ মিনিটের ওষুধ ডেলিভারি, প্রেসক্রিপশন আপলোড এবং ওষুধ সুরক্ষায় সহায়তা করতে পারি। আজ আপনাকে কীভাবে সাহায্য করতে পারি?",
      actionSuggestion: "Explore Services",
    };
  }
  if (language === "ta") {
    return {
      reply: "வணக்கம்! நான் உங்கள் QuickMed AI சுகாதார உதவியாளர். 10-30 நிமிட மருந்து டெலிவரி, மருந்துச் சீட்டு பதிவேற்றம் பற்றி ஏதேனும் கேள்விகள் இருந்தால் கேளுங்கள்!",
      actionSuggestion: "Explore Services",
    };
  }
  if (language === "te") {
    return {
      reply: "నమస్కారం! నేను మీ QuickMed AI హెల్త్ అసిస్టెంట్‌ని. 10-30 నిమిషాల మందుల డెలివరీ, ప్రిస్క్రిప్షన్ అప్‌లోడ్ గురించి ఏవైనా ప్రశ్నలు ఉంటే నన్ను అడగవచ్చు!",
      actionSuggestion: "Explore Services",
    };
  }
  if (language === "mr") {
    return {
      reply: "नमस्कार! मी तुमचा QuickMed AI आरोग्य सहाय्यक आहे. मी तुम्हाला १०-३० मिनिटांत औषध वितरण आणि प्रिस्क्रिप्शन अपलोडमध्ये मदत करू शकतो.",
      actionSuggestion: "Explore Services",
    };
  }
  if (language === "gu") {
    return {
      reply: "નમસ્તે! હું તમારો QuickMed AI હેલ્થ અસિસ્ટન્ટ છું. 10-30 મિનિટમાં દવા ડિલિવરી અને પ્રિસ્ક્રિપ્શન અપલોડમાં તમને મદદ કરી શકું છું.",
      actionSuggestion: "Explore Services",
    };
  }

  return {
    reply: "Hello! I'm your QuickMed AI Assistant. I can help you with 10-to-30 minute express medicine delivery in Ghaziabad, prescription OCR scanning, cold-chain (2°C–8°C) telemetry monitoring, and generic medicine cost savings. How can I assist your health needs today?",
    actionSuggestion: "Explore Services",
  };
}

export function registerRoutes(app: Express): void {
  // Public Health Endpoint
  app.get("/api/public/health", publicRateLimiter, (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "QuickMed API",
    });
  });

  // Custom Credentials Login Endpoint
  app.post("/api/auth/login", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = AuthCustomLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: `u-${Date.now()}`,
        name: parseResult.data.customName,
        email: parseResult.data.customEmail,
        role: parseResult.data.selectedRole,
      },
    });
  });

  // Phone Sign Up Endpoint
  app.post("/api/auth/phone-signup", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = PhoneSignupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    res.json({
      success: true,
      message: `SMS OTP dispatched to +91 ${parseResult.data.phone}`,
      otpDemoCode: "7392",
    });
  });

  // Verify OTP Endpoint
  app.post("/api/auth/verify-otp", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = VerifyOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    if (parseResult.data.enteredOtp === "7392" || parseResult.data.enteredOtp === "1234") {
      res.json({
        success: true,
        message: "Phone verified successfully",
      });
    } else {
      res.status(401).json({
        error: "Authentication failed",
        message: "Invalid OTP code provided",
      });
    }
  });

  // Pharmacy Store Registration Endpoint
  app.post("/api/pharmacy/register", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = PharmacyRegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    res.json({
      success: true,
      store: {
        id: `p-${Date.now()}`,
        ...parseResult.data,
        rating: "5.0 ★",
        verified: true,
      },
    });
  });

  // Revenue Calculator Simulation Endpoint
  app.post("/api/calculator/revenue", authenticatedUserRateLimiter, (req: Request, res: Response) => {
    const parseResult = RevenueCalculatorSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const { monthlyOrders, avgOrderValue, riderCommission } = parseResult.data;
    const totalGMV = monthlyOrders * avgOrderValue;
    const grossMargin = totalGMV * 0.2;
    const riderCost = monthlyOrders * (avgOrderValue * (riderCommission / 100));
    const netProfit = grossMargin - riderCost;

    res.json({
      success: true,
      calculations: {
        totalGMV,
        grossMargin,
        riderCost,
        netProfit,
        isProfitable: netProfit > 0,
      },
    });
  });

  // Multilingual AI Customer Support Chat Endpoint
  app.post("/api/chat/agent", publicRateLimiter, async (req: Request, res: Response) => {
    const parseResult = ChatAgentMessageSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid chat payload",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const { message, language, context } = parseResult.data;

    // Check if Gemini API key is configured for live Gemini LLM generation
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const systemInstruction = `You are QuickMed's helpful AI Customer Support Assistant.
QuickMed is an express medicine delivery platform in Ghaziabad, Uttar Pradesh, India (covering Indirapuram, Kavi Nagar, Raj Nagar, Vaishali).
Key features:
1. 10-30 minute delivery of prescription medicines.
2. Cold-chain storage & telemetry for temperature-sensitive drugs like Insulin (strictly 2°C to 8°C).
3. e-Prescription upload with AI OCR & licensed pharmacist audit (#0x9F82).
4. Generic salt-equivalent medicine suggestions with up to 70% cost savings.
5. Delivery OTP verification (e.g. 7392).

CRITICAL SAFETY INSTRUCTION: If user asks about life-threatening medical emergencies (chest pain, severe difficulty breathing, unconsciousness, heavy bleeding), tell them immediately to call emergency 112 or an ambulance, as QuickMed is not an emergency hospital replacement.

User language selected: ${language}. Please respond fluently and helpfully in ${language}. Keep responses concise and friendly with clear formatting.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemInstruction}\n\nUser Context: ${JSON.stringify(context || {})}\n\nUser Message: ${message}` }],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as any;
          const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            res.json({
              success: true,
              reply: replyText,
              language,
              provider: "gemini-1.5-flash",
            });
            return;
          }
        }
      } catch (err) {
        console.error("Gemini API call failed, falling back to local AI engine:", err);
      }
    }

    // High quality local AI knowledge fallback engine
    const result = generateMultilingualResponse(message, language);

    res.json({
      success: true,
      reply: result.reply,
      actionSuggestion: result.actionSuggestion,
      language,
      provider: "quickmed-ai-engine",
    });
  });
}

