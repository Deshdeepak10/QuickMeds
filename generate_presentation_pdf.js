import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const brainDir = "C:\\Users\\ANIRUDH\\.gemini\\antigravity-ide\\brain\\9524e078-3a52-4dad-9e2a-a23e7c300b2f";
const outputHtmlPath = "d:\\quickmed-explainer\\presentation_slides.html";
const outputPdfPath = "d:\\quickmed-explainer\\ArogyaSwift_Project_Presentation.pdf";
const brainPdfPath = path.join(brainDir, "ArogyaSwift_Project_Presentation.pdf");

// Helper to load image as base64
function getBase64Image(filename) {
  const filePath = path.join(brainDir, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString("base64")}`;
  }
  return "";
}

console.log("Loading screenshots...");
const imgDashboard = getBase64Image("main_app_dashboard_1788529808326.png");
const imgDemoModal = getBase64Image("demo_simulator_modal_1788529903721.png");
const imgPharmacy = getBase64Image("pharmacy_view_switched_1788530285440.png");
const imgRider = getBase64Image("rider_view_switched_1788530371040.png");
const imgStoreOtp = getBase64Image("store_otp_verified_1788530492477.png");
const imgDelivered = getBase64Image("delivery_completed_successfully_1788531328019.png");

console.log("Generating presentation HTML...");

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ArogyaSwift - Project & Startup Presentation</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  @page {
    size: 11in 6.1875in; /* 16:9 Presentation Aspect Ratio */
    margin: 0;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #090d16;
    color: #f1f5f9;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .slide {
    width: 11in;
    height: 6.1875in;
    page-break-after: always;
    page-break-inside: avoid;
    position: relative;
    padding: 0.45in 0.6in 0.4in 0.6in;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background: linear-gradient(135deg, #0b1120 0%, #0f172a 50%, #090d16 100%);
    border-bottom: 2px solid rgba(16, 185, 129, 0.2);
  }

  /* Watermark / Brand Accent */
  .slide::before {
    content: "";
    position: absolute;
    top: -120px;
    right: -120px;
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.04) 50%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .slide::after {
    content: "";
    position: absolute;
    bottom: -150px;
    left: -150px;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  /* Slide Header */
  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 0.15in;
    position: relative;
    z-index: 2;
  }

  .brand-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #10b981;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.3);
    padding: 4px 12px;
    border-radius: 20px;
  }

  .slide-number {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    background: rgba(255, 255, 255, 0.04);
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .slide-title-block {
    margin-top: 0.15in;
    margin-bottom: 0.2in;
    position: relative;
    z-index: 2;
  }

  .slide-category {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #06b6d4;
    margin-bottom: 4px;
    display: block;
  }

  .slide-title {
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }

  .slide-title span {
    background: linear-gradient(135deg, #10b981, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Content Layouts */
  .content-body {
    flex: 1;
    display: flex;
    gap: 0.35in;
    position: relative;
    z-index: 2;
  }

  .col-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35in;
    width: 100%;
  }

  .col-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.25in;
    width: 100%;
  }

  /* Cards */
  .glass-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }

  .glass-card.highlight {
    border-color: rgba(16, 185, 129, 0.4);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.8));
  }

  .glass-card.warning {
    border-color: rgba(245, 158, 11, 0.35);
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), rgba(15, 23, 42, 0.8));
  }

  .card-title {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-desc {
    font-size: 11.5px;
    color: #94a3b8;
    line-height: 1.55;
  }

  .bullet-list {
    list-style: none;
    margin-top: 8px;
  }

  .bullet-list li {
    font-size: 11.5px;
    color: #cbd5e1;
    margin-bottom: 6px;
    position: relative;
    padding-left: 18px;
    line-height: 1.5;
  }

  .bullet-list li::before {
    content: "▹";
    position: absolute;
    left: 0;
    color: #10b981;
    font-weight: bold;
    font-size: 13px;
  }

  /* Screenshot Showcase */
  .screenshot-frame {
    background: #020617;
    border: 1.5px solid rgba(16, 185, 129, 0.35);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .screenshot-bar {
    background: #0f172a;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .window-dots {
    display: flex;
    gap: 5px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .dot.red { background: #ef4444; }
  .dot.yellow { background: #f59e0b; }
  .dot.green { background: #10b981; }

  .window-url {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    color: #64748b;
  }

  .screenshot-img {
    width: 100%;
    flex: 1;
    object-fit: cover;
    object-position: top;
    display: block;
  }

  /* Metrics Badge Grid */
  .metric-box {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 14px;
    text-align: center;
  }

  .metric-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 20px;
    font-weight: 800;
    color: #10b981;
    display: block;
  }

  .metric-label {
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #94a3b8;
    margin-top: 2px;
    display: block;
  }

  /* Slide Footer */
  .slide-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 0.1in;
    font-size: 10px;
    color: #475569;
    position: relative;
    z-index: 2;
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .badge-tag {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    font-weight: 700;
    font-size: 9px;
    padding: 2px 8px;
    border-radius: 4px;
  }

  /* Title Slide Custom */
  .slide-title-screen {
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0.8in;
  }

  .hero-logo {
    font-size: 46px;
    font-weight: 900;
    letter-spacing: -1.5px;
    color: #ffffff;
    margin-bottom: 12px;
  }

  .hero-logo span {
    background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-subtitle {
    font-size: 18px;
    font-weight: 500;
    color: #94a3b8;
    max-width: 650px;
    margin: 0 auto 28px auto;
    line-height: 1.5;
  }

  .hero-badges {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 35px;
  }

  .hero-badge {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 8px 16px;
    border-radius: 30px;
    font-size: 11px;
    font-weight: 700;
    color: #cbd5e1;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .hero-meta {
    display: flex;
    gap: 25px;
    font-size: 11.5px;
    color: #64748b;
  }

  .hero-meta strong {
    color: #cbd5e1;
  }
</style>
</head>
<body>

<!-- SLIDE 1: TITLE SLIDE -->
<div class="slide slide-title-screen">
  <div style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center;">
    <div class="brand-pill" style="margin-bottom: 20px;">
      <span>⚡ Hyperlocal Quick-Commerce Healthcare</span>
    </div>

    <h1 class="hero-logo">Arogya<span>Swift</span></h1>
    <p class="hero-subtitle">
      10-15 Minute Rapid Prescription Fulfillment Network with Dual-OTP Security & Active Cold-Chain Telemetry
    </p>

    <div class="hero-badges">
      <div class="hero-badge">🏥 Multi-Portal Synchronized Hub</div>
      <div class="hero-badge">❄️ 2°C–8°C Cold-Chain Safeguards</div>
      <div class="hero-badge">🔐 Dual-OTP Custody Handshake</div>
      <div class="hero-badge">📋 CDSCO Schedule H Verified</div>
    </div>

    <div class="hero-meta">
      <div><strong>Topic:</strong> Quick-Commerce HealthTech Logistics</div>
      <div>•</div>
      <div><strong>Platform:</strong> Patient • Pharmacy • Courier • Compliance</div>
      <div>•</div>
      <div><strong>Architecture:</strong> Full-Stack React 19 / Express / SQLite</div>
    </div>
  </div>
</div>

<!-- SLIDE 2: INTRODUCTION -->
<div class="slide">
  <div class="slide-header">
    <div class="brand-pill">ArogyaSwift • Overview</div>
    <div class="slide-number">02 / 10</div>
  </div>

  <div class="slide-title-block">
    <span class="slide-category">Executive Summary</span>
    <h2 class="slide-title">Transforming Emergency Medicine Delivery into <span>Sub-15 Minute Rapid Logistics</span></h2>
  </div>

  <div class="content-body">
    <div class="col-2">
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div class="glass-card highlight">
          <h3 class="card-title">🚀 What is ArogyaSwift?</h3>
          <p class="card-desc">
            ArogyaSwift is an end-to-end hyperlocal pharmaceutical rapid-delivery network designed to connect Patients, Registered Pharmacies, and Certified Couriers in a strictly synchronized, tamper-evident lifecycle.
          </p>
        </div>

        <div class="glass-card">
          <h3 class="card-title">🌐 Connected 4-Pillar Ecosystem</h3>
          <ul class="bullet-list">
            <li><strong>Patient Portal:</strong> Instant AI OCR prescription scan, item extraction, live GPS map, and doorstep delivery PIN.</li>
            <li><strong>Pharmacy Portal:</strong> Schedule H safety audit, tamper-evident cold-chain packing, and store pickup OTP handshake.</li>
            <li><strong>Rider Portal:</strong> Proximity dispatch broadcast, EV route navigation, store OTP input, and customer PIN handover.</li>
            <li><strong>Compliance Portal:</strong> CDSCO license audit, GSTIN inspection, and immutable regulatory ledger.</li>
          </ul>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div class="screenshot-frame" style="height: 240px;">
          <div class="screenshot-bar">
            <div class="window-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
            <span class="window-url">http://localhost:3000/app - Patient OCR & Order Dashboard</span>
          </div>
          <img src="${imgDashboard}" class="screenshot-img" alt="Patient Dashboard">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="metric-box">
            <span class="metric-val">12.4 min</span>
            <span class="metric-label">Avg Delivery ETA</span>
          </div>
          <div class="metric-box">
            <span class="metric-val">100%</span>
            <span class="metric-label">OTP Handshake</span>
          </div>
          <div class="metric-box">
            <span class="metric-val">2°C–8°C</span>
            <span class="metric-label">Thermal Stability</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left"><span>ArogyaSwift Project Presentation</span> • <span class="badge-tag">CONFIDENTIAL & PROPRIETARY</span></div>
    <div>Slide 2 of 10</div>
  </div>
</div>

<!-- SLIDE 3: PROBLEM STATEMENT / IDEA -->
<div class="slide">
  <div class="slide-header">
    <div class="brand-pill">Market Validation</div>
    <div class="slide-number">03 / 10</div>
  </div>

  <div class="slide-title-block">
    <span class="slide-category">Problem Statement & Opportunity</span>
    <h2 class="slide-title">The Critical Gaps in <span>Traditional E-Pharmacies & Quick Commerce</span></h2>
  </div>

  <div class="content-body">
    <div class="col-3">
      <div class="glass-card warning">
        <h3 class="card-title" style="color: #f59e0b;">⏳ 24–48 Hour Delivery Lag</h3>
        <p class="card-desc">
          Current e-pharmacy platforms (Netmeds, 1mg, PharmEasy) rely on centralized distribution warehouses. Urgent antibiotics, inhalers, insulin, or post-surgery pain relievers take 1 to 2 days to arrive—completely unviable for acute healthcare emergencies.
        </p>
        <div style="margin-top: 14px; padding: 8px; background: rgba(245, 158, 11, 0.1); border-radius: 6px; font-size: 10.5px; color: #fbbf24;">
          ⚠️ 78% of acute prescriptions cannot wait beyond 60 minutes.
        </div>
      </div>

      <div class="glass-card warning">
        <h3 class="card-title" style="color: #f59e0b;">❄️ Cold-Chain Degradation</h3>
        <p class="card-desc">
          Biologics, vaccines, and insulin lose molecular integrity above 8°C. Standard delivery couriers carry medicines in uninsulated backpacks under 40°C heatwaves without thermal logging, rendering vital treatments ineffective or toxic.
        </p>
        <div style="margin-top: 14px; padding: 8px; background: rgba(245, 158, 11, 0.1); border-radius: 6px; font-size: 10.5px; color: #fbbf24;">
          ⚠️ Over 35% of temperature-sensitive drugs suffer thermal excursion.
        </div>
      </div>

      <div class="glass-card warning">
        <h3 class="card-title" style="color: #f59e0b;">🔏 Fraud & Regulatory Non-Compliance</h3>
        <p class="card-desc">
          Unregulated quick-commerce grocery apps lack CDSCO drug compliance. Without mandatory 2-step OTP chain-of-custody, packages risk theft, counterfeit substitution, or delivery to wrong recipients without licensed pharmacist sign-off.
        </p>
        <div style="margin-top: 14px; padding: 8px; background: rgba(245, 158, 11, 0.1); border-radius: 6px; font-size: 10.5px; color: #fbbf24;">
          ⚠️ Schedule H/H1 drugs require strict digital audit compliance.
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left"><span>The Core Idea: Hyperlocal licensed pharmacy network + EV couriers + dual-OTP verification</span></div>
    <div>Slide 3 of 10</div>
  </div>
</div>

<!-- SLIDE 4: OBJECTIVES -->
<div class="slide">
  <div class="slide-header">
    <div class="brand-pill">Strategic Goals</div>
    <div class="slide-number">04 / 10</div>
  </div>

  <div class="slide-title-block">
    <span class="slide-category">System Objectives</span>
    <h2 class="slide-title">Engineering Reliable, <span>Safe & Rapid Medicine Fulfillment</span></h2>
  </div>

  <div class="content-body">
    <div class="col-2">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="glass-card highlight">
          <h3 class="card-title">🎯 1. Ultra-Fast Hyperlocal Dispatch</h3>
          <p class="card-desc">
            Geofence matching engine assigns the closest certified pharmacy with verified inventory within a 3.5 km radius, ensuring pickup and doorstep delivery in <strong>under 15 minutes</strong>.
          </p>
        </div>

        <div class="glass-card highlight">
          <h3 class="card-title">🔐 2. Foolproof Dual-OTP Chain of Custody</h3>
          <p class="card-desc">
            Enforce a 2-step mathematical security protocol: Store Pickup OTP (between Store & Rider) + Doorstep Delivery PIN (between Rider & Patient) to eliminate wrongful handover and tampering.
          </p>
        </div>

        <div class="glass-card highlight">
          <h3 class="card-title">❄️ 3. Insulated Cold-Chain Monitoring</h3>
          <p class="card-desc">
            Every temperature-sensitive SKU (Insulin, Vaccines, Eye Drops) triggers insulated gel packs and live thermal range verification (2°C–8°C) displayed to the patient in real time.
          </p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="glass-card highlight">
          <h3 class="card-title">📋 4. Registered Pharmacist Clinical Validation</h3>
          <p class="card-desc">
            Schedule H compliance check, drug-drug interaction audit, and dosage ceiling validation signed by a registered pharmacist before packaging is authorized.
          </p>
        </div>

        <div class="glass-card highlight">
          <h3 class="card-title">⚡ 5. Real-Time Multi-Portal State Synchronization</h3>
          <p class="card-desc">
            Zero-latency state replication across Patient, Pharmacy, and Rider interfaces using centralized reactive polling, REST endpoints, and dynamic status progression.
          </p>
        </div>

        <div class="glass-card highlight">
          <h3 class="card-title">📱 6. Interactive Live Demo Simulator</h3>
          <p class="card-desc">
            Built-in multi-role simulator modal allowing stakeholders and evaluators to inspect all 3 portals executing simultaneously on a single unified canvas.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left"><span>Target: Zero delivery errors • 100% cold-chain compliance • Instant audit trail</span></div>
    <div>Slide 4 of 10</div>
  </div>
</div>

<!-- SLIDE 5: PROPOSED SOLUTION -->
<div class="slide">
  <div class="slide-header">
    <div class="brand-pill">Architecture & Design</div>
    <div class="slide-number">05 / 10</div>
  </div>

  <div class="slide-title-block">
    <span class="slide-category">Proposed Solution</span>
    <h2 class="slide-title">The 6-Stage <span>Synchronized Order-to-Delivery Pipeline</span></h2>
  </div>

  <div class="content-body">
    <div style="display: flex; flex-direction: column; width: 100%; gap: 14px;">
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
        <div class="glass-card" style="border-top: 3px solid #10b981; padding: 12px;">
          <span style="font-family: 'JetBrains Mono'; font-size: 10px; color: #10b981; font-weight: 700;">STAGE 1</span>
          <h4 style="font-size: 12px; font-weight: 700; margin: 4px 0; color: #fff;">Rx Order Placed</h4>
          <p style="font-size: 10px; color: #94a3b8; line-height: 1.4;">Patient scans Rx via AI OCR; store and medicine SKUs matched.</p>
        </div>

        <div class="glass-card" style="border-top: 3px solid #06b6d4; padding: 12px;">
          <span style="font-family: 'JetBrains Mono'; font-size: 10px; color: #06b6d4; font-weight: 700;">STAGE 2</span>
          <h4 style="font-size: 12px; font-weight: 700; margin: 4px 0; color: #fff;">Store Confirms</h4>
          <p style="font-size: 10px; color: #94a3b8; line-height: 1.4;">Pharmacist audits drug safety, packs with cold-chain gel kit.</p>
        </div>

        <div class="glass-card" style="border-top: 3px solid #3b82f6; padding: 12px;">
          <span style="font-family: 'JetBrains Mono'; font-size: 10px; color: #3b82f6; font-weight: 700;">STAGE 3</span>
          <h4 style="font-size: 12px; font-weight: 700; margin: 4px 0; color: #fff;">Rider Assigned</h4>
          <p style="font-size: 10px; color: #94a3b8; line-height: 1.4;">Order marked ready for dispatch; nearest EV rider accepts broadcast.</p>
        </div>

        <div class="glass-card" style="border-top: 3px solid #f59e0b; padding: 12px;">
          <span style="font-family: 'JetBrains Mono'; font-size: 10px; color: #f59e0b; font-weight: 700;">STAGE 4</span>
          <h4 style="font-size: 12px; font-weight: 700; margin: 4px 0; color: #fff;">Pickup OTP</h4>
          <p style="font-size: 10px; color: #94a3b8; line-height: 1.4;">Rider verifies 4-digit Store OTP (8514) to confirm package custody.</p>
        </div>

        <div class="glass-card" style="border-top: 3px solid #8b5cf6; padding: 12px;">
          <span style="font-family: 'JetBrains Mono'; font-size: 10px; color: #8b5cf6; font-weight: 700;">STAGE 5</span>
          <h4 style="font-size: 12px; font-weight: 700; margin: 4px 0; color: #fff;">Live GPS Transit</h4>
          <p style="font-size: 10px; color: #94a3b8; line-height: 1.4;">Rider en route; live temperature sensor active (4.2°C logged).</p>
        </div>

        <div class="glass-card" style="border-top: 3px solid #ec4899; padding: 12px;">
          <span style="font-family: 'JetBrains Mono'; font-size: 10px; color: #ec4899; font-weight: 700;">STAGE 6</span>
          <h4 style="font-size: 12px; font-weight: 700; margin: 4px 0; color: #fff;">Delivery PIN</h4>
          <p style="font-size: 10px; color: #94a3b8; line-height: 1.4;">Patient gives Doorstep PIN (4829); order completed & courier paid.</p>
        </div>
      </div>

      <div class="glass-card highlight" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 20px;">
        <div>
          <h4 style="font-size: 13px; font-weight: 800; color: #10b981; margin-bottom: 2px;">⚡ Key Innovation: Cryptographic Dual-Handshake Protocol</h4>
          <p style="font-size: 11px; color: #94a3b8;">Guarantees zero medicine diversion, tamper detection, and real-time reconciliation across distributed portals.</p>
        </div>
        <div style="display: flex; gap: 14px;">
          <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); padding: 6px 12px; border-radius: 8px; text-align: center;">
            <span style="font-size: 9px; color: #fbbf24; font-weight: 700; display: block;">STORE OTP</span>
            <span style="font-family: 'JetBrains Mono'; font-size: 14px; font-weight: 800; color: #fff;">8514</span>
          </div>
          <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); padding: 6px 12px; border-radius: 8px; text-align: center;">
            <span style="font-size: 9px; color: #34d399; font-weight: 700; display: block;">PATIENT PIN</span>
            <span style="font-family: 'JetBrains Mono'; font-size: 14px; font-weight: 800; color: #fff;">4829</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left"><span>Architecture: Event-driven status machine with SQLite ACID transactions & JSON timeline</span></div>
    <div>Slide 5 of 10</div>
  </div>
</div>

<!-- SLIDE 6: LIVE DEMO SIMULATOR -->
<div class="slide">
  <div class="slide-header">
    <div class="brand-pill">Interactive Live Demo</div>
    <div class="slide-number">06 / 10</div>
  </div>

  <div class="slide-title-block">
    <span class="slide-category">Live Project Demonstration</span>
    <h2 class="slide-title">Multi-Role Split Simulator: <span>Patient • Pharmacy • Rider</span></h2>
  </div>

  <div class="content-body">
    <div class="col-2">
      <div class="screenshot-frame" style="height: 290px;">
        <div class="screenshot-bar">
          <div class="window-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
          <span class="window-url">http://localhost:3000 - 3-Portal Synchronized Live Demo Simulator</span>
        </div>
        <img src="${imgDemoModal}" class="screenshot-img" alt="Live Demo Simulator">
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="glass-card highlight">
          <h3 class="card-title">🖥️ 3-Portal Synchronized Canvas</h3>
          <p class="card-desc">
            Evaluators can witness the entire transaction unfold in real time across 3 independent side-by-side terminal views without having to switch windows or devices.
          </p>
        </div>

        <div class="glass-card">
          <h3 class="card-title">🎮 Interactive Simulator Controls</h3>
          <ul class="bullet-list">
            <li><strong>Auto Playback:</strong> Automated end-to-end demo execution with 1x, 1.5x, and 2x speed selection.</li>
            <li><strong>Step Forward / Backward:</strong> Pause and inspect specific lifecycle states (e.g. cold-chain packing, dispatch broadcasting).</li>
            <li><strong>Live OTP Simulation:</strong> Pre-filled and manual OTP verification inputs for hands-on validation.</li>
            <li><strong>State Reset:</strong> Instant 1-click order seeding for continuous recurring demonstrations.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left"><span>Built with React 19, Lucide React, and TailwindCSS 4 • Accessible via top header "⚡ Live Demo"</span></div>
    <div>Slide 6 of 10</div>
  </div>
</div>

<!-- SLIDE 7: PHARMACY PORTAL & COLD-CHAIN -->
<div class="slide">
  <div class="slide-header">
    <div class="brand-pill">Store Operations</div>
    <div class="slide-number">07 / 10</div>
  </div>

  <div class="slide-title-block">
    <span class="slide-category">Licensed Pharmacy Hub</span>
    <h2 class="slide-title">Prescription Audit, Cold-Chain Packing & <span>Store Dispatch Queue</span></h2>
  </div>

  <div class="content-body">
    <div class="col-2">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="glass-card highlight">
          <h3 class="card-title">🏥 Active Store Incoming Pipeline</h3>
          <p class="card-desc">
            Licensed retail hubs (e.g. Apollo Pharmacy, MedPlus) receive instant sound and visual alerts upon prescription submission. Pharmacists inspect the digital prescription, verify doctor registration, and validate drug interactions.
          </p>
        </div>

        <div class="glass-card">
          <h3 class="card-title">❄️ Cold-Chain Packaging Safeguards</h3>
          <ul class="bullet-list">
            <li>Automatic SKU detection flags cold-chain drugs (e.g. Lantus Insulin, Augmentin).</li>
            <li>Mandatory insulated pouch with reusable gel refrigerant pack (2°C–8°C).</li>
            <li>Tamper-evident security barcode seal placed over package zipper.</li>
            <li>Store Pickup OTP (8514) generated exclusively for authorized courier handover.</li>
          </ul>
        </div>

        <div class="glass-card">
          <h3 class="card-title">⚡ 1-Click Status Controls</h3>
          <p class="card-desc">
            Pharmacists click <em>"Confirm & Start Packing"</em> followed by <em>"Mark Ready for Dispatch"</em>, triggering instantaneous rider broadcasts.
          </p>
        </div>
      </div>

      <div class="screenshot-frame" style="height: 290px;">
        <div class="screenshot-bar">
          <div class="window-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
          <span class="window-url">http://localhost:3000/app - Pharmacy Store Dispatch Pipeline</span>
        </div>
        <img src="${imgPharmacy}" class="screenshot-img" alt="Pharmacy Verification Portal">
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left"><span>Full compliance with Drugs and Cosmetics Act & CDSCO regulatory guidelines</span></div>
    <div>Slide 7 of 10</div>
  </div>
</div>

<!-- SLIDE 8: RIDER & DUAL-OTP HANDSHAKE -->
<div class="slide">
  <div class="slide-header">
    <div class="brand-pill">Logistics & Security</div>
    <div class="slide-number">08 / 10</div>
  </div>

  <div class="slide-title-block">
    <span class="slide-category">Delivery Courier Handshake</span>
    <h2 class="slide-title">Rider Navigation, Dual-OTP Handshake & <span>Doorstep Verification</span></h2>
  </div>

  <div class="content-body">
    <div class="col-2">
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="screenshot-frame" style="height: 145px;">
          <div class="screenshot-bar">
            <div class="window-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
            <span class="window-url">Store Pickup Handshake (OTP: 8514)</span>
          </div>
          <img src="${imgStoreOtp}" class="screenshot-img" alt="Store OTP Verification">
        </div>

        <div class="screenshot-frame" style="height: 145px;">
          <div class="screenshot-bar">
            <div class="window-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
            <span class="window-url">Doorstep Handover Complete (PIN: 4829)</span>
          </div>
          <img src="${imgDelivered}" class="screenshot-img" alt="Delivery Completed">
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="glass-card highlight">
          <h3 class="card-title">🏍️ Step 1: Pharmacy Store Pickup</h3>
          <p class="card-desc">
            Courier arrives at the pharmacy hub. The pharmacist confirms identity and shares the 4-digit <strong>Store Pickup OTP (8514)</strong>. Entering this unlocks the package and initiates transit status.
          </p>
        </div>

        <div class="glass-card highlight">
          <h3 class="card-title">📍 Step 2: Live GPS Telemetry Transit</h3>
          <p class="card-desc">
            Rider travels via EV cargo scooter. Patient tracks courier location on live interactive map with real-time ETA and cold-box temperature sensor readout (4.2°C).
          </p>
        </div>

        <div class="glass-card highlight">
          <h3 class="card-title">🏠 Step 3: Customer Doorstep Delivery PIN</h3>
          <p class="card-desc">
            At the patient's doorstep, the courier requests the customer's secret <strong>Delivery PIN (4829)</strong>. Upon verification, the order transitions to <span style="color: #10b981; font-weight: 800;">DELIVERED</span> and the courier's ₹65 payout is immediately credited.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left"><span>Zero false deliveries • Instant payout settlement • Cryptographically verifiable trail</span></div>
    <div>Slide 8 of 10</div>
  </div>
</div>

<!-- SLIDE 9: SCOPE & FUTURE SCOPE -->
<div class="slide">
  <div class="slide-header">
    <div class="brand-pill">Product Roadmap</div>
    <div class="slide-number">09 / 10</div>
  </div>

  <div class="slide-title-block">
    <span class="slide-category">Current vs. Future Scope</span>
    <h2 class="slide-title">Scaling ArogyaSwift: <span>From Prototype to National Healthcare Rail</span></h2>
  </div>

  <div class="content-body">
    <div class="col-2">
      <div class="glass-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h3 class="card-title" style="color: #10b981;">✅ Current Operational Scope</h3>
          <span class="badge-tag">PRODUCTION READY</span>
        </div>
        <ul class="bullet-list">
          <li><strong>4-Portal Role Switching:</strong> Instant navigation across Patient, Pharmacy, Rider, and Super Admin views.</li>
          <li><strong>AI Optical Character Recognition (OCR):</strong> Automated digitizing of doctor handwriting & prescription extraction.</li>
          <li><strong>Full Dual-OTP Handshake:</strong> Store Pickup OTP (8514) + Customer Doorstep Delivery PIN (4829).</li>
          <li><strong>Real SQLite Database:</strong> Relational orders table with JSON timelines, audit hashes, and ACID transactions.</li>
          <li><strong>Interactive Demo Simulator:</strong> Automated multi-role playback engine with variable speed controls.</li>
          <li><strong>Cold-Chain Tracking:</strong> Real-time temperature alerts (2°C–8°C) for sensitive medications.</li>
        </ul>
      </div>

      <div class="glass-card highlight">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h3 class="card-title" style="color: #06b6d4;">🚀 Future Expansion Roadmap</h3>
          <span class="badge-tag" style="background: rgba(6, 182, 212, 0.2); color: #22d3ee;">HORIZON 2026-2027</span>
        </div>
        <ul class="bullet-list">
          <li><strong>ABDM (Ayushman Bharat) Integration:</strong> Direct sync with National Digital Health IDs and Doctor e-Prescriptions.</li>
          <li><strong>Drone Medical Corridors:</strong> Sub-10 minute autonomous drone delivery for anti-venom, blood, and emergency cardiac meds.</li>
          <li><strong>BLE IoT Smart Thermocouples:</strong> Physical Bluetooth Low-Energy data loggers recording temperature on blockchain.</li>
          <li><strong>Automated Pharmacy ERP Bridges:</strong> Bi-directional inventory sync with Marg ERP, SAP, and MedPlus POS.</li>
          <li><strong>AI Teleconsultation Copilot:</strong> Instant video consults with licensed medical officers for prescription renewals.</li>
          <li><strong>Tier-2 & Rural Hubs:</strong> Extending dark-store micro-fulfillment centers across rural healthcare deserts.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left"><span>Vision: The fastest, safest, and most compliant pharmaceutical delivery backbone in India</span></div>
    <div>Slide 9 of 10</div>
  </div>
</div>

<!-- SLIDE 10: TECHNOLOGY & TOOLS -->
<div class="slide">
  <div class="slide-header">
    <div class="brand-pill">Technical Architecture</div>
    <div class="slide-number">10 / 10</div>
  </div>

  <div class="slide-title-block">
    <span class="slide-category">Tech Stack & Tools</span>
    <h2 class="slide-title">Cutting-Edge Technologies <span>Powering ArogyaSwift</span></h2>
  </div>

  <div class="content-body">
    <div class="col-3">
      <div class="glass-card">
        <h3 class="card-title" style="color: #38bdf8;">🎨 Frontend Stack</h3>
        <ul class="bullet-list">
          <li><strong>React 19 & TypeScript:</strong> Modern reactive components with type-safe state.</li>
          <li><strong>TailwindCSS 4:</strong> High-performance utility styling and responsive layouts.</li>
          <li><strong>Vite 7:</strong> Lightning-fast HMR and proxy routing to backend.</li>
          <li><strong>Radix UI Primitives:</strong> Accessible modals, tabs, dropdowns, and progress bars.</li>
          <li><strong>Lucide React Icons:</strong> Rich medical, delivery, and system iconography.</li>
          <li><strong>Framer Motion:</strong> Fluid micro-animations and status transitions.</li>
        </ul>
      </div>

      <div class="glass-card">
        <h3 class="card-title" style="color: #34d399;">⚙️ Backend & Storage</h3>
        <ul class="bullet-list">
          <li><strong>Node.js 22 & Express.js:</strong> Scalable RESTful API architecture.</li>
          <li><strong>SQLite (Better-SQLite3):</strong> Zero-latency embedded database with ACID guarantees.</li>
          <li><strong>Zod 4:</strong> Strict runtime request schema validation.</li>
          <li><strong>JWT & BCrypt:</strong> Secure token-based auth and password hashing.</li>
          <li><strong>Multer Storage:</strong> Multipart prescription image and medical file handling.</li>
          <li><strong>Reactive State Poller:</strong> Synchronizes multi-portal status in 2.5s intervals.</li>
        </ul>
      </div>

      <div class="glass-card">
        <h3 class="card-title" style="color: #a78bfa;">🛡️ Hardware & Compliance</h3>
        <ul class="bullet-list">
          <li><strong>CDSCO Compliance Rules:</strong> Automated Schedule H/H1 clinical safety audits.</li>
          <li><strong>Dual-OTP Security Engine:</strong> Cryptographic verification of store and patient codes.</li>
          <li><strong>Cold-Chain Telemetry:</strong> Simulated IoT sensor feedback (2°C–8°C thermal buffer).</li>
          <li><strong>GPS Geofencing:</strong> Hyperlocal pharmacy-to-doorstep routing and ETA calculation.</li>
          <li><strong>Headless Edge/Chrome PDF:</strong> Native pixel-perfect vector presentation export.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left"><span>ArogyaSwift • Modern, Resilient, Hyperlocal HealthTech Architecture</span></div>
    <div>Slide 10 of 10</div>
  </div>
</div>

</body>
</html>`;

fs.writeFileSync(outputHtmlPath, htmlContent, "utf8");
console.log(`Saved HTML slides to: ${outputHtmlPath}`);

// Run Edge headless to export to PDF
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
console.log("Rendering PDF with Edge Headless...");

try {
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${outputPdfPath}" "file:///${outputHtmlPath.replace(/\\\\/g, "/")}"`;
  execSync(cmd, { stdio: "inherit" });
  console.log(`✅ PDF successfully generated at: ${outputPdfPath}`);

  // Also copy to brain directory for convenient access
  fs.copyFileSync(outputPdfPath, brainPdfPath);
  console.log(`✅ Copy saved to brain directory: ${brainPdfPath}`);
} catch (err) {
  console.error("Failed to render PDF:", err);
}
