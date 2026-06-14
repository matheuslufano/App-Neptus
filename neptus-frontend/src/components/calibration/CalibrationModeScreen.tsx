"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Wifi, WifiOff, Download } from "lucide-react";
import { toast } from "sonner";

import AppButton from "@/components/AppButton";
import CalibrationStepList from "@/components/calibration/CalibrationStepList";
import CalibrationConfirmDialog from "@/components/calibration/CalibrationConfirmDialog";
import { bluetoothCommands } from "@/schemas/bluetooth-commands";
import { useBluetoothSensorData } from "@/hooks/useBluetoothSensorData";

const calibrationSteps = [
  "0 NTU",
  "100 NTU",
  "200 NTU",
  "300 NTU",
  "400 NTU",
  "500 NTU",
];

const CalibrationModeScreen = () => {
  const { sensorData, isConnected, sendCommand, onRawMessageReceived } =
    useBluetoothSensorData();

  const [currentState, setCurrentState] = useState("READ");
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [sampleValue, setSampleValue] = useState<number | null>(null);
  //const [temperatureValue, setTemperatureValue] = useState<number | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isStartingCalibration, setIsStartingCalibration] = useState(false);
  const [isCommandPending, setIsCommandPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const isCalibrationLoading =
    isStartingCalibration ||
    currentState === "LENDO" ||
    currentState === "PROCESSANDO";

  const calibrationLoadingLabel = useMemo(() => {
    if (isStartingCalibration) return "Iniciando calibração...";
    if (currentState === "LENDO") return "Capturando amostra...";
    if (currentState === "PROCESSANDO") return "Processando calibração...";
    return "Aguardando resposta do sensor...";
  }, [currentState, isStartingCalibration]);

  // O estado atual do firmware é representado por valores como READ, LENDO, PROCESSANDO, e as etapas de calibração.
  // Isso é usado para alterar a UI e habilitar/desabilitar ações de confirmação.

  const currentStepLabel = useMemo(() => {
    if (currentState === "READ") return "Modo leitura contínua";
    if (currentState === "INATIV") return "Inatividade detectada";
    if (currentState === "LENDO") return "Capturando amostra";
    if (currentState === "PROCESSANDO") return "Processando calibração";
    return "Amostra de calibração";
  }, [currentState]);

  useEffect(() => {
    if (sensorData?.turbidez != null) {
      setSampleValue(sensorData.turbidez);
    }
  }, [sensorData]);

  // Atualiza o valor exibido na UI sempre que a leitura de turbidez chega pelo hook BLE.

  useEffect(() => {
    if (!isConnected) {
      setCurrentState("READ");
      setActiveStepIndex(-1);
      setIsStartingCalibration(false);
      setStatusMessage(null);
      setErrorMessage(null);
    }
  }, [isConnected]);

  // Quando o ESP32 desconecta, limpa o estado de calibração para evitar UI inconsistentes.

  const handleCalibrationMessage = useCallback(
    (message: string) => {
      const normalized = message.trim();
      if (!normalized) return;

      // Todas as mensagens raw chegam do firmware do ESP32.
      // Mensagens JSON são ignoradas aqui porque são tratadas em outro fluxo.
      setErrorMessage(null);
      setStatusMessage(normalized);
      setIsStartingCalibration(false);
      setIsCommandPending(false);

      if (normalized === "LENDO") {
        setCurrentState("LENDO");
        return;
      }

      if (normalized === "PROCESSANDO") {
        setCurrentState("PROCESSANDO");
        return;
      }

      if (normalized === "CALIB_OK") {
        setCurrentState("READ");
        setActiveStepIndex(-1);
        setSequence([]);
        setStatusMessage("Calibração concluída com sucesso.");
        setErrorMessage(null);
        toast.success("Calibração concluída com sucesso. Redirecionando ao dashboard...");
        setTimeout(() => router.push("/"), 1000);
        return;
      }

    if (normalized === "CALIB_CANCELADA" || normalized === "INATIV") {
      setCurrentState("READ");
      setActiveStepIndex(-1);
      setStatusMessage(
        normalized === "INATIV"
          ? "Calibração interrompida por inatividade."
          : "Calibração cancelada.",
      );
      return;
    }

    if (normalized.startsWith("ERRO_")) {
      setErrorMessage(normalized);
      return;
    }

    const stepIndex = calibrationSteps.indexOf(normalized);
    if (stepIndex !== -1) {
      setCurrentState(normalized);
      setActiveStepIndex(stepIndex);
      setStatusMessage(`Aguardando "CONFIRMAR AMOSTRA" para coletar e calibrar o sensor.`);
      return;
    }
  }, []);

  useEffect(() => {
    // Escuta mensagens diretas do firmware ESP32 e traduz estados de calibração.
    const unsubscribe = onRawMessageReceived((message) => {
      if (message.startsWith("{")) return;
      handleCalibrationMessage(message);
    });

    return unsubscribe;
  }, [handleCalibrationMessage, onRawMessageReceived]);

  const startCalibration = () => {
    // Não inicia a calibração se não houver conexão ou se já estiver em processo.
    if (!isConnected || isCommandPending || currentState !== "READ") return;
    setIsConfirmDialogOpen(true);
  };

  const handleStartCalibrationConfirmed = async () => {
    if (!isConnected) return;

    setIsConfirmDialogOpen(false);
    setIsStartingCalibration(true);
    setIsCommandPending(true);
    setStatusMessage("Iniciando calibração no ESP32...");
    setErrorMessage(null);

    try {
      await sendCommand(bluetoothCommands.START_CAL);
      setSequence((prev) => [...prev, bluetoothCommands.START_CAL]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao iniciar calibração";
      setErrorMessage(message);
      setIsStartingCalibration(false);
    } finally {
      setIsCommandPending(false);
    }
  };

  const confirmSample = async () => {
    // Confirma a etapa atual de calibração e envia comando ao firmware.
    if (!isConnected || activeStepIndex < 0 || isCommandPending) return;

    setIsCommandPending(true);
    setStatusMessage("Confirmando amostra no ESP32...");
    setErrorMessage(null);

    try {
      await sendCommand(bluetoothCommands.CONFIRM);
      setSequence((prev) => [...prev, bluetoothCommands.CONFIRM]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao coletar amostra";
      setErrorMessage(message);
    } finally {
      setIsCommandPending(false);
    }
  };

  const isConfirmDisabled =
    !isConnected ||
    activeStepIndex < 0 ||
    isCommandPending ||
    currentState === "LENDO" ||
    currentState === "PROCESSANDO";

  const isStatusNegative =
    Boolean(errorMessage) ||
    currentState === "INATIV" ||
    statusMessage?.toLowerCase().includes("inatividade") ||
    statusMessage?.toLowerCase().includes("erro");

  const statusCardClasses = isStatusNegative
    ? "rounded-3xl border border-destructive/30 bg-destructive/10 p-5 shadow-sm"
    : "rounded-3xl border border-border bg-background p-5 shadow-sm";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-1x1 font-semibold uppercase">
              Deseja iniciar a calibração ?
            </h2>
            <div className="t-2 flex items-center gap-3">
              <p className="text-sm font-semibold text-muted-foreground">
                Consulte o nosso guia para orientações.
              </p>
              <a
                href="/docs/Guia_Calibracao.pdf"
                download
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-3 text-sm text-primary hover:underline"
              >
                <Download />
              </a>
            </div>
          </div>

          {isConnected ? (
            <div className="flex w-full justify-end sm:w-auto">
              <AppButton
                className="w-full sm:w-auto"
                variant="secondary"
                onClick={startCalibration}
                disabled={isCommandPending || currentState !== "READ"}
              >
                <Play className="mr-2 h-4 w-4" />
                Iniciar calibração
              </AppButton>
            </div>
          ) : null}

          {!isConnected ? (
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-muted-foreground flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-red-600" />
              <span>ESP32 desconectado. Conecte pelo painel antes de calibrar.</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {statusMessage || errorMessage ? (
            <div className={statusCardClasses}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Status de calibração
              </p>
              <div className={`text-sm ${isStatusNegative ? "text-destructive" : "text-foreground"}`}>
                {errorMessage ? (
                  <span>{errorMessage}</span>
                ) : (
                  <span>{statusMessage}</span>
                )}
              </div>
            </div>
          ) : null}

          <div className="relative rounded-3xl border border-border bg-background p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Última leitura
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentStepLabel}
                </p>
              </div>
              {isCalibrationLoading && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>{calibrationLoadingLabel}</span>
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">NTU</p>
                <p className="text-3xl font-semibold mt-2">{sampleValue ?? "--"}</p>
              </div>
              {// Futura implementação para exibir temperatura, atualmente o firmware não envia essa informação durante a calibração.
              
              /*<div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">Temperatura</p>
                <p className="text-3xl font-semibold mt-2">{temperatureValue ?? "--"} °C</p>
              </div>
              */}
            </div>
            {isCalibrationLoading ? (
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg border border-border">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm font-medium text-primary">{calibrationLoadingLabel}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <CalibrationStepList
          activeStepIndex={activeStepIndex}
          steps={calibrationSteps}
          onConfirm={confirmSample}
          isConnected={isConnected}
          disabled={isConfirmDisabled}
        />
      </div>

      <CalibrationConfirmDialog
        isOpen={isConfirmDialogOpen}
        onConfirm={handleStartCalibrationConfirmed}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
};

export default CalibrationModeScreen;
