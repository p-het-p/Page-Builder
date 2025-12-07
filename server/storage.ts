import {
  type User,
  type InsertUser,
  type Farmer,
  type InsertFarmer,
  type Factory,
  type InsertFactory,
  type ColdStorage,
  type InsertColdStorage,
  type Inventory,
  type InsertInventory,
  type ContactInquiry,
  type InsertContactInquiry,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getFarmers(): Promise<Farmer[]>;
  getFarmer(id: string): Promise<Farmer | undefined>;
  createFarmer(farmer: InsertFarmer): Promise<Farmer>;
  updateFarmerStatus(id: string, status: string): Promise<Farmer | undefined>;
  deleteFarmer(id: string): Promise<boolean>;

  getFactories(): Promise<Factory[]>;
  getFactory(id: string): Promise<Factory | undefined>;
  createFactory(factory: InsertFactory): Promise<Factory>;
  updateFactory(id: string, updates: Partial<Factory>): Promise<Factory | undefined>;
  deleteFactory(id: string): Promise<boolean>;

  getColdStorages(): Promise<ColdStorage[]>;
  getColdStorage(id: string): Promise<ColdStorage | undefined>;
  createColdStorage(storage: InsertColdStorage): Promise<ColdStorage>;
  updateColdStorage(id: string, updates: Partial<ColdStorage>): Promise<ColdStorage | undefined>;
  deleteColdStorage(id: string): Promise<boolean>;

  getInventory(): Promise<Inventory[]>;
  getInventoryByStorage(storageId: string): Promise<Inventory[]>;
  getInventoryByFarmer(farmerId: string): Promise<Inventory[]>;
  createInventory(item: InsertInventory): Promise<Inventory>;
  updateInventory(id: string, updates: Partial<Inventory>): Promise<Inventory | undefined>;
  deleteInventory(id: string): Promise<boolean>;

  getContactInquiries(): Promise<ContactInquiry[]>;
  createContactInquiry(inquiry: InsertContactInquiry): Promise<ContactInquiry>;
  updateContactInquiryStatus(id: string, status: string): Promise<ContactInquiry | undefined>;
}

import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users,
  farmers,
  factories,
  coldStorages,
  inventory,
  contactInquiries
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, id })
      .returning();
    return user;
  }

  async getFarmers(): Promise<Farmer[]> {
    return db.select().from(farmers);
  }

  async getFarmer(id: string): Promise<Farmer | undefined> {
    const [farmer] = await db.select().from(farmers).where(eq(farmers.id, id));
    return farmer;
  }

  async createFarmer(insertFarmer: InsertFarmer): Promise<Farmer> {
    const id = randomUUID();
    const [farmer] = await db
      .insert(farmers)
      .values({ ...insertFarmer, id, status: "pending" })
      .returning();
    return farmer;
  }

  async updateFarmerStatus(id: string, status: string): Promise<Farmer | undefined> {
    const [farmer] = await db
      .update(farmers)
      .set({ status })
      .where(eq(farmers.id, id))
      .returning();
    return farmer;
  }

  async deleteFarmer(id: string): Promise<boolean> {
    const [farmer] = await db
      .delete(farmers)
      .where(eq(farmers.id, id))
      .returning();
    return !!farmer;
  }

  async getFactories(): Promise<Factory[]> {
    return db.select().from(factories);
  }

  async getFactory(id: string): Promise<Factory | undefined> {
    const [factory] = await db.select().from(factories).where(eq(factories.id, id));
    return factory;
  }

  async createFactory(insertFactory: InsertFactory): Promise<Factory> {
    const id = randomUUID();
    const [factory] = await db
      .insert(factories)
      .values({ ...insertFactory, id, status: "active" })
      .returning();
    return factory;
  }

  async updateFactory(id: string, updates: Partial<Factory>): Promise<Factory | undefined> {
    const [factory] = await db
      .update(factories)
      .set(updates)
      .where(eq(factories.id, id))
      .returning();
    return factory;
  }

  async deleteFactory(id: string): Promise<boolean> {
    const [factory] = await db
      .delete(factories)
      .where(eq(factories.id, id))
      .returning();
    return !!factory;
  }

  async getColdStorages(): Promise<ColdStorage[]> {
    return db.select().from(coldStorages);
  }

  async getColdStorage(id: string): Promise<ColdStorage | undefined> {
    const [storage] = await db
      .select()
      .from(coldStorages)
      .where(eq(coldStorages.id, id));
    return storage;
  }

  async createColdStorage(insertStorage: InsertColdStorage): Promise<ColdStorage> {
    const id = randomUUID();
    const [storage] = await db
      .insert(coldStorages)
      .values({
        ...insertStorage,
        id,
        currentStock: 0,
        status: "online",
        temperature: insertStorage.temperature ?? "3.2",
        humidity: insertStorage.humidity ?? "88",
      })
      .returning();
    return storage;
  }

  async updateColdStorage(
    id: string,
    updates: Partial<ColdStorage>
  ): Promise<ColdStorage | undefined> {
    const [storage] = await db
      .update(coldStorages)
      .set(updates)
      .where(eq(coldStorages.id, id))
      .returning();
    return storage;
  }

  async deleteColdStorage(id: string): Promise<boolean> {
    const [storage] = await db
      .delete(coldStorages)
      .where(eq(coldStorages.id, id))
      .returning();
    return !!storage;
  }

  async getInventory(): Promise<Inventory[]> {
    return db.select().from(inventory);
  }

  async getInventoryByStorage(storageId: string): Promise<Inventory[]> {
    return db
      .select()
      .from(inventory)
      .where(eq(inventory.storageId, storageId));
  }

  async getInventoryByFarmer(farmerId: string): Promise<Inventory[]> {
    return db
      .select()
      .from(inventory)
      .where(eq(inventory.farmerId, farmerId));
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const id = randomUUID();
    const [item] = await db
      .insert(inventory)
      .values({ ...insertInventory, id, status: "stored" })
      .returning();
    return item;
  }

  async updateInventory(
    id: string,
    updates: Partial<Inventory>
  ): Promise<Inventory | undefined> {
    const [item] = await db
      .update(inventory)
      .set(updates)
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }

  async deleteInventory(id: string): Promise<boolean> {
    const [item] = await db
      .delete(inventory)
      .where(eq(inventory.id, id))
      .returning();
    return !!item;
  }

  async getContactInquiries(): Promise<ContactInquiry[]> {
    return db.select().from(contactInquiries);
  }

  async createContactInquiry(
    insertInquiry: InsertContactInquiry
  ): Promise<ContactInquiry> {
    const id = randomUUID();
    const [inquiry] = await db
      .insert(contactInquiries)
      .values({
        ...insertInquiry,
        id,
        status: "new",
        email: insertInquiry.email ?? null,
      })
      .returning();
    return inquiry;
  }

  async updateContactInquiryStatus(
    id: string,
    status: string
  ): Promise<ContactInquiry | undefined> {
    const [inquiry] = await db
      .update(contactInquiries)
      .set({ status })
      .where(eq(contactInquiries.id, id))
      .returning();
    return inquiry;
  }
}

export const storage = new DatabaseStorage();
