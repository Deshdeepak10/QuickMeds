import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const htmlPath = "d:\\quickmed-explainer\\presentation_slides.html";
const pdfPath = "d:\\quickmed-explainer\\ArogyaSwift_Project_Presentation.pdf";
const brainPdfPath = "C:\\Users\\ANIRUDH\\.gemini\\antigravity-ide\\brain\\9524e078-3a52-4dad-9e2a-a23e7c300b2f\\ArogyaSwift_Project_Presentation.pdf";

console.log("Printing presentation to PDF...");
const res = spawnSync(edgePath, [
  "--headless",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${pdfPath}`,
  htmlPath
], { timeout: 120000, encoding: "utf8" });

console.log("Exit status:", res.status);
if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`✅ SUCCESS! PDF generated: ${pdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  fs.copyFileSync(pdfPath, brainPdfPath);
  console.log(`✅ Copy saved to brain directory: ${brainPdfPath}`);
} else {
  console.error("❌ PDF was not created! Stderr:", res.stderr);
}

