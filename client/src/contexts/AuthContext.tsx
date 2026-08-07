import React, { createContext, useContext, useState } from "react";

export type UserRole = "patient" | "pharmacy" | "rider";

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  badge: string;
  avatar: string;
  location?: string;
  licenseNo?: string;
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
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(PRESET_USERS.patient);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  const logout = () => {
    setUser(PRESET_USERS.patient);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsRole,
        loginWithCustom,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen
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
