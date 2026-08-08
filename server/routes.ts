import { Express, Request, Response } from "express";
import {
  AuthCustomLoginSchema,
  PhoneSignupSchema,
  VerifyOtpSchema,
  PharmacyRegisterSchema,
  RevenueCalculatorSchema,
} from "../shared/schemas";
import {
  authRateLimiter,
  publicRateLimiter,
  authenticatedUserRateLimiter,
} from "./middleware/rateLimiter";

export function registerRoutes(app: Express): void {
  // Public Health Endpoint
  app.get("/api/public/health", publicRateLimiter, (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "QuickMed API",
    });
  });

  // Custom Credentials Login Endpoint
  app.post("/api/auth/login", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = AuthCustomLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: `u-${Date.now()}`,
        name: parseResult.data.customName,
        email: parseResult.data.customEmail,
        role: parseResult.data.selectedRole,
      },
    });
  });

  // Phone Sign Up Endpoint
  app.post("/api/auth/phone-signup", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = PhoneSignupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    res.json({
      success: true,
      message: `SMS OTP dispatched to +91 ${parseResult.data.phone}`,
      otpDemoCode: "7392",
    });
  });

  // Verify OTP Endpoint
  app.post("/api/auth/verify-otp", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = VerifyOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    if (parseResult.data.enteredOtp === "7392" || parseResult.data.enteredOtp === "1234") {
      res.json({
        success: true,
        message: "Phone verified successfully",
      });
    } else {
      res.status(401).json({
        error: "Authentication failed",
        message: "Invalid OTP code provided",
      });
    }
  });

  // Pharmacy Store Registration Endpoint
  app.post("/api/pharmacy/register", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = PharmacyRegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    res.json({
      success: true,
      store: {
        id: `p-${Date.now()}`,
        ...parseResult.data,
        rating: "5.0 ★",
        verified: true,
      },
    });
  });

  // Revenue Calculator Simulation Endpoint
  app.post("/api/calculator/revenue", authenticatedUserRateLimiter, (req: Request, res: Response) => {
    const parseResult = RevenueCalculatorSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const { monthlyOrders, avgOrderValue, riderCommission } = parseResult.data;
    const totalGMV = monthlyOrders * avgOrderValue;
    const grossMargin = totalGMV * 0.2;
    const riderCost = monthlyOrders * (avgOrderValue * (riderCommission / 100));
    const netProfit = grossMargin - riderCost;

    res.json({
      success: true,
      calculations: {
        totalGMV,
        grossMargin,
        riderCost,
        netProfit,
        isProfitable: netProfit > 0,
      },
    });
  });
}
