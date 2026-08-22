import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface GSTINVerifierProps {
  value?: string;
  onVerified?: (gstin: string, isValid: boolean) => void;
}

export function GSTINVerifier({ value = "", onVerified }: GSTINVerifierProps) {
  const [gstin, setGstin] = useState(value);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ isValid: boolean; stateName?: string; reason?: string } | null>(null);

  const handleVerify = async () => {
    if (!gstin.trim()) {
      toast.error("Please enter a GSTIN number");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/gstin/verify/${encodeURIComponent(gstin.trim())}`);
      const data = await res.json();

      setResult(data);

      if (data.isValid) {
        toast.success(`✅ Valid GSTIN: ${data.stateName}`);
        if (onVerified) onVerified(gstin.trim(), true);
      } else {
        toast.error(`❌ Invalid GSTIN: ${data.reason || "Checksum failed"}`);
        if (onVerified) onVerified(gstin.trim(), false);
      }
    } catch (err) {
      toast.error("Failed to connect to GSTIN registry verifier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-700 block">
        GSTIN Registration No. (Format: 09AABCA1234F1Z5)
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="09AABCA1234F1Z5"
            maxLength={15}
            className="font-mono text-sm uppercase pr-8"
          />
          {result && (
            <span className="absolute right-2.5 top-2.5">
              {result.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600" />
              )}
            </span>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleVerify}
          disabled={loading || gstin.length < 15}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-3"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Search className="w-3.5 h-3.5 mr-1" />}
          Verify
        </Button>
      </div>

      {result && (
        <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
          result.isValid ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {result.isValid ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong className="font-bold">Verified GSTIN Entity</strong> ({result.stateName})
                <span className="block text-[10px] text-emerald-700">{result.reason}</span>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <strong className="font-bold">Verification Failed</strong>: {result.reason}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
