import { db } from './db';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Storage operations for Vercel serverless functions
export const storage = {
    // Farmers
    async getFarmers(): Promise<schema.Farmer[]> {
        return await db.select().from(schema.farmers);
    },

    async getFarmer(id: string): Promise<schema.Farmer | undefined> {
        const [farmer] = await db.select().from(schema.farmers).where(eq(schema.farmers.id, id));
        return farmer;
    },

    async createFarmer(data: Omit<schema.Farmer, 'id' | 'status'>): Promise<schema.Farmer> {
        const [farmer] = await db.insert(schema.farmers).values({
            ...data,
            id: randomUUID(),
            status: 'pending',
        }).returning();
        return farmer;
    },

    async updateFarmerStatus(id: string, status: string): Promise<schema.Farmer | undefined> {
        const [farmer] = await db.update(schema.farmers)
            .set({ status })
            .where(eq(schema.farmers.id, id))
            .returning();
        return farmer;
    },

    async deleteFarmer(id: string): Promise<boolean> {
        const result = await db.delete(schema.farmers).where(eq(schema.farmers.id, id));
        return (result.rowCount ?? 0) > 0;
    },

    // Factories
    async getFactories(): Promise<schema.Factory[]> {
        return await db.select().from(schema.factories);
    },

    async getFactory(id: string): Promise<schema.Factory | undefined> {
        const [factory] = await db.select().from(schema.factories).where(eq(schema.factories.id, id));
        return factory;
    },

    async createFactory(data: Omit<schema.Factory, 'id' | 'status'>): Promise<schema.Factory> {
        const [factory] = await db.insert(schema.factories).values({
            ...data,
            id: randomUUID(),
            status: 'active',
        }).returning();
        return factory;
    },

    async updateFactory(id: string, data: Partial<schema.Factory>): Promise<schema.Factory | undefined> {
        const [factory] = await db.update(schema.factories)
            .set(data)
            .where(eq(schema.factories.id, id))
            .returning();
        return factory;
    },

    async deleteFactory(id: string): Promise<boolean> {
        const result = await db.delete(schema.factories).where(eq(schema.factories.id, id));
        return (result.rowCount ?? 0) > 0;
    },

    // Cold Storages
    async getColdStorages(): Promise<schema.ColdStorage[]> {
        return await db.select().from(schema.coldStorages);
    },

    async getColdStorage(id: string): Promise<schema.ColdStorage | undefined> {
        const [coldStorage] = await db.select().from(schema.coldStorages).where(eq(schema.coldStorages.id, id));
        return coldStorage;
    },

    async createColdStorage(data: any): Promise<schema.ColdStorage> {
        const [coldStorage] = await db.insert(schema.coldStorages).values({
            id: randomUUID(),
            name: data.name,
            location: data.location,
            capacity: data.capacity,
            temperature: data.temperature ?? '3.2',
            humidity: data.humidity ?? '88',
            currentStock: 0,
            status: 'online',
        }).returning();
        return coldStorage;
    },

    async updateColdStorage(id: string, data: Partial<schema.ColdStorage>): Promise<schema.ColdStorage | undefined> {
        const [coldStorage] = await db.update(schema.coldStorages)
            .set(data)
            .where(eq(schema.coldStorages.id, id))
            .returning();
        return coldStorage;
    },

    async deleteColdStorage(id: string): Promise<boolean> {
        const result = await db.delete(schema.coldStorages).where(eq(schema.coldStorages.id, id));
        return (result.rowCount ?? 0) > 0;
    },

    // Inventory
    async getInventory(): Promise<schema.Inventory[]> {
        return await db.select().from(schema.inventory);
    },

    async getInventoryByStorage(storageId: string): Promise<schema.Inventory[]> {
        return await db.select().from(schema.inventory).where(eq(schema.inventory.storageId, storageId));
    },

    async getInventoryByFarmer(farmerId: string): Promise<schema.Inventory[]> {
        return await db.select().from(schema.inventory).where(eq(schema.inventory.farmerId, farmerId));
    },

    async createInventory(data: Omit<schema.Inventory, 'id' | 'status'>): Promise<schema.Inventory> {
        const [item] = await db.insert(schema.inventory).values({
            ...data,
            id: randomUUID(),
            status: 'stored',
        }).returning();
        return item;
    },

    async updateInventory(id: string, data: Partial<schema.Inventory>): Promise<schema.Inventory | undefined> {
        const [item] = await db.update(schema.inventory)
            .set(data)
            .where(eq(schema.inventory.id, id))
            .returning();
        return item;
    },

    async deleteInventory(id: string): Promise<boolean> {
        const result = await db.delete(schema.inventory).where(eq(schema.inventory.id, id));
        return (result.rowCount ?? 0) > 0;
    },

    // Contact Inquiries
    async getContactInquiries(): Promise<schema.ContactInquiry[]> {
        return await db.select().from(schema.contactInquiries);
    },

    async createContactInquiry(data: any): Promise<schema.ContactInquiry> {
        const [inquiry] = await db.insert(schema.contactInquiries).values({
            id: randomUUID(),
            name: data.name,
            phone: data.phone,
            email: data.email ?? null,
            type: data.type,
            message: data.message,
            status: 'new',
        }).returning();
        return inquiry;
    },

    async updateContactInquiryStatus(id: string, status: string): Promise<schema.ContactInquiry | undefined> {
        const [inquiry] = await db.update(schema.contactInquiries)
            .set({ status })
            .where(eq(schema.contactInquiries.id, id))
            .returning();
        return inquiry;
    },
};
