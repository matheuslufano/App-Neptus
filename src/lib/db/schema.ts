import Dexie, { Table } from "dexie";

// Interfaces dos dados
export interface Reading {
  id: string;
  propertyId: string;
  tankId: string;
  turbidez: number;
  temperatura?: number;
  ph?: number;
  oxigenio?: number;
  amonia?: number;
  cor_agua?: number;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: "synced" | "pending" | "error";
  syncedAt?: Date;
  errorMessage?: string;
}

export interface Tank {
  id: string;
  userId: string;
  propertyId: string;
  name: string;
  area: number;
  fishType: string;
  fishWeight: number;
  fishCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: "synced" | "pending" | "error";
}

export interface Property {
  id: string;
  name: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Classe do banco de dados
export class AppDatabase extends Dexie {
  readings!: Table<Reading>;
  tanks!: Table<Tank>;
  properties!: Table<Property>;

  constructor() {
    super("neptus-db");

    // Schema v1 (original)
    this.version(1).stores({
      readings: "id, propertyId, tankId, createdAt, syncStatus",
      tanks: "id, propertyId, name",
      properties: "id, name",
    });

    // Schema v2 (atualizado com campos da API)
    this.version(2).stores({
      readings: "id, propertyId, tankId, createdAt, syncStatus",
      tanks: "id, propertyId, userId, name, fishType, active",
      properties: "id, name",
    });
  }
}

// Instância única do banco (lazy initialization para evitar erro no servidor)
let _db: AppDatabase | null = null;

export function getDb(): AppDatabase {
  if (typeof window === "undefined") {
    throw new Error("Database can only be accessed on client side");
  }
  if (!_db) {
    _db = new AppDatabase();
  }
  return _db;
}

// Alias para compatibilidade
export const db =
  typeof window !== "undefined"
    ? new AppDatabase()
    : (null as unknown as AppDatabase);
