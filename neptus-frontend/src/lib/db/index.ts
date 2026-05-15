import { getDb, Property, Reading, Tank } from "./schema";

// Funções para Readings
export const readingsDb = {
  // Buscar leitura por ID
  async getById(id: string): Promise<Reading | undefined> {
    return await getDb().readings.get(id);
  },

  // Buscar todas as leituras de uma propriedade
  async getByProperty(propertyId: string): Promise<Reading[]> {
    return await getDb()
      .readings.where("propertyId")
      .equals(propertyId)
      .reverse()
      .sortBy("createdAt");
  },

  // Buscar leituras de um tanque específico
  async getByTank(tankId: string): Promise<Reading[]> {
    return await getDb()
      .readings.where("tankId")
      .equals(tankId)
      .reverse()
      .sortBy("createdAt");
  },

  // Adicionar nova leitura
  async add(
    reading: Omit<Reading, "id" | "createdAt" | "updatedAt" | "syncStatus">
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

  // Buscar leituras pendentes de sincronização
  async getPending(): Promise<Reading[]> {
    return await getDb()
      .readings.where("syncStatus")
      .equals("pending")
      .toArray();
  },

  // Marcar como sincronizada
  async markAsSynced(id: string): Promise<void> {
    await getDb().readings.update(id, {
      syncStatus: "synced",
      syncedAt: new Date(),
    });
  },

  // Atualizar leitura com novos valores
  async update(id: string, reading: Partial<Reading>): Promise<void> {
    await getDb().readings.update(id, reading);
  },

  // Remover leitura
  async remove(id: string): Promise<void> {
    await getDb().readings.delete(id);
  },

  // Marcar como erro
  async markAsError(id: string, errorMessage: string): Promise<void> {
    await getDb().readings.update(id, {
      syncStatus: "error",
      errorMessage,
    });
  },

  // Limpar todas as leituras de uma propriedade
  async clearByProperty(propertyId: string): Promise<void> {
    await getDb().readings.where("propertyId").equals(propertyId).delete();
  },

  // Salvar múltiplas leituras (para sincronização)
  async bulkPut(readings: Reading[]): Promise<void> {
    await getDb().readings.bulkPut(readings);
  },
};

// Funções para Tanks
export const tanksDb = {
  // Buscar tanques de uma propriedade
  async getByProperty(propertyId: string): Promise<Tank[]> {
    return await getDb().tanks.where("propertyId").equals(propertyId).toArray();
  },

  // Adicionar tanque
  async add(
    tank: Omit<Tank, "id" | "createdAt" | "updatedAt" | "syncStatus">
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

  // Salvar múltiplos tanques (para sincronização)
  async bulkPut(tanks: Tank[]): Promise<void> {
    await getDb().tanks.bulkPut(tanks);
  },

  // Limpar tanques de uma propriedade
  async clearByProperty(propertyId: string): Promise<void> {
    await getDb().tanks.where("propertyId").equals(propertyId).delete();
  },
};

// Funções para Properties
export const propertiesDb = {
  // Buscar todas as propriedades
  async getAll(): Promise<Property[]> {
    return await getDb().properties.toArray();
  },

  // Buscar propriedade por ID
  async getById(id: string): Promise<Property | undefined> {
    return await getDb().properties.get(id);
  },

  // Salvar propriedade
  async save(property: Property): Promise<void> {
    await getDb().properties.put(property);
  },

  // Salvar múltiplas propriedades
  async bulkPut(properties: Property[]): Promise<void> {
    await getDb().properties.bulkPut(properties);
  },

  // Limpar todas as propriedades
  async clear(): Promise<void> {
    await getDb().properties.clear();
  },
};

// Função para limpar todos os dados
export async function clearAllData(): Promise<void> {
  await getDb().readings.clear();
  await getDb().tanks.clear();
  await getDb().properties.clear();
}

// Exportar a instância do banco também
export { getDb };
export type { Property, Reading, Tank };
