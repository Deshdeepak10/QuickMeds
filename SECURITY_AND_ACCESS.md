# 🛡️ QuickMed — Security & Access Control Document

**Document Version:** 1.0.0  
**Compliance Standard:** CDSCO Pharmaceutical Storage Guidelines, Telemedicine Practice Guidelines of India, OWASP Top 10 Security Standards  
**Scope:** Authentication, Role-Based Access Control (RBAC), Rate Limiting, Input Validation, Telemetry Integrity, and AI Safety  

---

## 1. Executive Security Overview

QuickMed operates at the intersection of emergency healthcare logistics, prescription fulfillment, and internet-of-things (IoT) cold-chain telemetry. Security and data privacy are foundational. This document details the security posture, authentication architecture, rate-limiting defenses, regulatory compliance controls, and AI safety mechanisms implemented across the platform.

---

## 2. Multi-Role Authentication & Access Control (RBAC)

QuickMed enforces strict Role-Based Access Control (RBAC) with four primary user personas:

| User Role | Access Scope | Key Credentials & Verification | Primary Actions Authorized |
| :--- | :--- | :--- | :--- |
| **Patient** | Consumer Portal | Name, Mobile Phone (+91 10-digit), Email, OTP, Ghaziabad Address | Upload e-Prescriptions, order prescription & OTC medicines, track live rider GPS & cold-box telemetry, view generic savings. |
| **Licensed Pharmacy** | Store Manager Hub | Pharmacist Owner Name, Shop Title, CDSCO License Number (`UP-2021-00921`), GSTIN Number, State Council Reg #, Address, Cold-Chain Certification | Audit incoming e-Prescriptions, apply digital pharmacist verification stamp (`#0x9F82`), confirm cold storage readiness (2°C–8°C), dispatch orders. |
| **Express Delivery Rider** | Logistics Dashboard | Rider Name, Phone, Assigned EV Vehicle, License Plate (`UP-14-EV-8821`), Delivery Zone | View assigned Ghaziabad route, monitor cold-box temperature sensor, update duty status (Online/Offline), verify delivery via 4-digit OTP (`7392`). |
| **App Owner (Super Admin)** | Platform Audit Portal | 6-Digit Master Security PIN (`779922`), Hardware Token (`SEC-ADMIN-CDSCO-2026`), Biometric Touch ID Sensor | Audit pharmacy registrations, inspect uploaded Drug License PDFs, GSTIN Certificates, State Pharmacy Council Degrees, Aadhaar KYC; issue CDSCO seals or rejection notices. |


### Session Management & Authentication Flow
1. **Preset Role Switching**: Provides zero-latency sandbox testing for audit and development (`PRESET_USERS` in `AuthContext.tsx`).
2. **Custom Credentials Login**: Requires full name, email, password, and explicit role selection via POST `/api/auth/login`.
3. **Phone + SMS OTP Authentication**: Standard phone registration with 4-digit OTP dispatch (`7392` demo code fallback) via POST `/api/auth/phone-signup` and POST `/api/auth/verify-otp`.

---

## 3. Threat Mitigation & Multi-Tier Rate Limiting

To protect API endpoints against Brute Force, Denial of Service (DoS), Credential Stuffing, and API abuse, QuickMed uses an in-memory sliding-window rate limiter with **exponential backoff delay** (`server/middleware/rateLimiter.ts`).

### Rate Limiter Tiers

```
                       +-----------------------------------+
                       |    INCOMING HTTP REST REQUEST     |
                       +-----------------------------------+
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
       /api/auth/* Endpoints                    /api/public/* & /api/chat/*
       Strict Auth Limiter                      Public / Chat Limiter
       - Window: 15 Minutes (900,000ms)         - Window: 15 Minutes
       - IP Max: 5 Attempts                     - IP Max: 60 Requests
       - Account Max: 5 Attempts                - Exponential Backoff Headers
       - Exponential Backoff Delay:             - HTTP 429 Retry-After Response
         2s -> 4s -> 8s -> 16s... (Max 900s)
```

### Exponential Backoff Algorithm:
```typescript
const attempts = Math.max(ipRecord.failedAttempts, accountRecord.failedAttempts) + 1;
const backoffSeconds = Math.min(Math.pow(2, attempts - 1) * 2, 900); // Exponential backoff up to 15 mins
```

### HTTP Response Headers Enforced:
- `X-RateLimit-Limit-IP`: Maximum allowed requests in window.
- `X-RateLimit-Remaining-IP`: Remaining request quota.
- `Retry-After`: Delay period in seconds required before retrying when HTTP `429 Too Many Requests` is issued.

---

## 4. Input Sanitization & Payload Validation

All payload structures sent to QuickMed API endpoints are strictly validated using **Zod Schemas** (`shared/schemas.ts`). Payload fields are stripped of illegal characters, validated against length bounds, and typed before reaching business handlers.

### Validated Endpoints & Constraints

1. **`AuthCustomLoginSchema`**:
   - `customName`: 2–100 chars, regex `/^[a-zA-Z0-9\s.\-']+$/`.
   - `customEmail`: Valid RFC 5322 email string, max 255 chars.
   - `selectedRole`: Enforced enum `["patient", "pharmacy", "rider"]`.
2. **`PhoneSignupSchema`**:
   - `phone`: Exactly 10 digits (`^\d{10}$`).
   - `role`: Enforced enum `["patient", "rider"]`.
   - `drivingLicense`: Alpha-numeric validation `/^[a-zA-Z0-9-]*$/`.
3. **`PharmacyRegisterSchema`**:
   - `licenseNo`: Must be 5–30 chars, matching `/^[a-zA-Z0-9-]+$/`.
4. **`ChatAgentMessageSchema`**:
   - `message`: 1–1000 chars trimmed string.
   - `language`: Enum `["en", "hi", "hinglish", "bn", "ta", "te", "mr", "gu"]`.
   - `conversationHistory`: Array capped at maximum 20 messages.

---

## 5. CDSCO Regulatory & Telemetry Data Security

QuickMed complies with CDSCO cold-chain guidelines for temperature-sensitive pharmaceuticals (Insulin, Vaccines, Biologics):

1. **Cold-Chain Telemetry Integrity**:
   - Live IoT telemetry sensors continuously monitor insulated smart boxes.
   - Allowed storage range is strictly **2°C to 8°C**.
   - Automatic visual and system alerts trigger if temperature breaches threshold (e.g. `>8.0°C` or `<2.0°C`).
2. **Digital Pharmacist Verification**:
   - Prescription verification requires explicit pharmacist license audit (`UP-2021-00921`) and digital audit stamp (`#0x9F82`).
3. **Handover OTP Authentication**:
   - Delivery riders cannot mark an order complete without receiving the patient's 4-digit delivery PIN (`7392`), ensuring medicines are delivered to the intended recipient.

---

## 6. AI Agent Safety & Emergency Triage Safeguards

The Multilingual AI Customer Help Agent (`/api/chat/agent`) enforces strict safety boundary rules:

> [!CAUTION]
> **Emergency Room Triage Disclaimer**: The AI agent is strictly prohibited from diagnosing life-threatening medical conditions or prescribing prescription drugs.

- **Emergency Detection**: If user queries contain keywords like `chest pain`, `heart attack`, `unconscious`, `heavy bleeding`, or `ambulance`, the system immediately bypasses general AI text generation and returns a critical alert advising the user to dial **112** or call an emergency ambulance.
- **LLM Prompt Isolation**: System prompts provided to Google Gemini API explicitly constrain responses to QuickMed platform assistance, delivery status, prescription upload guides, and generic drug cost savings.
- **Fallback Security**: If external LLM APIs fail or environment keys are unconfigured, the platform defaults to a pre-validated, locally isolated multilingual knowledge engine.

---

## 7. Environment & Secrets Management

Environment variables are isolated and defaulted safely via `shared/config.ts`:

- `GEMINI_API_KEY`: Server-side secret for Google Gemini API (never exposed to client browser).
- `VITE_FRONTEND_FORGE_API_KEY`: Restricted client map proxy key.
- `PORT`, `NODE_ENV`: Controlled server runtime properties.
- `RATE_LIMIT_*`: Configurable threshold settings for deployment tuning.
