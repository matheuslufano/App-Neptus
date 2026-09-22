import { getDb, readingsDb } from "./index";

/**
 * Migra dados do localStorage para IndexedDB
 * Essa função deve ser executada uma única vez quando o app for atualizado
 */
export async function migrateFromLocalStorage(
  propertyId: string,
): Promise<void> {
  try {
    // Verifica se já existe dados no IndexedDB
    const existingReadings = await readingsDb.getByProperty(propertyId);
    if (existingReadings.length > 0) {
      console.log("Dados já existem no IndexedDB, pulando migração");
      return;
    }

    // Busca dados do localStorage
    const localStorageKey = `offlineReadings_${propertyId}`;
    const localData = localStorage.getItem(localStorageKey);

    if (!localData) {
      console.log("Nenhum dado encontrado no localStorage");
      return;
    }

    const readings = JSON.parse(localData);

    if (!Array.isArray(readings) || readings.length === 0) {
      console.log("Nenhuma leitura para migrar");
      return;
    }

    // Migra para IndexedDB
    console.log(`Migrando ${readings.length} leituras para IndexedDB...`);

    const db = getDb();
    for (const reading of readings) {
      await db.readings.add({
        id: reading.id || crypto.randomUUID(),
        propertyId: propertyId,
        tankId: reading.tankId || "",
        turbidez: reading.turbidity || reading.turbidez || 0,
        temperatura: reading.temperature || reading.temperatura,
        ph: reading.ph,
        oxigenio: reading.dissolvedOxygen || reading.oxigenio,
        amonia: reading.amonia,
        cor_agua:
          reading.cor_agua !== undefined
            ? reading.cor_agua
            : Number(reading.imagem_cor) || 0,
        createdAt: new Date(
          reading.createdAt || reading.timestamp || Date.now(),
        ),
        updatedAt: new Date(
          reading.updatedAt || reading.timestamp || Date.now(),
        ),
        syncStatus: "pending",
      });
    }

    console.log("Migração concluída com sucesso!");

    // Opcional: limpar localStorage após migração bem-sucedida
    // localStorage.removeItem(localStorageKey);
  } catch (error) {
    console.error("Erro ao migrar dados:", error);
    throw error;
  }
}

/**
 * Verifica se a migração já foi executada
 */
export function hasMigrationRun(): boolean {
  return localStorage.getItem("migration_completed") === "true";
}

/**
 * Marca a migração como completa
 */
export function setMigrationComplete(): void {
  localStorage.setItem("migration_completed", "true");
}
