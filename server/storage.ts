import {
  User,
  Farmer,
  Factory,
  ColdStorage,
  Inventory,
  ContactInquiry,
  type InsertUser,
  type InsertFarmer,
  type InsertFactory,
  type InsertColdStorage,
  type InsertInventory,
  type InsertContactInquiry,
} from "@shared/schema";
import { connectDB } from "./db";

// Helper to convert MongoDB document to plain object with id
function toPlainObject<T>(doc: any): T & { id: string } {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id?.toString() || obj.id,
  };
}

function toPlainArray<T>(docs: any[]): (T & { id: string })[] {
  return docs.map(doc => toPlainObject<T>(doc));
}

export interface IStorage {
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: InsertUser): Promise<any>;

  getFarmers(): Promise<any[]>;
  getFarmer(id: string): Promise<any | undefined>;
  createFarmer(farmer: InsertFarmer): Promise<any>;
  updateFarmerStatus(id: string, status: string): Promise<any | undefined>;
  deleteFarmer(id: string): Promise<boolean>;

  getFactories(): Promise<any[]>;
  getFactory(id: string): Promise<any | undefined>;
  createFactory(factory: InsertFactory): Promise<any>;
  updateFactory(id: string, updates: Partial<any>): Promise<any | undefined>;
  deleteFactory(id: string): Promise<boolean>;

  getColdStorages(): Promise<any[]>;
  getColdStorage(id: string): Promise<any | undefined>;
  createColdStorage(storage: InsertColdStorage): Promise<any>;
  updateColdStorage(id: string, updates: Partial<any>): Promise<any | undefined>;
  deleteColdStorage(id: string): Promise<boolean>;

  getInventory(): Promise<any[]>;
  getInventoryByStorage(storageId: string): Promise<any[]>;
  getInventoryByFarmer(farmerId: string): Promise<any[]>;
  createInventory(item: InsertInventory): Promise<any>;
  updateInventory(id: string, updates: Partial<any>): Promise<any | undefined>;
  deleteInventory(id: string): Promise<boolean>;

  getContactInquiries(): Promise<any[]>;
  createContactInquiry(inquiry: InsertContactInquiry): Promise<any>;
  updateContactInquiryStatus(id: string, status: string): Promise<any | undefined>;
}

export class DatabaseStorage implements IStorage {
  private async ensureConnection() {
    await connectDB();
  }

  async getUser(id: string): Promise<any | undefined> {
    await this.ensureConnection();
    const user = await User.findById(id);
    return user ? toPlainObject(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    await this.ensureConnection();
    const user = await User.findOne({ username });
    return user ? toPlainObject(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<any> {
    await this.ensureConnection();
    const user = await User.create(insertUser);
    return toPlainObject(user);
  }

  async getFarmers(): Promise<any[]> {
    await this.ensureConnection();
    const farmers = await Farmer.find();
    return toPlainArray(farmers);
  }

  async getFarmer(id: string): Promise<any | undefined> {
    await this.ensureConnection();
    const farmer = await Farmer.findById(id);
    return farmer ? toPlainObject(farmer) : undefined;
  }

  async createFarmer(insertFarmer: InsertFarmer): Promise<any> {
    await this.ensureConnection();
    const farmer = await Farmer.create({ ...insertFarmer, status: "pending" });
    return toPlainObject(farmer);
  }

  async updateFarmerStatus(id: string, status: string): Promise<any | undefined> {
    await this.ensureConnection();
    const farmer = await Farmer.findByIdAndUpdate(id, { status }, { new: true });
    return farmer ? toPlainObject(farmer) : undefined;
  }

  async deleteFarmer(id: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await Farmer.findByIdAndDelete(id);
    return !!result;
  }

  async getFactories(): Promise<any[]> {
    await this.ensureConnection();
    const factories = await Factory.find();
    return toPlainArray(factories);
  }

  async getFactory(id: string): Promise<any | undefined> {
    await this.ensureConnection();
    const factory = await Factory.findById(id);
    return factory ? toPlainObject(factory) : undefined;
  }

  async createFactory(insertFactory: InsertFactory): Promise<any> {
    await this.ensureConnection();
    const factory = await Factory.create({ ...insertFactory, status: "active" });
    return toPlainObject(factory);
  }

  async updateFactory(id: string, updates: Partial<any>): Promise<any | undefined> {
    await this.ensureConnection();
    const factory = await Factory.findByIdAndUpdate(id, updates, { new: true });
    return factory ? toPlainObject(factory) : undefined;
  }

  async deleteFactory(id: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await Factory.findByIdAndDelete(id);
    return !!result;
  }

  async getColdStorages(): Promise<any[]> {
    await this.ensureConnection();
    const storages = await ColdStorage.find();
    return toPlainArray(storages);
  }

  async getColdStorage(id: string): Promise<any | undefined> {
    await this.ensureConnection();
    const storage = await ColdStorage.findById(id);
    return storage ? toPlainObject(storage) : undefined;
  }

  async createColdStorage(insertStorage: InsertColdStorage): Promise<any> {
    await this.ensureConnection();
    const storage = await ColdStorage.create({
      ...insertStorage,
      currentStock: 0,
      status: "online",
      temperature: insertStorage.temperature ?? "3.2",
      humidity: insertStorage.humidity ?? "88",
    });
    return toPlainObject(storage);
  }

  async updateColdStorage(id: string, updates: Partial<any>): Promise<any | undefined> {
    await this.ensureConnection();
    const storage = await ColdStorage.findByIdAndUpdate(id, updates, { new: true });
    return storage ? toPlainObject(storage) : undefined;
  }

  async deleteColdStorage(id: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await ColdStorage.findByIdAndDelete(id);
    return !!result;
  }

  async getInventory(): Promise<any[]> {
    await this.ensureConnection();
    const items = await Inventory.find();
    return toPlainArray(items);
  }

  async getInventoryByStorage(storageId: string): Promise<any[]> {
    await this.ensureConnection();
    const items = await Inventory.find({ storageId });
    return toPlainArray(items);
  }

  async getInventoryByFarmer(farmerId: string): Promise<any[]> {
    await this.ensureConnection();
    const items = await Inventory.find({ farmerId });
    return toPlainArray(items);
  }

  async createInventory(insertInventory: InsertInventory): Promise<any> {
    await this.ensureConnection();
    const item = await Inventory.create({ ...insertInventory, status: "stored" });
    return toPlainObject(item);
  }

  async updateInventory(id: string, updates: Partial<any>): Promise<any | undefined> {
    await this.ensureConnection();
    const item = await Inventory.findByIdAndUpdate(id, updates, { new: true });
    return item ? toPlainObject(item) : undefined;
  }

  async deleteInventory(id: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await Inventory.findByIdAndDelete(id);
    return !!result;
  }

  async getContactInquiries(): Promise<any[]> {
    await this.ensureConnection();
    const inquiries = await ContactInquiry.find();
    return toPlainArray(inquiries);
  }

  async createContactInquiry(insertInquiry: InsertContactInquiry): Promise<any> {
    await this.ensureConnection();
    const inquiry = await ContactInquiry.create({
      ...insertInquiry,
      status: "new",
      email: insertInquiry.email ?? null,
    });
    return toPlainObject(inquiry);
  }

  async updateContactInquiryStatus(id: string, status: string): Promise<any | undefined> {
    await this.ensureConnection();
    const inquiry = await ContactInquiry.findByIdAndUpdate(id, { status }, { new: true });
    return inquiry ? toPlainObject(inquiry) : undefined;
  }
}

export const storage = new DatabaseStorage();
