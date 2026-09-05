import React from "react";
import { LegalPolicyId } from "@/contexts/AuthContext";
import {
  ShieldCheck,
  FileText,
  Lock,
  Cookie,
  RefreshCw,
  XCircle,
  Truck,
  RotateCcw,
  AlertTriangle,
  Eye,
  Database,
  Ban,
  ShieldAlert,
  Bug,
  Users,
  CheckCircle2,
  Layers,
} from "lucide-react";

export interface PolicyItem {
  id: LegalPolicyId;
  title: string;
  category: "Legal" | "Logistics" | "Compliance" | "Security" | "Customer" | "Community";
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  lastUpdated: string;
  badgeText?: string;
  content: React.ReactNode;
}

export const LEGAL_POLICIES: PolicyItem[] = [
  {
    id: "privacy",
    title: "Privacy Policy",
    category: "Legal",
    icon: Lock,
    summary: "How ArogyaSwift collects, stores, and protects your personal health data under the DPDP Act 2023 & DISHA guidelines.",
    lastUpdated: "January 2026",
    badgeText: "DPDP Act 2023 Compliant",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
          <strong>Key Commitment:</strong> We treat your prescription and health data with medical-grade confidentiality. We never sell your personal data to pharmaceutical marketers, data brokers, or third-party advertisers.
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. Legislative Compliance & Regulatory Scope</h4>
          <p>
            ArogyaSwift operates in strict compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>, and the <strong>Digital Information Security in Healthcare Act (DISHA)</strong> frameworks of India.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Information We Collect</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li><strong>Personal Identifiers:</strong> Full name, verified mobile phone number, delivery address, geolocation data.</li>
            <li><strong>Sensitive Health Information:</strong> Scanned doctor prescriptions, diagnosed medication names, dosage frequencies, prescribing doctor's registration number.</li>
            <li><strong>Telemetry & Logistics Data:</strong> Real-time temperature readouts (2°C–8°C) during transit, rider handover timestamps, delivery PIN verification logs.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">3. Purpose of Processing</h4>
          <p>
            Your data is processed strictly to: (i) verify prescription legality with registered pharmacists, (ii) route orders to the nearest licensed fulfillment store, (iii) conduct clinical safety checks (drug-drug interaction & maximum daily dosage caps), and (iv) reconcile cold-chain custody handovers.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">4. Rights of Data Principals</h4>
          <p>
            Under the DPDP Act 2023, you retain the absolute right to: request summary access to your stored prescription logs, correct outdated address records, withdraw consent at any time, or request permanent deletion of your account history by contacting our Data Protection Officer at <code className="text-emerald-700 font-mono bg-emerald-50 px-1 py-0.5 rounded">dpo@arogyaswift.in</code>.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "terms",
    title: "Terms of Service",
    category: "Legal",
    icon: FileText,
    summary: "Contractual agreement governing access to our platform, prescription verification rules, and liability limitations.",
    lastUpdated: "January 2026",
    badgeText: "Statutory Agreement",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. Acceptance of Terms</h4>
          <p>
            By accessing, browsing, or placing an order on ArogyaSwift, you agree to be legally bound by these Terms of Service, the Drugs and Cosmetics Act, 1940, and the Pharmacy Practice Regulations, 2015. If you do not agree, you must immediately discontinue platform use.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Prescription Verification & Schedule H Mandate</h4>
          <p>
            All Schedule H and Schedule H1 drugs (antibiotics, psychotropics, insulin, cardiovascular regulators) require an authentic, signed prescription issued by a Registered Medical Practitioner (RMP). Orders will remain in a pending state until a licensed pharmacist digitally signs and approves the order.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">3. Marketplace & Fulfillment Nature</h4>
          <p>
            ArogyaSwift operates as a compliant technology enabler connecting patients with independently licensed retail pharmacy hubs and certified delivery couriers. Dispensation of medicines is executed exclusively by licensed retail partners holding valid state drug licenses.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">4. User Obligations</h4>
          <p>
            Users warrant that all submitted medical prescriptions are genuine, un-tampered, and issued to the named individual. Submitting forged prescriptions constitutes a criminal offense under the Indian Penal Code and results in immediate reporting to law enforcement authorities.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "cookie",
    title: "Cookie Policy",
    category: "Compliance",
    icon: Cookie,
    summary: "Detailed overview of cookies, web beacons, and local storage tokens used for session security and telemetry.",
    lastUpdated: "January 2026",
    badgeText: "Privacy & Tracking",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <p>
          ArogyaSwift uses cookies and HTML5 local storage to ensure platform integrity, protect authentication sessions, and calculate accurate hyperlocal delivery times.
        </p>

        <div className="space-y-3">
          <h4 className="text-base font-bold text-slate-900">Categories of Cookies We Employ:</h4>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> Strictly Necessary Cookies (Essential)
            </span>
            <p className="text-xs text-slate-600">JWT security tokens, CSRF protection tokens, active shopping cart caching, and order verification states. Cannot be disabled.</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-cyan-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> Functional & Preference Cookies
            </span>
            <p className="text-xs text-slate-600">Saves your preferred pharmacy hub, delivery address, high-contrast visual preferences, and selected language.</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-purple-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> Performance & Cold-Chain Telemetry Cookies
            </span>
            <p className="text-xs text-slate-600">Monitors latency in live courier GPS telemetry and Cold-box sensor ping stability for quality assurance.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "cookie-preferences",
    title: "Cookie Preferences",
    category: "Compliance",
    icon: Cookie,
    summary: "Interactive preference manager to enable or disable non-essential cookies and trackers.",
    lastUpdated: "Live State",
    badgeText: "User Controls",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed text-center py-6">
        <Cookie className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
        <h4 className="text-lg font-bold text-slate-900">Manage Your Active Cookie Permissions</h4>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          You can configure which cookies ArogyaSwift is permitted to store on your device. Essential security cookies remain active to allow medicine ordering and authentication.
        </p>
      </div>
    ),
  },
  {
    id: "refund",
    title: "Refund Policy",
    category: "Logistics",
    icon: RefreshCw,
    summary: "100% money-back guarantee for cold-chain breaches (>8°C), damaged security seals, or fulfillment delays.",
    lastUpdated: "January 2026",
    badgeText: "Cold-Chain Guarantee",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
          <strong>The ArogyaSwift Cold-Chain Pledge:</strong> If any temperature-sensitive medication is delivered with a broken thermal seal or logged above 8°C, we provide an immediate 100% refund or free replacement dispatch.
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. Refund Eligibility Conditions</h4>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>Tamper-evident security tape was sliced or broken prior to customer delivery PIN entry.</li>
            <li>Cold-chain temperature data logger indicated temperatures &gt; 8°C during transit.</li>
            <li>Delivered medicine batch does not match the approved prescription metadata.</li>
            <li>Delivery exceeded emergency SLA threshold by more than 45 minutes due to platform outage.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Processing Timeframe</h4>
          <p>
            UPI and Net Banking refunds are credited within <strong>2 to 4 hours</strong>. Credit and Debit card reversals are settled within 3 to 5 business days per Reserve Bank of India (RBI) guidelines.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "cancellation",
    title: "Cancellation Policy",
    category: "Logistics",
    icon: XCircle,
    summary: "Rules and timelines for cancelling urgent prescription deliveries before store packing and courier dispatch.",
    lastUpdated: "January 2026",
    badgeText: "Flexible Cancellation",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. Cancellation Window</h4>
          <p>
            Because ArogyaSwift delivers within 10 to 15 minutes, cancellations are <strong>100% free with zero cancellation charges</strong> if triggered while the order status is <code>Order Placed</code> or <code>Prescription Verification Pending</code>.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Cancellations Post Cold-Chain Packaging</h4>
          <p>
            Once a licensed pharmacist breaks the sterile packaging and packs temperature-sensitive medication with calibrated dry gel packs (status <code>Ready for Dispatch</code>), a nominal packaging recovery fee of ₹25 may apply to prevent biological medicine wastage.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">3. Cancellation by Platform</h4>
          <p>
            ArogyaSwift reserves the right to cancel orders if: (i) the prescribed drug is out of stock across all partner hubs within the 3.5 km radius, (ii) the prescription is rejected by the pharmacist due to clinical contraindications, or (iii) customer verification OTP fails repeatedly.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "shipping",
    title: "Shipping & Delivery Policy",
    category: "Logistics",
    icon: Truck,
    summary: "Sub-15 minute hyperlocal dispatch protocol, thermal cold-chain insulation, and live GPS tracking.",
    lastUpdated: "January 2026",
    badgeText: "10-15 Min SLA",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. 10–15 Minute Hyperlocal SLA</h4>
          <p>
            ArogyaSwift operates micro-fulfillment zones within an optimized 3.5 km radius of partner pharmacies. EV cargo riders are stationed within 2 minutes of hubs to maintain an average delivery time of 12.4 minutes.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Cold-Chain Packaging Standards</h4>
          <p>
            All biologics, insulins, and vaccines are packed inside multi-layered expanded polystyrene (EPS) or vacuum-insulated pouches with eutectic phase-change material (PCM) gel packs certified to maintain 2°C to 8°C for up to 90 minutes.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">3. Two-Step Custody Handover</h4>
          <p>
            Riders cannot mark packages as picked up without entering the pharmacist's 4-digit Store Pickup OTP (8514). Deliveries cannot be marked as delivered without the recipient's 4-digit Customer Delivery PIN (4829).
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "return-exchange",
    title: "Return & Exchange Policy",
    category: "Logistics",
    icon: RotateCcw,
    summary: "Drugs and Cosmetics Act restrictions on medicine returns, defective item replacements, and non-returnable categories.",
    lastUpdated: "January 2026",
    badgeText: "Statutory Rules",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          <strong>Statutory Notice:</strong> Under the Drugs and Cosmetics Rules, dispensed prescription medicines cannot be returned once delivered, except in verifiable cases of damage, cold-chain failure, or incorrect fulfillment.
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. Non-Returnable Products</h4>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>Opened or unsealed medicine strips, syrups, and injectables.</li>
            <li>Refrigerated biologics once accepted at the doorstep via PIN verification.</li>
            <li>Personal hygiene, diagnostic strips, and surgical consumables.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Instant Doorstep Inspection & Exchange</h4>
          <p>
            Patients are encouraged to visually inspect the tamper-evident seal before providing their 4-digit Delivery PIN. If any discrepancy is noted, refuse the package immediately, and the rider will return it to the hub for instant re-dispatch.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "disclaimer",
    title: "Medical & Platform Disclaimer",
    category: "Legal",
    icon: AlertTriangle,
    summary: "Important medical advisory: ArogyaSwift is a delivery network and does not provide emergency medical diagnosis.",
    lastUpdated: "January 2026",
    badgeText: "Medical Advisory",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-medium">
          🚨 <strong>EMERGENCY ADVISORY:</strong> ArogyaSwift is an express medication courier service, NOT an emergency medical service (EMS). In case of acute chest pain, severe allergic reaction, or life-threatening crisis, dial <strong>112</strong> or <strong>108</strong> immediately.
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. No Doctor-Patient Relationship</h4>
          <p>
            Content, OCR scan metadata, and generic drug substitution suggestions on ArogyaSwift are for informational purposes only. They do not constitute formal medical diagnosis, treatment recommendations, or clinical endorsements. Always consult your physician.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Pharmacist Independent Authority</h4>
          <p>
            Partner pharmacists retain complete legal independence under state pharmacy council rules to reject or modify fulfillment if dosing appears unsafe or prescription authenticity is in doubt.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "accessibility",
    title: "Accessibility Statement",
    category: "Compliance",
    icon: Eye,
    summary: "Our commitment to WCAG 2.1 Level AA digital accessibility standards for all patients, including screen reader support.",
    lastUpdated: "January 2026",
    badgeText: "WCAG 2.1 AA",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. WCAG 2.1 AA Conformance</h4>
          <p>
            ArogyaSwift is committed to ensuring that urgent medicine ordering is accessible to all individuals, including those with visual, auditory, motor, or cognitive impairments, adhering to <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Built-in Accessibility Features</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>Full keyboard navigation (Tab, Shift+Tab, Enter, Escape modal dismissal).</li>
            <li>High-contrast color modes meeting 4.5:1 minimum contrast ratios for elderly patients.</li>
            <li>Multilingual voice readouts and speech synthesis in English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, and Gujarati.</li>
            <li>ARIA landmark labels on all prescription uploaders, OTP inputs, and delivery progress bars.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "dpa",
    title: "Data Processing Agreement (DPA)",
    category: "Compliance",
    icon: Database,
    summary: "Controller-processor governance agreement establishing strict data processing standards for partner pharmacies.",
    lastUpdated: "January 2026",
    badgeText: "Enterprise DPA",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. Scope and Applicability</h4>
          <p>
            This Data Processing Agreement governs the processing of sensitive personal data by ArogyaSwift as a data fiduciary / processor on behalf of participating pharmacy retail hubs and patient data principals.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Technical & Organizational Safeguards</h4>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li><strong>Encryption at Rest:</strong> AES-256 encryption across all SQLite databases and patient prescription file repositories.</li>
            <li><strong>Encryption in Transit:</strong> Mandatory TLS 1.3 encryption across all REST and WebSocket API endpoints.</li>
            <li><strong>Access Governance:</strong> Role-based access control (RBAC) ensuring riders only see drop addresses, while clinical data is restricted to licensed pharmacists.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use Policy",
    category: "Legal",
    icon: Ban,
    summary: "Rules prohibiting fraudulent prescriptions, illegal medicine resale, automated scraping, or system abuse.",
    lastUpdated: "January 2026",
    badgeText: "Compliance Standard",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. Strictly Prohibited Conduct</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>Submitting manipulated, forged, photoshopped, or expired doctor prescriptions.</li>
            <li>Attempting to order narcotic drugs, psychotropics, or Schedule X substances barred from online delivery.</li>
            <li>Using automated bots, scrapers, or exploits to extract medicine pricing or inventory data.</li>
            <li>Intimidating, harassing, or physically abusing delivery courier partners.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Enforcement & Reporting</h4>
          <p>
            Violation of this policy results in immediate account suspension, permanent blacklisting across the delivery network, and formal referral to the State Pharmacy Council and Cyber Crime Cell.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "security",
    title: "Security Policy & Architecture",
    category: "Security",
    icon: ShieldAlert,
    summary: "Overview of our defense-in-depth security posture, cryptographic OTP hashing, and SOC2 / ISO 27001 roadmap.",
    lastUpdated: "January 2026",
    badgeText: "Zero-Trust Architecture",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. Defense-in-Depth Architecture</h4>
          <p>
            ArogyaSwift employs zero-trust security architecture. All administrative actions require hardware or multi-factor PIN authorization. API requests are rate-limited and validated against strict Zod runtime schemas.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Cryptographic Handshake Security</h4>
          <p>
            The 4-digit Store Pickup OTP (8514) and Customer Doorstep PIN (4829) are securely hashed and validated through atomic server-side transactions, preventing replay attacks or brute-force tampering.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">3. Continuous Monitoring & Pen-Testing</h4>
          <p>
            We conduct bi-annual third-party penetration tests (VAPT) and maintain automated vulnerability scanners across our CI/CD pipelines.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "responsible-disclosure",
    title: "Responsible Disclosure Program",
    category: "Security",
    icon: Bug,
    summary: "Guidelines for security researchers to report vulnerabilities safely under our safe harbor commitment.",
    lastUpdated: "January 2026",
    badgeText: "Safe Harbor",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
          <strong>Safe Harbor Guarantee:</strong> We appreciate ethical security research. ArogyaSwift pledges not to initiate legal action against researchers who discover and report vulnerabilities in good faith following these guidelines.
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. Reporting Guidelines</h4>
          <p>
            Please report security bugs, authentication bypasses, or data exposure directly to <code className="text-purple-700 font-mono bg-purple-50 px-1 py-0.5 rounded">security@arogyaswift.in</code>. Include detailed reproduction steps, request/response headers, and proof of concept.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Prohibited Testing Techniques</h4>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>Denial of Service (DoS / DDoS) targeting production servers.</li>
            <li>Social engineering or phishing of pharmacy staff or courier riders.</li>
            <li>Exfiltrating or viewing actual customer prescription records beyond minimal PoC.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "community-guidelines",
    title: "Community Guidelines",
    category: "Community",
    icon: Users,
    summary: "Standards of mutual respect, dignity, and safety across Patients, Pharmacists, and Delivery Riders.",
    lastUpdated: "January 2026",
    badgeText: "Zero Harassment",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">1. Respect for Healthcare Couriers</h4>
          <p>
            Our delivery riders brave severe weather and heavy traffic to bring lifesaving medicines to your doorstep in minutes. We enforce zero tolerance for discrimination, verbal abuse, or unreasonable doorstep delays.
          </p>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">2. Respect for Pharmacists</h4>
          <p>
            Pharmacists are licensed medical professionals bound by law to verify dosing and Schedule H legality. Disagreements regarding prescription validity must be handled courteously through our clinical escalation desk.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "customer-lifecycle",
    title: "Customer Lifecycle Overview",
    category: "Customer",
    icon: Layers,
    summary: "The complete journey map: Onboarding, Prescription Verification, Dual-OTP Delivery, and Chronic Refill Care.",
    lastUpdated: "January 2026",
    badgeText: "Full Journey Map",
    content: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h4 className="text-base font-bold text-slate-900 mb-2">The 5 Stages of the ArogyaSwift Lifecycle:</h4>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 text-xs block text-emerald-700">1. Seamless Onboarding & Profile Setup</span>
              <p className="text-xs text-slate-600 mt-0.5">Quick phone or email signup with address geofencing to ensure sub-15 minute fulfillment radius.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 text-xs block text-cyan-700">2. AI OCR Prescription Ingestion & Clinical Safety Audit</span>
              <p className="text-xs text-slate-600 mt-0.5">Instant digitization of handwriting, dosage checks, and licensed pharmacist digital signature.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 text-xs block text-blue-700">3. Tamper-Evident Cold-Chain Packaging</span>
              <p className="text-xs text-slate-600 mt-0.5">Insulated dry gel packs (2°C–8°C) and physical security seal applied by the store.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 text-xs block text-amber-700">4. Dual-OTP Handshake & Live GPS Tracking</span>
              <p className="text-xs text-slate-600 mt-0.5">Store Pickup OTP (8514) verified at pharmacy + Customer Delivery PIN (4829) verified at doorstep.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 text-xs block text-purple-700">5. Chronic Care Refills & Ongoing Support</span>
              <p className="text-xs text-slate-600 mt-0.5">Automated 30-day refill alerts for diabetes/hypertension and 24/7 AI multilingual live support.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export const POLICY_CATEGORIES = [
  "All",
  "Legal",
  "Logistics",
  "Compliance",
  "Security",
  "Customer",
  "Community",
] as const;

export function getPolicyById(id: string): PolicyItem {
  return LEGAL_POLICIES.find((p) => p.id === id) || LEGAL_POLICIES[0];
}
