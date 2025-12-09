import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import {
  insertFarmerSchema,
  insertFactorySchema,
  insertColdStorageSchema,
  insertInventorySchema,
  insertContactInquirySchema,
  User,
} from "@shared/schema";
import { connectDB } from "./db";

// Extend session type
declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
    role?: string;
  }
}

// Async handler wrapper to catch errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    });
  };

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'parth-agrotech-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // ============ AUTH ROUTES ============

  // Login
  app.post("/api/auth/login", asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username && !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    await connectDB();
    const user = await User.findOne({ username });

    if (!user) {
      // Username doesn't exist
      return res.status(401).json({ error: 'Incorrect username' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Username exists but password is wrong
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Set session
    req.session.userId = (user._id as any).toString();
    req.session.username = user.username;
    req.session.role = user.role || 'admin';

    res.json({
      success: true,
      user: {
        id: (user._id as any).toString(),
        username: user.username,
        role: user.role || 'admin',
      },
    });
  }));

  // Logout
  app.post("/api/auth/logout", asyncHandler(async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  }));

  // Check auth status
  app.get("/api/auth/me", asyncHandler(async (req, res) => {
    if (req.session?.userId) {
      res.json({
        authenticated: true,
        user: {
          id: req.session.userId,
          username: req.session.username,
          role: req.session.role,
        },
      });
    } else {
      res.status(401).json({ authenticated: false });
    }
  }));

  // Create admin user (for initial setup - only works if no admin exists)
  app.post("/api/auth/setup", asyncHandler(async (req, res) => {
    await connectDB();

    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      username,
      password: hashedPassword,
      role: 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      user: {
        id: (admin._id as any).toString(),
        username: admin.username,
        role: admin.role,
      },
    });
  }));

  // ============ EXISTING ROUTES ============

  app.get("/api/farmers", asyncHandler(async (req, res) => {
    const farmers = await storage.getFarmers();
    res.json(farmers);
  }));

  app.get("/api/farmers/:id", asyncHandler(async (req, res) => {
    const farmer = await storage.getFarmer(req.params.id);
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    res.json(farmer);
  }));

  app.post("/api/farmers", asyncHandler(async (req, res) => {
    const result = insertFarmerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const farmer = await storage.createFarmer(result.data);
    res.status(201).json(farmer);
  }));

  app.patch("/api/farmers/:id/status", asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "Status is required" });
    }
    const farmer = await storage.updateFarmerStatus(req.params.id, status);
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    res.json(farmer);
  }));

  app.delete("/api/farmers/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteFarmer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    res.status(204).send();
  }));

  app.get("/api/factories", asyncHandler(async (req, res) => {
    const factories = await storage.getFactories();
    res.json(factories);
  }));

  app.get("/api/factories/:id", asyncHandler(async (req, res) => {
    const factory = await storage.getFactory(req.params.id);
    if (!factory) {
      return res.status(404).json({ error: "Factory not found" });
    }
    res.json(factory);
  }));

  app.post("/api/factories", asyncHandler(async (req, res) => {
    const result = insertFactorySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const factory = await storage.createFactory(result.data);
    res.status(201).json(factory);
  }));

  app.patch("/api/factories/:id", asyncHandler(async (req, res) => {
    const factory = await storage.updateFactory(req.params.id, req.body);
    if (!factory) {
      return res.status(404).json({ error: "Factory not found" });
    }
    res.json(factory);
  }));

  app.delete("/api/factories/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteFactory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Factory not found" });
    }
    res.status(204).send();
  }));

  app.get("/api/cold-storages", asyncHandler(async (req, res) => {
    const storages = await storage.getColdStorages();
    res.json(storages);
  }));

  app.get("/api/cold-storages/:id", asyncHandler(async (req, res) => {
    const coldStorage = await storage.getColdStorage(req.params.id);
    if (!coldStorage) {
      return res.status(404).json({ error: "Cold storage not found" });
    }
    res.json(coldStorage);
  }));

  app.post("/api/cold-storages", asyncHandler(async (req, res) => {
    const result = insertColdStorageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const coldStorage = await storage.createColdStorage(result.data);
    res.status(201).json(coldStorage);
  }));

  app.patch("/api/cold-storages/:id", asyncHandler(async (req, res) => {
    const coldStorage = await storage.updateColdStorage(req.params.id, req.body);
    if (!coldStorage) {
      return res.status(404).json({ error: "Cold storage not found" });
    }
    res.json(coldStorage);
  }));

  app.delete("/api/cold-storages/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteColdStorage(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Cold storage not found" });
    }
    res.status(204).send();
  }));

  app.get("/api/inventory", asyncHandler(async (req, res) => {
    const { storageId, farmerId } = req.query;
    let items;
    if (storageId && typeof storageId === "string") {
      items = await storage.getInventoryByStorage(storageId);
    } else if (farmerId && typeof farmerId === "string") {
      items = await storage.getInventoryByFarmer(farmerId);
    } else {
      items = await storage.getInventory();
    }
    res.json(items);
  }));

  app.post("/api/inventory", asyncHandler(async (req, res) => {
    const result = insertInventorySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const item = await storage.createInventory(result.data);
    res.status(201).json(item);
  }));

  app.patch("/api/inventory/:id", asyncHandler(async (req, res) => {
    const item = await storage.updateInventory(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.json(item);
  }));

  app.delete("/api/inventory/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteInventory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.status(204).send();
  }));

  app.get("/api/contact", asyncHandler(async (req, res) => {
    const inquiries = await storage.getContactInquiries();
    res.json(inquiries);
  }));

  app.post("/api/contact", asyncHandler(async (req, res) => {
    const result = insertContactInquirySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const inquiry = await storage.createContactInquiry(result.data);
    res.status(201).json(inquiry);
  }));

  app.patch("/api/contact/:id/status", asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "Status is required" });
    }
    const inquiry = await storage.updateContactInquiryStatus(req.params.id, status);
    if (!inquiry) {
      return res.status(404).json({ error: "Contact inquiry not found" });
    }
    res.json(inquiry);
  }));

  app.get("/api/stats", asyncHandler(async (req, res) => {
    const farmers = await storage.getFarmers();
    const factories = await storage.getFactories();
    const coldStorages = await storage.getColdStorages();
    const inventory = await storage.getInventory();

    const totalCapacity = coldStorages.reduce((sum, s) => sum + s.capacity, 0);
    const totalStock = coldStorages.reduce((sum, s) => sum + s.currentStock, 0);
    const totalInventory = inventory.reduce((sum, i) => sum + i.quantity, 0);

    res.json({
      totalFarmers: farmers.length,
      pendingFarmers: farmers.filter((f) => f.status === "pending").length,
      approvedFarmers: farmers.filter((f) => f.status === "approved").length,
      totalFactories: factories.length,
      activeFactories: factories.filter((f) => f.status === "active").length,
      totalColdStorages: coldStorages.length,
      onlineStorages: coldStorages.filter((s) => s.status === "online").length,
      totalCapacity,
      totalStock,
      totalInventory,
      utilizationPercent: totalCapacity > 0 ? Math.round((totalStock / totalCapacity) * 100) : 0,
    });
  }));

  return httpServer;
}
