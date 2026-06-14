"use client";

import { Bluetooth, BluetoothConnected, BluetoothOff } from "lucide-react";
import { useEffect, useState } from "react";

import AppButton from "@/components/AppButton";
import BluetoothSetupGuide from "@/components/BluetoothSetupGuide";
import { useBluetoothSensorData } from "@/hooks/useBluetoothSensorData";
import { bluetoothService } from "@/services/bluetooth-service";

interface BluetoothConnectorProps {
  className?: string;
}

export default function BluetoothConnector({
  className,
}: BluetoothConnectorProps) {
  const { isConnecting, isConnected, error, connect, disconnect, isSupported } =
    useBluetoothSensorData();

  const [showError, setShowError] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isSupported) {
    const reason = bluetoothService.getBluetoothUnavailabilityReason();
    const isDisabledIssue =
      reason.includes("desabilitado") ||
      reason.includes("disabled") ||
      reason.includes("globally disabled");

    // Se o usuário quer ver o guia completo
    if (showSetupGuide && isDisabledIssue) {
      return (
        <div className={className}>
          <BluetoothSetupGuide
            onSuccess={() => {
              setShowSetupGuide(false);
              window.location.reload();
            }}
          />
        </div>
      );
    }

    return (
      <div
        className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <div className="flex items-start gap-3">
          <BluetoothOff className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-3 w-full">
            <div>
              <h3 className="font-medium text-red-900">
                Bluetooth não disponível
              </h3>
              <p className="text-sm text-red-700">{reason}</p>
            </div>

            {isDisabledIssue && (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    🔧 Solução rápida:
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>
                      • Abra{" "}
                      <strong>chrome://flags/#enable-web-bluetooth</strong>
                    </li>
                    <li>• Mude para &quot;Enabled&quot;</li>
                    <li>• Reinicie o navegador</li>
                  </ul>
                </div>

                <AppButton
                  onClick={() => setShowSetupGuide(true)}
                  className="w-full"
                  variant="outline"
                >
                  📋 Mostrar Guia Passo-a-Passo
                </AppButton>
              </div>
            )}

            {!isDisabledIssue && reason.includes("HTTPS") && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  💡 Como resolver:
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>
                    • Acesse via <strong>localhost</strong> em vez do IP da rede
                  </li>
                  <li>• Configure HTTPS no seu servidor de desenvolvimento</li>
                  <li>
                    • Use um túnel como ngrok para criar um endereço HTTPS
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status da conexão */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <BluetoothConnected className="h-6 w-6 text-green-600" />
            ) : (
              <Bluetooth className="h-6 w-6 text-gray-600" />
            )}
            <div>
              <h3 className="font-medium">
                {isConnected ? "ESP32 Conectado" : "ESP32 Desconectado"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? "Recebendo dados de turbidez em tempo real"
                  : "Clique para conectar ao ESP32-Turbidez"}
              </p>
            </div>
          </div>

          {/* Botão de conexão */}
          <AppButton
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            variant={isConnected ? "outline" : "default"}
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Conectando...
              </>
            ) : isConnected ? (
              "Desconectar"
            ) : (
              "Conectar ao ESP32"
            )}
          </AppButton>
        </div>
      </div>

      {/* Mensagem de erro */}
      {showError && error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>❌ Erro:</strong> {error}
          </p>
        </div>
      )}

      {/* Instruções para o usuário */}
      {!isConnected && !isConnecting && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Como conectar:
            </h4>
            <ol className="text-xs text-blue-800 space-y-1">
              <li>
                1. Ligue o ESP32 e aguarde ele aparecer como
                &quot;ESP32-Turbidez&quot;
              </li>
              <li>2. Clique em &quot;Conectar ao ESP32&quot;</li>
              <li>
                3. Selecione &quot;ESP32-Turbidez&quot; na lista que aparecer
              </li>
              <li>4. Aguarde a conexão ser estabelecida</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
