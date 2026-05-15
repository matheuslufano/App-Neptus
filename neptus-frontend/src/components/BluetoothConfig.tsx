"use client";

import { Bluetooth, BluetoothConnected, BluetoothOff, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import AppButton from "@/components/AppButton";
import { Input } from "@/components/ui/input";
import { bluetoothService } from "@/services/bluetooth-service";
import { type BluetoothConfig as BluetoothConfigType, type BluetoothConnectionStatus,useBluetoothConfigStore } from "@/stores/bluetoothConfigStore";

interface BluetoothConfigProps {
  onConfigSaved?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  isRequired?: boolean;
}

export default function BluetoothConfig({
  onConfigSaved,
  isOpen = false,
  onClose,
  onSuccess,
  isRequired = false,
}: BluetoothConfigProps) {
  const { config, connectionStatus, setConfig, clearConfig, setConnectionStatus } = useBluetoothConfigStore();
  const [serviceUUID, setServiceUUID] = useState(config.serviceUUID);
  const [characteristicUUID, setCharacteristicUUID] = useState(config.characteristicUUID);
  const [deviceName, setDeviceName] = useState(config.deviceName);
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  useEffect(() => {
    if (isOpen) {
      console.log("🔧 Modal Bluetooth aberto - sincronizando com store:", config);
      setServiceUUID(config.serviceUUID);
      setCharacteristicUUID(config.characteristicUUID);
      setDeviceName(config.deviceName);
    }
  }, [isOpen, config]);

  useEffect(() => {
    // Monitora mudanças de status do Bluetooth
    const unsubscribe = bluetoothService.onStatusChange((status) => {
      setConnectionStatus({
        isConnected: status.isConnected,
        deviceName: status.device?.name,
        lastConnection: status.isConnected ? new Date() : undefined,
      });
    });

    return unsubscribe;
  }, [setConnectionStatus]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleTestConnection = async () => {
    if (!serviceUUID.trim() || !characteristicUUID.trim()) {
      setTestStatus("error");
      return;
    }

    setIsLoading(true);
    setTestStatus("testing");

    // Salva a configuração
    setConfig(serviceUUID.trim(), characteristicUUID.trim(), deviceName.trim());
    bluetoothService.setConfig(serviceUUID.trim(), characteristicUUID.trim(), deviceName.trim());

    try {
      console.log("🔍 Testando conexão Bluetooth...");
      const isConnected = await bluetoothService.testConnection();

      if (isConnected) {
        setTestStatus("success");
        console.log("💾 Configuração Bluetooth salva:", {
          serviceUUID: serviceUUID.trim(),
          characteristicUUID: characteristicUUID.trim(),
          deviceName: deviceName.trim(),
        });
        onConfigSaved?.();
        onSuccess?.();
      } else {
        setTestStatus("error");
      }
    } catch (error) {
      setTestStatus("error");
      console.error("Erro ao testar conexão Bluetooth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConfig = () => {
    console.log("🗑️ Limpando configuração Bluetooth");
    clearConfig();
    bluetoothService.clearConfig();
    bluetoothService.disconnect();
    setServiceUUID("");
    setCharacteristicUUID("");
    setDeviceName("");
    setTestStatus("idle");
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-background rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background rounded-t-lg">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Configurar Bluetooth
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-4">
          <ConfigurationContent
            config={config}
            connectionStatus={connectionStatus}
            serviceUUID={serviceUUID}
            characteristicUUID={characteristicUUID}
            deviceName={deviceName}
            setServiceUUID={setServiceUUID}
            setCharacteristicUUID={setCharacteristicUUID}
            setDeviceName={setDeviceName}
            isLoading={isLoading}
            testStatus={testStatus}
            handleTestConnection={handleTestConnection}
            handleClearConfig={handleClearConfig}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(modalContent, document.body)}
    </>
  );
}

function ConfigurationContent({
  config,
  connectionStatus,
  serviceUUID,
  characteristicUUID,
  deviceName,
  setServiceUUID,
  setCharacteristicUUID,
  setDeviceName,
  isLoading,
  testStatus,
  handleTestConnection,
  handleClearConfig,
}: {
  config: BluetoothConfigType;
  connectionStatus: BluetoothConnectionStatus;
  serviceUUID: string;
  characteristicUUID: string;
  deviceName: string;
  setServiceUUID: (value: string) => void;
  setCharacteristicUUID: (value: string) => void;
  setDeviceName: (value: string) => void;
  isLoading: boolean;
  testStatus: string;
  handleTestConnection: () => void;
  handleClearConfig: () => void;
}) {
  const isBluetoothSupported = bluetoothService.isBluetoothSupported();

  if (!isBluetoothSupported) {
    const reason = bluetoothService.getBluetoothUnavailabilityReason();
    const isNetworkIssue = reason.includes('HTTPS') || reason.includes('localhost');
    
    return (
      <div className="space-y-3">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>❌ Bluetooth não disponível:</strong> {reason}
          </p>
        </div>
        
        {isNetworkIssue && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Como resolver:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Acesse via <strong>localhost</strong> em vez do IP da rede</li>
              <li>• Configure HTTPS no seu servidor de desenvolvimento</li>
              <li>• Use um túnel como ngrok para criar um endereço HTTPS</li>
              <li>• Para produção, sempre use HTTPS</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Service UUID *</label>
        <Input
          type="text"
          value={serviceUUID}
          onChange={(e) => setServiceUUID(e.target.value)}
          placeholder="12345678-1234-5678-1234-56789abcdef0"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          UUID do serviço Bluetooth do ESP32
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Characteristic UUID *</label>
        <Input
          type="text"
          value={characteristicUUID}
          onChange={(e) => setCharacteristicUUID(e.target.value)}
          placeholder="abcdefab-1234-5678-1234-56789abcdef0"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          UUID da característica para receber dados
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Nome do Dispositivo (opcional)
        </label>
        <Input
          type="text"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          placeholder="ESP32-Neptus"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Nome para filtrar dispositivos na busca
        </p>
      </div>

      <div className="flex gap-2">
        <AppButton
          onClick={handleTestConnection}
          disabled={isLoading || !serviceUUID.trim() || !characteristicUUID.trim()}
          className="flex-1"
        >
          {testStatus === "testing" ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Conectando...
            </>
          ) : (
            <>
              {testStatus === "success" ? (
                <BluetoothConnected className="w-4 h-4 mr-2" />
              ) : testStatus === "error" ? (
                <BluetoothOff className="w-4 h-4 mr-2" />
              ) : (
                <Bluetooth className="w-4 h-4 mr-2" />
              )}
              {testStatus === "success" ? "Conectado" : "Conectar"}
            </>
          )}
        </AppButton>

        {config.isConfigured && (
          <AppButton
            variant="outline"
            onClick={handleClearConfig}
            disabled={isLoading}
          >
            Limpar
          </AppButton>
        )}
      </div>

      {connectionStatus.isConnected && testStatus === "success" && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <strong>✓ Dispositivo conectado via Bluetooth:</strong> {connectionStatus.deviceName || "ESP32"}
          </p>
        </div>
      )}

      {testStatus === "error" && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>✗ Erro na conexão Bluetooth:</strong> Verifique se o dispositivo está ligado e próximo.
            Certifique-se de que os UUIDs estão corretos.
          </p>
        </div>
      )}

      {testStatus === "testing" && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>🔄 Procurando dispositivos...</strong> Selecione o ESP32 na lista que aparecerá.
          </p>
        </div>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>💡 Dica:</strong> O ESP32 deve estar programado com os UUIDs correspondentes 
          e estar transmitindo dados via BLE para funcionar corretamente.
        </p>
      </div>
    </div>
  );
}