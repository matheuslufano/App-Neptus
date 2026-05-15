import { SensorData } from "@/services/bluetooth-service";

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
  } = useBluetoothSensorData();

  const fetchData = async () => {
    // Para Bluetooth, tenta reconectar se desconectado
    if (!bluetoothConnected) {
      await bluetoothConnect();
    }
    // Se já está conectado, os dados são atualizados automaticamente pelo hook
  };

  return {
    sensorData: bluetoothData,
    isLoading: isConnecting,
    error: bluetoothError,
    refetch: fetchData,
    isConnected: bluetoothConnected,
  };
};
