import React, { createContext, useContext, useState } from "react";

export type UserRole = "patient" | "pharmacy" | "rider";

export interface PharmacyStoreData {
  id: string;
  ownerName: string;
  shopName: string;
  licenseNo: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  distance: string;
  rating: string;
  coldChainReady: boolean;
  stockMatched: number;
  etaMinutes: number;
}

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  badge: string;
  avatar: string;
  location?: string;
  licenseNo?: string;
  shopName?: string;
}

export const PRESET_USERS: Record<UserRole, UserSession> = {
  patient: {
    id: "u-patient-101",
    name: "Sarah Chen",
    role: "patient",
    email: "sarah.chen@example.com",
    badge: "Patient #P-8821",
    avatar: "👩‍💼",
    location: "Indiranagar, Bangalore"
  },
  pharmacy: {
    id: "u-pharmacy-202",
    name: "Apollo Express Pharmacy",
    role: "pharmacy",
    email: "hub.indiranagar@apollopharmacy.in",
    badge: "Licensed Hub #KA-2021-00921",
    avatar: "🏥",
    licenseNo: "KA-2021-00921",
    shopName: "Apollo Express Hub (Indiranagar)",
    location: "Indiranagar 100ft Rd"
  },
  rider: {
    id: "u-rider-303",
    name: "Vikram Singh",
    role: "rider",
    email: "vikram.rider@quickmed.in",
    badge: "Express Courier #R-4402",
    avatar: "🏍️",
    location: "Indiranagar Zone 4"
  }
};

interface AuthContextType {
  user: UserSession;
  loginAsRole: (role: UserRole) => void;
  loginWithCustom: (name: string, role: UserRole, email: string) => void;
  registerPharmacyStore: (store: Omit<PharmacyStoreData, "id" | "distance" | "rating" | "stockMatched" | "etaMinutes">) => void;
  registeredPharmacies: PharmacyStoreData[];
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isPharmacyRegisterModalOpen: boolean;
  setIsPharmacyRegisterModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(PRESET_USERS.patient);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPharmacyRegisterModalOpen, setIsPharmacyRegisterModalOpen] = useState(false);
  const [registeredPharmacies, setRegisteredPharmacies] = useState<PharmacyStoreData[]>([
    {
      id: "p1",
      ownerName: "Pharm. Priya Nair",
      shopName: "Apollo Pharmacy - Express Hub (Indiranagar)",
      licenseNo: "KA-2021-00921",
      category: "Cold-Chain Certified Retail",
      address: "Indiranagar 100ft Rd, Bangalore",
      phone: "+91 98765 43210",
      email: "hub.indiranagar@apollopharmacy.in",
      distance: "0.8 km",
      rating: "4.9 ★",
      coldChainReady: true,
      stockMatched: 100,
      etaMinutes: 18
    },
    {
      id: "p2",
      ownerName: "Pharm. Suresh Kumar",
      shopName: "MedPlus Superstore (Koramangala)",
      licenseNo: "KA-2019-04120",
      category: "Retail Pharmacy Hub",
      address: "Koramangala 8th Block, Bangalore",
      phone: "+91 98765 12345",
      email: "koramangala@medplus.in",
      distance: "1.6 km",
      rating: "4.7 ★",
      coldChainReady: true,
      stockMatched: 100,
      etaMinutes: 25
    }
  ]);

  const loginAsRole = (role: UserRole) => {
    setUser(PRESET_USERS[role]);
    setIsAuthModalOpen(false);
  };

  const loginWithCustom = (name: string, role: UserRole, email: string) => {
    setUser({
      id: `u-${Date.now()}`,
      name,
      role,
      email,
      badge: `${role.toUpperCase()} #${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: role === "patient" ? "👤" : role === "pharmacy" ? "🏪" : "🛵"
    });
    setIsAuthModalOpen(false);
  };

  const registerPharmacyStore = (storeInput: Omit<PharmacyStoreData, "id" | "distance" | "rating" | "stockMatched" | "etaMinutes">) => {
    const newStore: PharmacyStoreData = {
      ...storeInput,
      id: `p-${Date.now()}`,
      distance: "0.5 km",
      rating: "5.0 ★",
      stockMatched: 100,
      etaMinutes: 15
    };

    setRegisteredPharmacies((prev) => [newStore, ...prev]);

    // Set logged-in session to this registered pharmacy
    setUser({
      id: newStore.id,
      name: newStore.shopName,
      role: "pharmacy",
      email: newStore.email,
      badge: `DL #${newStore.licenseNo}`,
      avatar: "🏥",
      shopName: newStore.shopName,
      licenseNo: newStore.licenseNo,
      location: newStore.address
    });

    setIsPharmacyRegisterModalOpen(false);
  };

  const logout = () => {
    setUser(PRESET_USERS.patient);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsRole,
        loginWithCustom,
        registerPharmacyStore,
        registeredPharmacies,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isPharmacyRegisterModalOpen,
        setIsPharmacyRegisterModalOpen
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
