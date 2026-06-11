import { useCallback, useEffect, useState } from "react";

import { bluetoothService, SensorData } from "@/services/bluetooth-service";
import { useBluetoothConfigStore } from "@/stores/bluetoothConfigStore";
import { BluetoothCommand, bluetoothCommandSchema } from "@/schemas/bluetooth-commands";

// Tipo de retorno do hook useBluetoothSensorData definindo os dados do sensor, status de conexão, erros e funções para conectar/desconectar e enviar comandos.
interface UseBluetoothSensorDataReturn {
  sensorData: SensorData | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: BluetoothCommand) => Promise<void>;
  onRawMessageReceived: (callback: (message: string) => void) => () => void;
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

  // Monitora dados recebidos via Bluetooth e atualiza o estado local.
  // O serviço BLE emite dados sempre que a característica de notificação envia um pacote.
  useEffect(() => {
    const unsubscribeData = bluetoothService.onDataReceived((data) => {
      setSensorData(data);
      setError(null);
    });

    return unsubscribeData;
  }, []);

  // Inscrição reativa aos eventos de status do BLE.
  // Isso mantém o estado do hook sincronizado com o singleton bluetoothService.
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

    // Inscreve para mudanças futuras de conexão/desconexão.
    const unsubscribeStatus = bluetoothService.onStatusChange((status) => {
      setIsConnected(status.isConnected);

      // Atualiza o store com o novo estado
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

  // Envia comandos ao ESP32 usando tipagem segura para o protocolo Bluetooth.
  // O hook valida a conexão e delega ao serviço singleton.
  const sendCommand = useCallback(async (command: BluetoothCommand) => {
    if (!isConnected) {
      throw new Error("Bluetooth não está conectado");
    }

    const parsedCommand = bluetoothCommandSchema.parse(command);
    return bluetoothService.sendCommand(parsedCommand);
  }, [isConnected]);

  // Inscreve o consumidor para receber mensagens raw do firmware do ESP32.
  // Essas mensagens podem ser estados de calibração, erros ou outros eventos.
  const onRawMessageReceived = useCallback(
    (callback: (message: string) => void) => {
      return bluetoothService.onRawMessageReceived(callback);
    },
    [],
  );

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
    sendCommand,
    onRawMessageReceived,
    isSupported,
  };
};
