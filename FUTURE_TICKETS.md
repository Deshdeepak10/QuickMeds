# 🎫 QuickMed — Future Ticket & Engineering Roadmap

**Document Version:** 1.0.0  
**Project Status:** Active Production MVP  
**Target Delivery Horizon:** Q3 2026 – Q2 2027  

---

## Epic 1: Real-Time Telemedicine & Doctor Consultations

### `QM-101`: Integrate WebRTC Video Calls for Instant Doctor Consultations
- **Type**: Feature (Frontend + Backend)
- **Priority**: High
- **Description**: Allow patients without a valid prescription to initiate a 3-minute video consultation with an on-call licensed doctor to obtain a digital e-Prescription.
- **Acceptance Criteria**:
  - WebRTC video stream with mute, camera toggle, and screen share for prescription review.
  - Generates signed digital prescription PDF upon consultation completion.

### `QM-102`: Digital Doctor Signature & Medical Council Reg Verification
- **Type**: Security / Compliance
- **Priority**: High
- **Description**: Integrate National Health Authority (NHA) & Medical Council API to verify doctor registration numbers automatically during e-Prescription issuance.

---

## Epic 2: IoT Hardware Cold-Chain Temperature Sensors

### `QM-201`: MQTT / WebSocket Server for Live Cold-Box Hardware Telemetry
- **Type**: Backend Infrastructure
- **Priority**: High
- **Description**: Replace simulated temperature telemetry with real-time MQTT subscriber endpoint listening to ESP32 / Bluetooth Low Energy (BLE) temperature probes mounted inside rider cold boxes.
- **Acceptance Criteria**:
  - Ingests temperature readings every 5 seconds per active rider.
  - Automatically triggers SMS alert to rider & hub manager if temperature exceeds 8°C for > 2 minutes.

### `QM-202`: Cold-Chain Temperature Certificate PDF Generation
- **Type**: Feature
- **Priority**: Medium
- **Description**: Attach a downloadable CDSCO-compliant Temperature Compliance Certificate (listing minute-by-minute storage temps from hub to doorstep) with every completed insulin order receipt.

---

## Epic 3: Advanced AI Vision OCR & Prescription Parser

### `QM-301`: Multi-modal Vision LLM Integration for Handwritten Prescription Parsing
- **Type**: AI / ML
- **Priority**: High
- **Description**: Upgrade basic OCR scanning to a specialized Gemini 1.5 Pro / GPT-4o Vision pipeline capable of reading doctor handwriting in Hindi, English, and regional scripts.
- **Acceptance Criteria**:
  - Parses doctor handwriting with > 92% accuracy on benchmark prescriptions.
  - Flags drug interactions (e.g. contraindications between prescribed drugs).

### `QM-302`: Automated Salt Generic Substitution Engine
- **Type**: Feature
- **Priority**: Medium
- **Description**: Expand generic medicine mapping database from 50 to 10,000+ CDSCO approved salt equivalents with real-time price comparison and cost-savings breakdown.

---

## Epic 4: Multi-City Expansion & Dynamic Geofencing

### `QM-401`: Multi-City Geofencing & Automated Hub Assignment
- **Type**: Feature / Architecture
- **Priority**: High
- **Description**: Expand fulfillment coverage beyond Ghaziabad to Noida, Greater Noida, Delhi NCR, and Bengaluru using polygon geofences.
- **Acceptance Criteria**:
  - Automatically routes orders to nearest open pharmacy hub within 3 km radius.
  - Dynamic delivery ETA calculation based on real-time traffic conditions.

### `QM-402`: Dark Store Pharmacy Inventory Sync Engine
- **Type**: Backend
- **Priority**: Medium
- **Description**: Build POS / ERP integration connectors (PharmSoft, Marg ERP) for real-time inventory stock synchronization across dark stores.

---

## Epic 5: WhatsApp & Multi-Channel Notification Pipeline

### `QM-501`: WhatsApp Business API Integration for Order Updates & Prescriptions
- **Type**: Integration
- **Priority**: High
- **Description**: Send instant WhatsApp alerts for prescription approval, live GPS tracking links, temperature alerts, and delivery OTP codes.
- **Acceptance Criteria**:
  - Allow patients to upload prescription photos directly via WhatsApp chat to create an order.

### `QM-502`: Interactive Voice Response (IVR) Order Confirmation for Elderly Patients
- **Type**: Feature
- **Priority**: Low
- **Description**: Automated IVR call to confirm order details and delivery time for non-smartphone users.

---

## Epic 6: Multi-lingual Voice Bot Upgrade & Speech Translation

### `QM-601`: Native Offline Multi-lingual Speech Recognition Pipeline
- **Type**: AI / Frontend
- **Priority**: Medium
- **Description**: Upgrade AI Customer Agent voice input using Whisper WebAssembly for seamless offline speech-to-text in 12 Indian languages without relying on browser-dependent APIs.

### `QM-602`: Voice Command Order Checkout for Accessibility
- **Type**: Feature
- **Priority**: Low
- **Description**: Enable complete hands-free medicine reordering via voice commands ("Reorder my last insulin prescription").

---

## Epic 7: App Owner Compliance & Regulatory Verification (Completed & Roadmap)

### `QM-701`: App Owner High Security Gate & CDSCO Pharmacy Audit Portal [COMPLETED ✓]
- **Status**: Completed (v1.1)
- **Description**: Delivered standalone 2FA/FIDO2 security gate (`OwnerSecurityAuthModal`) and centralized CDSCO compliance audit portal (`TabsContent value="admin"` in `MedicineMVP.tsx`).
- **Features Delivered**:
  - 6-digit Master PIN (`779922`) & WebAuthn hardware token verification.
  - Comprehensive inspection of Drug License PDFs, GSTIN Certificates, State Pharmacy Council Degrees, and Owner Aadhaar KYC.
  - 1-click CDSCO Verified Seal approval or rejection with reason feedback.
  - Round floating AI Assistant widget supporting all 4 roles across 8 Indian languages.

### `QM-702`: Automated Government CDSCO & GSTIN Registry API Verification
- **Type**: Backend Integration
- **Priority**: Medium
- **Description**: Connect App Owner Portal directly to real-time CDSCO Drug Licensing database and GSTIN Portal APIs for instant automated credential verification.

