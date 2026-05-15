"use client";

import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

import AppButton from "@/components/AppButton";
import { bluetoothService } from "@/services/bluetooth-service";

interface BluetoothSetupGuideProps {
  onSuccess?: () => void;
}

export default function BluetoothSetupGuide({
  onSuccess,
}: BluetoothSetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [bluetoothStatus, setBluetoothStatus] = useState<{
    available: boolean;
    reason?: string;
    instructions?: string[];
  } | null>(null);

  const steps = [
    {
      title: "Abrir Configurações do Chrome",
      description: "Acesse as flags experimentais do Chrome",
      action: "Abrir chrome://flags/#enable-web-bluetooth",
      link: "chrome://flags/#enable-web-bluetooth",
    },
    {
      title: "Habilitar Web Bluetooth",
      description: "Mude a configuração para 'Enabled'",
      action: "Definir como 'Enabled'",
    },
    {
      title: "Habilitar Funcionalidades Experimentais",
      description: "Ative também as funcionalidades da plataforma web",
      action: "Abrir chrome://flags/#enable-experimental-web-platform-features",
      link: "chrome://flags/#enable-experimental-web-platform-features",
    },
    {
      title: "Reiniciar Navegador",
      description: "Feche e abra o navegador novamente",
      action: "Reiniciar o Chrome",
    },
    {
      title: "Testar Conexão",
      description: "Verificar se o Bluetooth está funcionando",
      action: "Verificar",
    },
  ];

  const checkBluetoothStatus = async () => {
    setIsChecking(true);
    try {
      const status = await bluetoothService.checkBluetoothAvailability();
      setBluetoothStatus(status);

      if (status.available) {
        setCurrentStep(steps.length);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Erro ao verificar Bluetooth:", error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkBluetoothStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStepAction = (step: number) => {
    const currentStepData = steps[step];

    if (currentStepData.link) {
      // Abre o link em uma nova aba
      window.open(currentStepData.link, "_blank");
    }

    if (step < steps.length - 1) {
      setCurrentStep(step + 1);
    } else {
      // Último passo - verificar
      checkBluetoothStatus();
    }
  };

  const isStepCompleted = (step: number) => {
    return (
      step < currentStep ||
      (bluetoothStatus?.available && step === steps.length - 1)
    );
  };

  const isStepCurrent = (step: number) => {
    return step === currentStep && !bluetoothStatus?.available;
  };

  if (bluetoothStatus?.available) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-medium text-green-900">
              Bluetooth Configurado!
            </h3>
            <p className="text-sm text-green-700">
              Web Bluetooth está funcionando. Você pode conectar ao ESP32 agora.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">
              Configuração do Web Bluetooth
            </h3>
            <p className="text-sm text-blue-700">
              Siga os passos abaixo para habilitar o Bluetooth no seu navegador:
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg transition-all ${
              isStepCompleted(index)
                ? "bg-green-50 border-green-200"
                : isStepCurrent(index)
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                    isStepCompleted(index)
                      ? "bg-green-600 text-white"
                      : isStepCurrent(index)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {isStepCompleted(index) ? "✓" : index + 1}
                </div>
                <div>
                  <h4
                    className={`font-medium ${
                      isStepCompleted(index)
                        ? "text-green-900"
                        : isStepCurrent(index)
                        ? "text-blue-900"
                        : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p
                    className={`text-sm ${
                      isStepCompleted(index)
                        ? "text-green-700"
                        : isStepCurrent(index)
                        ? "text-blue-700"
                        : "text-gray-500"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {isStepCurrent(index) && (
                <AppButton
                  onClick={() => handleStepAction(index)}
                  disabled={isChecking && index === steps.length - 1}
                  size="sm"
                  className="ml-3"
                >
                  {step.link && <ExternalLink className="h-4 w-4 mr-1" />}
                  {isChecking && index === steps.length - 1 ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Verificando...
                    </>
                  ) : (
                    step.action
                  )}
                </AppButton>
              )}
            </div>
          </div>
        ))}
      </div>

      {bluetoothStatus && !bluetoothStatus.available && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Status atual:</strong> {bluetoothStatus.reason}
          </p>
        </div>
      )}

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Dica:</strong> Se ainda não funcionar após seguir todos os
          passos, tente usar o Chrome Canary que tem melhor suporte a
          funcionalidades experimentais.
        </p>
      </div>
    </div>
  );
}
