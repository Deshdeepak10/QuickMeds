import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  MapPin,
  FileText,
  Shield,
  Bell,
  CreditCard,
  Save,
  Check,
  Plus,
  Trash2,
  Download,
  KeyRound,
  CheckCircle2,
  Lock,
  Smartphone,
  Mail
} from "lucide-react";
import { toast } from "sonner";

type SettingsTab = "profile" | "addresses" | "prescriptions" | "security" | "notifications" | "billing";

export function AccountSettingsModal() {
  const { isAccountSettingsOpen, setIsAccountSettingsOpen, user, setIsPasswordResetOpen } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile Form State
  const [name, setName] = useState(user?.name || "Sarah Chen");
  const [email, setEmail] = useState(user?.email || "sarah.chen@example.com");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [emergencyContact, setEmergencyContact] = useState("David Chen (+91 98111 22334)");

  // Addresses State
  const [addresses, setAddresses] = useState([
    { id: "1", title: "Home (Primary)", address: "Flat 402, Shipra Sun City, Indirapuram, Ghaziabad", isPrimary: true },
    { id: "2", title: "Office / Work", address: "Tower B, Cyber City, Sector 62, Noida", isPrimary: false },
    { id: "3", title: "Parents' Residence", address: "B-14, Raj Nagar, Ghaziabad", isPrimary: false },
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState({
    orderStatusWhatsApp: true,
    temperatureAlertsSMS: true,
    refillRemindersEmail: true,
    promotionalOffers: false,
  });

  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile details updated successfully!");
  };

  const handleSetPrimaryAddress = (id: string) => {
    setAddresses(
      addresses.map((a) => ({
        ...a,
        isPrimary: a.id === id,
      }))
    );
    toast.success("Primary delivery address updated!");
  };

  return (
    <Dialog open={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen}>
      <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden bg-white text-slate-900 border-slate-200 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              <DialogTitle className="text-base font-bold text-white">
                Account Settings & Preferences
              </DialogTitle>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                {user?.role.toUpperCase()} ACCOUNT
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-300 mt-0.5">
              Manage personal info, saved delivery addresses, chronic refill vault, and security.
            </DialogDescription>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 border-b border-slate-200 bg-slate-50 flex items-center gap-1 overflow-x-auto shrink-0">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "addresses", label: "Addresses", icon: MapPin },
            { id: "prescriptions", label: "Refill Vault", icon: FileText },
            { id: "security", label: "Security", icon: Shield },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "billing", label: "Invoices", icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "border-emerald-600 text-emerald-700 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Full Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-50 border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Account Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-50 border-slate-300 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Registered Email Address</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Emergency Medical Contact</Label>
                <Input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs text-slate-900"
                  placeholder="Relative name and contact number"
                />
                <span className="text-[10px] text-slate-400">Used only during urgent cold-chain medication emergencies.</span>
              </div>

              <div className="pt-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4">
                  <Save className="w-3.5 h-3.5 mr-1" /> Save Profile Details
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Saved Hyperlocal Delivery Locations</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info("Address auto-detection active via Geolocation API")}
                  className="text-xs h-8 border-slate-300"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add New Address
                </Button>
              </div>

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      addr.isPrimary ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-900 text-xs">{addr.title}</span>
                        {addr.isPrimary && (
                          <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0">Primary</Badge>
                        )}
                      </div>
                      <p className="text-slate-600 text-xs mt-1">{addr.address}</p>
                    </div>

                    {!addr.isPrimary && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSetPrimaryAddress(addr.id)}
                        className="text-xs text-emerald-700 hover:bg-emerald-100/60 h-8 self-start sm:self-auto"
                      >
                        Set as Primary
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRESCRIPTION VAULT */}
          {activeTab === "prescriptions" && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-900 text-xs">
                <strong>Prescription Vault:</strong> Encrypted with AES-256. Verified prescriptions allow 1-click refills without re-uploading every month.
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Dr. R. K. Sharma (Cardiologist) - Rx #48291</span>
                    <span className="text-[11px] text-slate-500">Includes: Lantus Insulin 100 IU/ml (Cold-Chain) & Metformin 500mg</span>
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Valid until: Dec 2026 • 2 Refills Remaining</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">Active Vault</Badge>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Dr. A. Sen (Pulmonologist) - Rx #11928</span>
                    <span className="text-[11px] text-slate-500">Includes: Budecort Inhaler 200mcg & Montelukast 10mg</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Valid until: Oct 2026 • 1 Refill Remaining</span>
                  </div>
                  <Badge className="bg-slate-200 text-slate-700 border-slate-300 text-[10px]">Active Vault</Badge>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-4 max-w-xl">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Two-Factor Authentication (2FA)</span>
                    <span className="text-[11px] text-slate-500">Receive an SMS / WhatsApp OTP on every new device login.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => {
                      setTwoFactorEnabled(e.target.checked);
                      toast.success(`Two-factor authentication ${e.target.checked ? "enabled" : "disabled"}`);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Password Management</span>
                  <span className="text-[11px] text-slate-500">Last updated 45 days ago. Minimum 6 characters.</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAccountSettingsOpen(false);
                    setIsPasswordResetOpen(true);
                  }}
                  className="text-xs h-8 border-slate-300"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1" /> Change Password
                </Button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Active Browser Sessions</span>
                  <span className="text-[11px] text-slate-500">Currently active on Windows (Chrome 134) - Ghaziabad, IN</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success("All other device sessions logged out!")}
                  className="text-xs h-8 text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  Logout Other Devices
                </Button>
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-4 max-w-xl">
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">WhatsApp Order Status & Delivery PIN</span>
                    <span className="text-[11px] text-slate-500">Instant updates when order is packed, rider is en route, and PIN code.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.orderStatusWhatsApp}
                    onChange={(e) => setNotifications({ ...notifications, orderStatusWhatsApp: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">SMS Cold-Chain Temperature Alerts</span>
                    <span className="text-[11px] text-slate-500">Instant alert if courier's cold-box crosses the 2°C–8°C limit.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.temperatureAlertsSMS}
                    onChange={(e) => setNotifications({ ...notifications, temperatureAlertsSMS: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Email Chronic Refill Reminders</span>
                    <span className="text-[11px] text-slate-500">Reminder 4 days before daily medicines are estimated to finish.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.refillRemindersEmail}
                    onChange={(e) => setNotifications({ ...notifications, refillRemindersEmail: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INVOICES & BILLING */}
          {activeTab === "billing" && (
            <div className="space-y-4">
              <span className="font-bold text-slate-900 text-xs block">Tax Invoices (CDSCO & GST Compliant)</span>
              <div className="space-y-2.5">
                {[
                  { id: "INV-2026-0091", date: "04 Sep 2026", store: "Apollo Pharmacy Hub", amount: "₹1,540", status: "Paid" },
                  { id: "INV-2026-0042", date: "18 Aug 2026", store: "Apollo Pharmacy Hub", amount: "₹650", status: "Paid" },
                ].map((inv) => (
                  <div key={inv.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{inv.id} • {inv.store}</span>
                      <span className="text-[11px] text-slate-500">Date: {inv.date} • Total: <strong>{inv.amount}</strong></span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success(`Downloading ${inv.id}.pdf`)}
                      className="text-xs h-8 border-slate-300"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> PDF Invoice
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
