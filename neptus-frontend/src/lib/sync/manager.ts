import { syncReadingsBatch } from "@/lib/api/sync";
import { readingsDb, tanksDb } from "@/lib/db";
import type { Reading, Tank } from "@/lib/db/schema";
import { getAllReadingsByTank } from "@/services/readings-service";
import { getAllTanks, TankFromAPI } from "@/services/tanks-service";

export interface SyncStatus {
  isSyncing: boolean;
  lastSync: Date | null;
  pendingCount: number;
  error: string | null;
}

export class SyncManager {
  private isSyncing = false;
  private syncCallbacks: Array<(status: SyncStatus) => void> = [];
  private accessToken: string | null = null;
  private propertyId: string | null = null;

  /**
   * Define o token de acesso e ID da propriedade para sincronização
   */
  setCredentials(accessToken: string, propertyId: string): void {
    this.accessToken = accessToken;
    this.propertyId = propertyId;
  }

  /**
   * Subscribe para receber atualizações de status de sincronização
   */
  subscribe(callback: (status: SyncStatus) => void): () => void {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notifica todos os subscribers sobre mudança de status
   */
  private notifySubscribers(status: SyncStatus): void {
    this.syncCallbacks.forEach((cb) => cb(status));
  }

  /**
   * Converte tanque da API para formato do IndexedDB
   */
  private tankFromAPI(apiTank: TankFromAPI): Tank {
    return {
      id: apiTank.id,
      userId: apiTank.id_usuario,
      propertyId: apiTank.id_propriedade,
      name: apiTank.nome,
      area: apiTank.area_tanque,
      fishType: apiTank.tipo_peixe,
      fishWeight: apiTank.peso_peixe,
      fishCount: apiTank.qtd_peixe,
      active: apiTank.ativo,
      createdAt: new Date(apiTank.criado_em),
      updatedAt: new Date(apiTank.atualizado_em),
      syncStatus: "synced",
    };
  }

  /**
   * Sincroniza tanques DO servidor (download)
   */
  async syncTanksFromServer(): Promise<{
    tanksDownloaded: number;
    success: boolean;
    error?: string;
  }> {
    if (!this.accessToken || !this.propertyId) {
      console.error("Token de acesso ou propertyId não configurados");
      return {
        tanksDownloaded: 0,
        success: false,
        error: "Credenciais não configuradas",
      };
    }

    try {
      console.log("Baixando tanques do servidor...");

      // Busca todos os tanques da propriedade
      const apiTanks = await getAllTanks(this.propertyId, this.accessToken);

      // Converte para formato do IndexedDB
      const tanks = apiTanks.map((apiTank) => this.tankFromAPI(apiTank));

      // Limpa tanques antigos da propriedade e salva novos
      await tanksDb.clearByProperty(this.propertyId);
      await tanksDb.bulkPut(tanks);

      console.log(`${tanks.length} tanques sincronizados do servidor`);

      return {
        tanksDownloaded: tanks.length,
        success: true,
      };
    } catch (error) {
      console.error("Erro ao sincronizar tanques do servidor:", error);
      return {
        tanksDownloaded: 0,
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Sincroniza leituras DO servidor (download) para um tanque específico
   */
  async syncReadingsFromServerForTank(tankId: string): Promise<{
    readingsDownloaded: number;
    success: boolean;
    error?: string;
  }> {
    if (!this.accessToken) {
      return {
        readingsDownloaded: 0,
        success: false,
        error: "Token de acesso não configurado",
      };
    }

    try {
      // Busca todas as leituras do tanque
      const apiReadings = await getAllReadingsByTank(tankId, this.accessToken);

      // Converte para formato do IndexedDB
      const readings: Reading[] = apiReadings.map((apiReading) => ({
        id: apiReading.id,
        propertyId: this.propertyId!,
        tankId: apiReading.id_tanque,
        turbidez: apiReading.turbidez,
        temperatura: apiReading.temperatura,
        ph: apiReading.ph,
        oxigenio: apiReading.oxigenio,
        amonia: apiReading.amonia,
        cor_agua: apiReading.cor_agua,
        createdAt: new Date(apiReading.criado_em),
        updatedAt: new Date(apiReading.atualizado_em),
        syncStatus: "synced",
      }));

      // Salva no IndexedDB (usando bulkPut para substituir existentes)
      await readingsDb.bulkPut(readings);

      return {
        readingsDownloaded: readings.length,
        success: true,
      };
    } catch (error) {
      console.error(`Erro ao sincronizar leituras do tanque ${tankId}:`, error);
      return {
        readingsDownloaded: 0,
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Sincroniza leituras DO servidor (download) para todos os tanques
   */
  async syncReadingsFromServer(): Promise<{
    totalReadings: number;
    tanksProcessed: number;
    success: boolean;
    error?: string;
  }> {
    if (!this.propertyId) {
      return {
        totalReadings: 0,
        tanksProcessed: 0,
        success: false,
        error: "PropertyId não configurado",
      };
    }

    try {
      console.log("Baixando leituras do servidor para todos os tanques...");

      // Busca todos os tanques da propriedade
      const tanks = await tanksDb.getByProperty(this.propertyId);

      if (tanks.length === 0) {
        console.log("Nenhum tanque encontrado para sincronizar leituras");
        return {
          totalReadings: 0,
          tanksProcessed: 0,
          success: true,
        };
      }

      // Sincroniza leituras de cada tanque em paralelo
      const results = await Promise.all(
        tanks.map((tank) => this.syncReadingsFromServerForTank(tank.id)),
      );

      const totalReadings = results.reduce(
        (sum, r) => sum + r.readingsDownloaded,
        0,
      );
      const tanksProcessed = results.filter((r) => r.success).length;

      console.log(
        `${totalReadings} leituras sincronizadas de ${tanksProcessed} tanques`,
      );

      return {
        totalReadings,
        tanksProcessed,
        success: true,
      };
    } catch (error) {
      console.error("Erro ao sincronizar leituras do servidor:", error);
      return {
        totalReadings: 0,
        tanksProcessed: 0,
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Download inicial de dados (primeira sincronização)
   */
  async initialSync(): Promise<{
    tanks: number;
    readings: number;
    success: boolean;
    error?: string;
  }> {
    if (!this.accessToken || !this.propertyId) {
      return {
        tanks: 0,
        readings: 0,
        success: false,
        error: "Credenciais não configuradas",
      };
    }

    if (this.isSyncing) {
      console.log("Sincronização já em progresso...");
      return {
        tanks: 0,
        readings: 0,
        success: false,
        error: "Sincronização em progresso",
      };
    }

    this.isSyncing = true;
    this.notifySubscribers({
      isSyncing: true,
      lastSync: null,
      pendingCount: 0,
      error: null,
    });

    try {
      // 1. Busca tanques do servidor
      const tanksResult = await this.syncTanksFromServer();
      console.log(`✓ Tanques baixados: ${tanksResult.tanksDownloaded}`);

      // 2. Busca leituras do servidor para todos os tanques
      const readingsResult = await this.syncReadingsFromServer();
      console.log(`✓ Leituras baixadas: ${readingsResult.totalReadings}`);

      this.notifySubscribers({
        isSyncing: false,
        lastSync: new Date(),
        pendingCount: 0,
        error: null,
      });

      return {
        tanks: tanksResult.tanksDownloaded,
        readings: readingsResult.totalReadings,
        success: true,
      };
    } catch (error) {
      console.error("❌ Erro durante sincronização inicial:", error);

      this.notifySubscribers({
        isSyncing: false,
        lastSync: null,
        pendingCount: 0,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });

      return {
        tanks: 0,
        readings: 0,
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincronização de UPLOAD (envia dados pendentes para servidor)
   */
  async sync(): Promise<{
    syncedCount: number;
    failedCount: number;
    success: boolean;
  }> {
    // Evita sincronizações simultâneas
    if (this.isSyncing) {
      console.log("Sincronização já em progresso...");
      return {
        syncedCount: 0,
        failedCount: 0,
        success: false,
      };
    }

    this.isSyncing = true;
    this.notifySubscribers({
      isSyncing: true,
      lastSync: null,
      pendingCount: 0,
      error: null,
    });

    try {
      // Envia leituras pendentes para o servidor
      const pendingReadings = await readingsDb.getPending();
      let syncedCount = 0;
      let failedCount = 0;

      if (pendingReadings.length > 0) {
        console.log(
          `⬆ Enviando ${pendingReadings.length} leituras pendentes...`,
        );

        const uploadResult = await syncReadingsBatch(pendingReadings);

        // Marca como sincronizadas
        for (const id of uploadResult.syncedIds) {
          await readingsDb.markAsSynced(id);
        }

        // Marca com erro
        for (const reading of uploadResult.failedReadings) {
          await readingsDb.markAsError(
            reading.id,
            "Tanque inválido ou não encontrado",
          );
        }

        syncedCount = uploadResult.syncedIds.length;
        failedCount = uploadResult.failedReadings.length;

        console.log(
          `✓ Upload: ${syncedCount} enviadas, ${failedCount} falhadas`,
        );
      } else {
        console.log("✓ Nenhuma leitura pendente para enviar");
      }

      // Sucesso
      const finalPendingCount = (await readingsDb.getPending()).length;

      this.notifySubscribers({
        isSyncing: false,
        lastSync: new Date(),
        pendingCount: finalPendingCount,
        error: null,
      });

      return {
        syncedCount,
        failedCount,
        success: true,
      };
    } catch (error) {
      console.error("❌ Erro fatal durante sincronização:", error);

      this.notifySubscribers({
        isSyncing: false,
        lastSync: null,
        pendingCount: (await readingsDb.getPending()).length,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });

      return {
        syncedCount: 0,
        failedCount: 0,
        success: false,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Retorna status atual
   */
  async getStatus(): Promise<SyncStatus> {
    const pendingCount = (await readingsDb.getPending()).length;
    return {
      isSyncing: this.isSyncing,
      lastSync: null,
      pendingCount,
      error: null,
    };
  }
}

// Instância única do gerenciador
export const syncManager = new SyncManager();
