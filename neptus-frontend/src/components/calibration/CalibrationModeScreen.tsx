"use client";

import { useMemo, useState } from "react";
import { FileText, Play, Wifi, WifiOff } from "lucide-react";
import { Download } from "lucide-react";

import AppButton from "@/components/AppButton";
import CalibrationStepList from "@/components/calibration/CalibrationStepList";
import CalibrationConfirmDialog from "@/components/calibration/CalibrationConfirmDialog";

const calibrationSteps = [
  "0_NTU",
  "100_NTU",
  "200_NTU",
  "300_NTU",
  "400_NTU",
  "500_NTU",
];

const CalibrationModeScreen = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [currentState, setCurrentState] = useState("READ");
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [sampleValue, setSampleValue] = useState<number | null>(null);
  const [temperatureValue, setTemperatureValue] = useState<number | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isStartingCalibration, setIsStartingCalibration] = useState(false);

  const currentStepLabel = useMemo(() => {
    if (currentState === "READ") return "Modo leitura contínua";
    if (currentState === "INATIV") return "Inatividade detectada";
    return "Amostra de calibração";
  }, [currentState]);

  const connectDevice = () => {
    setIsConnected(true);
    setCurrentState("READ");
    setSampleValue(null);
    setTemperatureValue(null);
  };

  const disconnectDevice = () => {
    setIsConnected(false);
    setCurrentState("READ");
    setActiveStepIndex(-1);
    setSequence([]);
    setSampleValue(null);
    setTemperatureValue(null);
  };

  const startCalibration = () => {
    if (!isConnected) return;
    setIsConfirmDialogOpen(true);
  };

  const beginCalibration = () => {
    setCurrentState("0_NTU");
    setActiveStepIndex(0);
    setSampleValue(0);
    setTemperatureValue(22.5);
    setSequence((prev) => [...prev, "START_CAL"]);
    setIsStartingCalibration(false);
  };

  const handleStartCalibrationConfirmed = () => {
    setIsConfirmDialogOpen(false);
    setIsStartingCalibration(true);
    window.setTimeout(beginCalibration, 600);
  };

// Por enquanto, a função do Botão "MED" vai ficar aqui guardada, mas depois ela vai ser implementada no
// dashboard, onde o usuário pode medir a NTU a qualquer momento, Vai ser implementada com o icon de refresh, 
// e não com o "MED" escrito, mas por enquanto, para facilitar os testes, vai ficar assim mesmo.
//  const measureNtu = () => {
//    if (!isConnected) return;
//    const nextSample = Math.round(50 + Math.random() * 450);
//    setSampleValue(nextSample);
//    setTemperatureValue(parseFloat((20 + Math.random() * 4).toFixed(1)));
//    setSequence((prev) => [...prev, "MED"]);
//  };

  const confirmSample = () => {
    if (!isConnected || activeStepIndex < 0) return;

    if (activeStepIndex === calibrationSteps.length - 1) {
      setCurrentState("READ");
      setActiveStepIndex(-1);
      setSequence((prev) => [...prev, "CONFIRM", "START_CAL"]);
      return;
    }

    const nextIndex = activeStepIndex + 1;
    setCurrentState(calibrationSteps[nextIndex]);
    setActiveStepIndex(nextIndex);
    setSampleValue(nextIndex * 100);
    setTemperatureValue(parseFloat((20 + Math.random() * 4).toFixed(1)));
    setSequence((prev) => [...prev, "CONFIRM"]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-1x1 font-semibold uppercase">
              Deseja iniciar a calibração ?
            </h2>
            <div className="t-2 flex flex items-center gap-3">
              <p className="text-sm font-semibold text-muted-foreground">Consulte o nosso guia para orientações.</p>
              <a
                href="/docs/Guia_Calibracao.pdf" download
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-3 text-sm text-primary hover:underline"
                
              >
                <Download/>
              </a>
            </div>
          </div>

          <div className="flex gap-2">
            <AppButton className="w-full" variant="secondary" onClick={startCalibration}>
              <Play className="mr-2 h-4 w-4" />
              Iniciar calibração
            </AppButton>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">

          {isStartingCalibration ? (
            <div className="rounded-3xl border border-border bg-background p-5 shadow-sm transition-opacity duration-300">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm font-semibold text-primary">
                  Iniciando modo calibração...
                </p>
              </div>
            </div>
          ) : null}

          <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Última leitura
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">NTU</p>
                <p className="text-3xl font-semibold mt-2">{sampleValue ?? "--"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">Temperatura</p>
                <p className="text-3xl font-semibold mt-2">{temperatureValue ?? "--"} °C</p>
              </div>
            </div>
          </div>

          {//<div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
           //<div className="flex items-center justify-between gap-4 mb-5">
             //<p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
               //Comandos
             //</p>
           //</div>

           //<div className="grid gap-3 sm:grid-cols-3">
             //<AppButton onClick={measureNtu} disabled={!isConnected || currentState !== "READ"}>
               //MED
             //</AppButton>
              
           //</div>
            //</div>
          }
        </div>

        <CalibrationStepList
          activeStepIndex={activeStepIndex}
          steps={calibrationSteps}
          onConfirm={confirmSample}
          isConnected={isConnected}
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
