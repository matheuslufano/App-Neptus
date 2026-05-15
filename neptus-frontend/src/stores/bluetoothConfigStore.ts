import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BluetoothConfig {
  serviceUUID: string;
  characteristicUUID: string;
  deviceName: string;
  isConfigured: boolean;
}

export interface BluetoothConnectionStatus {
  isConnected: boolean;
  deviceName?: string;
  lastConnection?: Date;
}

interface BluetoothConfigStore {
  config: BluetoothConfig;
  connectionStatus: BluetoothConnectionStatus;
  setConfig: (serviceUUID: string, characteristicUUID: string, deviceName?: string) => void;
  clearConfig: () => void;
  setConnectionStatus: (status: BluetoothConnectionStatus) => void;
}

const defaultConfig: BluetoothConfig = {
  serviceUUID: "6e400001-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART Service
  characteristicUUID: "6e400003-b5a3-f393-e0a9-e50e24dcca9e", // TX Characteristic (ESP32 → App)
  deviceName: "ESP32-Turbidez", // Nome que o ESP32 deve anunciar
  isConfigured: true, // Já vem configurado por padrão com NUS
};

const defaultConnectionStatus: BluetoothConnectionStatus = {
  isConnected: false,
};

export const useBluetoothConfigStore = create<BluetoothConfigStore>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      connectionStatus: defaultConnectionStatus,

      setConfig: (serviceUUID: string, characteristicUUID: string, deviceName: string = "ESP32-Neptus") => {
        set({
          config: {
            serviceUUID: serviceUUID.trim(),
            characteristicUUID: characteristicUUID.trim(),
            deviceName: deviceName.trim(),
            isConfigured: true,
          },
        });
      },

      clearConfig: () => {
        set({ 
          config: defaultConfig,
          connectionStatus: defaultConnectionStatus
        });
      },

      setConnectionStatus: (status: BluetoothConnectionStatus) => {
        set({ connectionStatus: status });
      },
    }),
    {
      name: "bluetooth-config-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);