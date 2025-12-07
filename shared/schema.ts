import { pgTable, text, varchar, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const farmers = pgTable("farmers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  village: text("village").notNull(),
  district: text("district").notNull(),
  farmSize: real("farm_size").notNull(),
  potatoVariety: text("potato_variety").notNull(),
  status: text("status").notNull().default("pending"),
});

export const factories = pgTable("factories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  location: text("location").notNull(),
  monthlyRequirement: integer("monthly_requirement").notNull(),
  status: text("status").notNull().default("active"),
});

export const coldStorages = pgTable("cold_storages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  currentStock: integer("current_stock").notNull().default(0),
  temperature: text("temperature").notNull().default("3.2"),
  humidity: text("humidity").notNull().default("88"),
  status: text("status").notNull().default("online"),
});

export const inventory = pgTable("inventory", {
  id: varchar("id", { length: 36 }).primaryKey(),
  farmerId: varchar("farmer_id", { length: 36 }).notNull(),
  storageId: varchar("storage_id", { length: 36 }).notNull(),
  quantity: integer("quantity").notNull(),
  variety: text("variety").notNull(),
  grade: text("grade").notNull(),
  entryDate: text("entry_date").notNull(),
  status: text("status").notNull().default("stored"),
});

export const contactInquiries = pgTable("contact_inquiries", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  type: text("type").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFarmerSchema = createInsertSchema(farmers).omit({
  id: true,
  status: true,
});

export const insertFactorySchema = createInsertSchema(factories).omit({
  id: true,
  status: true,
});

export const insertColdStorageSchema = createInsertSchema(coldStorages).omit({
  id: true,
  currentStock: true,
  status: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  status: true,
});

export const insertContactInquirySchema = createInsertSchema(contactInquiries).omit({
  id: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFarmer = z.infer<typeof insertFarmerSchema>;
export type Farmer = typeof farmers.$inferSelect;

export type InsertFactory = z.infer<typeof insertFactorySchema>;
export type Factory = typeof factories.$inferSelect;

export type InsertColdStorage = z.infer<typeof insertColdStorageSchema>;
export type ColdStorage = typeof coldStorages.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertContactInquiry = z.infer<typeof insertContactInquirySchema>;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
