# 🎨 QuickMed — Frontend Specification Document

**Document Version:** 1.0.0  
**UI Framework:** React 19, TypeScript 5.6, Vite 7  
**Styling System:** Vanilla CSS + Tailwind CSS v4 + Glassmorphism Aesthetics  
**Routing & Navigation:** Wouter Router  
**State Management:** React Context API (`AuthContext`, `ThemeContext`)  

---

## 1. Design System & Aesthetics Guidelines

QuickMed is designed to deliver a premium, high-trust healthcare experience with vibrant modern aesthetics, micro-animations, glassmorphism card surfaces, and dynamic telemetry indicators.

### 1.1 Color Palette System

| Color Token | Hex / Value | UI Usage |
| :--- | :--- | :--- |
| **Medical Emerald Primary** | `#059669` / `emerald-600` | Primary action buttons, active navigation states, verified pharmacy badges. |
| **Teal Secondary** | `#0d9488` / `teal-600` | Gradient backgrounds, secondary buttons, floating AI widget accents. |
| **Cold-Chain Cyan** | `#0891b2` / `cyan-600` | Refrigerated storage badges (2°C–8°C), cold-box telemetry indicators. |
| **Amber Warning** | `#d97706` / `amber-600` | Emergency disclaimers, pending pharmacist audit queues, warning alerts. |
| **Ruby Danger** | `#dc2626` / `red-600` | Emergency 112 call action, temperature breach alert, failed login toast. |
| **Dark Obsidian Surface** | `#090d16` | Dark mode background, high-contrast navigation bar header. |

### 1.2 Typography & Glassmorphism Surfaces
- **Font Family**: Inter, system-ui, sans-serif.
- **Glassmorphism Spec**: `backdrop-blur-md bg-background/95 border border-primary/20 shadow-2xl rounded-2xl`.
- **Animations**: CSS keyframe pulse, ping indicators for real-time telemetry, Framer Motion tab transitions.

---

## 2. Component Hierarchy & Architecture

```
client/src/
├── App.tsx                        # Root layout, providers & global modal containers
├── main.tsx                       # React 19 root DOM renderer
├── index.css                      # Tailwind v4 directives & glassmorphism utility classes
├── components/
│   ├── CustomerSupportAgent.tsx   # Multilingual AI Chat Widget (Round floating 14x14 badge, 8 languages, 4 role prompts)
│   ├── AuthModal.tsx              # Multi-role custom credentials login dialog (Patient, Pharmacy, Rider)
│   ├── OwnerSecurityAuthModal.tsx # Standalone High Security App Owner Gate (6-digit PIN, 2FA, Biometrics)
│   ├── PharmacyRegisterModal.tsx  # Pharmacy Store CDSCO license registration modal (Drug License, GSTIN, Aadhaar KYC)
│   ├── PhoneSignupModal.tsx       # Phone + OTP signup modal for Patients & Riders
│   ├── ProfileModal.tsx           # Active User session & badge drawer
│   ├── LiveTrackingMap.tsx        # Vector route tracking & temperature telemetry view
│   ├── Map.tsx                    # Google Maps JS API & iframe fallback map component
│   ├── RevenueCalculator.tsx      # Pharmacy unit-economics simulator modal
│   ├── ProtectedRoute.tsx         # Auth guard wrapper for protected routes
│   ├── ErrorBoundary.tsx          # React error boundary fallback
│   └── ui/                        # Radix UI primitives (Button, Dialog, Input, Select, Badge, etc.)
├── contexts/
│   ├── AuthContext.tsx            # Global Auth, user sessions & registered pharmacies state
│   └── ThemeContext.tsx           # Light/Dark mode state & local storage persistence
└── pages/
    ├── LoginHome.tsx              # Landing page, role quick-switches, discreet Platform Owner Gate footer link
    ├── MedicineMVP.tsx            # Core 7-Tab Workspace (Rx OCR, Audit, Sourcing, Cold-Chain, Pill Vault, Economics, App Owner Portal)
    ├── MedicineDelivery.tsx       # Detailed medicine store & order page
    ├── QuickLaunch.tsx            # Interactive feature launcher page
    ├── Resources.tsx              # Documentation & developer guide page
    └── NotFound.tsx               # 404 Error page
```

---

## 3. Core Pages & View Specifications

### 3.1 `LoginHome.tsx` (Landing & Role Selection)
- **Header**: QuickMed logo, theme toggle (Light/Dark), quick role switcher (`Patient`, `Pharmacy`, `Rider`), sign-in trigger.
- **Hero Section**: Dynamic headline ("Medicines Delivered in 10-30 Minutes"), CTA buttons ("Try Patient Workspace", "Register Pharmacy Store", "Rider Duty Login").
- **Features Grid**: Highlighting e-Prescription AI OCR, 2°C–8°C Cold-Chain telemetry, Generic medicine savings up to 70%, and 24/7 Multilingual AI Support.

### 3.2 `MedicineMVP.tsx` (Main Multi-Role Dashboard)
Tabbed interface providing 4 specialized views:
1. **Patient Order & Prescription Workspace**:
   - e-Prescription upload dropzone (Photo/PDF simulation with AI OCR parsing).
   - Medicine search & salt-equivalent generic recommendation engine.
   - Active order timeline with 4-digit OTP display (`7392`).
2. **Pharmacist Audit & Dispatch Queue**:
   - Incoming e-Prescriptions queue with doctor registration verification.
   - Pharmacist license approval button applying digital verification stamp (`#0x9F82`).
   - Cold storage readiness toggle (2°C–8°C).
3. **Rider GPS & Live Telemetry Map**:
   - Navigation vector map showing route from Pharmacy Hub to Patient location in Ghaziabad.
   - Real-time temperature readout (`3.8°C`), speed telemetry (`24 km/h`), vehicle battery (`84%`).
   - Delivery completion modal with 4-digit OTP input.
4. **Revenue & Unit Economics Calculator**:
   - Interactive sliders for monthly order volume, average order value, and rider commission.
   - Real-time profit/margin calculation calling POST `/api/calculator/revenue`.

### 3.3 `CustomerSupportAgent.tsx` (Multilingual AI Assistant)
- **Floating Button**: Bottom-right floating trigger with active online pulse badge.
- **Language Switcher Bar**: 8 language pills (English 🇬🇧, हिन्दी 🇮🇳, Hinglish 🗣️, বাংলা 🇧🇩, தமிழ் 🇮🇳, తెలుగు 🇮🇳, मराठी 🇮🇳, ગુજરાતી 🇮🇳).
- **Speech Input**: Web Speech API (`webkitSpeechRecognition`) microphone toggle button with active recording state.
- **Audio Playback**: Web SpeechSynthesis audio read-aloud button on AI responses.
- **Action Triggers**: Quick action buttons inside chat responses ("Upload Prescription", "Track Order", "Compare Generic Prices", "Call 112 Emergency").

---

## 4. Frontend State Management (`AuthContext.tsx`)

```typescript
interface AuthContextType {
  user: UserSession;
  isAuthenticated: boolean;
  loginAsRole: (role: UserRole) => void;
  loginWithCustom: (name: string, role: UserRole, email: string) => void;
  registerPharmacyStore: (store: PharmacyStoreData) => void;
  registerUserWithPhone: (data: PhoneSignupInput) => void;
  registeredPharmacies: PharmacyStoreData[];
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isPharmacyRegisterModalOpen: boolean;
  setIsPharmacyRegisterModalOpen: (open: boolean) => void;
  isPhoneSignupModalOpen: boolean;
  setIsPhoneSignupModalOpen: (open: boolean) => void;
}
```

---

## 5. Responsive Design & Browser Support

- **Breakpoints**: Mobile (`sm: 640px`), Tablet (`md: 768px`), Desktop (`lg: 1024px`), Wide (`xl: 1280px`).
- **Touch Targets**: All interactive buttons enforce minimum 44px height for mobile accessibility.
- **Supported Browsers**: Chrome 100+, Edge 100+, Safari 15+, Firefox 100+ (Web Speech API degrades gracefully when unsupported).
