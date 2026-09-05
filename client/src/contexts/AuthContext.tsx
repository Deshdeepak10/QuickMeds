import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "patient" | "pharmacy" | "rider" | "admin";

export interface PharmacyStoreData {
  id: string;
  ownerName: string;
  shopName: string;
  licenseNo: string;
  gstNo?: string;
  ownerAadhar?: string;
  pharmacistRegNo?: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  distance: string;
  rating: string;
  coldChainReady: boolean;
  stockMatched: number;
  etaMinutes: number;
  verificationStatus: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  documentsUploaded?: {
    drugLicensePdf?: string;
    gstCertificatePdf?: string;
    aadharCardPdf?: string;
    pharmacistDegreePdf?: string;
  };
}

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  badge: string;
  avatar: string;
  location?: string;
  licenseNo?: string;
  shopName?: string;
  vehicleType?: string;
  verificationStatus?: "approved" | "pending" | "rejected";
}

export const PRESET_USERS: Record<UserRole, UserSession> = {
  patient: {
    id: "u-patient-101",
    name: "Sarah Chen",
    role: "patient",
    email: "sarah.chen@example.com",
    phone: "+91 98765 43210",
    badge: "Patient #P-8821",
    avatar: "👩‍💼",
    location: "Raj Nagar Extension, Ghaziabad",
    verificationStatus: "approved"
  },
  pharmacy: {
    id: "u-pharmacy-202",
    name: "Apollo Express Pharmacy (Ghaziabad)",
    role: "pharmacy",
    email: "hub.ghaziabad@apollopharmacy.in",
    phone: "+91 98765 11223",
    badge: "Licensed Hub #UP-2021-00921",
    avatar: "🏥",
    licenseNo: "UP-2021-00921",
    shopName: "Apollo Express Hub (Raj Nagar, Ghaziabad)",
    location: "Kavi Nagar Main Rd, Ghaziabad",
    verificationStatus: "approved"
  },
  rider: {
    id: "u-rider-303",
    name: "Vikram Singh",
    role: "rider",
    email: "vikram.rider@arogyaswift.in",
    phone: "+91 98765 99887",
    badge: "Express Courier #R-4402",
    avatar: "🏍️",
    location: "Ghaziabad Central Zone",
    vehicleType: "EV Scooter",
    verificationStatus: "approved"
  },
  admin: {
    id: "u-admin-999",
    name: "ArogyaSwift Compliance Officer (App Owner)",
    role: "admin",
    email: "compliance@arogyaswift.in",
    phone: "+91 120 4991200",
    badge: "Super Admin #SA-001",
    avatar: "👑",
    location: "Ghaziabad Head Office",
    verificationStatus: "approved"
  }
};

export interface OrderTimelineItem {
  stage: string;
  title: string;
  time: string;
  desc: string;
}

export interface OrderItem {
  id: string;
  name: string;
  genericName?: string;
  price: number;
  quantity: number;
  requiresColdChain?: boolean;
  dosage?: string;
}

export type OrderStatus =
  | "placed"
  | "confirmed_preparing"
  | "ready_to_dispatch"
  | "searching_rider"
  | "rider_assigned"
  | "at_pharmacy"
  | "picked_up"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface ActiveOrder {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_address: string;
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_address?: string;
  pharmacy_phone?: string;
  rider_id?: string;
  rider_name?: string;
  rider_phone?: string;
  rider_vehicle?: string;
  items: OrderItem[];
  status: OrderStatus;
  pickup_otp: string;
  delivery_otp: string;
  total_amount: number;
  delivery_fee: number;
  is_emergency: number | boolean;
  timeline: OrderTimelineItem[];
  created_at: string;
  updated_at?: string;
}

export type LegalPolicyId =
  | "privacy"
  | "terms"
  | "cookie"
  | "cookie-preferences"
  | "refund"
  | "cancellation"
  | "shipping"
  | "return-exchange"
  | "disclaimer"
  | "accessibility"
  | "dpa"
  | "acceptable-use"
  | "security"
  | "responsible-disclosure"
  | "community-guidelines"
  | "customer-lifecycle";

interface AuthContextType {
  user: UserSession;
  token: string | null;
  isAuthenticated: boolean;
  loginAsRole: (role: UserRole) => void;
  quickSwitchRole: (role: UserRole) => void;
  loginWithCustom: (name: string, role: UserRole, email: string) => Promise<void>;
  registerPharmacyStore: (store: Omit<PharmacyStoreData, "id" | "distance" | "rating" | "stockMatched" | "etaMinutes"> & { verificationStatus?: "approved" | "pending" | "rejected" }) => Promise<void>;
  approvePharmacyStore: (storeId: string) => Promise<void>;
  rejectPharmacyStore: (storeId: string, reason: string) => Promise<void>;
  registerUserWithPhone: (data: { name: string; phone: string; role: "patient" | "rider"; email?: string; vehicleType?: string; location?: string }) => void;
  registeredPharmacies: PharmacyStoreData[];
  logout: () => void;

  // Order Lifecycle Management
  orders: ActiveOrder[];
  currentOrder: ActiveOrder | null;
  setCurrentOrder: (order: ActiveOrder | null) => void;
  fetchOrders: () => Promise<void>;
  createOrder: (orderData: {
    patientId?: string;
    patientName?: string;
    patientPhone?: string;
    patientAddress?: string;
    pharmacyId: string;
    pharmacyName: string;
    pharmacyAddress?: string;
    pharmacyPhone?: string;
    items: OrderItem[];
    totalAmount: number;
    deliveryFee?: number;
    isEmergency?: boolean;
  }) => Promise<ActiveOrder | null>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    extra?: {
      riderId?: string;
      riderName?: string;
      riderPhone?: string;
      riderVehicle?: string;
      pharmacistNote?: string;
    }
  ) => Promise<ActiveOrder | null>;
  verifyPickupOtp: (orderId: string, enteredPickupOtp: string) => Promise<{ success: boolean; message?: string; error?: string; order?: ActiveOrder }>;
  verifyDeliveryOtp: (orderId: string, enteredDeliveryOtp: string) => Promise<{ success: boolean; message?: string; error?: string; order?: ActiveOrder }>;
  resetDemoOrder: () => Promise<void>;

  // Modals & UI Controls
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalRole: UserRole;
  setAuthModalRole: (role: UserRole) => void;
  isOwnerAuthModalOpen: boolean;
  setIsOwnerAuthModalOpen: (open: boolean) => void;
  isPharmacyRegisterModalOpen: boolean;
  setIsPharmacyRegisterModalOpen: (open: boolean) => void;
  isPhoneSignupModalOpen: boolean;
  setIsPhoneSignupModalOpen: (open: boolean) => void;
  phoneSignupRole: "patient" | "rider";
  setPhoneSignupRole: (role: "patient" | "rider") => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;

  // Legal & Customer Lifecycle Modals
  isLegalModalOpen: boolean;
  setIsLegalModalOpen: (open: boolean) => void;
  legalModalTab: LegalPolicyId;
  setLegalModalTab: (tab: LegalPolicyId) => void;
  openLegalPolicy: (policyId: LegalPolicyId) => void;
  isCookiePreferencesOpen: boolean;
  setIsCookiePreferencesOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isAccountSettingsOpen: boolean;
  setIsAccountSettingsOpen: (open: boolean) => void;
  isHelpCenterOpen: boolean;
  setIsHelpCenterOpen: (open: boolean) => void;
  isEmailVerifyOpen: boolean;
  setIsEmailVerifyOpen: (open: boolean) => void;
  isPasswordResetOpen: boolean;
  setIsPasswordResetOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(PRESET_USERS.patient);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("arogyaswift_jwt"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>("patient");
  const [isOwnerAuthModalOpen, setIsOwnerAuthModalOpen] = useState(false);
  const [isPharmacyRegisterModalOpen, setIsPharmacyRegisterModalOpen] = useState(false);
  const [isPhoneSignupModalOpen, setIsPhoneSignupModalOpen] = useState(false);
  const [phoneSignupRole, setPhoneSignupRole] = useState<"patient" | "rider">("patient");
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<ActiveOrder | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Legal and lifecycle state
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalPolicyId>("privacy");
  const [isCookiePreferencesOpen, setIsCookiePreferencesOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isEmailVerifyOpen, setIsEmailVerifyOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);

  const openLegalPolicy = (policyId: LegalPolicyId) => {
    setLegalModalTab(policyId);
    setIsLegalModalOpen(true);
  };

  const [registeredPharmacies, setRegisteredPharmacies] = useState<PharmacyStoreData[]>([
    {
      id: "p1",
      ownerName: "Pharm. Priya Nair",
      shopName: "Apollo Pharmacy - Express Hub (Raj Nagar, Ghaziabad)",
      licenseNo: "UP-2021-00921",
      category: "Certified Retail Hub",
      address: "Kavi Nagar Main Rd, Ghaziabad",
      phone: "+91 98765 43210",
      email: "hub.ghaziabad@apollopharmacy.in",
      distance: "0.8 km",
      rating: "4.9 ★",
      coldChainReady: true,
      stockMatched: 100,
      etaMinutes: 180,
      verificationStatus: "approved"
    },
    {
      id: "p2",
      ownerName: "Pharm. Suresh Kumar",
      shopName: "MedPlus Superstore (Indirapuram, Ghaziabad)",
      licenseNo: "UP-2019-04120",
      category: "Retail Pharmacy Hub",
      address: "Shipra Sun City, Indirapuram, Ghaziabad",
      phone: "+91 98765 12345",
      email: "indirapuram@medplus.in",
      distance: "1.6 km",
      rating: "4.7 ★",
      coldChainReady: true,
      stockMatched: 100,
      etaMinutes: 180,
      verificationStatus: "approved"
    }
  ]);

  // Fetch registered pharmacies from DB on load
  useEffect(() => {
    fetch("/api/pharmacies")
      .then((res) => res.json())
      .then((data) => {
        if (data.pharmacies && Array.isArray(data.pharmacies)) {
          const mapped = data.pharmacies.map((p: any) => ({
            id: p.id,
            ownerName: p.owner_name,
            shopName: p.shop_name,
            licenseNo: p.license_no,
            gstNo: p.gst_no,
            ownerAadhar: p.owner_aadhar,
            pharmacistRegNo: p.pharmacist_reg_no,
            category: p.category,
            address: p.address,
            phone: p.phone,
            email: p.email,
            distance: "0.8 km",
            rating: p.rating || "5.0 ★",
            coldChainReady: true,
            stockMatched: 100,
            etaMinutes: 180,
            verificationStatus: p.verification_status || "pending",
            rejectionReason: p.rejection_reason,
          }));

          setRegisteredPharmacies(mapped);
        }
      })
      .catch((err) => console.log("Pharmacies fetch note:", err));
  }, []);

  const loginAsRole = (role: UserRole) => {
    setUser(PRESET_USERS[role]);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const loginWithCustom = async (name: string, role: UserRole, email: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customName: name,
          customEmail: email,
          password: "Password123",
          selectedRole: role,
        }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem("arogyaswift_jwt", data.token);
        setUser(data.user);
      } else {
        setUser({
          id: `u-${Date.now()}`,
          name,
          role,
          email,
          badge: `${role.toUpperCase()} #${Math.floor(1000 + Math.random() * 9000)}`,
          avatar: role === "patient" ? "👩‍💼" : role === "pharmacy" ? "🏥" : "🏍️",
          verificationStatus: "approved"
        });
      }
    } catch (err) {
      setUser({
        id: `u-${Date.now()}`,
        name,
        role,
        email,
        badge: `${role.toUpperCase()} #${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: role === "patient" ? "👩‍💼" : role === "pharmacy" ? "🏥" : "🏍️",
        verificationStatus: "approved"
      });
    }

    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const registerPharmacyStore = async (storeInput: Omit<PharmacyStoreData, "id" | "distance" | "rating" | "stockMatched" | "etaMinutes"> & { verificationStatus?: "approved" | "pending" | "rejected" }) => {
    const status = storeInput.verificationStatus || "pending";

    try {
      const res = await fetch("/api/pharmacy/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeInput),
      });

      const data = await res.json();
      if (res.ok && data.store) {
        const newStore: PharmacyStoreData = {
          ...storeInput,
          id: data.store.id,
          distance: "0.5 km",
          rating: "5.0 ★",
          stockMatched: 100,
          etaMinutes: 180,
          verificationStatus: data.store.verificationStatus || "pending"
        };
        setRegisteredPharmacies((prev) => [newStore, ...prev]);

        setUser({
          id: newStore.id,
          name: newStore.shopName,
          role: "pharmacy",
          email: newStore.email,
          phone: newStore.phone,
          badge: `DL #${newStore.licenseNo}`,
          avatar: "🏥",
          shopName: newStore.shopName,
          licenseNo: newStore.licenseNo,
          location: newStore.address,
          verificationStatus: newStore.verificationStatus
        });
      }
    } catch (err) {
      const newStore: PharmacyStoreData = {
        ...storeInput,
        id: `p-${Date.now()}`,
        distance: "0.5 km",
        rating: "5.0 ★",
        stockMatched: 100,
        etaMinutes: 180,
        verificationStatus: status
      };
      setRegisteredPharmacies((prev) => [newStore, ...prev]);
    }

    setIsAuthenticated(true);
    setIsPharmacyRegisterModalOpen(false);
  };

  const approvePharmacyStore = async (storeId: string) => {
    try {
      await fetch("/api/owner/approve-pharmacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId }),
      });
    } catch (err) {
      console.error(err);
    }

    setRegisteredPharmacies((prev) =>
      prev.map((store) =>
        store.id === storeId || store.licenseNo === storeId
          ? { ...store, verificationStatus: "approved" as const, rejectionReason: undefined }
          : store
      )
    );

    setUser((prev) => ({
      ...prev,
      verificationStatus: "approved" as const
    }));
  };

  const rejectPharmacyStore = async (storeId: string, reason: string) => {
    try {
      await fetch("/api/owner/reject-pharmacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId, reason }),
      });
    } catch (err) {
      console.error(err);
    }

    setRegisteredPharmacies((prev) =>
      prev.map((store) =>
        store.id === storeId || store.licenseNo === storeId
          ? { ...store, verificationStatus: "rejected" as const, rejectionReason: reason }
          : store
      )
    );

    setUser((prev) => ({
      ...prev,
      verificationStatus: "rejected" as const
    }));
  };

  const registerUserWithPhone = (data: { name: string; phone: string; role: "patient" | "rider"; email?: string; vehicleType?: string; location?: string }) => {
    const formattedPhone = data.phone.startsWith("+91") ? data.phone : `+91 ${data.phone}`;

    setUser({
      id: `u-${Date.now()}`,
      name: data.name,
      role: data.role,
      phone: formattedPhone,
      email: data.email || `${data.phone}@arogyaswift.in`,
      badge: data.role === "patient" ? `Patient #${Math.floor(1000 + Math.random() * 9000)}` : `Rider #${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: data.role === "patient" ? "👩‍💼" : "🏍️",
      vehicleType: data.vehicleType,
      location: data.location || "Ghaziabad, Uttar Pradesh"
    });

    setIsAuthenticated(true);
    setIsPhoneSignupModalOpen(false);
  };

  const quickSwitchRole = (role: UserRole) => {
    setUser(PRESET_USERS[role]);
    setIsAuthenticated(true);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
          if (data.orders.length > 0) {
            setCurrentOrder((prev) => {
              if (!prev) return data.orders[0];
              const updated = data.orders.find((o: ActiveOrder) => o.id === prev.id);
              return updated || data.orders[0];
            });
          } else {
            // Auto seed demo order if empty
            await fetch("/api/orders/seed-demo", { method: "POST" });
            const seedRes = await fetch("/api/orders");
            const seedData = await seedRes.json();
            if (seedData.orders && seedData.orders.length > 0) {
              setOrders(seedData.orders);
              setCurrentOrder(seedData.orders[0]);
            }
          }
        }
      }
    } catch (err) {
      console.log("Orders sync note:", err);
    }
  };

  // Sync orders on mount and periodically every 2.5s for multi-portal synchronization
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 2500);
    return () => clearInterval(interval);
  }, []);

  const createOrder = async (orderData: {
    patientId?: string;
    patientName?: string;
    patientPhone?: string;
    patientAddress?: string;
    pharmacyId: string;
    pharmacyName: string;
    pharmacyAddress?: string;
    pharmacyPhone?: string;
    items: OrderItem[];
    totalAmount: number;
    deliveryFee?: number;
    isEmergency?: boolean;
  }): Promise<ActiveOrder | null> => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders((prev) => [data.order, ...prev]);
        setCurrentOrder(data.order);
        return data.order;
      }
      return null;
    } catch (err) {
      console.error("Create order failed:", err);
      return null;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    extra?: {
      riderId?: string;
      riderName?: string;
      riderPhone?: string;
      riderVehicle?: string;
      pharmacistNote?: string;
    }
  ): Promise<ActiveOrder | null> => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        setCurrentOrder(data.order);
        return data.order;
      }
      return null;
    } catch (err) {
      console.error("Update order status failed:", err);
      return null;
    }
  };

  const verifyPickupOtp = async (orderId: string, enteredPickupOtp: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/verify-pickup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enteredPickupOtp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        setCurrentOrder(data.order);
        return { success: true, message: data.message, order: data.order };
      }
      return { success: false, error: data.error || "Invalid Pickup OTP" };
    } catch (err: any) {
      return { success: false, error: err.message || "Pickup verification failed" };
    }
  };

  const verifyDeliveryOtp = async (orderId: string, enteredDeliveryOtp: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/verify-delivery-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enteredDeliveryOtp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        setCurrentOrder(data.order);
        return { success: true, message: data.message, order: data.order };
      }
      return { success: false, error: data.error || "Invalid Delivery OTP" };
    } catch (err: any) {
      return { success: false, error: err.message || "Delivery verification failed" };
    }
  };

  const resetDemoOrder = async () => {
    try {
      await fetch("/api/orders/seed-demo", { method: "POST" });
      await fetchOrders();
    } catch (err) {
      console.error("Reset demo order failed:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("arogyaswift_jwt");
    setToken(null);
    setIsAuthenticated(false);
    setUser(PRESET_USERS.patient);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loginAsRole,
        quickSwitchRole,
        loginWithCustom,
        registerPharmacyStore,
        approvePharmacyStore,
        rejectPharmacyStore,
        registerUserWithPhone,
        registeredPharmacies,
        logout,

        // Order Lifecycle Management
        orders,
        currentOrder,
        setCurrentOrder,
        fetchOrders,
        createOrder,
        updateOrderStatus,
        verifyPickupOtp,
        verifyDeliveryOtp,
        resetDemoOrder,

        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalRole,
        setAuthModalRole,
        isOwnerAuthModalOpen,
        setIsOwnerAuthModalOpen,
        isPharmacyRegisterModalOpen,
        setIsPharmacyRegisterModalOpen,
        isPhoneSignupModalOpen,
        setIsPhoneSignupModalOpen,
        phoneSignupRole,
        setPhoneSignupRole,
        isDemoModalOpen,
        setIsDemoModalOpen,

        // Legal & Lifecycle Modals
        isLegalModalOpen,
        setIsLegalModalOpen,
        legalModalTab,
        setLegalModalTab,
        openLegalPolicy,
        isCookiePreferencesOpen,
        setIsCookiePreferencesOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isAccountSettingsOpen,
        setIsAccountSettingsOpen,
        isHelpCenterOpen,
        setIsHelpCenterOpen,
        isEmailVerifyOpen,
        setIsEmailVerifyOpen,
        isPasswordResetOpen,
        setIsPasswordResetOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
