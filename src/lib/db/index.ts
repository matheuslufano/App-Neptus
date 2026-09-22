import { getDb, Property, Reading, Tank } from "./schema";

export const readingsDb = {
  async getById(id: string): Promise<Reading | undefined> {
    return await getDb().readings.get(id);
  },

  async getByProperty(propertyId: string): Promise<Reading[]> {
    return await getDb()
      .readings.where("propertyId")
      .equals(propertyId)
      .reverse()
      .sortBy("createdAt");
  },

  async getByTank(tankId: string): Promise<Reading[]> {
    return await getDb()
      .readings.where("tankId")
      .equals(tankId)
      .reverse()
      .sortBy("createdAt");
  },

  async add(
    reading: Omit<Reading, "id" | "createdAt" | "updatedAt" | "syncStatus">,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();

    await getDb().readings.add({
      ...reading,
      id,
      createdAt: now,
      updatedAt: now,
      syncStatus: "pending",
    });

    return id;
  },

  async getPending(): Promise<Reading[]> {
    return await getDb()
      .readings.where("syncStatus")
      .equals("pending")
      .toArray();
  },

  async markAsSynced(id: string): Promise<void> {
    await getDb().readings.update(id, {
      syncStatus: "synced",
      syncedAt: new Date(),
    });
  },

  async update(id: string, reading: Partial<Reading>): Promise<void> {
    await getDb().readings.update(id, reading);
  },

  async remove(id: string): Promise<void> {
    await getDb().readings.delete(id);
  },

  async markAsError(id: string, errorMessage: string): Promise<void> {
    await getDb().readings.update(id, {
      syncStatus: "error",
      errorMessage,
    });
  },

  async clearByProperty(propertyId: string): Promise<void> {
    await getDb().readings.where("propertyId").equals(propertyId).delete();
  },

  async bulkPut(readings: Reading[]): Promise<void> {
    await getDb().readings.bulkPut(readings);
  },
};

export const tanksDb = {
  async getByProperty(propertyId: string): Promise<Tank[]> {
    return await getDb().tanks.where("propertyId").equals(propertyId).toArray();
  },

  async add(
    tank: Omit<Tank, "id" | "createdAt" | "updatedAt" | "syncStatus">,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();

    await getDb().tanks.add({
      ...tank,
      id,
      createdAt: now,
      updatedAt: now,
      syncStatus: "pending",
    });

    return id;
  },

  async save(tank: Tank): Promise<void> {
    await getDb().tanks.put(tank);
  },

  async update(id: string, tank: Partial<Tank>): Promise<void> {
    await getDb().tanks.update(id, {
      ...tank,
      updatedAt: new Date(),
    });
  },

  async remove(id: string): Promise<void> {
    await getDb().tanks.delete(id);
  },

  async bulkPut(tanks: Tank[]): Promise<void> {
    await getDb().tanks.bulkPut(tanks);
  },

  async clearByProperty(propertyId: string): Promise<void> {
    await getDb().tanks.where("propertyId").equals(propertyId).delete();
  },
};

export const propertiesDb = {
  async getAll(): Promise<Property[]> {
    return await getDb().properties.toArray();
  },

  async getById(id: string): Promise<Property | undefined> {
    return await getDb().properties.get(id);
  },

  async save(property: Property): Promise<void> {
    await getDb().properties.put(property);
  },

  async bulkPut(properties: Property[]): Promise<void> {
    await getDb().properties.bulkPut(properties);
  },

  async clear(): Promise<void> {
    await getDb().properties.clear();
  },
};

export async function clearAllData(): Promise<void> {
  await getDb().readings.clear();
  await getDb().tanks.clear();
  await getDb().properties.clear();
}

export { getDb };
export type { Property, Reading, Tank };
