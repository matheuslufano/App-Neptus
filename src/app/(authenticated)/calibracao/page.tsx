"use client";

import PageHeader from "@/components/PageHeader";
import CalibrationModeScreen from "@/components/calibration/CalibrationModeScreen";

export default function CalibrationPage() {
  return (
    <main className="space-y-5">
      <PageHeader
        title="Modo de Calibração"
        description="Processo guiado para calibrar o sensor."
      />
      <CalibrationModeScreen />
    </main>
  );
}
