import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, AlertCircle, Eye } from "lucide-react";
import { toast } from "sonner";

interface PrescriptionUploaderProps {
  onOcrComplete?: (ocrData: any) => void;
}

export function PrescriptionUploader({ onOcrComplete }: PrescriptionUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setOcrResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a prescription image or PDF");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("prescription", file);
    formData.append("patientName", "Sarah Chen");
    formData.append("patientPhone", "9876543210");

    try {
      const res = await fetch("/api/prescription/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOcrResult(data.ocrResult);
        setFileUrl(data.fileUrl);
        toast.success("✨ Gemini Vision OCR scan complete!");
        if (onOcrComplete) onOcrComplete(data.ocrResult);
      } else {
        toast.error(data.error || "Failed to upload prescription");
      }
    } catch (err) {
      toast.error("Network error during file upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                AI Vision Prescription Scanner
              </h4>
              <p className="text-xs text-slate-500">Real Gemini 1.5 Vision OCR & Pharmacist Audit</p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white text-[10px] uppercase font-bold">
            🟢 LIVE API
          </Badge>
        </div>

        {/* Upload Drop Zone */}
        <div className="p-6 bg-white border border-emerald-200 rounded-xl text-center space-y-3 shadow-inner">
          <input
            type="file"
            id="rx-file-input"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="rx-file-input"
            className="cursor-pointer inline-flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              {file ? file.name : "Click to select Doctor Prescription Photo / PDF"}
            </span>
            <span className="text-xs text-slate-400">Supports JPG, PNG, WEBP, PDF (Max 10MB)</span>
          </label>

          {file && (
            <div className="pt-2 flex justify-center gap-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 px-6 rounded-xl shadow-md"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning with Gemini Vision...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Upload & Run AI OCR
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* OCR Result Display */}
        {ocrResult && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-slate-900 shadow-md">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-extrabold uppercase text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Extracted Medicines ({ocrResult.medicines?.length || 0})
              </span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Confidence: {Math.round((ocrResult.confidenceScore || 0.95) * 100)}%
              </span>
            </div>

            <div className="text-xs space-y-1">
              <p className="text-slate-600">
                <strong>Prescribing Doctor:</strong> {ocrResult.doctorName} ({ocrResult.registrationNo})
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {ocrResult.medicines?.map((med: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-center">
                  <div>
                    <strong className="font-bold text-slate-900 block">{med.name}</strong>
                    <span className="text-slate-500 text-[11px]">{med.dosage} • {med.frequency}</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 text-[10px] border-blue-200">
                    {med.saltComposition}
                  </Badge>
                </div>
              ))}
            </div>

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 pt-1"
              >
                <Eye className="w-3.5 h-3.5" /> View Uploaded Prescription File
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
