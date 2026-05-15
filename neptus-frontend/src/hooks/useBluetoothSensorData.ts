import { useCallback, useEffect, useState } from "react";

import { bluetoothService, SensorData } from "@/services/bluetooth-service";
import { useBluetoothConfigStore } from "@/stores/bluetoothConfigStore";

interface UseBluetoothSensorDataReturn {
  sensorData: SensorData | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isSupported: boolean;
}

export const useBluetoothSensorData = (): UseBluetoothSensorDataReturn => {
  const { config, setConnectionStatus } = useBluetoothConfigStore();

  const isSupported = bluetoothService.isBluetoothSupported();

  // Inicializa com o estado atual do serviço (importante para quando navega entre páginas)
  const currentStatus = bluetoothService.getConnectionStatus();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(currentStatus.isConnected);
  const [error, setError] = useState<string | null>(null);

  // Monitora dados recebidos via Bluetooth
  useEffect(() => {
    const unsubscribeData = bluetoothService.onDataReceived((data) => {
      setSensorData(data);
      setError(null);
    });

    return unsubscribeData;
  }, []);

  // Inscrição reativa aos eventos do BLE (Bluetooth Low Energy) via singleton do serviço
  useEffect(() => {
    const currentStatus = bluetoothService.getConnectionStatus();
    setIsConnected(currentStatus.isConnected);

    if (currentStatus.isConnected) {
      setConnectionStatus({
        isConnected: true,
        deviceName: currentStatus.device?.name,
        lastConnection: new Date(),
      });
      setError(null);
    }

    // Inscreve para mudanças futuras
    const unsubscribeStatus = bluetoothService.onStatusChange((status) => {
      setIsConnected(status.isConnected);

      // Atualiza o store
      setConnectionStatus({
        isConnected: status.isConnected,
        deviceName: status.device?.name,
        lastConnection: status.isConnected ? new Date() : undefined,
      });

      if (!status.isConnected) {
        setError("Dispositivo desconectado");
      } else {
        setError(null);
      }
    });

    return () => {
      unsubscribeStatus();
    };
  }, [setConnectionStatus]);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setError("Web Bluetooth não é suportado neste navegador");
      return;
    }

    if (!config.isConfigured) {
      setError("Bluetooth não está configurado");
      return;
    }

    // Verifica se já está conectado ANTES de tentar conectar
    const currentStatus = bluetoothService.getConnectionStatus();
    if (currentStatus.isConnected) {
      setIsConnected(true);
      setError(null);
      setConnectionStatus({
        isConnected: true,
        deviceName: currentStatus.device?.name,
        lastConnection: new Date(),
      });
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Configura o serviço com os dados salvos
      bluetoothService.setConfig(
        config.serviceUUID,
        config.characteristicUUID,
        config.deviceName,
      );

      const success = await bluetoothService.connect();

      if (success) {
        setIsConnected(true);
        setError(null);
      } else {
        setError("Falha ao conectar com o dispositivo");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      // Se o usuário cancelou, não mostra como erro
      if (
        errorMessage.includes("cancelled") ||
        errorMessage.includes("canceled")
      ) {
        setError(null);
      } else {
        setError(errorMessage);
        console.error("❌ Erro ao conectar Bluetooth:", err);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [config, isSupported, setConnectionStatus]);

  const disconnect = useCallback(async () => {
    try {
      await bluetoothService.disconnect();
      setSensorData(null);
      setError(null);
    } catch (err) {
      console.error("❌ Erro ao desconectar:", err);
    }
  }, []);

  return {
    sensorData,
    isConnecting,
    isConnected,
    error,
    connect,
    disconnect,
    isSupported,
  };
};
