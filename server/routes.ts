import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertFarmerSchema,
  insertFactorySchema,
  insertColdStorageSchema,
  insertInventorySchema,
  insertContactInquirySchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/farmers", async (req, res) => {
    const farmers = await storage.getFarmers();
    res.json(farmers);
  });

  app.get("/api/farmers/:id", async (req, res) => {
    const farmer = await storage.getFarmer(req.params.id);
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    res.json(farmer);
  });

  app.post("/api/farmers", async (req, res) => {
    const result = insertFarmerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const farmer = await storage.createFarmer(result.data);
    res.status(201).json(farmer);
  });

  app.patch("/api/farmers/:id/status", async (req, res) => {
    const { status } = req.body;
    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "Status is required" });
    }
    const farmer = await storage.updateFarmerStatus(req.params.id, status);
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    res.json(farmer);
  });

  app.delete("/api/farmers/:id", async (req, res) => {
    const deleted = await storage.deleteFarmer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    res.status(204).send();
  });

  app.get("/api/factories", async (req, res) => {
    const factories = await storage.getFactories();
    res.json(factories);
  });

  app.get("/api/factories/:id", async (req, res) => {
    const factory = await storage.getFactory(req.params.id);
    if (!factory) {
      return res.status(404).json({ error: "Factory not found" });
    }
    res.json(factory);
  });

  app.post("/api/factories", async (req, res) => {
    const result = insertFactorySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const factory = await storage.createFactory(result.data);
    res.status(201).json(factory);
  });

  app.patch("/api/factories/:id", async (req, res) => {
    const factory = await storage.updateFactory(req.params.id, req.body);
    if (!factory) {
      return res.status(404).json({ error: "Factory not found" });
    }
    res.json(factory);
  });

  app.delete("/api/factories/:id", async (req, res) => {
    const deleted = await storage.deleteFactory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Factory not found" });
    }
    res.status(204).send();
  });

  app.get("/api/cold-storages", async (req, res) => {
    const storages = await storage.getColdStorages();
    res.json(storages);
  });

  app.get("/api/cold-storages/:id", async (req, res) => {
    const coldStorage = await storage.getColdStorage(req.params.id);
    if (!coldStorage) {
      return res.status(404).json({ error: "Cold storage not found" });
    }
    res.json(coldStorage);
  });

  app.post("/api/cold-storages", async (req, res) => {
    const result = insertColdStorageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const coldStorage = await storage.createColdStorage(result.data);
    res.status(201).json(coldStorage);
  });

  app.patch("/api/cold-storages/:id", async (req, res) => {
    const coldStorage = await storage.updateColdStorage(req.params.id, req.body);
    if (!coldStorage) {
      return res.status(404).json({ error: "Cold storage not found" });
    }
    res.json(coldStorage);
  });

  app.delete("/api/cold-storages/:id", async (req, res) => {
    const deleted = await storage.deleteColdStorage(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Cold storage not found" });
    }
    res.status(204).send();
  });

  app.get("/api/inventory", async (req, res) => {
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
  });

  app.post("/api/inventory", async (req, res) => {
    const result = insertInventorySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const item = await storage.createInventory(result.data);
    res.status(201).json(item);
  });

  app.patch("/api/inventory/:id", async (req, res) => {
    const item = await storage.updateInventory(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.json(item);
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    const deleted = await storage.deleteInventory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.status(204).send();
  });

  app.get("/api/contact", async (req, res) => {
    const inquiries = await storage.getContactInquiries();
    res.json(inquiries);
  });

  app.post("/api/contact", async (req, res) => {
    const result = insertContactInquirySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const inquiry = await storage.createContactInquiry(result.data);
    res.status(201).json(inquiry);
  });

  app.patch("/api/contact/:id/status", async (req, res) => {
    const { status } = req.body;
    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "Status is required" });
    }
    const inquiry = await storage.updateContactInquiryStatus(req.params.id, status);
    if (!inquiry) {
      return res.status(404).json({ error: "Contact inquiry not found" });
    }
    res.json(inquiry);
  });

  app.get("/api/stats", async (req, res) => {
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
  });

  return httpServer;
}
