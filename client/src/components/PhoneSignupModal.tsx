import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, User, Bike, ShieldCheck, ArrowRight, CheckCircle2, MapPin, Mail, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { PhoneSignupSchema } from "@shared/schemas";

export function PhoneSignupModal() {
  const [, setLocation] = useLocation();
  const { isPhoneSignupModalOpen, setIsPhoneSignupModalOpen, phoneSignupRole, setPhoneSignupRole, registerUserWithPhone } = useAuth();

  const [name, setName] = useState("Sarah Chen");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [locationPin, setLocationPin] = useState("Indiranagar, Bangalore (560038)");
  const [vehicleType, setVehicleType] = useState("EV Scooter (Cold Storage Box)");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = PhoneSignupSchema.safeParse({
      name,
      phone,
      role: phoneSignupRole,
      email: email || undefined,
      locationPin,
      vehicleType: phoneSignupRole === "rider" ? vehicleType : undefined,
      drivingLicense: phoneSignupRole === "rider" ? drivingLicense : undefined,
    });

    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "Invalid sign up details provided");
      return;
    }

    setIsSubmitting(true);

    // Instant registration (OTP verification bypassed per user configuration)
    registerUserWithPhone({
      name,
      phone,
      role: phoneSignupRole,
      email: email || undefined,
      vehicleType: phoneSignupRole === "rider" ? vehicleType : undefined,
      location: locationPin,
    });

    toast.success(`🎉 Instant Registration Complete! Logged in as ${phoneSignupRole.toUpperCase()}`);
    setIsSubmitting(false);
    setIsPhoneSignupModalOpen(false);
    setLocation("/app");
  };

  return (
    <Dialog open={isPhoneSignupModalOpen} onOpenChange={setIsPhoneSignupModalOpen}>
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Phone Number Sign Up
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-xs">
                Register as a Patient or Delivery Rider instantly using your mobile phone number.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 mt-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setPhoneSignupRole("patient")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              phoneSignupRole === "patient"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Patient Sign Up
          </button>
          <button
            type="button"
            onClick={() => setPhoneSignupRole("rider")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              phoneSignupRole === "rider"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bike className="w-3.5 h-3.5" /> Delivery Rider
          </button>
        </div>

        {/* Form Details */}
        <form onSubmit={handlePhoneSignup} className="space-y-3.5 mt-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600" /> Full Name *
            </label>
            <Input
              placeholder="e.g. Sarah Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> Mobile Phone Number *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono font-bold">+91</span>
              <Input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                className="pl-12 bg-slate-50 border-slate-300 font-mono text-slate-900 text-sm font-bold"
                required
              />
            </div>
          </div>

          {phoneSignupRole === "patient" ? (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Delivery Address / Location Pin
              </label>
              <Input
                placeholder="e.g. Indiranagar 100ft Rd, Bangalore"
                value={locationPin}
                onChange={(e) => setLocationPin(e.target.value)}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle Type</label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger className="bg-slate-50 border-slate-300 text-slate-900 text-sm">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EV Scooter (Cold Storage Box)">EV Scooter (Cold Storage Box)</SelectItem>
                    <SelectItem value="Motorbike (Insulated Bag)">Motorbike (Insulated Bag)</SelectItem>
                    <SelectItem value="Bicycle (Express Local)">Bicycle (Express Local)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Driver License ID</label>
                <Input
                  placeholder="e.g. DL-04202100982"
                  value={drivingLicense}
                  onChange={(e) => setDrivingLicense(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address (Optional)
            </label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-bold py-5 text-sm shadow-md mt-2 flex items-center justify-center gap-2 ${
              phoneSignupRole === "patient" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-cyan-600 hover:bg-cyan-700 text-white"
            }`}
          >
            {isSubmitting ? "Creating Account..." : "Complete Sign Up & Continue →"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
