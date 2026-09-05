import { z } from "zod";

/**
 * Strict Input Validation Schemas
 * Rejects invalid types, out-of-range lengths, or unexpected formats.
 */

// Custom Login Form Schema
export const AuthCustomLoginSchema = z.object({
  customName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s.\-']+$/, "Full name contains invalid characters"),
  customEmail: z
    .string()
    .trim()
    .email("Invalid email format")
    .max(255, "Email address cannot exceed 255 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
  selectedRole: z.enum(["patient", "pharmacy", "rider"]),
});

// Phone Sign Up Details Schema
export const PhoneSignupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s.\-']+$/, "Full name contains invalid characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  role: z.enum(["patient", "rider"]),
  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .max(255, "Email cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),
  locationPin: z
    .string()
    .trim()
    .max(250, "Location address cannot exceed 250 characters")
    .optional(),
  vehicleType: z
    .string()
    .trim()
    .max(100, "Vehicle type cannot exceed 100 characters")
    .optional(),
  drivingLicense: z
    .string()
    .trim()
    .max(50, "Driver license ID cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9-]*$/, "Driver license ID contains invalid characters")
    .optional(),
});

// OTP Verification Schema
export const VerifyOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  enteredOtp: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "OTP code must be exactly 4 digits"),
});

// Pharmacy Registration Schema
export const PharmacyRegisterSchema = z.object({
  ownerName: z
    .string()
    .trim()
    .min(2, "Owner name must be at least 2 characters")
    .max(100, "Owner name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s.\-']+$/, "Owner name contains invalid characters"),
  shopName: z
    .string()
    .trim()
    .min(2, "Pharmacy shop title must be at least 2 characters")
    .max(100, "Pharmacy shop title cannot exceed 100 characters"),
  licenseNo: z
    .string()
    .trim()
    .min(5, "Drug License number must be at least 5 characters")
    .max(30, "Drug License number cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9-]+$/, "License number must contain only letters, digits, and hyphens"),
  gstNo: z
    .string()
    .trim()
    .min(10, "GSTIN number must be at least 10 characters")
    .max(20, "GSTIN number cannot exceed 20 characters")
    .optional()
    .or(z.literal("")),
  ownerAadhar: z
    .string()
    .trim()
    .min(12, "Aadhaar number must be at least 12 digits")
    .max(14, "Aadhaar number cannot exceed 14 characters")
    .optional()
    .or(z.literal("")),
  pharmacistRegNo: z
    .string()
    .trim()
    .min(4, "State Council Registration number must be at least 4 characters")
    .max(30, "Registration number cannot exceed 30 characters")
    .optional()
    .or(z.literal("")),
  category: z
    .string()
    .trim()
    .min(3, "Category must be selected")
    .max(100, "Category exceeds maximum length"),
  address: z
    .string()
    .trim()
    .min(5, "Shop address must be at least 5 characters")
    .max(300, "Shop address cannot exceed 300 characters"),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, "").slice(-10))
    .refine((val) => val.length === 10, { message: "Phone number must contain 10 valid digits" }),
  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .max(255, "Email cannot exceed 255 characters"),
  coldChainReady: z.boolean().optional().default(true),
});


// Revenue Calculator Schema
export const RevenueCalculatorSchema = z.object({
  monthlyOrders: z
    .number()
    .int("Monthly orders must be a whole number")
    .min(1, "Monthly orders must be at least 1")
    .max(1000000, "Monthly orders cannot exceed 1,000,000"),
  avgOrderValue: z
    .number()
    .min(1, "Average order value must be at least ₹1")
    .max(100000, "Average order value cannot exceed ₹100,000"),
  riderCommission: z
    .number()
    .min(0, "Commission percentage cannot be negative")
    .max(100, "Commission percentage cannot exceed 100%"),
});

// Prescription Upload Schema
export const PrescriptionUploadSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, "Patient name must be at least 2 characters")
    .max(100, "Patient name cannot exceed 100 characters"),
  patientPhone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  prescriptionNotes: z
    .string()
    .trim()
    .max(1000, "Prescription notes cannot exceed 1000 characters")
    .optional(),
});

// AI Customer Help Chat Agent Schema
export const ChatAgentMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters"),
  language: z.enum(["en", "hi", "hinglish", "bn", "ta", "te", "mr", "gu"]).default("en"),
  context: z
    .object({
      role: z.string().optional(),
      activeTab: z.string().optional(),
      orderId: z.string().optional(),
      location: z.string().optional(),
    })
    .passthrough()
    .optional(),
  conversationHistory: z
    .array(
      z.object({
        sender: z.enum(["user", "agent"]),
        text: z.string().max(1000),
      })
    )
    .max(20)
    .optional(),
});

// GSTIN Verification Schema
export const GSTINVerifySchema = z.object({
  gstin: z
    .string()
    .trim()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format (e.g. 09AABCA1234F1Z5)"),
});

// App Owner Auth Schema
export const OwnerAuthSchema = z.object({
  masterPin: z.string().trim().min(4, "Master PIN required"),
});

// Order Schemas
export const OrderStatusEnum = z.enum([
  "placed",
  "confirmed_preparing",
  "ready_to_dispatch",
  "searching_rider",
  "rider_assigned",
  "at_pharmacy",
  "picked_up",
  "out_for_delivery",
  "delivered",
  "cancelled"
]);

export const OrderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  genericName: z.string().optional(),
  price: z.number(),
  quantity: z.number().min(1),
  requiresColdChain: z.boolean().optional(),
  dosage: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  patientId: z.string().optional().default("u-patient-101"),
  patientName: z.string().default("Sarah Chen"),
  patientPhone: z.string().default("+91 98765 43210"),
  patientAddress: z.string().default("Flat 402, Shipra Sun City, Indirapuram, Ghaziabad"),
  pharmacyId: z.string(),
  pharmacyName: z.string(),
  pharmacyAddress: z.string().optional().default("Kavi Nagar Main Rd, Ghaziabad"),
  pharmacyPhone: z.string().optional().default("+91 98765 43210"),
  items: z.array(OrderItemSchema).min(1, "Order must contain at least one item"),
  totalAmount: z.number(),
  deliveryFee: z.number().optional().default(35),
  isEmergency: z.boolean().optional().default(false),
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
  riderId: z.string().optional(),
  riderName: z.string().optional(),
  riderPhone: z.string().optional(),
  riderVehicle: z.string().optional(),
  pharmacistNote: z.string().optional(),
});

export const VerifyPickupOtpSchema = z.object({
  orderId: z.string(),
  enteredPickupOtp: z.string().trim().regex(/^\d{4}$/, "Pickup OTP must be a 4-digit number"),
});

export const VerifyDeliveryOtpSchema = z.object({
  orderId: z.string(),
  enteredDeliveryOtp: z.string().trim().regex(/^\d{4}$/, "Delivery OTP must be a 4-digit number"),
});

export type AuthCustomLoginInput = z.infer<typeof AuthCustomLoginSchema>;
export type PhoneSignupInput = z.infer<typeof PhoneSignupSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type PharmacyRegisterInput = z.infer<typeof PharmacyRegisterSchema>;
export type RevenueCalculatorInput = z.infer<typeof RevenueCalculatorSchema>;
export type PrescriptionUploadInput = z.infer<typeof PrescriptionUploadSchema>;
export type ChatAgentMessageInput = z.infer<typeof ChatAgentMessageSchema>;
export type GSTINVerifyInput = z.infer<typeof GSTINVerifySchema>;
export type OwnerAuthInput = z.infer<typeof OwnerAuthSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type VerifyPickupOtpInput = z.infer<typeof VerifyPickupOtpSchema>;
export type VerifyDeliveryOtpInput = z.infer<typeof VerifyDeliveryOtpSchema>;
export type OrderStatus = z.infer<typeof OrderStatusEnum>;



