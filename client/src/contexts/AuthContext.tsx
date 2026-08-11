import React, { createContext, useContext, useState } from "react";

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
    email: "vikram.rider@quickmed.in",
    phone: "+91 98765 99887",
    badge: "Express Courier #R-4402",
    avatar: "🏍️",
    location: "Ghaziabad Central Zone",
    vehicleType: "EV Scooter (Cold Storage Box)",
    verificationStatus: "approved"
  },
  admin: {
    id: "u-admin-999",
    name: "QuickMed Compliance Officer (App Owner)",
    role: "admin",
    email: "compliance@quickmed.in",
    phone: "+91 120 4991200",
    badge: "Super Admin #SA-001",
    avatar: "👑",
    location: "Ghaziabad Head Office",
    verificationStatus: "approved"
  }
};

interface AuthContextType {
  user: UserSession;
  isAuthenticated: boolean;
  loginAsRole: (role: UserRole) => void;
  loginWithCustom: (name: string, role: UserRole, email: string) => void;
  registerPharmacyStore: (store: Omit<PharmacyStoreData, "id" | "distance" | "rating" | "stockMatched" | "etaMinutes"> & { verificationStatus?: "approved" | "pending" | "rejected" }) => void;
  approvePharmacyStore: (storeId: string) => void;
  rejectPharmacyStore: (storeId: string, reason: string) => void;
  registerUserWithPhone: (data: { name: string; phone: string; role: "patient" | "rider"; email?: string; vehicleType?: string; location?: string }) => void;
  registeredPharmacies: PharmacyStoreData[];
  logout: () => void;


  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isOwnerAuthModalOpen: boolean;
  setIsOwnerAuthModalOpen: (open: boolean) => void;
  isPharmacyRegisterModalOpen: boolean;
  setIsPharmacyRegisterModalOpen: (open: boolean) => void;
  isPhoneSignupModalOpen: boolean;
  setIsPhoneSignupModalOpen: (open: boolean) => void;
  phoneSignupRole: "patient" | "rider";
  setPhoneSignupRole: (role: "patient" | "rider") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(PRESET_USERS.patient);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOwnerAuthModalOpen, setIsOwnerAuthModalOpen] = useState(false);
  const [isPharmacyRegisterModalOpen, setIsPharmacyRegisterModalOpen] = useState(false);
  const [isPhoneSignupModalOpen, setIsPhoneSignupModalOpen] = useState(false);
  const [phoneSignupRole, setPhoneSignupRole] = useState<"patient" | "rider">("patient");


  const [registeredPharmacies, setRegisteredPharmacies] = useState<PharmacyStoreData[]>([
    {
      id: "p1",
      ownerName: "Pharm. Priya Nair",
      shopName: "Apollo Pharmacy - Express Hub (Raj Nagar, Ghaziabad)",
      licenseNo: "UP-2021-00921",
      category: "Cold-Chain Certified Retail",
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

  const loginAsRole = (role: UserRole) => {
    setUser(PRESET_USERS[role]);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const loginWithCustom = (name: string, role: UserRole, email: string) => {
    setUser({
      id: `u-${Date.now()}`,
      name,
      role,
      email,
      badge: `${role.toUpperCase()} #${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: role === "patient" ? "👩‍💼" : role === "pharmacy" ? "🏥" : "🏍️",
      verificationStatus: "approved"
    });
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const registerPharmacyStore = (storeInput: Omit<PharmacyStoreData, "id" | "distance" | "rating" | "stockMatched" | "etaMinutes"> & { verificationStatus?: "approved" | "pending" | "rejected" }) => {

    const status = storeInput.verificationStatus || "approved";
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
      verificationStatus: status
    });

    setIsAuthenticated(true);
    setIsPharmacyRegisterModalOpen(false);
  };

  const approvePharmacyStore = (storeId: string) => {
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

  const rejectPharmacyStore = (storeId: string, reason: string) => {
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
      email: data.email || `${data.phone}@quickmed.in`,
      badge: data.role === "patient" ? `Patient #${Math.floor(1000 + Math.random() * 9000)}` : `Rider #${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: data.role === "patient" ? "👩‍💼" : "🏍️",
      vehicleType: data.vehicleType,
      location: data.location || "Indiranagar, Bangalore"
    });

    setIsAuthenticated(true);
    setIsPhoneSignupModalOpen(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(PRESET_USERS.patient);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loginAsRole,
        loginWithCustom,
        registerPharmacyStore,
        approvePharmacyStore,
        rejectPharmacyStore,
        registerUserWithPhone,
        registeredPharmacies,
        logout,

        isAuthModalOpen,
        setIsAuthModalOpen,
        isOwnerAuthModalOpen,
        setIsOwnerAuthModalOpen,
        isPharmacyRegisterModalOpen,
        setIsPharmacyRegisterModalOpen,
        isPhoneSignupModalOpen,
        setIsPhoneSignupModalOpen,
        phoneSignupRole,
        setPhoneSignupRole
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
