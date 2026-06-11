import { SensorData } from "@/services/bluetooth-service";
import { bluetoothCommands } from "@/schemas/bluetooth-commands";

import { useBluetoothSensorData } from "./useBluetoothSensorData";

interface UseSensorDataReturn {
  sensorData: SensorData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isConnected: boolean;
}

export const useSensorData = (): UseSensorDataReturn => {
  // Hook do Bluetooth - ÚNICA forma de comunicação
  const {
    sensorData: bluetoothData,
    isConnecting,
    isConnected: bluetoothConnected,
    error: bluetoothError,
    connect: bluetoothConnect,
    sendCommand,
  } = useBluetoothSensorData();

  const fetchData = async () => {
    // Para Bluetooth, tenta reconectar se desconectado
    if (!bluetoothConnected) {
      await bluetoothConnect();
      return;
    }
    // Se já está conectado, os dados são atualizados automaticamente pelo hook
    try {
      await sendCommand(bluetoothCommands.GET_TURBIDEZ);
    } catch (err) {
      console.error("Erro ao solicitar leitura do sensor:", err);
    }
};

  return {
    sensorData: bluetoothData,
    isLoading: isConnecting,
    error: bluetoothError,
    refetch: fetchData,
    isConnected: bluetoothConnected,
  };
};
