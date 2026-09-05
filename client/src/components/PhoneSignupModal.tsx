import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, User, Bike, MapPin, Mail } from "lucide-react";
import { toast } from "sonner";
import { PhoneSignupSchema } from "@shared/schemas";

export function PhoneSignupModal() {
  const [, setLocation] = useLocation();
  const { isPhoneSignupModalOpen, setIsPhoneSignupModalOpen, phoneSignupRole, registerUserWithPhone } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [locationPin, setLocationPin] = useState("");
  const [vehicleType, setVehicleType] = useState("EV Scooter (Cold Storage Box)");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear inputs whenever the modal opens or role switches
  useEffect(() => {
    if (isPhoneSignupModalOpen) {
      setName("");
      setPhone("");
      setEmail("");
      setLocationPin("");
      setDrivingLicense("");
    }
  }, [isPhoneSignupModalOpen, phoneSignupRole]);

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
      toast.error(result.error.issues[0]?.message || "Invalid registration details provided.");
      return;
    }

    setIsSubmitting(true);

    registerUserWithPhone({
      name,
      phone,
      role: phoneSignupRole,
      email: email || undefined,
      vehicleType: phoneSignupRole === "rider" ? vehicleType : undefined,
      location: locationPin,
    });

    const roleName = phoneSignupRole === "patient" ? "Patient" : "Delivery Partner";
    toast.success(`Registration complete! Welcome to ArogyaSwift as a ${roleName}.`);
    setIsSubmitting(false);
    setIsPhoneSignupModalOpen(false);
    setLocation("/app");
  };

  const isPatient = phoneSignupRole === "patient";

  return (
    <Dialog open={isPhoneSignupModalOpen} onOpenChange={setIsPhoneSignupModalOpen}>
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl text-white shadow-md ${
                isPatient
                  ? "bg-emerald-600 shadow-emerald-600/20"
                  : "bg-cyan-600 shadow-cyan-600/20"
              }`}
            >
              {isPatient ? <User className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {isPatient ? "Patient Sign Up" : "Delivery Rider Sign Up"}
                </DialogTitle>
                <Badge
                  className={
                    isPatient
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]"
                      : "bg-cyan-100 text-cyan-800 border-cyan-200 text-[10px]"
                  }
                >
                  {isPatient ? "Patient" : "Express Courier"}
                </Badge>
              </div>
              <DialogDescription className="text-slate-600 text-xs mt-0.5">
                {isPatient
                  ? "Sign up with your mobile number to order verified medicines and track deliveries in real time."
                  : "Sign up with your mobile number as a delivery partner for cold-chain packages."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Details */}
        <form onSubmit={handlePhoneSignup} className="space-y-3.5 mt-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
              <User className={`w-3.5 h-3.5 ${isPatient ? "text-emerald-600" : "text-cyan-600"}`} /> Full Name *
            </label>
            <Input
              placeholder={isPatient ? "e.g. Sarah Chen" : "e.g. Vikram Singh"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
              <Phone className={`w-3.5 h-3.5 ${isPatient ? "text-emerald-600" : "text-cyan-600"}`} /> Mobile Phone Number *
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

          {isPatient ? (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Delivery Address / Location Pin
              </label>
              <Input
                placeholder="e.g. Indiranagar 100ft Rd, Bangalore"
                value={locationPin}
                onChange={(e) => setLocationPin(e.target.value)}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:ring-emerald-500"
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">Driver's License ID</label>
                <Input
                  placeholder="e.g. DL-04202100982"
                  value={drivingLicense}
                  onChange={(e) => setDrivingLicense(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:ring-cyan-500"
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
              placeholder={isPatient ? "user@example.com" : "rider@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-bold py-5 text-sm shadow-md mt-2 flex items-center justify-center gap-2 ${
              isPatient
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-cyan-600 hover:bg-cyan-700 text-white"
            }`}
          >
            {isSubmitting
              ? "Creating Account..."
              : isPatient
              ? "Complete Patient Sign Up & Continue →"
              : "Complete Rider Sign Up & Continue →"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
